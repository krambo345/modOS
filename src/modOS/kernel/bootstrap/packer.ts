import { kernel } from "@kernel/api";
import * as variables from "@kernel/shared/variables";

export async function bootstrapPackageGet() {
  await kernel.system.log("Launching system packages");
  for (const pckg of variables.sysPackages) {
    const got = await kernel.packer.get(pckg)
    if (got) {
      await kernel.system.log(`Got ${pckg}`, "success");
    } else {
      await kernel.system.log(`Failed to get ${pckg}`, "error");
    }
  }
}
export async function bootstrapPackageLaunch() {
  await kernel.system.log("Launching system packages");
  for (const pckg of variables.startUpPackages) {
    const launched = await kernel.packer.start(pckg)
    if (launched) {
      await kernel.system.log(`Got ${pckg}`, "success");
    } else {
      await kernel.system.log(`Failed to get ${pckg}`, "error");
    }
  }
}
