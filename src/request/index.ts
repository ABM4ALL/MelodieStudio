import { HTTPResponse } from "@/models/models";
import axios from "axios";
import { ElNotification } from "element-plus";
import EventEmitter from 'events';



class Request extends EventEmitter {
    constructor() {
        super();
        this.interceptors();
    }
    interceptors() {
        axios.interceptors.request.use(
            config => {
                return config;
            },
            error => {
                return Promise.reject(error);
            }
        );
        axios.interceptors.response.use(
            response => {
                const code = response.status;
                if ((code >= 200 && code < 300) || code === 304) {
                    this.emit("HttpStatusSuccess");
                    // response.data
                    const data: HTTPResponse = response.data
                    if (data.status !== 0) {
                        console.error("Server cannot deal with request, the error message:", data.msg)
                        ElNotification.error(data.msg)
                        return Promise.reject(response);
                    }
                    return Promise.resolve(response.data);
                } else {
                    // 响应错误逻辑处理 5xx 4xx 等等
                    this.emit("http-request-fail");
                    return Promise.reject(response);
                }
            },
            error => {
                // 响应错误逻辑处理
                // const code = response.status;
                console.error(error);

                this.emit("http-request-fail");
                return Promise.reject(error);
            }
        );
    }
    get(url, params?): Promise<HTTPResponse> {
        const resp = axios({
            method: 'get',
            url,
            params
        }) as unknown as Promise<HTTPResponse>;
        return resp
    }
    post(url, data): Promise<HTTPResponse> {
        return axios({
            method: 'post',
            url,
            data
        }) as unknown as Promise<HTTPResponse>;
    }
    delete(url, data) {
        return axios({
            method: 'delete',
            url,
            data
        });
    }
    put(url, data) {
        return axios({
            method: 'put',
            url,
            data
        });
    }
    patch(url, data) {
        return axios({
            method: 'patch',
            url,
            data
        });
    }
}

const request: Request = new Request();

// 这里监听请求的错误统一处理（做弹窗提示提示）
request.on("http-request-fail", () => {
    ElNotification.error("Request failed, please check the interface.");
});


export default request;

