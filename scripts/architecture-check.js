import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const collectFiles = async (directory) =>
  (
    await Promise.all(
      (await readdir(directory, { withFileTypes: true })).map((entry) =>
        entry.isDirectory()
          ? collectFiles(join(directory, entry.name))
          : [join(directory, entry.name)],
      ),
    )
  ).flat();
const files = (await collectFiles("src")).filter((file) =>
  file.endsWith(".js"),
);
for (const file of files) {
  const source = await readFile(file, "utf8");
  if (source.includes("require("))
    throw new Error(`CommonJS usage detected: ${file}`);
  if (!file.startsWith("src/db/mysql/") && source.includes("databasePool"))
    throw new Error(`databasePool import outside MySQL layer: ${file}`);
}
