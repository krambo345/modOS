import type { messageType } from "@kernel/shared/types";
import * as bino from "@kernel/bino";
import * as apps from "@kernel/apps";
import * as system from "@kernel/system";
import * as auth from "@kernel/firebase/auth";
import { firestoreUserData } from "@kernel/firebase/firestore";
import * as terminal from "@kernel/terminal";

export const kernel = {
  system: {
    async sound(sound: string, times?: number) {
      return await system.systemSound(sound, times);
    },
    async log(message: unknown, type?: messageType) {
      return await system.systemLog(message, type);
    },
    delay(t?: number) {
      return system.systemDelay(t);
    },
  },
  bino: {
    file: {
      write(path: string, data: string) {
        if (bino.binoWrite(path, data)) {
          return true;
        }
      },
      read(path: string) {
        if (bino.binoCheck(path)) {
          return bino.binoRead(path);
        }
      },
      check(path: string) {
        return bino.binoCheck(path);
      },
      delete(path: string) {
        if (bino.binoCheck(path)) {
          bino.binoDelete(path);
          return true;
        } else {
          return false;
        }
      },
    },
    dir: {
      make(path: string) {
        bino.binoDirWrite(path);
        return true;
      },
      list(path: string) {
        if (bino.binoCheck(path)) {
          return bino.binoDirContents(path);
        }
      },
      delete(path: string) {
        if (bino.binoCheck(path)) {
          bino.binoDirDelete(path);
          return true;
        } else {
          return false;
        }
      },
    },
  },
  account: {
    async manage(credentials: { action: string; email: string; password: string }) {
      return await auth.authAccountManager(credentials);
    },
    async manageWithGoogle() {
      return await auth.authGoogleAccountManager();
    },
    async sessionUID() {
      return await auth.authSessionUID();
    },
    async ensureUserData() {
      return await firestoreUserData();
    },
  },
  // Single surface for everything package/app related: browse (list), cache
  // locally (install/uninstall), and run (launch/kill). launch() installs
  // automatically the first time a package is used, then always runs from
  // the local bino cache afterwards.
  apps: {
    async list(col?: string) {
      return await apps.appsList(col);
    },
    isInstalled(pckg: string) {
      return apps.appsIsInstalled(pckg);
    },
    async install(pckg: string) {
      return await apps.appsInstall(pckg);
    },
    uninstall(pckg: string) {
      return apps.appsUninstall(pckg);
    },
    async launch(pckg: string) {
      return await apps.appsLaunch(pckg);
    },
    async kill(pckg: string) {
      return await apps.appsKill(pckg);
    },
  },
  terminal: {
    async launch(element: HTMLElement) {
      await terminal.launch(element);
    },
  },
};

(globalThis as unknown as { modOS: { kernel: typeof kernel } }).modOS = { kernel };
