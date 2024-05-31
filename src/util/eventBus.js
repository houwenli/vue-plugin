class EventBus {
    constructor() {
        this.events = new Map();
    }

    // 订阅事件
    $on(type, fn) {
        this.events.set(type, fn);
    }

    // 只执行一次订阅事件
    $once(type, fn) {
        this.$on(type, () => {
            fn();
            this.$off(type);
        });
    }

    // 发布 触发事件
    $emit(type, ...args) {
        const fn = this.events.get(type);
        fn && fn.apply(null, args);
    }

    //取消订阅
    $off(type) {
        this.events.delete(type);
    }
}

export default EventBus;
