import global from '../../store/global';
import baseMethods from '../../util/baseMethods';


export default {
    name: 'ws-keep-alive',
    abstract: true,
    props: {
        include: Array,  //只缓存include包含组件，如果不传include 则缓存所有组件
        exclude: Array,  //exclude和include 存在交集时，则更新缓存
        max: {      //最大缓存数，!!max == false 则不限制缓存数
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            refresh: false,
        }
    },
    created() {
        this.cache = new Map(); // 缓存虚拟dom {key: VNode}
        this.keys = new Map(); //路由对应的组件key值   {key: path}
        this.scrollTopMap = new Map();  //记录缓存页面滚动条高度   {key: scrollTop}
        this.watchd();
        this.monitor();
    },
    render() {
        const vnode = this.$slots.default ? this.$slots.default[0] : null;
        const componentOptions = vnode && vnode.componentOptions;
        if (componentOptions) {
            //组件名
            const name = this.getComponentName(componentOptions);
            //组件唯一key值
            const key = vnode.key == null
                ? componentOptions.Ctor.cid + (componentOptions.tag ? `::${componentOptions.tag}` : '') : vnode.key;

            //当前组件是否在缓存中
            const cached = this.keys.has(key);
            //如果缓存部分组件，并且不在include里面，则代表不启用缓存，直接返回vnode
            //如果在exclude里面，则删除缓存
            if ((this.include && !this.include.includes(name)) ||
                this.exclude && this.exclude.includes(name)) {
                cached && this.clearKeepAlived(key);
                return vnode;
            }
            //如果命中缓存，则取缓存
            if (cached) {
                //获取缓存组件
                vnode.componentInstance = this.cache.get(key).componentInstance;
                //获取缓存组件滚动条记录
                this.scrollTopMap.has(key) && this.$nextTick(() => this.getScrollTop(key));
                this.keys.delete(key);
                this.keys.set(key, this.$route.path);
            } else {
                //没有命中缓存则设置缓存
                this.cache.set(key, vnode);
                this.keys.set(key, this.$route.path);
                if (this.max && this.keys.size > parseInt(this.max)) {
                    //如果超出最大缓存数，则删除最久不活动的缓存
                    let firstKey = [...this.keys.keys()][0];
                    this.clearKeepAlived(firstKey);
                }
            }
            vnode.data.keepAlive = true; //渲染和执行被包裹组件的钩子函数需要用到
        }
        return vnode;
    },
    methods: {
        watchd() {
            // 实时监听缓存的变动
            this.$watch('include', value => {
                value && this.keys.forEach((val, key) => {
                    const vnode = this.cache.get(key);
                    if (vnode) {
                        const name = this.getComponentName(vnode.componentOptions);
                        //如果缓存组件没有在include里面或者存在exclude里面，则删除缓存
                        if (!val.includes(name) || (this.exclude && this.exclude.includes(name))) {
                            this.clearKeepAlived(key);
                        }
                    }
                })
            })
            this.$watch('exclude', value => {
                value && this.keys.forEach((val, key) => {
                    const vnode = this.cache.get(key);
                    if (vnode) {
                        const name = this.getComponentName(vnode.componentOptions);
                        //如果缓存组件存在exclude里面，则删除缓存
                        this.exclude.includes(name) && this.clearKeepAlived(key);
                    }
                })
            })
        },
        monitor() {
            //清除缓存组件，参数可以是组件名或路由路径，可以是string或array
            this.$eventBus.$on('clearKeepAlive', (data) => {
                //data === true 则删除所有缓存组件
                if (data === true) {
                    return this.keys.forEach((val, key) => this.clearKeepAlived(key));
                }
                if (data === 'refresh') {
                    return this.refresh = true;
                }
                if (data) {
                    this.clearKeepAliveManually(data);
                } else {
                    let key = this.getRouterPathKey(this.$route.path);
                    this.clearKeepAlived(key);
                }
            });
            global.getState('router').beforeEach((to, from, next) => {
                //如果refresh并且在缓存组件里面，则删除缓存，等待渲染后重新设置缓存。
                let toKey = this.getRouterPathKey(to.path);
                if (this.refresh && toKey) {
                    this.clearKeepAlived(toKey);
                    this.refresh = false;
                    next();
                }
                this.refresh = false;
                //如果有key值记录，则代表有组件缓存，故需记录缓存组件滚动条高度
                let key = this.getRouterPathKey(from.path);
                key && this.setScrollTop(key);
                baseMethods.scrollBackTop();
                next();
            })
        },
        // 删除缓存
        clearKeepAlived(key) {
            const vnode = this.cache.get(key);
            if (vnode) {
                vnode.componentInstance.$destroy();
                this.cache.delete(key);
                this.keys.delete(key);
                this.scrollTopMap.delete(key);  //清除缓存同时清除滚动条记录
            }
        },
        //记录滚动条高度
        setScrollTop(key) {
            const el = document.documentElement || document.body;
            this.scrollTopMap.set(key, el.scrollTop);
        },
        //设置滚动条高度
        getScrollTop(key) {
            const el = document.documentElement || document.body;
            el.scrollTop = this.scrollTopMap.get(key);
        },
        //获取组件名
        getComponentName(opts) {
            return opts && (opts.Ctor.options.name || opts.tag);
        },
        //通过路径path获取路由组件key值
        getRouterPathKey(path) {
            for (let [key, value] of this.keys.entries()) {
                if (value === path) {
                    return key;
                }
            }
        },
        //手动清除缓存
        clearKeepAliveManually(data) {
            if (baseMethods.typeOf(data) === 'regExp') {
                return this.keys.forEach((val, key) => {
                    data.test(val) && this.clearKeepAlived(key);
                })
            }
            let clearArr = baseMethods.typeOf(data) === 'array' ? [...data] : [data];
            for (let path of clearArr) {
                let key = this.getRouterPathKey(path);
                key && this.clearKeepAlived(key);
            }
            this.keys.forEach((val, key) => {
                const vnode = this.cache.get(key);
                if (vnode) {
                    const compName = this.getComponentName(vnode.componentOptions);
                    clearArr.includes(compName) && this.clearKeepAlived(key);
                }
            })
        }
    },
    destroyed() {
        //销毁所有缓存组件
        this.cache.forEach((val, key) => this.clearKeepAlived(key));
    },
}
