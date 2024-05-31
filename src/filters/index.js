import methods from '../util/baseMethods';

let filters = {
    //省份-城市
    formatCityName(value) {
        let provinceName = value.provinceName || value.province || '';
        let cityName = value.cityName || '';
        return `${provinceName}${cityName ? '-' : ''}${cityName}`
    },
    //省份-城市-区域
    formatAreaName(value) {
        let provinceName = value.provinceName || value.province || '';
        let cityName = value.cityName || '';
        let areaName = value.areaName || '';
        return `${provinceName}${cityName ? '-' : ''}${cityName}${areaName ? '-' : ''}${areaName}`
    },
    //格式化时间 日期格式 (2019-01-01)
    formatData(value) {
        return methods.formatData(value, 'yyyy-MM-dd');
    },
    //格式化时间 时间格式 (2019-01-01 12:00:00)
    formatTime(value) {
        return methods.formatData(value);
    },
    // 单位转换 分转元, 保留两位小数,不足两位则补0
    regFenToYuan(value) {
        return methods.regFenToYuan(value);
    },
    // 单位转换 米转公里 保留一位小数,不足则补0
    regRiceToKm(value) {
        return methods.regRiceToKm(value);
    },
    // 单位转换 秒转分
    regSecondToMinute(value) {
        return methods.regSecondToMinute(value);
    },
    //单位转换 10000 => "10,000"
    toThousandFilter(value) {
        return (+value || 0).toString().replace(/^-?\d+/g, m => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','));
    },
    //首字母大写
    toUpperCase(value) {
        if (!value) {
            return '';
        }
        value = value.toString();
        return value.charAt(0).toUpperCase() + value.slice(1);
    },
    //隐藏手机号码
    hidePhoneNumber(value) {
        let n = value.slice(0, 3);
        let m = value.slice(-4);
        return `${n}****${m}`;
    },
    //暴露install方法，用于Vue.use()插件注册
    install(Vue) {
        Object.keys(this).forEach(key => {
            Vue.filter(key, this[key]);
        })
        Vue.filter('propsFilters', function (data, filters) {
            if (!Vue.filter(filters)) { // 如果没有找到该过滤
                try {
                    throw new Error(filters + '过滤器未注册')
                } catch (e) {
                }
            }
            return Vue.filter(filters)(data);
        })
    }
}
export default filters;
