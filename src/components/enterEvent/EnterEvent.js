import baseMethods from '../../util/baseMethods'

export default {
    name: 'ws-enter-event',
    abstract: true,
    props: {
        time: {
            type: Number,
            default: 500
        },
        throttle: {
            type: Boolean,
            default: false
        },
        //defer默认true: 反向防抖，先执行回调，单位时间内重触发时间，不再执行回调。可用于合并请求，执行第一次 后续单位时间内不再执行。
        defer: {
            type: Boolean,
            default: true
        },
        listenEnter: {
            //是否监听回车事件
            type: Boolean,
            default: false
        }
    },
    data(){
        return {
            throttledMap: {}
        }
    },
    mounted() {
        if (this.$slots.default){
            this.key = this.$route.path;
            //防抖阀
            this.$emitEvent = baseMethods.debounce(this.emitEvent, this.time, this.defer);
            this.binldEvent();
        }
    },
    render() {
        const vnode = this.$slots.default ? this.$slots.default[0] : null;
        const listeners = vnode && vnode.componentOptions.listeners;
        if (listeners){
            let _evnet = this.throttle ? 'throttle' : 'debounce';
            Object.getOwnPropertyNames(listeners).forEach(key => {
                if (!this.throttledMap[key]){
                    this.throttledMap[key] = baseMethods[_evnet](listeners[key], this.time ,this.defer);
                }
            });
            Object.getOwnPropertyNames(this.throttledMap).forEach(key => {
                listeners[key] = this.throttledMap[key];
            })
        }
        return vnode;
    },
    methods: {
        enterHandler(e) {
            if (this.$route.path !== this.key) {
                return false;
            }
            if (!this.listenEnter) return false
            let event = e || window.event;
            let keyCode = event.keyCode || event.which || event.charCode;
            if (keyCode === 13) {
                this.$emitEvent();
            }
        },
        emitEvent() {
            if (this.$listeners.event) {
                this.$emit('event');
            } else {
                this.$el.click();
            }
        },
        binldEvent() {
            //节流阀
            let event = baseMethods.throttle(this.enterHandler, 300);
            baseMethods.addHandler(window, 'keyup', event);
        },
        destroyEvent() {
            let event = baseMethods.throttle(this.enterHandler, 300);
            baseMethods.removeHandler(window, 'keyup', event);
        }
    },
    beforeDestroy() {
        this.destroyEvent();
    }
}
