<template>
    <div :class="prefix">
        <el-cascader
            ref="organization"
            :options="options"
            :props="props"
            v-model="selectedArr"
            :placeholder="placeholder"
            :disabled="disabled"
            :showAllLevels="showAllLevels"
            :clearable="clearable"
            :filterable="filterable"
            :collapse-tags="collapseTags"
            @change="handleChange"
        ></el-cascader>
    </div>
</template>

<script>
export default {
    name: "ws-organization",
    props: {
        value: { type: [String, Number, Array] }, //选中值
        valueKey: { type: String, default: "relationId" }, // 获取字段，默认为relationId，可选agencyNumber
        // 配置项
        defaultProps: {
            type: Object,
            default: () => {}
        },
        data: { type: Array, default: () => [] }, //数据源，不传则取组件内部数据
        placeholder: { type: String, default: "请选择机构" },
        clearable: { type: Boolean, default: true }, //是否显示关闭按钮
        filterable: { type: Boolean, default: true }, //是否可搜索
        disabled: { type: Boolean, default: false }, //是否禁用
        showAllLevels: { type: Boolean, default: true }, //输入框中是否显示选中值的完整路径
        multiple: { type: Boolean, default: false }, //是否多选
        collapseTags: { type: Boolean, default: true }, //多选模式下是否折叠Tag
        level: { type: [String,Number], default: "4" } //显示级别1大区，2分公司，3服务中心，4服务站
    },
    watch: {
        value: {
            handler(val) {
                typeof val !== "object" && (this.props.emitPath = false);
                this.selectedArr = val;
            },
            immediate: true
        },
        level: {
            handler(val) {
                val === "1" && (this.props.checkStrictly = false);
            },
            immediate: true
        }
    },
    computed: {
        options() {
            return this.data.length ? this.data : [];
        }
    },
    data() {
        return {
            prefix: "ws-organization",
            orgType: 0, //0大区  10分公司  20服务中心  30服务站
            selectedArr: "",
            props: {
                lazy: true,
                value: this.valueKey,
                label: "orgName",
                checkStrictly: true,
                emitPath: true,
                multiple: this.multiple,
                lazyLoad: this.lazyLoad,
                ...this.defaultProps
            }
        };
    },
    methods: {
        lazyLoad(node, resolve) {
            const { level, data } = node;
            let params = {
                data: level ? node.data : { orgType: 0 },
                op: ""
            };
            if(data && data.ifChild === 0) return resolve([])
            this.$axios("/wscommon/local/selectOrgOption", params).then(res => {
                if (res.code == 1) {
                    let data = JSON.parse(res.data);
                    data.forEach(item => {
                        if (!item.ifChild || level >= this.level - 1) {
                            item.leaf = true;
                        }
                    });

                    // 通过调用resolve将子节点数据返回，通知组件数据加载完成
                    resolve(data);
                }
            });
        },
        handleChange(value) {
            if (value) {
                let nodeObj = this.$refs.organization.getCheckedNodes()||[];
                let temArr = [];
                nodeObj.forEach(item => {
                    let {
                        agencyNumber,
                        orgId,
                        orgName,
                        orgType,
                        relationId
                    } = item?item.data:{};
                    temArr.push({
                        agencyNumber,
                        orgId,
                        orgName,
                        orgType,
                        relationId
                    });
                });

                !this.multiple &&
                    !this.props.multiple &&
                    (temArr = temArr[temArr.length - 1]);
                this.$emit("input", value);
                this.$emit("change", temArr);
            } else {
                this.$emit("input", value);
                this.$emit("change", value);
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.ws-organization {
    display: inline-block;
}
</style>
