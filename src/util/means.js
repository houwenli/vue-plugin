import global from '../store/global';
import baseMethods from '../util/baseMethods';
import { MessageBox } from 'element-ui';

let list = new Map();
let getStoreFilters = (state, moduleName) => {
    for (let [key, data] of Object.entries(state)) {
        let valueType = baseMethods.typeOf(data);
        if (valueType === 'array' && key.toLocaleLowerCase().endsWith('filters')) {
            list.set(key, data);
            // 这里会生成大量的重复数据待优化
            if (list.has(key) && moduleName) {
                // 不同模块中定义了相同名称的字典，加上前缀防止被覆盖
                list.set(moduleName + '-' + key, data);
            }
        }
        if (valueType === 'object') {
            getStoreFilters(data, key);
        }
    }
};

export const mergeFilters = (Vue, state) => {
    getStoreFilters(state);
    for (let [key, data] of list) {
        Vue.filter(key, val => {
            let str = '';
            let valueType = baseMethods.typeOf(val);
            if (valueType === 'number' || valueType === 'string') {
                let list = data.filter(item => item.id == val);
                if (list.length) {
                    return list[0].value;
                }
            }
            if (valueType === 'array') {
                for (let obj of data) {
                    val.includes(obj.id) && (str += obj.value + ',');
                }
                str = str.substring(0, str.length - 1);
            }
            return str;
        });
    }
};

export const registerComponent = (Vue, requireComponent) => {
    requireComponent.keys().map(fileName => {
        // 获取组件配置
        const componentConfig = requireComponent(fileName);
        // 剥去文件名开头的 `./` 和`.vue`结尾的扩展名,并把驼峰命名改成中划线
        const componentName = fileName
            .replace(/^\.\//, '')
            .replace(/\.vue$/, '')
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .toLowerCase();
        // 全局注册组件
        Vue.component(
            componentName,
            // 如果这个组件选项是通过 `export default` 导出的，那么就会优先使用 `.default`，否则回退到使用模块的根。
            componentConfig.default || componentConfig
        );
        // return {
        //     path: '/'+componentName,
        //     name: componentName.replace(/\//,'-'),
        //     component
        // }
    });
};

export const formatServiceMap = config => {
    let { serviceMap = new Map() } = config;
    if (baseMethods.typeOf(serviceMap) !== 'map') {
        console.error('serviceMap must be: [object Map]');
        return new Map();
    }
    let map = new Map();
    for (let [key, value] of serviceMap.entries()) {
        if (baseMethods.typeOf(value) === 'string') {
            map.set(key, value);
        }
        if (baseMethods.typeOf(value) === 'array') {
            value.map(item => map.set(item, key));
        }
    }
    return map;
};

const baseURL = baseMethods.cachedFn(URL => {
    let processEnv = global.getState('processEnv') || {};
    let debug = global.getState('debug') || '';
    let serviceMap = global.getState('serviceMap');
    let isProxyUrl=URL.startsWith('/api')
    let rootUrl = isProxyUrl?'':processEnv[serviceMap.get(URL) || 'VUE_APP_BASE_API'];
    if (processEnv['NODE_ENV'] === 'dev' && !serviceMap.has(URL)) {
        rootUrl = isProxyUrl?'':processEnv[debug];
    }
    let env = processEnv.NODE_ENV.startsWith('dev') ? `-${processEnv.VUE_APP_ENV}` : '';
    let prefixMap = new Map([
        ['system', `https://confweb${env}.wsecar.com/api/confCenterWebImpl`],
        ['company', `https://partner${env}.wsecar.com/api/partner`],
        ['common', `https://confweb${env}.wsecar.com/api/confCenterWebImpl`] //第三方体系暂未用到
    ]);
    let { type = 'system', service } = $vuex.project;
    let prefixUrl = prefixMap.get(type);
    let VUE_APP = URL.includes('wscommon/local/selectOrgOption') ? 'VUE_APP_ORG_API' : 'VUE_APP_CITY_API';
    if (
        URL.includes('wscommon/local/selectOrgOption') ||
        URL.includes('wscommon/local/selectAreaTree') ||
        URL.includes('wscommon/local/selectOrgByOrgName') ||
        URL.includes('wscommon/districtManage/select')
    ) {
        // 机构接口，添加wscommon防止和项目中的接口地址重名
        rootUrl = processEnv[serviceMap.get(URL) || VUE_APP] || prefixUrl;
    }
    // oa中的通用省市区接口
    if (URL.includes('wscommon/authority/dataSync/select')) {
        rootUrl = processEnv[serviceMap.get(URL) || 'VUE_APP_CITY_API'] || processEnv[service];
    }
    URL = URL.replace('wscommon/', '');
    return `${rootUrl || ''}${URL}`;
});

export const getUrl = (URL, config) => {
    if (!URL) return;
    !URL.startsWith('/') && (URL = '/' + URL);
    if (config.baseURL) {
        return URL;
    }

    return baseURL(URL);
};

export const registerModule = (store, config) => {
    //type:账号体系,  运营体系：system; 分支机构体系：company, 第三方：common
    //service:接口服务
    if (!config || !config.project) {
        return {
            state: {},
            getters: {},
            mutations: {},
            actions: {}
        };
    }
    const { moduleName, service = '', type = 'system', namespaced = true, registerModule = 'login', systemKey: systemCode, enableLink = false, jumpLink } = config.project;
    const baseURL = config.processEnv[service];
    const conf = {
        dataType:'string',
        successCode:1,
        unLoginCode:[-25, -20402, -20406, -20414, -20404]
    };
    baseURL && (conf.baseURL = baseURL);

    const options = {
        namespaced,
        state: {
            userInfo: baseMethods.getStore('_ccmUser'),
            menuList: [],
            opIdMap: {},
            baseMenu: []
        },
        getters: {
            userInfo: state => state.userInfo,
            menuList: state => state.menuList,
            baseMenuMap:state=>state.baseMenu.reduce((obj,menu)=>{
                obj[menu.op]=menu.url
                return obj
            },{})
        },
        mutations: {
            setUserInfo(state, data) {
                state.userInfo = data;
            },
            setMenuList(state, data) {
                state.menuList = data;
            },
            setOpIdMap(state, data) {
                state.opIdMap = data
            },
            setbaseMenu(state, data) {
                state.baseMenu = data
            }
        },
        actions: {
            //登陆
            requestLogin({ commit }, parm) {
                const URL = `/${type}/login`;
                return $vuex.$axios(URL, parm, conf);
            },
            requestSmsLogin({ commit }, parm) {
                const URL = `/${type}/smsLogin`;
                return $vuex.$axios(URL, parm, conf);
            },
            //获取登录验证码  base64
            requestGetValidateCode({ commit }, parm) {
                const URL = `/${type}/getValidateCode`;
                return $vuex.$axios(URL, parm, conf);
            },
            //获取手机验证码
            requestGetSmsCode({ commit }, parm) {
                const URL = `/${type}/sendSms`;
                return $vuex.$axios(URL, parm, conf);
            },
            //获取手机验证码长度
             requestGetSmsCodeLen({ commit }) {
              const URL = `/${type}/getSmsCodeLength`;
              return $vuex.$axios(URL, {}, conf);
            },
            //退出登录
            requestLogout({ commit }, parm) {
                const URL = `/${type}/logout`;
                MessageBox.confirm('确定要退出登录吗？', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    center: true
                }).then(() => {
                    $vuex.$axios(URL, parm, conf).then(res => {
                        baseMethods.removeStore('_ccmUser');
                        baseMethods.removeStore(baseMethods.getSystemKey());
                        baseMethods.clearStore();
                        global.getState('router').replace({ path: '/' });
                    });
                });
            },
            //更改密码
            requestUpdatePassword({ commit }, parm) {
                const URL = `/${type}/updatePassword`;
                return $vuex.$axios(URL, parm, conf);
            },
            requestResetPassword({ commit }, parm) {
                const URL = `/${type}/resetPassword`;
                return $vuex.$axios(URL, parm, conf);
            },
            //获取权限菜单
            async getMenuList({ commit,dispatch }, project = {isGetBaseMenu:true}) {
                try {
                    // 直接在菜单中获取，避免去改每个子系统,isGetBaseMenu为false取消请求
                    project.isGetBaseMenu&&await dispatch('getBaseMenu',project)
                } catch (error) {
                    console.log(error)
                }
                const URL = `/${type}/getModuleMenu`;
                const parm = {
                    data: {
                        systemCode: project.systemCode || systemCode,
                        moduleName: project.moduleName || moduleName
                    },
                    op: ''
                };
                return $vuex.$axios(URL, parm, { isCancel: false,...conf,...project }).then(res => {
                    let data = JSON.parse(res.data)
                    $vuex.project.menuList = data
                    commit('setMenuList', data)
                    let map = formMenuList(data)
                    commit('setOpIdMap', map)
                    // 用于axios拦截器中添加menuId
                    global.commit('opIdMap', map)
                    let systemKey = baseMethods.getSystemKey()
                    let menuMap = baseMethods.getStore(systemKey)
                    let path = enableLink ? jumpLink : global.getState('currentPath');
                    // 区分从登录页跳转和页面刷新，仅在登录页跳转，判断当前路由是否在授权页中，默认取第一个
                    if (!menuMap && getMenuPaths(data) && !getMenuPaths(data).includes(path)) {
                        path = getMenuPaths(data).some(v => path.startsWith(v)) ? path : getMenuPaths(data)[0]
                        return new Promise((resolve, reject) => {
                            global.getState('router').replace(path).then(resolve).catch(reject)
                        })
                    }
                  
                });

            },
            // 获取基础配置op
            async getBaseMenu({ commit }, project = {}) {
                return new Promise((resolve, reject) => {
                    const URL = `/${type}/getBasicMenu`;
                    const parm = {
                        data: {
                            systemCode: project.systemCode || (systemCode==='oa'?'OASYSTEM':systemCode),//oa里很多key写死了oa-需要特殊处理
                        },
                    }
                    $vuex.$axios(URL, parm,conf).then(res => {
                        let data=JSON.parse(res.data)
                        commit('setbaseMenu', data)
                        resolve(data)
                    }).catch(err => {
                        reject(err)
                    })

                })


            }
        }
    };

    if (store.registerModule) {
        if (store.state[registerModule]) {
            store.unregisterModule(registerModule);
        }
        store.registerModule(registerModule, options);
    }

    return options;
};

export const assignModule = (store, config) => {
    let module = registerModule(store, config);
    return {
        state: {
            ...global.getState('filtersData'),
            ...module.state,
            ...store.state
        },
        getters: {
            ...module.getters,
            ...store.getters
        },
        mutations: {
            ...module.mutations,
            ...store.mutations
        },
        actions: {
            ...module.actions,
            ...store.actions
        }
    };
};

function getMenuPaths(menuList) {
    let pathArr = []
    if (menuList && !menuList.length) return pathArr
    let urlPrefix = url => (url.startsWith('/') ? url : '/' + url);
    let help = (menus) => {
        for (let i = 0; i < menus.length; i++) {
            if (menus[i].type == 2) {
                pathArr.push(urlPrefix(menus[i].resourcesUrl))
            }
            if (menus[i].children && menus[i].children.length) {
                help(menus[i].children)
            }
        }
    }
    help(menuList)
    return pathArr
}
/**
 * 遍历菜单树 组装数据 { moduleName: { op: id } }
 * category 1 页面及分类菜单 category 2 url category 3 op
 * oa中菜单接口和子系统菜单结构不一致，oa要处理所有页面及分类菜单即 temp.category == 1 && temp.resourcesUrl
*/
function formMenuList(arr) {
    let urlPrefix = (url) => (url.startsWith("/") ? url : "/" + url)
    let collectPages = (menus, pages = []) => {
        for (let i = 0; i < menus.length; i++) {
            let temp = menus[i]
            if (temp.category == 1 && temp.resourcesUrl) {
                let newArr =
                    temp.children &&
                    temp.children.reduce((pre, cur) => {
                        pre = pre.concat(cur.category == 2 && cur.children ? cur.children : [])
                        return pre
                    }, [])
                pages.push({ ...temp, children: newArr })
            }
            if (temp.children) {
                collectPages(temp.children, pages)
            }
        }
        return pages
    }
    let help = (menus) => {
        let map = {}
        for (let i = 0; i < menus.length; i++) {
            let temp = menus[i]
            if (temp.category == 1 && temp.resourcesUrl) {
                map[urlPrefix(temp.resourcesUrl)] = {}
                temp.children &&
                    temp.children.map((v) => {
                        map[urlPrefix(temp.resourcesUrl)][v.op] = v.id
                    })
            }
        }
        return map
    }

    return help(collectPages(arr))
}
