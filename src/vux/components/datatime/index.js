import Date from './Date';

Date.install = function(Vue) {
    Vue.component(Date.name, Date);
};

export default Date;
