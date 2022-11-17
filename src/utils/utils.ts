export function readFile(filePath: string) {
    // 创建一个新的xhr对象
    const okStatus = document.location.protocol === "file" ? 0 : 200;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", filePath, false);
    xhr.overrideMimeType("text/html;charset=utf-8");
    xhr.send(null);
    return xhr.status === okStatus ? xhr.responseText : null;
}


export function insertAfter<T>(arr: Array<T>, item: T, pos: number): Array<T> {
    const before = arr.slice(0, pos);
    const after = arr.slice(pos);
    return before.concat([item]).concat(after)
}

/**
 * 复制单行内容到粘贴板
 * content : 需要复制的内容
 */
export function copyToClip(content: string) {
    const aux = document.createElement("input");
    aux.setAttribute("value", content);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);

}

export const deepCopy = <T>(obj): T => {
    return JSON.parse(JSON.stringify(obj))
}

export const eliminateFloatRoundoffError = (s: string) => {
    if (s.indexOf('.') !== -1) {
        const fractionalPart = s.split('.')[1]
        if (fractionalPart.length > 10) {
            const parsedVal = parseFloat(s).toFixed(10)
            let indicator = parsedVal.length - 1
            while (parsedVal.substring(indicator, indicator + 1) == '0') {
                indicator -= 1
            }
            console.log(s, parsedVal.substring(0, indicator + 1))
            return parsedVal.substring(0, indicator + 1)
        }
    }

    return s
}