import City from "./City.vue"
City.install = function (Vue) {
    Vue.component(City.name, City)
}
export default City;
