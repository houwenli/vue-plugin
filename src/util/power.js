import baseMethods from './baseMethods';
import global from '../store/global';


/**
 * @description 获取公共基础配置op列表
 * @param {*} op 不传op时获取所有，传op时获取op对应url
 * @returns {op:url}
 */
export const getBaseMenuList=(op)=>{
    const { namespaced = true, registerModule = 'login' } = $vuex.project;
    const type=namespaced && registerModule
    const baseMenuMap=$vuex.store.getters[`${type}/baseMenuMap`]
    return op? baseMenuMap[op]:baseMenuMap
}
//根据模块名查询当前模块下所有的权限
const getMenuList = (modelName) => {
    let menuDataList = baseMethods.getStore(baseMethods.getSystemKey())|| {};
    return menuDataList[modelName] || {};
};

//根据模块名和op值查询对应模块的请求地址及权限
export const getModuleUrl = (moduleName, op) => {
    if (!moduleName || !op) {
        baseMethods.removeStore('moduleName')
        return '';
    }
    baseMethods.setStore('moduleName', moduleName)
    let list = getMenuList(moduleName)[op] || {};
    return list['resourcesUrl']||getBaseMenuList()[op]||''
};

//根据模块名查询当前模块所有配置的op
export const getModuleOpList = (moduleName) => {
    if (!moduleName) {
        return [];
    }
    return getMenuList(moduleName);
};

//全局注入权限组件选项
export const powerMixin = (Vue) => {
    Vue.mixin({
        computed: {
            powerList() {
                if (!this.moduleName) {
                    return {};
                }
                let list = {};
                let menuDataList = getMenuList(this.moduleName);
                for (let [key, value] of Object.entries(menuDataList)) {
                    list = {
                        ...list, ...{
                            [key]: value.resourcesUrl
                        }
                    }
                }
                list={...getBaseMenuList(),...list}
                return list;
            }
        },
        beforeRouteEnter(to, from, next) {
            next(vm => {
                let { systemKey } = global.getState('project')
                if (systemKey !== 'oa') {
                    baseMethods.setStore('moduleName', vm.moduleName)
                }
                global.commit('currentPath', to.fullPath)
            })
        },
        getModuleUrl(op) {
            return getModuleUrl(this.moduleName, op);
        },
    })
}
