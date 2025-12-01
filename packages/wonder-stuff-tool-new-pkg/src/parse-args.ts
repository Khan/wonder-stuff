import yargs from "yargs";
import {hideBin} from "yargs/helpers";

/**
 * Parses the command-line arguments passed into this program and returns the
 * parsed values.
 *
 * If invalid/incompatible parameters were provided, prints usage info.
 */
export function parseArgs(): ParsedArgs {
    const argv = yargs(hideBin(process.argv))
        .scriptName("wonder-stuff-tool-publish-new-pkg")
        .usage(
            "Usage: $0 <package-name> [options]\n\n" +
                "Helps with setting up Trusted Publishing for a new npm package by publishing a placeholder npm package which can then be configured.",
        )
        .demandCommand(1, 1, "You must provide exactly one package name")
        .option("cleanup", {
            type: "boolean",
            default: true,
            describe: "Clean up the temporary directory after publishing",
        })
        .help()
        .alias("help", "h")
        .strict()
        .parseSync();

    const packageName = argv._[0] as string;

    return {
        packageName,
        cleanup: argv.cleanup,
    };
}
