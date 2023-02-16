import {execSync} from "child_process";
import * as fg from "fast-glob";
import * as path from "path";

const rootDir = path.join(__dirname, "..");
const files = fg.sync("packages/wonder-stuff-*/dist/**/*.d.ts", {cwd: rootDir});

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
