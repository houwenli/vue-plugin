import Tabs from './Tabs.vue';

Tabs.install = function(Vue) {
    Vue.component(Tabs.name, Tabs);

    // Vue.mixin({
    //     deactivated(){
    //         if (this.$route.meta.isRefresh){
    //             this.$destroy(this.$route.name);
    //         }
    //     },
    // })
};

export default Tabs;
