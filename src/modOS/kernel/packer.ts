import { firestorePackagesGet, firestorePackageInstall } from "@kernel/firebase/firestore";
import { kernel } from "@kernel/api";
import * as variables from "@kernel/shared/variables";
import * as types from "@kernel/shared/types";

type packageModule = {
  app?: () => unknown;
  kill?: () => unknown;
  commands?: () => unknown;
};

const packageRunning = new Map<string, packageModule>();
const commandCache = new Map<string, Record<string, types.terminalCommand>>();

function buildPackageAPI(command: types.terminalCommand): unknown {
  if (command.sub) {
    const api: Record<string, unknown> = {};
    for (const [key, sub] of Object.entries(command.sub)) {
      api[key] = buildPackageAPI(sub);
    }
    return api;
  }
  if (command.run) {
    return (...args: string[]) => command.run!(args);
  }
  return undefined;
}

function attachPackageAPI(commandList: Record<string, types.terminalCommand>) {
  const modOS = (window as unknown as Record<string, unknown>).modOS as Record<string, unknown> | undefined;
  if (!modOS) return;
  for (const [key, command] of Object.entries(commandList)) {
    modOS[key] = buildPackageAPI(command);
  }
}

function detachPackageAPI(commandList: Record<string, types.terminalCommand>) {
  const modOS = (window as unknown as Record<string, unknown>).modOS as Record<string, unknown> | undefined;
  if (!modOS) return;
  for (const key of Object.keys(commandList)) {
    delete modOS[key];
  }
}

function packageFileURL(file: string) {
  if (file.startsWith("http://") || file.startsWith("https://")) {
    return file;
  }
  return `https://${file}`;
}

function packagePath(pckg: string) {
  return `${variables.structurePackages}${pckg}`;
}

export async function packageList(col: string = "lib") {
  return await firestorePackagesGet(col);
}

export function packageIsInstalled(pckg: string) {
  return kernel.bino.file.check(packagePath(pckg));
}

export async function packageInstall(pckg: string, visiting: Set<string> = new Set()): Promise<boolean> {
  if (packageIsInstalled(pckg)) {
    return true;
  }

  if (visiting.has(pckg)) {
    return false;
  }
  visiting.add(pckg);

  const record = await firestorePackageInstall(pckg);
  if (!record || typeof (record as { file?: unknown }).file !== "string") {
    return false;
  }

  const dependencies = Array.isArray((record as { dependencies?: unknown }).dependencies)
    ? (record as { dependencies: string[] }).dependencies
    : [];

  for (const dep of dependencies) {
    if (!packageIsInstalled(dep)) {
      await packageInstall(dep, visiting);
    }
  }

  const file = (record as { file: string }).file;
  const response = await fetch(packageFileURL(file));
  if (!response.ok) {
    return false;
  }
  const source = await response.text();

  kernel.bino.dir.make(variables.structurePackages);
  kernel.bino.file.write(packagePath(pckg), source);
  commandCache.delete(pckg);
  return true;
}

export async function packageUninstall(pckg: string) {
  if (!packageIsInstalled(pckg)) {
    return false;
  }
  if (packageRunning.has(pckg)) {
    await packageKill(pckg);
  }
  commandCache.delete(pckg);
  return kernel.bino.file.delete(packagePath(pckg));
}

export async function packageLaunch(pckg: string, visiting: Set<string> = new Set()): Promise<boolean> {
  if (!packageIsInstalled(pckg)) {
    return false;
  }

  if (visiting.has(pckg)) {
    return true;
  }
  visiting.add(pckg);

  if (packageRunning.has(pckg)) {
    await packageKill(pckg);
  }

  const record = await firestorePackageInstall(pckg);
  const dependencies = record && Array.isArray((record as { dependencies?: unknown }).dependencies)
    ? (record as { dependencies: string[] }).dependencies
    : [];

  for (const dep of dependencies) {
    if (packageRunning.has(dep)) continue;
    await packageLaunch(dep, visiting);
  }

  const source = kernel.bino.file.read(packagePath(pckg)) as string;
  const blob = new Blob([source], { type: "text/javascript" });
  const moduleURL = URL.createObjectURL(blob);

  let module: packageModule;
  try {
    module = await import(/* @vite-ignore */ moduleURL);
  } finally {
    URL.revokeObjectURL(moduleURL);
  }

  if (typeof module.app !== "function") {
    return false;
  }

  const result = await module.app();
  packageRunning.set(pckg, module);

  if (typeof module.commands === "function") {
    try {
      const commandList = (await module.commands()) as Record<string, types.terminalCommand>;
      if (commandList && typeof commandList === "object") {
        commandCache.set(pckg, commandList);
        attachPackageAPI(commandList);
      }
    } catch (error) {
      console.error(`Failed to load commands for package "${pckg}":`, error);
    }
  }

  return Boolean(result ?? true);
}

export async function packageKill(pckg: string) {
  const module = packageRunning.get(pckg);
  if (!module) {
    return false;
  }
  if (typeof module.kill === "function") {
    await module.kill();
  }
  packageRunning.delete(pckg);
  const cached = commandCache.get(pckg);
  if (cached) {
    detachPackageAPI(cached);
    commandCache.delete(pckg);
  }
  return true;
}

export async function packageCommands(): Promise<
  Record<string, types.terminalCommand>
> {
  const commands: Record<string, types.terminalCommand> = {};

  for (const pckg of packageRunning.keys()) {
    const cached = commandCache.get(pckg);
    if (cached) {
      Object.assign(commands, cached);
    }
  }

  return commands;
}