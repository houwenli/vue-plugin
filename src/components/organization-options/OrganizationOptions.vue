<template>
    <div class="ws-organization-options">
        <el-select v-if="showSelect" v-model="orgValue" clearable :placeholder="placeholder" @change="changeOrg" :popper-append-to-body="false" class="options-wrap">
            <el-option v-for="item in orgOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
        </el-select>
        <el-select
            v-if="showSearch"
            v-model="selectValue"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键词"
            :remote-method="remoteMethod"
            @change="handleSelect"
            @clear="handleClear"
            :value-key="valueKey"
            :loading="loading"
            :popper-append-to-body="false"
            clearable
             class="input-wrap"
        >
            <el-option v-for="item in options" :key="item.relationId" :label="item.orgName" :value="item[valueKey]"></el-option>
        </el-select>
    </div>
</template>

<script>
export default {
    name: 'ws-organization-options',
    props: {
        value: { type: [String, Number, Array] },
        orgType: { type: String, default: '' }, //20分公司  30服务中心  30服务站
        valueKey: { type: String, default: 'relationId' }, // 获取字段，默认为relationId，可选agencyNumber
        selectOptions: { type: Array, default: () => [] }, //数据源，不传则取组件内部数据
        placeholder: { type: String, default: '请选择' },
        showSelect: { type: Boolean, default: true },
        showSearch: { type: Boolean, default: true },
        data: { type: Object, default: () => ({ op: '' }) },
        url: { type: String, default: '/local/selectOrgByOrgName' },
        formatResponse: { type: Function, default: res => res }
    },
    computed: {
        orgOptions() {
            return this.selectOptions.length
                ? this.selectOptions
                : [
                      {
                          value: '20',
                          label: '分公司'
                      },
                      {
                          value: '30',
                          label: '服务中心'
                      },
                      {
                          value: '40',
                          label: '服务站'
                      }
                  ];
        }
    },
    watch: {
        orgType: {
            handler(val) {
                this.orgValue = val;
            },
            immediate: true
        },
        value: {
            handler(val) {
                this.selectValue = val;
                if (this.showSelect && !val && !this.flag && this.orgOptions.length !== 1) {
                    this.orgValue = '';
                    this.flag = false;
                }
            }
        }
    },
    data() {
        return {
            selectValue: '',
            orgValue: '',
            options: [],
            loading: false,
            flag: false
        };
    },
    methods: {
        changeOrg() {
            this.flag = true;
            this.selectValue = '';
            this.$emit('input', '');
            this.options = [];
        },
        remoteMethod(queryString) {
            if (queryString !== '' && queryString.length > 1) {
                this.loading = true;

                let params = {
                    data: { orgName: queryString, orgType: this.orgValue },
                    op: '',
                    ...this.data
                };
                let { url, formatResponse } = this
                this.$axios(url, params)
                    .then(res => {
                        this.loading = false;
                        let data = JSON.parse(res.data) || [];
                        this.options = formatResponse(data);
                    })
                    .catch(() => {
                        this.options = [];
                        this.loading = false;
                    });
            } else {
                this.options = [];
            }
        },
        handleSelect(value) {
            this.$emit('input', value);
            this.$emit('select', value);
        },
        handleClear() {
            this.$emit('select', '');
            this.$emit('input', '');
        }
    }
};
</script>

<style lang="scss" scoped>
.ws-organization-options {
    display: flex;
    border-radius: 4px;
    background: #fff;
    border: 1px solid #DCDFE6;
    box-sizing: border-box;
    color: #606266;
    ::v-deep .el-input__inner{
        border:none;
    }
    ::v-deep .el-input.is-focus .el-input__inner{
        border:none !important;
    }
    ::v-deep .el-input__inner:focus{
       border:none !important;
    }
    .options-wrap{
        width: 102px;
        flex:0 0 102px;
        border-right:1px solid #DCDFE6;
    }

    .input-wrap{
        flex:1;
    }
}
</style>
