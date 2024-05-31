import axios from 'axios';
import message from './resetMessage';
import baseMethods from './baseMethods';
import global from '../store/global';
import { addPending, removePending, clearPending } from './pending';
axios.defaults.timeout = 15000;

// 请求成功code
const getSuccessCode=(config)=>{
    // 默认code
    let defaultCode=1
    // 全局配置code
    const { successCode:httpCode} = $vuex.http||{}
    // 请求配置code
    let {successCode}=config||{}
    return successCode||httpCode||defaultCode
}
// 未登录code
const getUnLoginCode=(config)=>{
    // 默认code
    let defaultCode=[-25, -20402, -20406, -20414, -20404]
    // 全局配置code
    const { unLoginCode:httpCode=[] } = $vuex.http||{}
    // 请求配置code
    let {unLoginCode=[]}=config||{}
    return defaultCode.concat(httpCode).concat(unLoginCode)
}
//service post
let service = axios.create();

//自定义uploadFile 上传接口 formdata
let uploadFile = axios.create();

//自定义downFile 下载二进制流
let downFile = axios.create({
    responseType: 'arraybuffer'
});

const requestHandler = config => {
    let hasUrl = checkUrl(config);
    if(!hasUrl)return false
    // 获取当前请求op的id
    // oa中moduleName用于权限分块，不一定与路由相关，需调用getModuleUrl存moduleName，子应用中，moduleName与路由相关，可直接取
    let menuName = window.sessionStorage.getItem('moduleName') || '';
    let { data } = config;
    let opIdMap = global.getState('opIdMap') || {};
    let menuId = opIdMap[menuName] && opIdMap[menuName][data.op];

    const { moduleName, commonData } = $vuex.project;
    const { headers,params,dataType='string' } = $vuex.http||{};
    let formData = config.data.data;
    let store = baseMethods.getStore('_ccmUser');
    let token = Object.prototype.toString.call(store) === '[object Object]' ? store.token : '';
    config.data = {
        token,
        systemName: moduleName,
        menuId,
        menuName,
        ...config.data,
        ...commonData,
        ...params
    };
    $vuex.project.menuDictionary ? (config.data.menuDictionary = $vuex.project.menuDictionary) : '';
    //删除传参对象空属性，如果已对象转字符串则转成转成对象
    if (formData) {
        // 防止纯数字参数超过number的最大长度
        if (isNaN(Number(formData))) {
            // 参数为对象形式
            if (typeof formData === 'string') {
                formData = JSON.parse(formData);
            }
            formData = baseMethods.delEmptyObject(formData);
            let resDataType=config.dataType||dataType
            config.data.data = resDataType==='string'?JSON.stringify(formData):formData;
        } else {
            // 参数为纯数字
            if (typeof formData === 'number') {
                formData = JSON.stringify(formData);
            }
            config.data.data = formData;
        }
    }
    removePending(config); // 在请求开始前，对之前的请求做检查取消操作
    addPending(config); // 将当前请求添加到 pending 中
    config.headers = {
        'Content-Type': 'application/json; charset=UTF-8',
        // 灰度需要增加两个请求头
        // 'X-Token':token,
        'X-Uid':store?store.id:'',
    };
    if(headers){
        config.headers={...config.headers,...headers}
    }
    return config;
};
const responseHandler = response => {
    removePending(response.config); // 在请求结束后，移除本次请求
    /**
     * -20414 您的账号在另外一台设备上登录，现强制下线
     -20402 登录失败
     -20406 获取权限列表出错
     -20404 退出登录session过期
     -25 session过期
     跳转首页
     */
    let unLoginCode = [-25, -20402, -20406, -20414, -20404];

    let {isCatch = false}=response.config;

    if (getUnLoginCode(response.config).includes(response.data.code)) {
        sessionStorage.clear()
        // sessionStorage.removeItem('_ccmUser');
        document.cookie = `WS_KEY=${JSON.stringify('')};expires=${new Date().toGMTString()};path=/`;

        /**
         * global.getState('router').replace({ path: '/' });
         *
         * 这里global.getState('router') 获取到路由是子应用的路由实例， 不是oa/os主应用的。 本质是当前应用跳转到 / 根路由-从而命中路由中的/，然后重定向到子应用的login页面
         * 然后在 子应用的login.vue中调用一些方式，跳转主应用的 mainLogin路由
         *
         * 上面这个方式经过测试无法触发 子应用跳转回主应用的 mainLogin路由
         */

        let url = window.location.origin + '/mainLogin'
        window.history.pushState({}, '', url)
    }
    if (response.status === 200 && response.data.code !== getSuccessCode(response.config)) {
        if (!isCatch) {
            response.data.msg &&
                message.error({
                    showClose: true,
                    message: response.data.msg,
                    type: 'error'
                });
        }
    }
    return response;
};
const errorHandler = error => {
    if (axios.isCancel(error)) {
        console.error('cancel request: ' + error.message);
    } else {
        let { isCatch = false } = error.config||{};
        if (!isCatch) {
            message.error('网络异常，请稍后重试');
        }
    }

    return Promise.reject(error);
};

const checkUrl = (config, dataType = 'json') => {
    let { url, data } = config;
    if (!url) {
        let path = location.pathname;
        let op = '',
            params = '';
        if (dataType === 'json') {
            op = data.op;
            params = data.data;
        } else {
            op = data.get('op');
            for (let [k, v] of data.entries()) {
                params += k + '=' + v;
            }
        }
        message.error('账号无权限，请联系管理员授权');
        console.error(`当前请求无权限：[路由地址]：${path} ; [op]: ${op} ;[请求参数]: ${JSON.stringify(params)}`);
        return false;
    }
    return true;
};

//request 拦截器
service.interceptors.request.use(
    config => requestHandler(config),
    error => errorHandler(error)
);
downFile.interceptors.request.use(
    config => requestHandler(config),
    error => errorHandler(error)
);
uploadFile.interceptors.request.use(
    config => {
        config.headers = {
            'Content-Type': 'multipart/form-data'
        };
        let hasUrl =checkUrl(config, 'formData');
        if(!hasUrl)return false
            return config;
        },
    error => errorHandler(error)
);

//response 拦截器
service.interceptors.response.use(
    response => responseHandler(response),
    error => errorHandler(error)
);
uploadFile.interceptors.response.use(
    response => responseHandler(response),
    error => errorHandler(error)
);
downFile.interceptors.response.use(
    response => {
        removePending(response.config);
        // 实现自动下载前提是服务端要在header设置Access-Control-Expose-Headers: Content-Disposition
        // 前端才能正常获取到Content-Disposition内容
        const disposition = response.headers['content-disposition'];
        const contentType = response.headers['content-type'];

        //返回二进制流会自动下载
        if (disposition && !contentType.includes('application/json')) {
            let fileName = disposition.substring(disposition.indexOf('filename=') + 9, disposition.length);
            // 对文件名进行解密
            fileName = decodeURIComponent(fileName);
            //去除文件名引号
            fileName = fileName.replace(/\"/g, '');
            let blob = new Blob([response.data], { type: contentType });
            let a = document.createElement('a');
            a.download = fileName; //指定下载的文件名
            a.href = URL.createObjectURL(blob); //  URL对象
            if (document.all) {
                a.click(); // 模拟点击
            } else {
                //兼容火狐点击事件
                let evt = document.createEvent('MouseEvents');
                evt.initEvent('click', true, true);
                a.dispatchEvent(evt);
            }
            URL.revokeObjectURL(a.href); // 释放URL 对象
            return response;
        } else if (contentType.includes('application/json')) {
            //异常返回json会自动处理异常信息
            return new Promise((resolve, reject) => {
                let reader = new FileReader();
                let blob = new Blob([response.data], { type: contentType });
                reader.readAsText(blob);
                reader.onloadend = e => {
                    response.data = JSON.parse(e.target.result);
                    resolve(responseHandler(response));
                };
            });
        }
    },
    error => errorHandler(error)
);

//封装POST请求
const POST = (url, data = {}, config = {}) => {
    return new Promise((resolve, reject) => {
        service
            .post(url, data, config)
            .then(response => {
                if (response.data.code === getSuccessCode(config)) {
                    resolve(response.data);
                } else {
                    reject(response.data);
                }
            })
            .catch(err => {
                reject(err);
            });
    });
};

//封装UPLOAD请求
const UPLOAD = (url, formdata, config = {}) => {
    return new Promise((resolve, reject) => {
        uploadFile
            .post(url, formdata, config)
            .then(response => {
                if (response.data.code === getSuccessCode(config)) {
                    resolve(response.data);
                } else {
                    reject(response.data);
                }
            })
            .catch(err => {
                reject(err);
            });
    });
};
//封装DOWNFILE请求
const DOWNFILE = (url, data, config = {}) => {
    return new Promise((resolve, reject) => {
        downFile
            .post(url, data, config)
            .then(response => {
                if (response.data.code === getSuccessCode(config) || response.data.code === undefined) {
                    resolve(response.data);
                } else {
                    reject(response.data);
                }
            })
            .catch(err => {
                reject(err);
            });
    });
};
/**
 * http请求代理类,封装成vue插件，绑定到vue原型prototype上
 * 使用Vue.use(fetch),this.$ajax.get();
 */
// const fetch = {
//     install(Vue, options) {
//         Object.defineProperties(Vue.prototype, {
//             $ajax: {
//                 get() {
//                     return {
//                         GET,
//                         POST,
//                         PUT
//                     }
//                 },
//             }
//         })
//     }
// }
export { POST, UPLOAD, DOWNFILE, service, uploadFile, downFile, removePending, clearPending };
