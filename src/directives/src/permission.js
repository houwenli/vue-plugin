import { getBaseMenuList,getModuleOpList } from "../../util/power"
import baseMethods from "../../util/baseMethods"
const checkPermission = ({ el, binding,vnode }) => {
    let { value, modifiers } = binding
    let fn = modifiers.or ? 'some' : 'every'
    let powerList = vnode.context.powerList
    let type=baseMethods.typeOf(value)
    if(type==='object'){
        let {op,moduleName}=value
        value=op
        moduleName&&(powerList=getModuleOpList(moduleName))
    }
    typeof value==='string'&&(value = value.split())
    let baseMenu = getBaseMenuList() || {};
    let hasAuth = value[fn](op => {
        return powerList[op] || baseMenu[op]
    })
    if (!hasAuth) {
        el.parentNode && el.parentNode.removeChild(el)
    }
}
export default {
    inserted(el, binding, vnode) {
        let { value} = binding
        if (!value) return
        checkPermission({ el, binding,vnode })
    }
}

