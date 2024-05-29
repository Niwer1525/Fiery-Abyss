/**
 * Convert degrees to radians
 * @param {*} degrees The angle in degrees
 * @returns The angle in radians
 */
export function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

export function listChildren(children) {
    let child;
    for (let i = 0; i < children.length; i++) {
        child = children[i];

        // Calls this function again if the child has children
        if (child.children) listChildren(child.children);
        else // if this child last in recursion
            return child;
    }
}

export function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}