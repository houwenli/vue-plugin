import Descriptions from "./Descriptions.vue"
import Item from "./Item.vue"
Descriptions.install=function(Vue){
    Vue.component(Descriptions.name,Descriptions)
    Vue.component(Item.name,Item)
}
export default Descriptions