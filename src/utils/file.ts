export function readFile(filePath: string) {
  // 创建一个新的xhr对象
  const okStatus = document.location.protocol === "file" ? 0 : 200;
  const xhr = new XMLHttpRequest();
  xhr.open("GET", filePath, false);
  xhr.overrideMimeType("text/html;charset=utf-8");
  xhr.send(null);
  return xhr.status === okStatus ? xhr.responseText : null;
}

// Upload file
export const uploadFile = (blob: Blob, targetFilename: string, type: string) => {
  const file = new File([blob], "test.xxx", { type: type });
  const url = "/dev-api/oss"; // 接收上传文件的后台地址

  const form = new FormData(); // FormData 对象
  form.append("file", file); // 文件对象
  form.append("path", targetFilename);
  form.append('userID', "1")

  const xhr = new XMLHttpRequest();  // XMLHttpRequest 对象
  xhr.open("post", url, true); //post方式，url为服务器请求地址，true 该参数规定请求是否异步处理。
  xhr.onload = () => { console.log('succeeded!') }; //请求完成
  xhr.onerror = (err) => { console.log(err) } //请求失败
  xhr.send(form); //开始上传，发送form数据
}

export const getExt = (path: string): string => {
  const splitted = path.trimEnd().split('.')
  return splitted[splitted.length - 1]
}


export const baseName = (absPath: string): string => {
  if (absPath == null) {
    return "";
  }
  absPath = absPath.replaceAll("\\", "/")
  const len = absPath.split("/").length;
  if (absPath.endsWith("/")) {
    return absPath.split("/")[len - 2];
  } else {
    return absPath.split("/")[len - 1];
  }
};

export const getDirName = (absPath: string): string => {
  absPath = absPath.replaceAll("\\", "/")
  const pos = absPath.lastIndexOf('/');
  return absPath.substring(0, pos);
}

export function downloadFile(file: File) {
  const a: HTMLAnchorElement = document.createElement("a");
  // 创建一个点击事件
  const event = new MouseEvent("click");
  // 将 a 的 download 属性设置为我们想要下载的图片的名称，若 name 不存在则使用'图片'作为默认名称
  a.download = file.name;
  // 将生成的 URL 设置为 a.href 属性
  // const url = 
  a.href = URL.createObjectURL(file);
  // 触发 a 的点击事件
  a.dispatchEvent(event);
}

export function downloadImage(id: string, name: string) {
  const image = new Image();
  // 解决跨域 canvas 污染问题
  image.setAttribute("crossOrigin", "anonymous");
  image.onload = function (): HTMLAnchorElement {
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context: CanvasRenderingContext2D = canvas.getContext(
      "2d"
    ) as CanvasRenderingContext2D;
    context.drawImage(image, 0, 0, image.width, image.height);
    //得到图片的base64编码数据
    const url = canvas.toDataURL("image/png");
    // // 生成一个 a 标签
    const a: HTMLAnchorElement = document.createElement("a");
    // 创建一个点击事件
    const event = new MouseEvent("click");
    // 将 a 的 download 属性设置为我们想要下载的图片的名称，若 name 不存在则使用'图片'作为默认名称
    a.download = name || "图片";
    // 将生成的 URL 设置为 a.href 属性
    a.href = url;
    // 触发 a 的点击事件
    a.dispatchEvent(event);
    return a;
  };
  image.src = (document.getElementById(id) as HTMLImageElement).src;
}