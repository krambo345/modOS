import { kernel } from "@kernel/api";
import * as variables from "@kernel/shared/variables";

export async function bootstrapAppsLaunch() {
  await kernel.system.log("Launching system packages");
  for (const pckg of variables.sysPackages) {
    const launched = await kernel.apps.launch(pckg);
    if (launched) {
      await kernel.system.log(`Launched ${pckg}`, "success");
    } else {
      await kernel.system.log(`Failed to launch ${pckg}`, "error");
    }
  }
}
