import * as path from "path";
import ancesdir from "ancesdir";
import {ESLintUtils, TSESTree, TSESLint} from "@typescript-eslint/utils";

import * as util from "../util";

const createRule = ESLintUtils.RuleCreator(
    (name) =>
        `https://github.com/Khan/wonder-stuff/blob/main/packages/eslint-plugin-khan/docs/${name}.md`,
);

const PKG_ROOT = ancesdir(__dirname);
const CHECKSYNC_PATH = path.join(PKG_ROOT, "node_modules", ".bin", "checksync");

const UPDATE_REMINDER =
    "If necessary, check the sync-tag target and make relevant changes before updating the checksum.";

type Fix = {type: "replace" | "delete"; line: number; text: string};

type Item = {
    type: "replace" | "delete";
    reason?: string;
    location?: {line: number};
    message?: string;
    fix?: Fix;
};

const applyFix = (
    fixer: TSESLint.RuleFixer,
    {tagToFix, fix}: {tagToFix: TSESTree.Comment; fix: Fix},
) => {
    switch (fix.type) {
        case "replace":
            return fixer.replaceText(tagToFix, fix.text);

        case "delete":
            return fixer.remove(tagToFix);

        default:
            throw new Error(`Unknown fix type ${fix.type}`);
    }
};

const processFile = (
    file: Array<Item>,
    node: TSESTree.Program,
    context: TSESLint.RuleContext<MessageIds, Options>,
    tagStarts: Array<TSESTree.Comment>,
) => {
    for (const item of file) {
        processItem(item, node, context, tagStarts);
    }
};

const messages = {
    reason: "{{reason}}",
    reasonAndReminder: "{{reason}} {{reminder}}",
};

const processItem = (
    item: Item,
    node: TSESTree.Program,
    context: TSESLint.RuleContext<MessageIds, Options>,
    tagStarts: Array<TSESTree.Comment>,
) => {
    if (item.reason && item.location) {
        if (item.fix) {
            const itemFix = item.fix;
            const comment = tagStarts.find(
                (comment) => comment.loc.start.line === itemFix.line,
            );
            if (comment) {
                context.report({
                    node: comment,
                    messageId: "reason",
                    data: {
                        reason: item.reason,
                    },
                    fix(fixer) {
                        return applyFix(fixer, {
                            tagToFix: comment,
                            fix: itemFix,
                        });
                    },
                });
            }
        } else {
            const itemLocation = item.location;
            const comment = tagStarts.find(
                (comment) => comment.loc.start.line === itemLocation.line,
            );
            if (comment) {
                context.report({
                    node: comment,
                    messageId: "reason",
                    data: {
                        reason: item.reason,
                    },
                });
            }
        }
    } else if (item.message) {
        context.report({
            node: node,
            messageId: "reasonAndReminder",
            data: {
                reason: item.reason,
                reminder: UPDATE_REMINDER,
            },
        });
    } else {
        // eslint-disable-next-line no-console
        console.error(`Unknown item type ${item.type}`);
    }
};

const getCommandForFilename = (
    {
        configFile,
        ignoreFiles,
        rootDir,
    }: {configFile?: string; ignoreFiles: string; rootDir: string},
    filename: string,
) => {
    const ignoreFilesArg = ignoreFiles ? `--ignore-files ${ignoreFiles}` : "";
    const configFileArg = configFile
        ? `--config ${path.join(rootDir, configFile)}`
        : "";

    return `${CHECKSYNC_PATH} ${filename} ${configFileArg} ${ignoreFilesArg} --json`;
};

const getSyncErrors = (
    {
        configFile,
        ignoreFiles,
        rootDir,
    }: {configFile?: string; ignoreFiles: string; rootDir: string},
    filename: string,
) => {
    const command = getCommandForFilename(
        {configFile, ignoreFiles, rootDir},
        filename,
    );
    try {
        return util.execSync(command, {
            cwd: rootDir,
            encoding: "utf-8",
        });
    } catch (e: any) {
        // From https://github.com/somewhatabstract/checksync/blob/b2f31732715aa940051e7b2b2166b4699aa0f047/src/exit-codes.js
        // Error 3 is that we have DESYNCHRONIZED_BLOCKS.
        if (e.status === 3) {
            return e.stdout;
        }

        throw e;
    }
};

type Options = [
    {
        ignoreFiles: Array<string>;
        rootDir: string;
        configFile?: string;
    },
];
type MessageIds = keyof typeof messages;

export default createRule<Options, MessageIds>({
    name: "sync-tag",
    meta: {
        docs: {
            description: "Ensure sync tags are valid",
            recommended: false,
        },
        fixable: "code",
        messages,
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
        type: "problem",
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
                const syncStartComments =
                    node.comments?.filter((comment) =>
                        comment.value.trim().startsWith("sync-start:"),
                    ) ?? [];

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
    defaultOptions: [
        {
            ignoreFiles: [],
            configFile: "",
            rootDir: "",
        },
    ],
});
