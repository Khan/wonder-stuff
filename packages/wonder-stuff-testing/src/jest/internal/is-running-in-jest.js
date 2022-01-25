// @flow
// istanbul ignore file
/**
 * Determine if jest is running or not.
 *
 * This is a simple check. We don't export this, but we do use it to do our
 * own checks, while allowing us to easily test the results of those checks.
 */
export const isRunningInJest = (): boolean => typeof jest !== "undefined";
