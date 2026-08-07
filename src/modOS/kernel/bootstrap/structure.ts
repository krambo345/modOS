import { kernel } from "@kernel/api";
import * as variables from "@kernel/shared/variables";

export async function bootstrapStructureBuild() {
  await kernel.system.log("Building on-memory system structure");

  const directories = [
    variables.structureCache,
    variables.structurePackages,
    variables.structurePackagesTerminal,
    variables.structurePackagesFileManager,
    variables.structurePackagesWindowManager,
    variables.structurePackagesDesktop,
    variables.structurePackagesBar,
    variables.structureUsr,
    variables.structureUsrDocuments,
    variables.structureUsrMedia,
  ];

  for (const directory of directories) {
    await kernel.system.log(`Making directory ${directory}`, "info");
    kernel.bino.dir.make(directory);
  }
}
