export default class EventBus {
    constructor(vue) {
        if (!this.handles) {
            Object.defineProperty(this, 'handles', {
                value: {},
                enumerable: false
            })
        }
        this.Vue = vue;
        //_uid和eventName的映射表
        this.eventMapUid = {};
    }

    setEventMapUid(uid, eventName) {
        if (!this.eventMapUid[uid]) {
            this.eventMapUid[uid] = [];
        }
        // 把每个_uid订阅的事件名字push到各自uid所属的数组里
        this.eventMapUid[uid].push(eventName);
    }

    $on(eventName, callBack, vm) {
        if (!this.handles[eventName]) {
            this.handles[eventName] = [];
        }
        this.handles[eventName].push(callBack);
        if (vm instanceof this.Vue) {
            this.setEventMapUid(vm['_uid'], eventName);
        }
    }

    $emit() {
        let args = [...arguments];
        let eventName = args[0];
        let params = args.slice(1);
        if (this.handles[eventName]) {
            let len = this.handles[eventName].length;
            for (let i = 0; i < len; i++) {
                this.handles[eventName][i](...params);
            }
        }
    }

    $offVmEvent(uid) {
        let currentEvents = this.eventMapUid[uid] || [];
        currentEvents.map(eventName => {
            this.$off(eventName);
        })
    }
    $off(eventName){
        delete this.handles[eventName];
    }
}

