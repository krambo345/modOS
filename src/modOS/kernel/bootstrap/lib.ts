import { kernel } from "@kernel/api";
import * as variables from "@kernel/shared/variables";

export async function bootstrapLibBuild() {
  await kernel.system.log("Building lib");

  const lib = JSON.stringify(await kernel.packer.fetch());

  await kernel.system.log("lib built", "success");
  await kernel.system.log("Writing lib.json");
  kernel.bino.file.write(variables.libJSONloc, lib);
  await kernel.system.log(`Wrote ${variables.libJSONloc}`, "success");
  await kernel.system.log(
    `lib.json content: ${kernel.bino.file.read(variables.libJSONloc)}`,
    "info",
  );

  return true;
}