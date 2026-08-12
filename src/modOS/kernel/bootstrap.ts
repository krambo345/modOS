import * as variables from "@kernel/shared/variables";
import { kernel } from "@kernel/api";
import { bootstrapDisplayToggle } from "@kernel/bootstrap/display";
import { bootstrapAccountForm } from "@kernel/bootstrap/accountForm";
import { bootstrapBrowserDetect } from "@kernel/bootstrap/browser";
import { bootstrapBinoTest } from "@kernel/bootstrap/binoTest";
import { bootstrapStructureBuild } from "@kernel/bootstrap/structure";
import { bootstrapLibBuild } from "@kernel/bootstrap/lib";
import { bootstrapPackageGet, bootstrapPackageLaunch } from "@kernel/bootstrap/packer";

export async function bootstrap() {
  const manifest = document.querySelector<HTMLDivElement>(".manifest")!;
  const display = document.querySelector<HTMLDivElement>(".display")!;
  try{
  await kernel.system.log(`Booting ${variables.osName} ${variables.osVersion}`);
  await bootstrapDisplayToggle(manifest, display, "manifest");
    await bootstrapAccountForm();
    manifest.innerHTML = ``
  if (!(await kernel.account.ensureUserData())) {
    await kernel.system.log("Failed to retrieve or create user data.", "error");
  } else {
    await kernel.system.log("Successfully signed in", "success");
  }

  await kernel.system.log(`bootstrapping ${variables.osName} ${variables.osVersion}`);
  const check = await kernel.system.sound("test");
  if (check != undefined) {
    await kernel.system.log(check, "error");
    await kernel.system.log("", "error");
    await kernel.system.log(
      "If you wish to get the full experience of modOS, please fix the problem by enabling the setting for sound in your browser, removing an adblocker, or resolving the external factor.",
      "error",
    );
  }
  await kernel.system.log("Detecting browser");
    const browser = bootstrapBrowserDetect();
    if (browser != "Unknown") {
      await kernel.system.log("Browser detected", "success");
      await kernel.system.log("Browser: " + browser, "info");
    } else {
      await kernel.system.log("Failed to detect known browser", "error");
      await kernel.system.log("Reported browser: " + browser, "warn");
    }
    await bootstrapBinoTest();
    await bootstrapStructureBuild();
    await bootstrapLibBuild();
    await bootstrapPackageGet();
    await bootstrapPackageLaunch();
}
catch(error){
  await kernel.system.log(error, "error");
  await kernel.terminal.launch(manifest);
  manifest.style.overflowY = "scroll";
  manifest.scrollTop = manifest.scrollHeight;
  kernel.system.log(`Entered modOS rescue mode; scrolling has been unlocked. Crash reason: ${error}`, "warn");
  return false;
}
  await kernel.system.log(
    `Bootstrap complete, welcome to ${variables.osName} ${variables.osVersion}!`,
    "success",
  );
  await kernel.system.delay(2000);

  await bootstrapDisplayToggle(manifest, display, "display", false);
    return false;
}
