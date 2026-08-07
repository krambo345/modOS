import { firestorePackageInstall, firestorePackagesGet } from "@kernel/firebase/firestore";
import { binoWrite, binoRead, binoCheck, binoDelete, binoDirWrite } from "@kernel/bino";
import * as variables from "@kernel/shared/variables";

type appsModule = {
  launch?: () => unknown;
  kill?: () => unknown;
};

const appsRunning = new Map<string, appsModule>();

function appsFileURL(file: string) {
  if (file.startsWith("http://") || file.startsWith("https://")) {
    return file;
  }
  return `https://${file}`;
}

function appsPath(pckg: string) {
  return `${variables.structurePackages}${pckg}.js`;
}

/** List packages available in a Firestore collection (defaults to the app store "lib" collection). */
export async function appsList(col: string = "lib") {
  return await firestorePackagesGet(col);
}

/** Whether a package's source is already cached on disk (bino/zenfs). */
export function appsIsInstalled(pckg: string) {
  return binoCheck(appsPath(pckg));
}

/**
 * Install a package: look up its record in Firestore, fetch the source it points to,
 * and write it to bino. After this, launch() never needs to touch Firestore again.
 */
export async function appsInstall(pckg: string) {
  if (appsIsInstalled(pckg)) {
    return true;
  }

  const record = await firestorePackageInstall(pckg);
  if (!record || typeof (record as { file?: unknown }).file !== "string") {
    return false;
  }

  const file = (record as { file: string }).file;
  const response = await fetch(appsFileURL(file));
  if (!response.ok) {
    return false;
  }
  const source = await response.text();

  binoDirWrite(variables.structurePackages);
  binoWrite(appsPath(pckg), source);
  return true;
}

/** Remove a cached package. Kills it first if it's currently running. */
export function appsUninstall(pckg: string) {
  if (!appsIsInstalled(pckg)) {
    return false;
  }
  if (appsRunning.has(pckg)) {
    void appsKill(pckg);
  }
  binoDelete(appsPath(pckg));
  return true;
}

/**
 * Launch a package. If it isn't installed yet, installs it first (one Firestore/network
 * round trip, one time). Every launch after that reads the source straight from bino.
 */
export async function appsLaunch(pckg: string) {
  if (!appsIsInstalled(pckg)) {
    const installed = await appsInstall(pckg);
    if (!installed) {
      return false;
    }
  }

  const source = binoRead(appsPath(pckg)) as string;
  const blob = new Blob([source], { type: "text/javascript" });
  const moduleURL = URL.createObjectURL(blob);

  let module: appsModule;
  try {
    module = await import(/* @vite-ignore */ moduleURL);
  } finally {
    URL.revokeObjectURL(moduleURL);
  }

  if (typeof module.launch !== "function") {
    return false;
  }

  const result = await module.launch();
  appsRunning.set(pckg, module);
  return result ?? true;
}

export async function appsKill(pckg: string) {
  const module = appsRunning.get(pckg);
  if (!module) {
    return false;
  }
  if (typeof module.kill === "function") {
    await module.kill();
  }
  appsRunning.delete(pckg);
  return true;
}