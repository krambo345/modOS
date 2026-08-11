import { kernel } from "@kernel/api";

export async function bootstrapDisplayToggle(
  manifest: HTMLDivElement,
  display: HTMLDivElement,
  target: "manifest" | "display",
  clearManifest?: boolean,
) {
  if (clearManifest) {
    manifest.innerHTML = "";
  }
  manifest.style.display = target === "manifest" ? "block" : "none";
  display.style.display = target === "display" ? "block" : "none";

  const success =
    manifest.style.display === (target === "manifest" ? "block" : "none") &&
    display.style.display === (target === "display" ? "block" : "none");

  if (success) {
    await kernel.system.log(`Toggled to ${target}`, "success");
    await kernel.system.log("Manifest display: " + manifest.style.display, "info");
    await kernel.system.log("Display display: " + display.style.display, "info");
  } else {
    await kernel.system.log(`Failed to toggle to ${target}`, "error");
    await kernel.system.log("Manifest display: " + manifest.style.display, "warn");
    await kernel.system.log("Display display: " + display.style.display, "warn");
  }
}
