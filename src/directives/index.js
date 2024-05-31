import fn from "../util/baseMethods"
const modules={}
let files=require.context('./src',true,/\.js$/)
files.keys().forEach(item=>{
    let name= fn.getKebabCase(item.replace('./','').split('.')[0])
    modules[name]=files(item).default
})

const Directives = {};

Directives.install = function(Vue) {
    for(let name in modules){
        Vue.directive(name,modules[name])
    }
};

export default Directives;
