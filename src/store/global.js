import filtersData from './filtersData';

let propertyDescriptor = {
    filtersData: filtersData,
}

// let store = new Proxy(propertyDescriptor, {
//     set() {
//         throw new SyntaxError('Object cannot be set property!');
//     }
// });//babel目前转换不了proxy，导致ie页面报错打不开
let store = propertyDescriptor
Object.defineProperty(store, 'filtersData', {
    configurable: false,
    enumerable: false,
    get: function () {
        return filtersData;
    },
    set: function (newVal) {
        throw new SyntaxError('Object cannot be set property!');
    }
})

const getState = (key) => store[key];

const commit = (key, value) => propertyDescriptor[key] = value;

const mergeState = (key, value) => propertyDescriptor[key] = Object.assign({}, store[key], value);


export default {
    store,
    getState,
    commit,
    mergeState
}
