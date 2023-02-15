import {execSync} from "child_process";
import * as path from "path";
import * as fglob from "fast-glob";

const rootDir = path.join(__dirname, "..");
const files = fglob.sync("packages/wonder-stuff-*/dist/**/*.d.ts", {
    cwd: rootDir,
});

for (const inFile of files) {
    const outFile = inFile.replace(".d.ts", ".js.flow");
    const command = `yarn flowgen ${inFile} -o ${outFile} --add-flow-header`;

    try {
        execSync(command, {cwd: rootDir});
        console.log(`✅ wrote: ${outFile}`);
    } catch (e) {
        console.log(`❌ error processing: ${inFile}: ${e}`);
    }
}
