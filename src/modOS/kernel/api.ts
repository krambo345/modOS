import type { messageType } from "@kernel/shared/types";
import * as variables from "@kernel/shared/variables";
import * as bino from "@kernel/bino";
import * as packer from "@kernel/packer";
import * as system from "@kernel/system";
import * as auth from "@kernel/firebase/auth";
import { firestoreUserData } from "@kernel/firebase/firestore";
import * as terminal from "@kernel/terminal";

export const kernel = {
  base: import.meta.env.BASE_URL,
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
        if (path == undefined) {
          return String("Path not specified")
        }
        if (data == undefined) {
          return String("Data not specified")
        }
        if (bino.binoWrite(path, data)) {
          return true;
        }
      },
      read(path: string) {
        if (path == undefined) {
          return String("Path not specified")
        }
        if (bino.binoCheck(path)) {
          return bino.binoRead(path);
        }
      },
      check(path: string) {
        return bino.binoCheck(path);
      },
      delete(path: string) {
        if (path == undefined) {
          return String("Path not specified")
        }
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
        if (path == undefined) {
          return String("Path not specified")
        }
        bino.binoDirWrite(path);
        return true;
      },
      list(
        path: string,
        options?: Parameters<typeof bino.binoDirContents>[1]
      ): ReturnType<typeof bino.binoDirContents> | string {
        if (path == undefined) {
          return String("Path not specified");
        }

        if (bino.binoCheck(path)) {
          return bino.binoDirContents(path, options);
        }

        return String("Path not found");
      },
      delete(path: string) {
        if (path == undefined) {
          return String("Path not specified")
        }
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
  packer: {
    async fetch() {
      return await packer.packageList();
    },
    async check(pckg: string) {
      return packer.packageIsInstalled(pckg);
    },
    async get(pckg: string) {
      return await packer.packageInstall(pckg);
    },
    async remove(pckg: string) {
      return packer.packageUninstall(pckg);
    },
    async start(pckg: string) {
      return await packer.packageLaunch(pckg);
    },
    async stop(pckg: string) {
      return await packer.packageKill(pckg);
    },
  },
  terminal: {
    async launch(element: HTMLElement) {
      await terminal.launch(element);
    },
    async kill() {
      await terminal.kill();
    },
  },
};

(globalThis as unknown as { modOS: { kernel: typeof kernel; variables: typeof variables } }).modOS = {
  kernel,
  variables,
};