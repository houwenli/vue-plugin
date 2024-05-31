
/***************工具类( 使用建议绑定到Vue.prototype.$baseMethod = BaseMethod)***********/
import BaseMethod from './src/util/baseMethods';   //公共方法
import RegexList from './src/util/regexList';   //正则表达式

/***************抽象类( 使用需 Vue.use(...) )******************************************/
import Throttle from './src/packages/abstract/throttle';
import EnterEvent from './src/packages/abstract/enterEvent';


/***************移动端Vue组件( 使用需 Vue.use(...) )*****************************************/
import VuxVerification from './src/vux/components/verification';
import DateTime from './src/vux/components/datatime';


/***************Vue自定义指令( 使用需注册 Vue.use(Directives) )***************************/
import Directives from './src/packages/directives';

/***************Vue过滤器( 使用需注册 Vue.use(Filters) )***************************/
import Filters from './src/packages/filters';


// const components = [
//     Table,
//     Date,
//     Verification
// ]
//
// const install = function (Vue, opts = {}) {
//     components.forEach(component => {
//         Vue.component(component.name, component);
//     });
// };

// if (typeof window !== 'undefined' && window.Vue) {
//     install(window.Vue);
// }

export {
    RegexList,
    BaseMethod,
    Directives,
    Filters,
    Throttle,
    VuxVerification,
    DateTime
}
