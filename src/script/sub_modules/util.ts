export const clamp = (n:number, max:number, min:number):number => {
    if (typeof min !== 'number') min = 0;
    return n > max ? max : n < min ? min : n;
}

export const random = (max:number, min:number):number => {
    if (typeof max !== 'number') {
        return Math.random();
    } else if (typeof min !== 'number') {
        min = 0;
    }
    return Math.random() * (max - min) + min;
}

export function getAdjustedPosition(x, y, target){
    let rect = target.getBoundingClientRect();
    let xx = Math.round(target.width * (x - rect.left) / target.clientWidth);
    let yy = Math.round(target.height * (y - rect.top) / target.clientHeight);
    return [xx, yy];
}
