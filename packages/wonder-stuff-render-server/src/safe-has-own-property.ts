/**
 * Wrapper to Object.prototype.hasOwnProperty so we only need suppress flow once
 */
export const safeHasOwnProperty = (obj: any, property: string): boolean => // $FlowIgnore[method-unbinding]
Object.prototype.hasOwnProperty.call(obj, property);
