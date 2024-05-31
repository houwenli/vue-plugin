<template>
    <div :class="prefix">
        <slot></slot>
        <el-date-picker
            v-model="time"
            :editable="false"
            :value-format="defaultValueFormat"
            range-separator="至"
            :start-placeholder="startPlaceholder"
            :end-placeholder="endPlaceholder"
            :type="type"
            :picker-options="defaultPickerOptions"
            :disabled="disabled"
            :default-time="defaultTime"
            v-bind="$attrs"
        ></el-date-picker>
    </div>
</template>

<script>
export default {
    name: 'ws-date-range',
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        valueFormat: {
            type: String,
            default: ''
        },
        type: {
            type: String,
            default: 'datetimerange'
        },
        intervalTime: {
            type: Number,
            default: 31
        },
        startTime: {
            type: String,
            default: ''
        },
        endTime: {
            type: String,
            default: ''
        },
        defaultTime: {
            type: Array,
            default: () => ['00:00:00', '23:59:59']
        },
        pickerOptions: {
            type: Object,
            default: () => {}
        },
        startPlaceholder: {
            type: String,
            default: '开始日期'
        },
        endPlaceholder: {
            type: String,
            default: '结束日期'
        },
        readonly: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            prefix: 'ws-daterange',
            time: [],
            pickerMinDate: null,
            pickerMaxDate: null,
            defaultPickerOptions: {
                shortcuts: [
                    {
                        text: '最近一周',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', [start, end]);
                        }
                    },
                    {
                        text: '最近一个月',
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            picker.$emit('pick', [start, end]);
                        }
                    }
                ],
                onPick: ({ maxDate, minDate }) => {
                    if (minDate && this.pickerMinDate) {
                        this.pickerMinDate = null;
                    } else if (minDate) {
                        this.pickerMinDate = minDate.getTime();
                    }
                },
                disabledDate: this.disabledDate,
                ...this.pickerOptions
            }
        };
    },
    computed: {
        defaultValueFormat() {
            return this.valueFormat ? this.valueFormat : this.type === 'daterange' ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm:ss';
        }
    },
    watch: {
        time(val) {
            let startTime = '',
                endTime = '';
            if (val) {
                startTime = val[0];
                endTime = val[1];
            }
            this.$emit('update:startTime', startTime);
            this.$emit('update:endTime', endTime);
        },
        endTime: {
            handler(val) {
                if (val && this.startTime) {
                    this.$set(this.time, 0, this.startTime);
                    this.$set(this.time, 1, val);
                } else {
                    this.time = [];
                }
            },
            immediate: true
        },
        startTime: {
            handler(val) {
                if (val && this.endTime) {
                    this.$set(this.time, 0, val);
                    this.$set(this.time, 1, this.endTime);
                } else {
                    this.time = [];
                }
            },
            immediate: true
        }
    },
    methods: {
        //禁用时间范围
        disabledDate(time) {
            if (this.pickerMinDate) {
                return (
                    time.getTime() > this.pickerMinDate + this.intervalTime * 24 * 3600 * 1000 ||
                    time.getTime() < this.pickerMinDate - this.intervalTime * 24 * 3600 * 1000
                );
            }
            return false;
        }
    }
};
</script>

<style scoped lang="scss">
.ws-daterange {
    display: inline-block;
    .el-input {
        width: 200px;
    }
}
.ws-table-warp .search-wrap .search-item .el-date-editor--datetimerange.el-input__inner{
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-break: break-all;
    box-sizing: border-box;
}
</style>
