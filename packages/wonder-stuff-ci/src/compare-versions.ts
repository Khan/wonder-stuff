/**
 * Compare two versions or tags
 * @param {string} v1 A version of the form `<num>.<num>.<num>` or tag of the form `<tag>-<num>.<num>.<num>`.
 * @param {string} v2 A version of the form `<num>.<num>.<num>` or tag of the form `<tag>-<num>.<num>.<num>`.
 * @returns {number} 1 if v1 > v2, -1 if v1 < v2, 0 if v1 == v2
 */
export const compareVersions = (v1: string, v2: string) => {
    const v1v = v1.includes("-") ? v1.split("-")[1] : v1;
    const v2v = v2.includes("-") ? v2.split("-")[1] : v2;
    const v1p = v1v.replace(/^v/g, "").split(".");
    const v2p = v2v.replace(/^v/g, "").split(".");
    for (let i = 0; i < v1p.length || i < v2p.length; i++) {
        const p1 = +v1p[i] || 0;
        const p2 = +v2p[i] || 0;
        if (+p1 !== +p2) {
            return p1 > p2 ? 1 : -1;
        }
    }
    return 0;
};
