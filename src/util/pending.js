const pendingMap = new Map();
import axios from 'axios';

const CancelToken = axios.CancelToken;
const getUrl = ({ method, url, data }) => {
    data = typeof data === 'string' ? JSON.parse(data) : data;
    const { op, menuName } = data; //对应页面的配置的moduleName
    return [method, url, op, menuName].join('&');
};
export const addPending = config => {
    const { isCancel } = $vuex.project;
    // 全局开关 请求开关
    if (!isCancel || config.isCancel === false) return;
    const url = getUrl(config);
    config.cancelToken =
        config.cancelToken ||
        new CancelToken(c => {
            if (!pendingMap.has(url)) {
                pendingMap.set(url, c);
            }
        });
};
export const removePending = config => {
    //也可以设置白名单，而不用在请求时配置
    const { cancelWhiteList = [] } = $vuex;
    if (config.isCancel === false) return;
    const url = getUrl(config);
    if (pendingMap.has(url) && !cancelWhiteList.includes(config.url)) {
        const cancel = pendingMap.get(url);
        cancel('cancel request');
        pendingMap.delete(url);
    }
};
export const clearPending = (msg='cancel request') => {
    for (const [url, cancel] of pendingMap) {
        cancel(msg);
    }
    pendingMap.clear();
};
