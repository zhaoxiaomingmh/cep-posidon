import { AppRef } from "@/router/App";
import axios from "axios";
import { psConfig } from "./util-env";

export const API_KEY = 'x-api-key';
export const API_TIMESTAMP = 'x-api-timestamp';
export const API_CLIENTID = 'x-api-clientid';
export const API_EMAILE = 'X-User-Email'

const instance = axios.create({
    timeout: 50000,
    headers: {
        'Content-Type': 'application/json',
    },
    responseType: 'json'
})

// 添加请求拦截器
instance.interceptors.request.use(function (config) {
    config.headers[API_KEY] = psConfig.rsa;
    config.headers[API_CLIENTID] = psConfig.clientId
    config.headers[API_TIMESTAMP] = psConfig.timeStamp;
    config.headers[API_EMAILE] = AppRef.current.user.email;
    config.headers["Content-Type"] = 'application/json'
    // 在发送请求之前做些什么   
    config.url = psConfig.host + config.url;
    return config;
}, function (error) {
    // 对请求错误做些什么   
    return Promise.reject(error);
});

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
    // 对响应数据做点什么   
    //console.log(response)
    return response;
}, function (error) {
    // 对响应错误做点什么   
    return Promise.reject(error);
});


// get请求
function httpGet(api, params, name: String = '') {
    return new Promise((reslove, reject) => {
        instance.get(api, {
            params: params
        }).then(res => {
            console.log(res);
            reslove(res)
        }).catch((err) => {
            console.log("api第一次请求错误:", err)
            if (err.code == "ERR_NETWORK") {
                return;
            }
            if (err.response) {
                if (err.response.status == 401) {
                    instance.get(api, {
                        params: params
                    }).then(resp => {
                        console.log(resp);
                        reslove(resp)
                    }).catch((error) => {
                        if (name && name.length > 0) {
                            reject(error);
                        }
                        console.log('api重试后依然请求错误:', error);
                        reject(error);
                    });
                } 
                    else {
                        reject(err);
                    }
                
            }
        })
    })
};

// post请求
function httpPost(api, data): any {
    return new Promise((reslove, reject) => {
        instance.post(api, data).then(res => {
            reslove(res)
        }).catch((err) => {
            console.log("api第一次请求错误:", err)
            if (err.code == "ERR_NETWORK") {
                return;
            }
            if (err.response) {
                if (err.response.status == 401) {
                    instance.post(api, data).then(resp => {
                        reslove(resp)
                    }).catch((error) => {
                        console.log('api重试后依然请求错误:', error);
                        reject(error);
                    });
                } else {
                    reject(err);
                }
            }
        })
    })
};

function httpPut(api, data) {
    return new Promise((reslove, reject) => {
        instance.put(api, data).then(res => {
            reslove(res)
        }).catch((err) => {
            console.log("api第一次请求错误:", err)
            if (err.code == "ERR_NETWORK") {
                return;
            }
            if (err.response) {
                if (err.response.status == 401) {
                    instance.put(api, data).then(resp => {
                        reslove(resp)
                    }).catch((error) => {
                        console.log('api重试后依然请求错误:', error);
                        reject(error);
                    });
                } else if (err.response.status == 500) {
                    console.log('服务器内部错误:', err.response);
                    reject(err.response); // 处理 500 错误
                }
            }
        })
    })
};

function httpDelete(api, data) {
    return new Promise((reslove, reject) => {
        instance.delete(api, data).then(res => {
            reslove(res)
        }).catch((err) => {
            console.log("api第一次请求错误:", err)
            if (err.code == "ERR_NETWORK") {
                return;
            }
            if (err.response) {
                if (err.response.status == 401) {
                    instance.delete(api, data).then(resp => {
                        reslove(resp)
                    }).catch((error) => {
                        console.log('api重试后依然请求错误:', error);
                        reject(error);
                    });
                }
            }
        })
    })
};

export default {
    httpGet, httpPost, httpDelete
}