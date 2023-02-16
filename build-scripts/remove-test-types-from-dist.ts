import * as fs from "fs";
import * as fg from "fast-glob";
import * as path from "path";

const rootDir = path.join(__dirname, "..");
const files = fg.sync("packages/wonder-stuff-*/dist/**/__tests__/*.d.ts", {
    cwd: rootDir,
});

for (const file of files) {
    fs.unlinkSync(path.join(rootDir, file));
}

const dirs = fg.sync("packages/wonder-stuff-*/dist/**/__tests__", {
    cwd: rootDir,
    onlyFiles: false,
});

for (const dir of dirs) {
    fs.rmdirSync(path.join(rootDir, dir));
}
