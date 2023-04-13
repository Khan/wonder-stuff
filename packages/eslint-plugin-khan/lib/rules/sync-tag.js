const path = require("path");

const util = require("../util.js");

const PKG_ROOT = path.join(__dirname, "..", "..");
const CHECKSYNC_PATH = path.join(PKG_ROOT, "node_modules", ".bin", "checksync");

const UPDATE_REMINDER =
    "If necessary, check the sync-tag target and make relevant changes before updating the checksum.";

const applyFix = (fixer, {tagToFix, fix}) => {
    switch (fix.type) {
        case "replace":
            return fixer.replaceText(tagToFix, fix.text);

        case "delete":
            return fixer.remove(tagToFix);

        default:
            throw new Error(`Unknown fix type ${fix.type}`);
    }
};

const processFile = (file, node, context, tagStarts) => {
    for (const item of file) {
        processItem(item, node, context, tagStarts);
    }
};

const processItem = (item, node, context, tagStarts) => {
    if (item.reason && item.location) {
        if (item.fix) {
            const comment = tagStarts.find(
                (comment) => comment.loc.start.line === item.fix.line,
            );
            context.report({
                node: comment,
                message: `${item.reason}`,
                fix(fixer) {
                    return applyFix(fixer, {
                        tagToFix: comment,
                        fix: item.fix,
                    });
                },
            });
        } else {
            const comment = tagStarts.find(
                (comment) => comment.loc.start.line === item.location.line,
            );
            context.report({
                node: comment,
                message: item.reason,
            });
        }
    } else if (item.message) {
        context.report({
            node: node,
            message: `${item.reason} ${UPDATE_REMINDER}`,
        });
    } else {
        // eslint-disable-next-line no-console
        console.error(`Unknown item type ${item.type}`);
    }
};

const getCommandForFilename = (
    {configFile, ignoreFiles, rootDir},
    filename,
) => {
    const ignoreFilesArg = ignoreFiles ? `--ignore-files ${ignoreFiles}` : "";
    const configFileArg = configFile
        ? `--config ${path.join(rootDir, configFile)}`
        : "";

    return `${CHECKSYNC_PATH} ${filename} ${configFileArg} ${ignoreFilesArg} --json`;
};

const getSyncErrors = ({configFile, ignoreFiles, rootDir}, filename) => {
    const command = getCommandForFilename(
        {configFile, ignoreFiles, rootDir},
        filename,
    );
    try {
        return util.execSync(command, {
            cwd: rootDir,
            encoding: "utf-8",
        });
    } catch (e) {
        // From https://github.com/somewhatabstract/checksync/blob/b2f31732715aa940051e7b2b2166b4699aa0f047/src/exit-codes.js
        // Error 3 is that we have DESYNCHRONIZED_BLOCKS.
        if (e.status === 3) {
            return e.stdout;
        }

        throw e;
    }
};

module.exports = {
    meta: {
        docs: {
            description: "Ensure sync tags are valid",
        },
        schema: [
            {
                type: "object",
                properties: {
                    ignoreFiles: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },
                    rootDir: {
                        type: "string",
                    },
                    configFile: {
                        type: "string",
                    },
                },
            },
        ],
        fixable: "code",
    },

    create(context) {
        const configFile = context.options[0].configFile;
        const ignoreFiles = (context.options[0].ignoreFiles || []).join(",");
        const rootDir = context.options[0].rootDir;
        if (!rootDir) {
            throw new Error("rootDir must be set");
        }

        return {
            Program(node) {
                const syncStartComments = node.comments.filter((comment) =>
                    comment.value.trim().startsWith("sync-start:"),
                );

                const shouldChecksync = syncStartComments.length > 0;

                if (shouldChecksync) {
                    const filename = path.relative(
                        rootDir,
                        context.getFilename(),
                    );

                    const rawJson = getSyncErrors(
                        {configFile, ignoreFiles, rootDir},
                        filename,
                    );

                    try {
                        const data = JSON.parse(rawJson);
                        const fileOutput = Object.keys(data.files).find((f) =>
                            filename.endsWith(f),
                        );
                        if (fileOutput) {
                            processFile(
                                data.files[fileOutput],
                                node,
                                context,
                                syncStartComments,
                            );
                        }
                    } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error(e);
                        return;
                    }
                }
            },
        };
    },
};
