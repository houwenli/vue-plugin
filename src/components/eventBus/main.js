import EventBus from './EventBus';

const $eventBus = {
    install(Vue,option){
        Vue.prototype.$eventBus = new EventBus(Vue);
        Vue.mixin({
            // 拦截beforeDestroy钩子自动销毁自身所有订阅的事件
            beforeDestroy(){
                this.$eventBus.$offVmEvent(this['uid']);
            }
        })
    }
}
export default $eventBus;
