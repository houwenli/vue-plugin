import global from '../store/global';
const methods = {
    //格式化时间 format 定义格式yyyy-MM-dd hh:mm:ss（formatData('yyyy-MM-dd')）
    formatData(time, format = 'yyyy-MM-dd hh:mm:ss') {
        if (!time) {
            return '';
        }
        time = this.formatIosDate(time);
        let newDate = new Date(time);
        let date = {
            'M+': newDate.getMonth() + 1,
            'd+': newDate.getDate(),
            'h+': newDate.getHours(),
            'm+': newDate.getMinutes(),
            's+': newDate.getSeconds(),
            'q+': Math.floor((newDate.getMonth() + 3) / 3),
            'S+': newDate.getMilliseconds()
        };
        if (/(y+)/i.test(format)) {
            format = format.replace(RegExp.$1, (newDate.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (let k in date) {
            if (new RegExp('(' + k + ')').test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? date[k] : ('00' + date[k]).substr(('' + date[k]).length));
            }
        }
        return format;
    },
    //获取n天以前或以后的时间，n:负数表示n天以前，正数表示n天以后日期。 time可传时间，默认当前日期。
    getBeforeDay(n = 0, format = 'yyyy-MM-dd hh:mm:ss', time = new Date()) {
        time = this.formatIosDate(time);
        let newDate = new Date(time);
        newDate.setDate(newDate.getDate() + n); //获取n天后的日期
        return this.formatData(newDate.valueOf(), format);
    },
    //获取今天开始到n天以后日期
    getTodayToAny(n = 1, format = 'yyyy-MM-dd hh:mm:ss') {
        let startDate = new Date(new Date(new Date().toLocaleDateString()).getTime());
        let startTime = this.formatData(startDate.valueOf(), format);
        let endDate = startDate.setDate(startDate.getDate() + n);
        let endTime = this.formatData(endDate.valueOf(), format);
        return {
            startTime,
            endTime
        };
    },
    //获取当前月份第一天肯最后一天，n: -1 =>一个月前
    getNowMonthDate(n = 0, flg = false) {
        let date = new Date();
        let year = date.getFullYear() + '';
        let month = date.getMonth() + 1 + n + '';
        if (flg) {
            month = n + '';
        }

        // 当月第一天日期
        let startDate = year + '-' + month + '-01';
        // 当月月最后一天日期
        let lastDateOfCurrentMonth = new Date(year, month, 0);
        let endDate = year + '-' + month + '-' + lastDateOfCurrentMonth.getDate();
        return {
            startDate,
            endDate
        };
    },

    //导出文件csv文件
    exportFile(data, name, type = 'text/csv;charset=utf-8') {
        let blob;
        if (type.includes('csv')) {
            blob = new Blob(['\ufeff' + data], { type: type });
        } else {
            blob = new Blob([data], { type: type });
        }
        let a = document.createElement('a');
        a.download = name; //指定下载的文件名
        a.href = URL.createObjectURL(blob); //  URL对象
        if (document.all) {
            a.click(); // 模拟点击
        } else {
            //兼容火狐点击事件
            let evt = document.createEvent('MouseEvents');
            evt.initEvent('click', true, true);
            a.dispatchEvent(evt);
        }
        URL.revokeObjectURL(a.href); // 释放URL 对象
    },

    // 通过 url 导出文件
    exportFileByUrl(url, name) {
        let a = document.createElement('a');
        a.download = name;
        a.href = url;
        if (document.all) {
            a.click(); // 模拟点击
        } else {
            //兼容火狐点击事件
            let evt = document.createEvent('MouseEvents');
            evt.initEvent('click', true, true);
            a.dispatchEvent(evt);
        }
        URL.revokeObjectURL(a.href); // 释放URL 对象
    },

    // 单位转换 元转分
    regYuanToFen(m) {
        if (!parseFloat(m)) {
            return 0;
        }
        return Math.round(m * 100);
    },
    // 单位转换 分转元, float = true 保留两位小数,不足两位则补0；false 没有小数位或不足两位，不补0
    regFenToYuan(m, float = true) {
        if (!parseInt(m)) {
            return '0.00';
        }
        let num = Math.round((m / 100) * 100) / 100;
        return float ? num.toFixed(2) : num;
    },
    // 单位转换 米转公里 float = true 保留一位小数,不足则补0；false 没有小数位，不补0
    regRiceToKm(m, float = true) {
        if (!parseInt(m)) {
            return '0.0';
        }
        let num = Math.round((m / 1000) * 100) / 100;
        return float ? num.toFixed(1) : num;
    },
    // 单位转换 公里转米
    regKmToRice(m) {
        if (!parseFloat(m)) {
            return 0;
        }
        return Math.round(m * 1000);
    },
    // 单位转换 分转秒
    regMinuteToSecond(m) {
        if (!parseInt(m)) {
            return 0;
        }
        return Math.round(m * 60);
    },

    // 单位转换 秒转分
    regSecondToMinute(m) {
        if (!parseInt(m)) {
            return '0';
        }
        return parseInt(m / 60) + '';
    },

    //防抖函数：在事件被触发wait秒后再执行回调，如果在这wait秒内又被触发，则重新计时。
    //defer = true: 如果后续这个单位时间内触再次函数，不再执行回调。可用于合并请求，执行第一次 后续单位时间内不再执行。
    debounce(fn, wait = 300, defer = false) {
        let timer, deferTimer;
        return function(...args) {
            let that = this;
            if (timer) {
                clearTimeout(timer);
            }
            if (defer && !deferTimer) {
                deferTimer = true;
                fn.apply(that, args);
            }
            timer = setTimeout(() => {
                deferTimer = null;
                !defer && fn.apply(that, args);
            }, wait);
        };
    },

    //节流函数：规定在一个单位时间内，只能触发一次函数。如果这个单位时间内触发多次函数，只有一次生效。单位时间内循环执行
    throttle(fun, wait = 300) {
        let last, deferTimer;
        return function(...args) {
            let that = this;
            let now = +new Date();
            if (last && now < last + wait) {
                clearTimeout(deferTimer);
                deferTimer = setTimeout(() => {
                    last = now;
                    fun.apply(that, args);
                }, wait);
            } else {
                last = now;
                fun.apply(that, args);
            }
        };
    },

    //深度拷贝对象和数组
    deepClone(obj) {
        return _.cloneDeep(obj);
    },
    //删除对象和数组空属性
    delEmptyObject(obj) {
        let cloneObj = _.cloneDeep(obj);
        for (let key in cloneObj) {
            if (cloneObj.hasOwnProperty(key)) {
                //不遍历其原型链上的属性
                let val = cloneObj[key];
                if (val === '' || val === undefined) {
                    cloneObj[key] = null;
                }
                if (cloneObj[key] && typeof cloneObj[key] === 'object') {
                    this.emptyObject(cloneObj[key]);
                }
            }
        }
        return cloneObj;
    },
    emptyObject(obj) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                //不遍历其原型链上的属性
                let val = obj[key];
                if (val === '' || val === undefined) {
                    obj[key] = null;
                }
                if (obj[key] && typeof obj[key] === 'object') {
                    this.emptyObject(obj[key]);
                }
            }
        }
    },
    //页面回到顶部,type 返回顶部是否需要平滑动画，默认false。scrollX是否水平滚动条也回到0位置
    scrollBackTop(type = false, scrollX = false) {
        let el = document.documentElement || document.body;
        if (!type) {
            if (scrollX) {
                window.scrollTo(0, 0);
            } else {
                el.scrollTop = 0;
            }
            return;
        }
        cancelAnimationFrame(window.animationFrameTimer);
        (function scroll() {
            let scrollTop = el.scrollTop;
            if (scrollTop > 0) {
                let y = Math.floor(scrollTop - scrollTop / 5);
                y = y > 20 ? y : y - 10;
                if (scrollX) {
                    window.scrollTo(0, y);
                } else {
                    el.scrollTop = y;
                }
                window.animationFrameTimer = window.requestAnimationFrame(scroll);
            } else {
                cancelAnimationFrame(window.animationFrameTimer);
            }
        })();
    },

    //复制string到粘贴板
    copyCommand(str) {
        let oInput = document.createElement('textarea');
        oInput.value = str;
        document.body.appendChild(oInput);
        oInput.select();
        document.execCommand('Copy');
        oInput.style.display = 'none';
        document.body.removeChild(oInput);
    },
    //原生判断dom节点是否包含class
    hasClass(el, cls) {
        if (el && el.className) {
            return el.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
        }
    },
    //给dom节点添加class
    addClass(el, cls) {
        if (!this.hasClass(el, cls)) {
            el.className += ' ' + cls;
        }
    },
    //删除dom节点class
    removeClass(el, cls) {
        if (this.hasClass(el, cls)) {
            let reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            el.className = el.className.replace(reg, ' ');
        }
    },
    //原生切换dom节点class
    toggleClass(el, cls) {
        if (this.hasClass(el, cls)) {
            this.removeClass(el, cls);
        } else {
            this.addClass(el, cls);
        }
    },

    //移动数组元素位置
    moveArray(arr, index, tindex) {
        if (index > tindex) {
            arr.splice(tindex, 0, arr[index]);
            arr.splice(index + 1, 1);
        } else {
            arr.splice(tindex + 1, 0, arr[index]);
            arr.splice(index, 1);
        }
        return arr;
    },

    //添加事件绑定 注：addEventListener()添加的匿名函数无法移除
    addHandler(element, event, handler, type = false) {
        if (element.addEventListener) {
            element.addEventListener(event, handler, type);
        } else if (element.attachEvent) {
            element.attachEvent('on' + event, handler);
        } else {
            element['on' + event] = handler; //直接赋给事件
        }
        return function() {
            if (element.removeEventListener) {
                element.removeEventListener(event, handler, type);
            } else if (element.deattachEvent) {
                //IE
                element.deattachEvent('on' + event, handler);
            } else {
                element['on' + event] = null; //直接赋给事件
            }
        };
    },

    //取消事件绑定 注：addEventListener()添加的匿名函数无法移除
    removeHandler(element, event, handler, type = false) {
        //Chrome
        if (element.removeEventListener) {
            element.removeEventListener(event, handler, type);
        } else if (element.deattachEvent) {
            //IE
            element.deattachEvent('on' + event, handler);
        } else {
            element['on' + event] = null; //直接赋给事件
        }
    },

    //生成[n,m]的随机整数
    randomNum(minNum, maxNum) {
        return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
    },

    //判断元素是否在可视区域
    isElementInViewport(el) {
        let rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            // rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
            // rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },

    //map转Object
    mapToObject(map) {
        let obj = Object.create(null);
        for (let [k, v] of map) {
            obj[k] = v;
        }
        return obj;
    },
    //对象转map
    objectToMap(obj) {
        obj = obj || {};
        let strMap = new Map();
        for (let k of Object.keys(obj)) {
            strMap.set(k, obj[k]);
        }
        return strMap;
    },
    //判断对象类型
    typeOf(obj) {
        const { toString } = Object.prototype;
        const map = {
            '[object Boolean]': 'boolean',
            '[object Number]': 'number',
            '[object String]': 'string',
            '[object Function]': 'function',
            '[object Array]': 'array',
            '[object Date]': 'date',
            '[object RegExp]': 'regExp',
            '[object Undefined]': 'undefined',
            '[object Null]': 'null',
            '[object Object]': 'object',
            '[object Map]': 'map',
            '[object Set]': 'set'
        };
        return map[toString.call(obj)];
    },
    //缓存执行结果
    cachedFn(fn) {
        let cache = new Map();
        return str => {
            !cache.has(str) && cache.set(str, fn(str));
            return cache.get(str);
        };
    },
    //禁止浏览器页面滚动
    disableBodyScroll() {
        document.body.parentNode.style.overflow = 'hidden'; //禁止横竖向滚动条
        if (document.documentElement.offsetHeight > document.documentElement.clientHeight - 4) {
            document.body.parentNode.style.paddingRight = this.getScrollbarWidth() + 'px'; //防止取消滚动条时页面抖动
        }
    },
    //允许浏览器页面滚动
    enableBodyScroll() {
        document.body.parentNode.style.overflow = 'auto'; //恢复横竖向滚动条
        document.body.parentNode.style.paddingRight = 0; //禁止横竖向滚动条
    },
    //获取浏览器滚动条宽度
    getScrollbarWidth() {
        const outer = document.createElement('div');
        outer.className = 'ws-scrollbar__wrap';
        outer.style.visibility = 'hidden';
        outer.style.width = '100px';
        outer.style.position = 'absolute';
        outer.style.top = '-9999px';
        document.body.appendChild(outer);

        const widthNoScroll = outer.offsetWidth;
        outer.style.overflow = 'scroll';

        const inner = document.createElement('div');
        inner.style.width = '100%';
        outer.appendChild(inner);

        const widthWithScroll = inner.offsetWidth;
        outer.parentNode.removeChild(outer);
        return widthNoScroll - widthWithScroll;
    },
    //获取URL的hash参数
    getHashParams() {
        let arr = (location.hash || '').replace(/^\#/, '').split('&');
        let params = {};
        for (let i = 0; i < arr.length; i++) {
            let data = arr[i].split('=');
            if (data.length === 2) {
                params[data[0]] = data[1];
            }
        }
        return params;
    },

    //获取URL的query参数
    getQueryParams() {
        let arr = (location.search || '').replace(/^\?/, '').split('&');
        let params = {};
        for (let i = 0; i < arr.length; i++) {
            let data = arr[i].split('=');
            if (data.length === 2) {
                params[data[0]] = data[1];
            }
        }
        return params;
    },

    //获取cookeie
    getCookies(name) {
        let arr,
            reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
        if ((arr = document.cookie.match(reg))) {
            let result = unescape(arr[2]);
            result = result.replace(/^\"|\"$/g, '').replace(/\\\"/g, '"');
            try {
                return JSON.parse(result);
            } catch (e) {}
            return result;
        } else {
            return null;
        }
    },

    //存储sessionStorage
    setStore(name, content) {
        if (!name) return;
        if (typeof content !== 'string') {
            content = JSON.stringify(content);
        }
        window.sessionStorage.setItem(name, content);
    },

    //获取sessionStorage
    getStore(name) {
        if (!name) return null;
        let sessionStorage = window.sessionStorage.getItem(name) || null;
        return JSON.parse(sessionStorage);
    },

    //删除sessionStorage
    removeStore(name) {
        if (!name) return;
        window.sessionStorage.removeItem(name);
    },
    // 清空sessionStorage
    clearStore() {
        sessionStorage.clear();
    },

    //获取设备系统类型，主要区分ios与android
    getDeviceOSType() {
        let _type = 'pc';
        let ua = navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod|mac/.test(ua)) {
            _type = 'ios';
        } else if (/android/.test(ua)) {
            _type = 'android';
        }
        return _type;
    },

    // 二进制转base64
    arrayBufferToBase64(buffer) {
        let binary = '';
        let bytes = new Uint8Array(buffer);
        let len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    },
    // 格式化字符串
    formatText(str, size = 3, seperator = ',', type) {
        str = str + '';
        if (type === 'money') {
            // 金额
            return str.replace(/^-?\d+/g, m => m.replace(/(?=(?!\b)(\d{3})+$)/g, seperator));
        } else {
            // 普通字符串
            let regText = '\\B(?=(\\w{' + size + '})+(?!\\w))';
            let reg = new RegExp(regText, 'g');
            return str.replace(reg, seperator);
        }
    },
    // 获取当前系统systemKey
    getSystemKey() {
        return this.getPrefix() + '-methodList';
    },
    // 获取子应用前缀
    getPrefix() {
        let systemInfo = global.getState('store').state.global && global.getState('store').state.global.systemConfigProject || { systemCode: global.getState('project').systemKey }
        return systemInfo.systemCode || location.host.split('.')[0].split('-')[0];
    },
    // 兼容ios格式时间
    formatIosDate(time) {
        return typeof time === 'string' ? (this.getDeviceOSType() === 'ios' ? time.replace(/-/g, '/') : time) : time;
    },
    // 驼峰命名转-
    getKebabCase(str){
        return str.replace(/[A-Z]/g,(i)=>'-'+i.toLowerCase())
    },
    // -转小驼峰
    getCamelCase(str){
        return str.replace(/-([a-z])/g,(i)=>i.toUpperCase())
    }
};

export default methods;
