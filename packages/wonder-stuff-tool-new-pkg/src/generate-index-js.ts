/**
 * Generates the placholder package's `index.js` file contents. The contents are
 * meant to be very obvious that the package is simply a placeholder and
 * contains no usable code.
 */
export function generateIndexJs(): string {
    return 'throw new Error("Not implemented");\n';
}
