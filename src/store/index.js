export default class Store {
    constructor(Vue, options) {
        // state， getters， mutations， actions 为每个实例化单独享有的
        let {state = {}, getters = {}, actions = {}, mutations = {}} = options;
        this.state = Vue.observable(state);
        this.getters = this.handleGetters(getters);
        this.mutations = mutations;
        this.actions = actions;
        this.commit = this.commit.bind(this);
    }

    commit(type, arg) {
        this.mutations[type](this.state, arg);
    }

    dispatch(type, arg) {
        return this.actions[type]({commit: this.commit, state: this.state}, arg);
    }

    handleGetters(getters) {
        let _getters = {};
        for (const [key, value] of Object.entries(getters)) {
            typeof value === 'function' && Object.defineProperty(_getters, key, {
                enumerable: true,
                get: () => value(this.state, this.getters)
            })
        }
        return _getters;
    }
}

const map = (options, type) => {
    let mapped = {};
    let store = $vuex.store;
    options.forEach((key) => {
        mapped[key] = (...args) => {
            if (!(key in store[type])) {
                return console.error(`[vuex] unknown ${type}: ${key}`);
            }
            return ['state', 'getters'].includes(type) ? store[type][key] :
                store[type == 'actions' ? 'dispatch' : 'commit'].apply(store, [key, ...args]);
        }
    })
    return mapped;
}

export const mapState = (options) => map(options, 'state');
export const mapGetters = (options) => map(options, 'getters');
export const mapMutations = (options) => map(options, 'mutations');
export const mapActions = (options) => map(options, 'actions');
const modules=require.context('./modules',false,/\.js$/)
export const registerModule = (store, moduleName, options) => {
    if (store.hasModule(moduleName)) {
        store.unregisterModule(moduleName);
    }
    store.registerModule(moduleName, options);
};