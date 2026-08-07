import { firestorePackagesGet, firestorePackageInstall, firestoreUserData } from "@kernel/firebase/firestore";
import { appsLaunch, appsKill } from "@kernel/apps";

export async function packerLibText(col: string) {
  return (await packerLibJSON(col)).toString();
}

export async function packerLibJSON(col: string) {
  return await firestorePackagesGet(col);
}

export async function packerPackagesInstall(pckg: string) {
  return await firestorePackageInstall(pckg);
}

export async function packerUserData() {
  return await firestoreUserData();
}

export async function packerAppsLaunch(pckg: string) {
  return await appsLaunch(pckg);
}

export async function packerAppsKill(pckg: string) {
  return await appsKill(pckg);
}