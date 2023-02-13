export type ExtractedString = {
    // The line number of the string in the original file.
    linePos: number;
    // The starting position of the string in the original file.
    startOffset: number;
    // The ending position of the string in the original file.
    endOffset: number;
    // The type of string, such as "_", "$_", or "ngettext".
    type: string;
    // The strings found (will be one for singular, two for plural)
    msgids: Array<string>;
    // The comments associated with the string.
    comments: Array<string>;
};

// Used by the `re` function below, allowing for writing multi-line regexes
// with comments.
// From: https://stackoverflow.com/questions/12317049/how-to-split-a-long-regular-expression-into-multiple-lines-in-javascript/60027277#60027277
const regexClean = (piece: string) =>
    piece
        .replace(
            /((^|\n)(?:[^/\\]|\/[^*/]|\\.)*?)\s*\/\*(?:[^*]|\*[^/])*(\*\/|)/g,
            "$1",
        )
        .replace(/((^|\n)(?:[^/\\]|\/[^/]|\\.)*?)\s*\/\/[^\n]*/g, "$1")
        .replace(/\s*\n\s*/g, "");

/**
 * Builds a regex pattern (as a string) which can then be turned into a full
 * regex by calling: `new RegEx(...)`.
 */
const re = ({raw}: any, ...interpolations: Array<string>) =>
    interpolations.reduce(
        (regex, insert, index) => regex + insert + regexClean(raw[index + 1]),
        regexClean(raw[0]),
    );

/**
 * A regex pattern that matches a string segments inside an i18n call followed
 * by an optional +. This handles cases like:
 *
 * - i18n._("hello")
 * - i18n._('hello')
 * - i18n._("hello" + " world")
 * - i18n._("hello" + ' world')
 *
 * This also handles escaped quotes and other escaped characters.
 * NOTE: This regex is based on STRIP_STRINGS_RE from analysis.py
 */
const INNER_STRINGS_PATTERN = re`
    (?:
        // Match a double-quote wrapped string
        "((?:\\.|[^"])*)"|
        // Match a single-quote wrapped string
        '((?:\\.|[^'])*)'
    )
    // Handle any concatenation happening to join this string to the next
    \s*[+]?\s*
`;

// A regex pattern for matching a single-line I18N: comment
const SINGLE_COMMENT_PATTERN = re`
    (?:
        // Make sure we're at the start of a line
        ^\s*
        // Look for a leading // to denote the single line
        \/\/\s*
        // Give this a name so we can reference it later
        (?<single_comment>
            // Find the leading I18N: that indicates the type of comment
            I18N: *
            // We then gobble up all the text in this comment (and adjacent
            // comments) including the endlines and single-line comments. We
            // process all of this out later using extractAndCombineComment.
            (?:[^\n]+|\n\s*\/\/)+
        )
    )
`;

// A regex pattern for matching a multi-line I18N: comment
const MULTI_COMMENT_PATTERN = re`
    (?:
        // Make sure we're starting at the beginning of the line
        ^\s*
        // Look for the start of a multi-line comment line: /* ...
        // We also handle potentially multiple leading *s for /**
        \/?\*[*\s]*
        // Give this a name so we can reference it later
        (?<multi_comment>
            // Find the leading I18N: that indicates the type of comment
            I18N:\s*
            // Gobble up all of the remaining text in the comment including
            // endlines and *s. We process all of this out later using
            // extractAndCombineComment.
            [\s\S]*?
        )
        // Look for the closing of a multi-line comment: ... */
        \s*\*/
    )
`;

/**
 * A regex pattern for matching a handlebars I18N: comment
 * It may seem unintuitive that we still handle this considering that we don't
 * have .handlebars files anymore, however we do have handlebars.js files and
 * we still have old I18N: comments embedded inside the Handlebars template that
 * we want to try and preserve if at all possible. We can get rid of this if no
 * more .handlebars.js files exist (or if none of them use I18N:-style comments)
 */
const HANDLEBARS_COMMENT_PATTERN = re`
    (?:
        // Look for the opening of a handlebars comment: {{! ...
        {{!
            // Find the leading I18N: that indicates the type of comment
            \s*
            I18N:
            \s*
            // Give this a name so we can reference it later
            (?<handlebars_comment>
                // Gobble up all of the remaining text in the comment
                [\s\S]*?
            )
            \s*
        // Inexplicably some places in our codebase put a ! at the end of
        // handlebars comments so we strip those out, too.
        [!]?
        // Look for the closing of a handlebars comment: ... }}
        }}
    )
`;

/**
 * A regex used for splitting apart comments that span multiple lines.
 * We do this so that we can remove any unnecessary characters (such as endlines
 * and comment characters) to make it possible to merge the parts back together
 * into a readable string.
 */
const COMMENT_SPLIT_RE = new RegExp(re`
    // Primarily we're looking for endlines (and trailing spaces) to split
    // the comment across
    \n\s*
    (?:
        // The comment could also include a \/\/ (if it's single-line style
        // comment) so we'll need to remove that.
        \/\/
        |
        // The comment could also include a */ (if it's multi-line style
        // comment) so we'll need to remove that.
        \*/
        |
        // The comment could also include a * (if it's multi-line style
        // comment) so we'll need to remove that.
        \*
    )?
    \s*
`);

/**
 * A regex used for locating calls to i18n._ and i18n.$_. It will extract the
 * name of the method being called and all of the strings that are specified in
 * the first argument to the call. For example the result will look like this:
 *
 *    input: i18n._("hello")
 *    output: i18n_name: _, i18n_message: "hello"
 *
 *    input: i18n.$_("hello" + " world")
 *    output: i18n_name: $_, i18n_message: "hello" + " world"
 *
 * The output will be further processed by extractAndCombineString.
 */
const I18N_PATTERN = re`
    // We expect the pattern to lead with a some variable. In uncompressed JS
    // it will probably be i18n, otherwise it may be something like 'a' or even
    // an inlined function call (this won't be consistent, will depend upon
    // Terser's output)
    [\w)]+\s*\.\s*
    // But then there will be the main function name (either _ or $_)
    // Give this a name so we can reference it later
    (?<i18n_name>_|\$_)
    // Followed by an open paren (
    \(
    \s*
    // Capture all of the strings inside the first argument to the i18n call
    // Give this a name so we can reference it later
    (?<i18n_message>
        // We care about any/all content up until the first , or a closing ).
        // Everything before that point should be a valid string we want to
        // extract. We bring in the INNER_STRINGS_PATTERN from above into here.
        (?:${INNER_STRINGS_PATTERN})+
    )
    // Look for the first , or closing ).
    [,)]
`;

/**
 * A regex used for locating calls to i18n.ngettext. It will extract the name
 * of the method being called (always "ngettext") and all of the strings that
 * are specified in the first and second arguments to the call. For example the
 * result will look like this:
 *
 * input: i18n.ngettext("first %(num)s", "second %(num)s", num)
 * output: ngettext_name: ngettext
 *         ngettext_singular: "first"
 *         ngettext_plural: "second"
 *
 * input: i18n.ngettext("hello" + " world %(num)s", "second %(num)s", num)
 * output: ngettext_name: ngettext
 *         ngettext_singular: "hello" + " world"
 *         ngettext_plural: "second"
 *
 * The output of each argument will be further processed by
 * extractAndCombineString.
 */
const NGETTEXT_PATTERN = re`
    // We expect the pattern to lead with a some variable. In uncompressed JS
    // it will probably be i18n, otherwise it may be something like 'a' or even
    // an inlined function call (this won't be consistent, will depend upon
    // Terser's output)
    [\w)]+\s*\.\s*
    // But then there will be the main function name (always ngettext)
    // Give this a name so we can reference it later
    (?<ngettext_name>ngettext)
    // Followed by an open paren (
    \(
    \s*
    // Capture all of the strings inside the first argument to the ngettext
    // call. Give this a name so we can reference it later
    (?<ngettext_singular>(?:${INNER_STRINGS_PATTERN})+)
    // The arguments are split by a comma ,
    ,
    \s*
    // Capture all of the strings inside the second argument to the ngettext
    // call. Give this a name so we can reference it later
    (?<ngettext_plural>(?:${INNER_STRINGS_PATTERN})+)
    // The arguments are ended by a comma , (after this some data will be
    // passed in to ngettext)
    ,
`;

/**
 * A regex that matches all of the segments of a (potentially multi-segment)
 * string. This is used by extractAndCombineString to locate all of the
 * segments and combine them together into a single string.
 */
const INNER_STRINGS_RE = new RegExp(INNER_STRINGS_PATTERN, "g");

/**
 * The main i18n regex! Successfully matches all calls to i18n._, i18n.$_,
 * i18n.ngettext, and all the different types of I18N: comments. Composed of
 * all the regexes specified above.
 */
const I18N_RE = new RegExp(
    [
        I18N_PATTERN,
        NGETTEXT_PATTERN,
        SINGLE_COMMENT_PATTERN,
        MULTI_COMMENT_PATTERN,
        HANDLEBARS_COMMENT_PATTERN,
    ].join("|"),
    "img",
);

/**
 * It is not really possible to use a regexp to remove comments from js
 * code before strings are removed; to do that you need to parse the
 * js.  But we try anyway.  Here is the heuristic we use:
 *
 * 1) Real comments almost always *precede* the `/*` or `//` with a space.
 *    (Or have the comment start at the beginning of the line.)  This is
 *    rare inside strings, where the `/*` is usually part of a glob
 *    pattern, and the `//` is usually part of a url.
 * 2) However, we do see exceptions: `if (...) {//added for widgets`.
 *    This seems to only happen after `{` so we add that as a special
 *    case.
 * 3) Another exception to the above is when we comment out code, e.g.
 *       const sizes = ["small", "default", "large"/*, 'xlarge' * /];
 *    In such cases, the closing `* /` is typically on the same line as
 *    the leading `/*`.  But for globs in strings we don't typically see
 *    that.  So we consider /*...* / (on one line) to be a real comment
 *    always.
 * Note that some of these alternatives match the whitespace before the
 * comment.  Since strip_js_comments() leaves whitespace alone, that is
 * safe to do even though they're not technically part of the comments.
 * TODO(csilvers): properly handle globs like "a/* /b/* /c" which look
 *                 like comments to the RE now
 * TODO(csilvers): properly handle comment-looking text inside multiline strings
 */
const STRIP_COMMENT_RE = new RegExp(
    re`
        /\*.*?\*/                         // /*...*/ on one line
        |^\s*/\*(?:.|\n)*?\*/             // /* ... */ at the beginning of a line
        |^\s*\/\/.*$                      // // at the beginning of a line
        |(?<=[ \t{])/\*(?:.|\n)*?\*/      // <space>/* ... */ or {/* ... */
        |(?<=[ \t{])\/\/.*$               // <space>// or {//
    `,
    "mg",
);

/**
 * Return the js_code without JS comments, preserving newlines.
 *
 * Preserving newlines allows line numbers reporting to work as expected.

 * The second argument is an optional string which can be specified to leave a
 * comment intact (not remove it).
 */
const stripJSComments = (jsCode: string, keep: string | null = null) =>
    jsCode.replace(STRIP_COMMENT_RE, (match) =>
        keep != null && keep !== "" && match.includes(keep)
            ? match
            : match.replace(/\S/g, " "),
    );

/**
 * Convert common escaped characters to their equivalent.
 *
 * This helps to clean up the strings somewhat, avoids escaping things that
 * don't need to be escaped.
 */
const convertEscapes = (textString: string) =>
    textString
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, "\\");

/**
 * Extract string segments and returns a unified string.
 *
 * This looks for individual string segments, like:
 *     "hello" + " world"
 *
 * And returns a single merged string: hello world
 */
const extractAndCombineString = (textString: string): string => {
    // Look for the string segments (either double or single quote)
    const parts: Array<string> = [];
    for (const match of textString.matchAll(INNER_STRINGS_RE)) {
        parts.push(match[1] || match[2]);
    }
    // Merge them all together and convert the escaped characters
    return convertEscapes(parts.join(""));
};

/**
 * Extract a comment and returns a list of unified comment strings.
 *
 * This looks for comments that've potentially split across multiple lines
 * and combines those segments together into a single comment string. It also
 * handles multiple distinct comments in the same block and also removing
 * duplicate comments.
 *
 * For example this is able to handle comments like this:
 *
 *     input: test
 *     output: ["test]
 *
 *     input: hello\n// world
 *     output: ["hello world"]
 *
 *     input: comment 1\n// I18N: comment 2
 *     output: ["comment 1", "comment 2"]
 *
 *     input: comment 1\n// I18N: comment 1
 *     output: ["comment 1"]
 */
const extractAndCombineComment = (commentString: string): Array<string> => {
    const comments: Array<string> = [];

    // Split the comment using the comment splitting regex above
    for (const untrimmedComment of commentString.split(COMMENT_SPLIT_RE)) {
        const comment = untrimmedComment.replace(/^[\s\n]*|[\s\n]*$/g, "");
        // Are we dealing with a new comment?
        if (comment.includes("I18N:")) {
            comments.push(comment.replace(/I18N:\s*/, "").trim());
        } else if (comment.trim()) {
            // Or is this just appending to an existing comment?
            const oldComment = comments[comments.length - 1];
            comments[comments.length - 1] =
                (oldComment ? oldComment + " " : "") + comment.trim();
        }
    }

    // Get rid of all duplicate comments
    return Array.from(new Set(comments));
};

/**
 * Extract all i18n string (and comments) from a file.
 *
 * This method yields an object with the relevant details, namely:
 *
 *  // The line number of the string in the original file.
 *  linePos: number,
 *  // The starting position of the string in the original file.
 *  startOffset: number,
 *  // The ending position of the string in the original file.
 *  endOffset: number,
 *  // The type of string, such as "_", "$_", or "ngettext".
 *  type: string,
 *  // The strings found (will be one for singular, two for plural)
 *  msgids: Array<string>,
 *  // The comments associated with the string.
 *  comments: Array<string>,
 *
 * @param {string} textString
 * @returns
 */
export function* extractStrings(
    textString: string,
): Generator<ExtractedString, void, void> {
    let curComment = null;

    // Check and see if a file potentially contains a reference to i18n or i18n
    // functions. If it doesn't then we can completely skip processing the file
    // (including stripping comments)
    if (
        !(
            textString.includes("i18n") ||
            textString.includes("._(") ||
            textString.includes(".ngettext(") ||
            textString.includes(".$_(")
        )
    ) {
        return;
    }

    // We only want to strip comments from files that haven't already been
    // processed by Webpack (it's both redundant and prone to errors)
    if (!textString.includes("webpackJsonp")) {
        // Read in the file and strip out non-I18N: comments
        textString = stripJSComments(textString, "I18N:");
    }

    // Go through all of the matches in the file
    for (const match of textString.matchAll(I18N_RE)) {
        const {groups} = match;

        /* istanbul ignore if */
        if (!groups) {
            // eslint-disable-next-line no-console
            console.error("i18n regex match failed.");
            break;
        }

        // If a i18n._ or i18n.$_ call was found
        if (groups.i18n_name) {
            // Compute the line number by counting endlines
            const linePos =
                1 +
                (textString.slice(0, match.index).match(/\n/g) || []).length;
            const startOffset = textString.indexOf(
                groups.i18n_message,
                match.index,
            );
            yield {
                linePos,
                startOffset,
                endOffset: startOffset + groups.i18n_message.length,
                type: groups.i18n_name,
                // i18n._ and i18n.$_ both have one string to extract
                msgids: [extractAndCombineString(groups.i18n_message)],
                comments: curComment || [],
            };
            curComment = null;
            // If a single-line comment was found
        } else if (groups.single_comment) {
            curComment = extractAndCombineComment(groups.single_comment);
            // If a multi-line comment was found
        } else if (groups.multi_comment) {
            curComment = extractAndCombineComment(groups.multi_comment);
            // If a handlebars comment was found
        } else if (groups.handlebars_comment) {
            curComment = [groups.handlebars_comment];
            // Otherwise a call to i18n.ngettext was found
        } else {
            // Compute the line number by counting endlines
            const linePos =
                1 +
                (textString.slice(0, match.index).match(/\n/g) || []).length;
            const startOffset = textString.indexOf(
                groups.ngettext_singular,
                match.index,
            );
            const endOffset =
                textString.indexOf(
                    groups.ngettext_plural,
                    // @ts-expect-error [FEI-5011] - TS2532 - Object is possibly 'undefined'.
                    match.index + groups.ngettext_singular.length,
                ) + groups.ngettext_plural.length;
            yield {
                linePos,
                startOffset,
                endOffset,
                type: groups.ngettext_name,
                msgids: [
                    // ngettext has two strings to extract
                    // (singular and plural)
                    extractAndCombineString(groups.ngettext_singular),
                    extractAndCombineString(groups.ngettext_plural),
                ],
                comments: curComment || [],
            };
            curComment = null;
        }
    }
}
