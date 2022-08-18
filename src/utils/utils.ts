export function readFile(filePath: string) {
    // 创建一个新的xhr对象
    const okStatus = document.location.protocol === "file" ? 0 : 200;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", filePath, false);
    xhr.overrideMimeType("text/html;charset=utf-8");
    xhr.send(null);
    return xhr.status === okStatus ? xhr.responseText : null;
}