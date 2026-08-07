import { kernel } from "@kernel/api";

export async function bootstrapBinoTest() {
  await kernel.system.log("Testing kernel.bino API");
  const testDir = "/cache/";
  const testFile = "test.txt";

  await kernel.system.log(
    `Making ${testDir} ` + kernel.bino.dir.make(`${testDir}`),
    "info",
  );

  await kernel.system.log(
    `Writing ${testDir}${testFile} ` +
      kernel.bino.file.write(testDir + testFile, "test"),
    "info",
  );
  await kernel.system.log(
    `Checking ${testDir}${testFile} ` +
      kernel.bino.file.check(testDir + testFile),
    "info",
  );

  await kernel.system.log(
    `Reading ${testDir}${testFile} ` +
      kernel.bino.file.read(testDir + testFile),
    "info",
  );

  await kernel.system.log(
    `Listing ${testDir} ` + kernel.bino.dir.list(testDir),
    "info",
  );

  await kernel.system.log(
    `Deleting ${testDir}${testFile} ` +
      kernel.bino.file.delete(testDir + testFile),
    "info",
  );

  await kernel.system.log(
    `Deleting ${testDir} ` + kernel.bino.dir.delete(`${testDir}`),
    "info",
  );
  await kernel.system.log(
    "If any of the values above show 'false' or any other unexpected value, please make an issue on GitHub. Thank you!",
    "warning",
  );
}
