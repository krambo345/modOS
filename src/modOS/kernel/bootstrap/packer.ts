import { kernel } from "@kernel/api";
import * as variables from "@kernel/shared/variables";

export async function bootstrapPackageGet() {
  await kernel.system.log("Getting system packages");
  for (const pckg of variables.sysPackages) {
    const got = await kernel.packer.get(pckg)
    if (got) {
      await kernel.system.log(`Got ${pckg}`, "success");
    } else {
      throw Error(`Failed to get ${pckg}`)
    }
  }
}
export async function bootstrapPackageLaunch() {
  await kernel.system.log("Launching system packages");
  for (const pckg of variables.startUpPackages) {
    const started = await kernel.packer.start(pckg)
    if (started) {
      await kernel.system.log(`Started ${pckg}`, "success");
    } else {
      throw Error(`Failed to launch ${pckg}`)
    }
  }
}
