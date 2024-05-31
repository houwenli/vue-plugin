<template>
    <div :class="prefix">
        <el-cascader
            ref="cascader"
            :options="options"
            :props="props"
            v-model="code"
            :placeholder="setDefaultAttr('placeholder', '请选择城市')"
            :disabled="setDefaultAttr('disabled', false)"
            :showAllLevels="setDefaultAttr('showAllLevels', true)"
            :clearable="setDefaultAttr('clearable', true)"
            :filterable="setDefaultAttr('filterable', true)"
            :collapse-tags="setDefaultAttr('collapseTags', true)"
            v-bind="$attrs"
            v-on="listeners"
        ></el-cascader>
    </div>
</template>

<script>
// 防止多次引用组件时请求多次
function fetchData() {
    let { type,systemKey  } = $vuex.project;
    let URL,op
    // ***子系统中才有__POWERED_BY_QIANKUN__
    if(window.__POWERED_BY_QIANKUN__||systemKey==='oa'){
        // oa通用接口
        URL='/wscommon/authority/dataSync/select',
        op = 'getProvincesTree';
    }else{
        // 兼容os
        URL='/wscommon/authority/dataSync/select',
        op = 'getProvincesTree';
        if (type === 'system') {
            // 运营体系通用接口
            URL = '/wscommon/districtManage/select';
            op = 'treeList';
        } else if (type === 'company') {
            // 分支机构体系通用接口
            URL = '/wscommon/local/selectAreaTree';
        }
    }
        


    return $vuex.$axios(URL, { op },{isCatch:true,successCode:1,dataType:'json'});
}
let getList;
import areaData from './area.json';
export default {
    name: 'ws-city',
    inheritAttrs: false,
    props: {
        value: { type: [Array, String, Number] }, //选中值(String只是为了兼容初始值为'')
        // 配置项
        defaultProps: {
            type: Object,
            default: () => {}
        },
        data: { type: Array }, //数据源，不传则取组件内部数据
        level: { type: String, default: '3' }, //显示级别，1省，2省市，3省市区
        showAll: { type: Boolean, default: false }, //是否显示区县中的全部选项
        showCountry: { type: Boolean, default: false }, //是否展示全国
        disableSelection: false // 是否禁用复选框
    },
    watch: {
        value: {
            handler(val, oldVal) {
                typeof val !== 'object' && (this.props.emitPath = false);
                this.code = val;
            },
            immediate: true
        },
        level: {
            handler(val) {
                val === '1' && (this.props.checkStrictly = false);
            },
            immediate: true
        }
    },
    data() {
        return {
            prefix: 'ws-city',
            code: this.value,
            regionList: [],
            props: {
                expandTrigger: 'hover',
                value: 'code',
                label: 'name',
                checkStrictly: false,
                emitPath: true,
                multiple: this.$attrs.multiple === '' ? true : this.$attrs.multiple || false,
                ...this.defaultProps
            }
        };
    },
    computed: {
        options() {
            return this.data ? this.data : this.regionList;
        },
        // v-model绑定值的类型
        dataType() {
            return Array.isArray(this.value) ? 'array' : 'string';
        },
        listeners() {
            return { ...this.$listeners, change: this.handleChange };
        }
    },
    async mounted() {
        !this.data && this.getRegionList();
    },
    methods: {
        // 设置默认属性
        setDefaultAttr(attr, value) {
            return this.$attrs[attr] == undefined ? value : this.$attrs[attr];
        },
        async getAreaData(){
            try {
                !getList && (getList = fetchData());
                let res = await getList;
                return JSON.parse(res.data);
            } catch (error) {
                return _.cloneDeep(areaData);
            }
        },
        // 获取所有省市区
        async getRegionList() {
            let data=await this.getAreaData()
            let index = data.findIndex(item => item.code === 0);
            data.splice(index, 1);
            // 接口会返回一个其他城市code为0，和全国有冲突，这里手动去掉其他城市
            if (this.showCountry) {
                data.unshift({
                    code: 0,
                    name: '全国',
                    children: []
                });
            }
            if (this.level === '3') {
                if (this.showAll) {
                    if (this.disableSelection) {
                        this.regionList = this.recursionAddAttr(data);
                    } else {
                        this.regionList = data;
                    }
                } else {
                    let list = [];
                    data.forEach((province, provinceIndex) => {
                        let temArr =
                            province.children && province.children.length
                                ? {
                                      code: province.code,
                                      name: province.name,
                                      disabled: this.disableSelection,
                                      children: []
                                  }
                                : {
                                      code: province.code,
                                      name: province.name,
                                      disabled: this.disableSelection
                                  };
                        list.push(temArr);
                        if (province.children && province.children.length) {
                            province.children.map((city, cityIndex) => {
                                //如果区里面只有全部，也不展示最后一级
                                let temCity =
                                    city.children && city.children.length>1
                                        ? {
                                              code: city.code,
                                              name: city.name,
                                              provinceCode: province.code,
                                              disabled: this.disableSelection,
                                              children: []
                                          }
                                        : {
                                              code: city.code,
                                              name: city.name,
                                              provinceCode: province.code,
                                              disabled: this.disableSelection
                                          };
                                list[provinceIndex].children.push(temCity);
                                if (city.children && city.children.length) {
                                    city.children.map(area => {
                                        if (area.code !== 0) {
                                            list[provinceIndex].children[cityIndex].children &&
                                                list[provinceIndex].children[cityIndex].children.push({
                                                    code: area.code,
                                                    name: area.name,
                                                    cityCode: city.code,
                                                    provinceCode: province.code,
                                                    disabled: this.disableSelection
                                                });
                                        }
                                    });
                                }
                            });
                        }
                        this.regionList = list;
                    });
                }
            } else if (this.level === '2') {
                let list = [];
                data.forEach((province, index) => {
                    let temArr =
                        province.children && province.children.length
                            ? {
                                  code: province.code,
                                  name: province.name,
                                  disabled: this.disableSelection,
                                  children: []
                              }
                            : { code: province.code, name: province.name, disabled: this.disableSelection };
                    list.push(temArr);
                    if (province.children && province.children.length) {
                        province.children.map(city => {
                            if (city.code !== 0) {
                                list[index].children.push({
                                    code: city.code,
                                    name: city.name,
                                    provinceCode: province.code,
                                    disabled: this.disableSelection
                                });
                            }
                        });
                    }
                    this.regionList = list;
                });
            } else if (this.level === '1') {
                let list = [];
                data.forEach(province => {
                    let temArr = {
                        code: province.code,
                        name: province.name,
                        disabled: this.disableSelection
                    };
                    list.push(temArr);
                    this.regionList = list;
                });
            }
        },
        recursionAddAttr(data) {
            data.forEach(cityData => {
                cityData.disabled = true;
                if (cityData.children && cityData.children.length) {
                    this.recursionAddAttr(cityData.children);
                }
            });
            return data;
        },
        handleChange(value) {
            let origin = this.dataType === 'array' ? [...value] : [value];
            // 在多选和展示全国时，全国省市区互斥
            if (this.props.multiple && this.showCountry) {
                if (this.dataType === 'string') {
                    throw new Error('多选时必须绑定数组');
                    return;
                }
                if (this.props.emitPath) {
                    // emitPath为true时选中的是二维数组
                    if (value.some(item => item.join() === '0') && !this.value.some(item => item.join() === '0')) {
                        // 清空选中的节点
                        value = [[0]];
                        this.$refs.cascader.$refs.panel.clearCheckedNodes();
                    }

                    if (value.some(item => item.join() === '0') && this.value.some(item => item.join() === '0')) {
                        // 如果上一次选择了全国
                        let index = value.findIndex(item => item.join() === '0');
                        origin.splice(index, 1);
                        value = origin;
                    }
                } else {
                    if (value.includes(0) && !this.value.includes(0)) {
                        value = [0];
                        this.$refs.cascader.$refs.panel.clearCheckedNodes();
                    }
                    if (value.includes(0) && this.value.includes(0)) {
                        let index = value.findIndex(item => item === 0);
                        origin.splice(index, 1);
                        value = origin;
                    }
                }
            }

            if (value) {
                let nodeObj = this.$refs.cascader.getCheckedNodes();
                let temArr = [];
                nodeObj.forEach(item => {
                    let obj = {};
                    let [provinceName, cityName, areaName] = item.pathLabels;
                    let [provinceCode, cityCode, areaCode] = item.path;
                    obj = {
                        provinceName,
                        cityName,
                        areaName,
                        provinceCode,
                        cityCode,
                        areaCode
                    };
                    for (let [k, v] of Object.entries(item.data)) {
                        if (k !== 'children' && k !== 'anwserCode' && k !== 'cityCodeList') {
                            // 排除无用属性
                            obj[k] = v;
                        }
                    }
                    temArr.push(obj);
                });
                !this.props.multiple && (temArr = temArr[temArr.length - 1]);

                this.$emit('change', value, temArr); //选中code，选中对象
                this.$emit('input', value);
            } else {
                this.$emit('change', value, null);
                this.$emit('input', value);
            }
        },
        // 获取默认省市区数据
        getData() {
            return this.regionList;
        }
    }
};
</script>

<style lang="scss" scoped>
.ws-city {
    display: inline-block;
}
</style>
