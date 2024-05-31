import CommonMenu from './menu.vue';

CommonMenu.install = function(Vue) {
    Vue.component(CommonMenu.name, CommonMenu);
};

export default CommonMenu;
