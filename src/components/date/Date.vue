<template>
    <div class="date_picker_warp">
        <slot></slot>
        <el-date-picker
            v-model="startTime"
            :editable="false"
            :value-format="valueFormat"
            :type="type"
            placeholder="请选择开始日期"
            v-bind="$attrs"
            v-on="$listeners"
            :picker-options="pickerOptions"
            :disabled="disabled"
            default-time="00:00:00">
        </el-date-picker>
        ~
        <el-date-picker
            v-model="endTime"
            :editable="false"
            :value-format="valueFormat"
            :type="type"
            :disabled="disabled || !startTime"
            :picker-options="pickerEnd"
            placeholder="请选择结束日期"
            v-bind="$attrs"
            v-on="$listeners"
            :default-time="defaultEndTime">
        </el-date-picker>
    </div>
</template>

<script>
    export default {
        name: 'ws-date',
        props: {
            disabled: {
                type: Boolean,
                default: false
            },
            valueFormat: {
                type: String,
                default: 'yyyy-MM-dd HH:mm:ss'
            },
            type: {
                type: String,
                default: 'datetime'
            },
            intervalTime: {
                type: Number,
                default: 31
            },
            modelStartTime: {
                type: String,
                default: ''
            },
            modelEndTime: {
                type: String,
                default: ''
            },
            defaultTime: {
                type: String,
                default: '00:00:00'
            },
            defaultEndTime: {
                type: String,
                default: '23:59:59'
            },
            pickerOptions: {
                type: Object,
                default: () => {}
            },
            // 最大日期限制
            maxDate: {
                type: Date,
                default: null
            },
        },
        data() {
            return {
                startTime: '',
                endTime: '',
                pickerEnd: {
                    disabledDate: this.disabledDate
                },
                disabledTime: ''
            }
        },
        watch: {
            startTime(val) {
                if (val){
                    this.judgementData();
                    let time = val.split(' ')[0] + ' 00:00:00';
                    this.disabledTime = new Date(time).getTime();
                }else {
                    this.endTime = '';
                }
                this.$emit('update:modelStartTime', val);
            },
            endTime(val) {
                val && this.judgementData();
                this.$emit('update:modelEndTime', val);
            },
            modelStartTime: {
                handler(val) {
                    this.startTime = val;
                },
                immediate: true
            },
            modelEndTime: {
                handler(val) {
                    this.endTime = val;
                },
                immediate: true
            }
        },
        methods: {
            //禁用时间范围，结束日期不能小于开始日期
            disabledDate(time) {
                const intervalDateLimit = this.disabledTime + 3600 * 1000 * 24 * this.intervalTime;
                const maxDateLimit = this.maxDate ? this.maxDate.getTime() : intervalDateLimit;
                const tempTime = intervalDateLimit > maxDateLimit ? maxDateLimit : intervalDateLimit;
                return time.getTime() < this.disabledTime || (this.intervalTime && time.getTime() > tempTime);
            },
            judgementData() {
                let start = new Date(this.startTime).getTime();
                let end = new Date(this.endTime).getTime();
                let max = start + 3600 * 1000 * 24 * (this.intervalTime + 1);
                //如果开始时间大于等于结束时间 或者 结束时间大于最大设定时间，则结束时间清空
                if (start > end || (this.startTime && this.endTime && this.intervalTime && end > max)) {
                    this.endTime = '';
                }
            }
        }

    }
</script>

<style scoped lang="scss">
    .date_picker_warp {
        display: inline-block;

        .el-input {
            width: 200px;
        }
    }
</style>
