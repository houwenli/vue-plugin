import { POST, UPLOAD, DOWNFILE, service, uploadFile, downFile,removePending,clearPending } from './src/util/httpService';   //请求代理类
import Router from "vue-router";

import './src/assets/css/index.css';
import './src/assets/icon-font/iconfont.css';

/*******工具类******/
import BaseMethod from './src/util/baseMethods';   //公共方法
import RegexList from './src/util/regexList';   //正则表达式
import Message from './src/util/resetMessage';   //重写全局消息弹窗
import Watermark from './src/util/watermark';   //背景水印
import EventBus from './src/util/eventBus';   //发布订阅事件
import * as power from './src/util/power';   //权限事件相关
import * as means from './src/util/means';
import $config from './src/util/config'//通用配置
import $rules from './src/util/rules'//通用表单校验


/******Vue自定义指令( 使用需注册 Vue.use(Directives) )**********/
import Directives from './src/directives';

/******Vue过滤器( 使用需注册 Vue.use(Filters) )************/
import Filters from './src/filters';

/******公共数据中心( 区别和vue的vuex不是同一个 )************/
import Global from './src/store/global';
import Vuex from './src/store';
import {mapState, mapGetters, mapMutations, mapActions} from './src/store';

const install = function (Vue, {router, store, config = {}} = {}) {

    if (!router) {
        console.error('vue-plugin need options: router');
        return;
    }
    if (!store) {
        console.error('vue-plugin need options: store');
        return;
    }
    const routerPush = Router.prototype.push;
    Router.prototype.push = function push(location, onResolve, onReject) {
        return routerPush.call(this, location, onResolve, onReject).catch(error => console.log(error));
    };
    const routerReplace = Router.prototype.replace;
    Router.prototype.replace = function push(location, onResolve, onReject) {
        return routerReplace.call(this, location, onResolve, onReject).catch(error => console.log(error));
    };
    config.serviceMap = means.formatServiceMap(config);

    //公共数据中心
    for (let [key, data] of Object.entries(config)) {
        Global.commit(key, data);
    }

    const events = new EventBus();
    //扩展vue-router方法，refresh可用于刷新缓存组件
    router.constructor.prototype.refresh = function(data) {
        events.$emit('clearKeepAlive', 'refresh');
        routerPush.call(this, data);
    };
    //重写vue-router方法，back可用立刻删除当前组件缓存
    router.constructor.prototype.back = (data) => {
        events.$emit('clearKeepAlive');
        router.push(data);
    };
    router.constructor.prototype.afterSaveBack = (data) => {
        events.$emit('clearKeepAlive');
        router.push(data);
        events.$emit('activated');
    };
    events.$on("activated", () => {
        let routerMap = Global.getState('uidMap');
        Vue.nextTick(() => {
            routerMap[Global.getState('table_uid')]();
        })
    });
    Global.commit('router', router);
    Global.commit('store', store);
    if (store.registerModule) {
        config.project && means.registerModule(store, config);
        store.replaceState(Object.assign({}, Global.getState('filtersData'), store.state));
        means.mergeFilters(Vue, store.state);
    } else {
        let $store = new Vuex(Vue, means.assignModule(store, config));
        Vue.prototype.$store = $store;
        Global.commit('store', $store);
        means.mergeFilters(Vue, $store.state);
        window.mapGetters = mapGetters;
        window.mapState = mapState;
        window.mapActions = mapActions;
        window.mapMutations = mapMutations;
    }
    const globalMap = new Map([
        ['$axios', (URL, data, conf = {}) => POST(means.getUrl(URL, conf), data, conf)],
        ['$downFile', (URL, data, conf = {}) => DOWNFILE(means.getUrl(URL, conf), data, conf)],
        ['$upLoad', (URL, data, conf = {}) => UPLOAD(means.getUrl(URL, conf), data, conf)],
        ['$eventBus', events], //发布订阅事件
        ['$baseMethod', BaseMethod], //通用方法
        ['$regexList', RegexList], //通用正则表达式
        ['$watermark', Watermark], //水印
        ['$message', Message], //重写element message组件
        ['$getModuleUrl', power.getModuleUrl], // 根据模块名查询当前模块所有配置的op
        ['$getModuleOpList', power.getModuleOpList], //根据模块名查询当前模块所有配置的op
        ['$getBaseMenuList', power.getBaseMenuList], //获取公共基础配置op列表,不传op时获取所有，传op时获取op对应url
        ['$config', $config], //通用配置
        ['$rules', $rules],
        ['$power', power]
    ]);
    for (let [key, value] of globalMap.entries()) {
        Global.commit(key, value);      //公共数据中心
        Vue.prototype[key] = value;     //绑定公共方法到vue原型
    }
    power.powerMixin(Vue);               //全局注入权限组件选项

    window.$vuex = Vue.prototype.$vuex = Global.store;   //公共数据中心

    Vue.use(Filters);   //注册全局过滤器
    Vue.use(Directives);    //注册全局自定义指令
    //自动加载index.js文件注册组件
    const componentsList = require.context('./src/components', true, /index.js/);
    componentsList.keys().forEach(key => Vue.use(componentsList(key).default));

    //自动注册全局组件
    config.component && means.registerComponent(Vue, config.component);
    // 用户关闭浏览器时 清除cookie
    window.onbeforeunload = function () {
        document.cookie = `WS_KEY=${JSON.stringify('')};expires=${new Date().toGMTString()};path=/`
    }
};


export default {
    version: process.env.VERSION,
    install,
    POST: (URL, data, conf = {}) => POST(means.getUrl(URL, conf), data, conf),
    UPLOAD: (URL, data, conf = {}) => UPLOAD(means.getUrl(URL, conf), data, conf),
    DOWNFILE: (URL, data, conf = {}) => DOWNFILE(means.getUrl(URL, conf), data, conf),
    mapState,
    mapGetters,
    mapMutations,
    mapActions,
    removePending,
    clearPending,
    service,
    uploadFile,
    downFile
}
