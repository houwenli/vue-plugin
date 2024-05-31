<template>
    <div class="vux-datetime_warp">
        <div class="data-time start-date" key="startDate" @click="showDateTime('startTime')">{{startTime || '开始时间'}}<i
            class="iconfont icon-arrow-down"></i></div>
        <div class="slot-text">至</div>
        <div class="data-time end-date" key="endDate" @click="showDateTime('endTime')">{{endTime || '结束时间'}}<i
            class="iconfont icon-arrow-down"></i></div>
    </div>
</template>

<script>
    import Vue from 'vue'
    import {DatetimePlugin, ToastPlugin} from 'vux'
    import baseMethods from '../../../util/baseMethods'

    Vue.use(DatetimePlugin)
    export default {
        name: 'ws-vux-datetime',
        props: {
            modelStartTime: {
                type: String,
                default: ''
            },
            modelEndTime: {
                type: String,
                default: ''
            },
            intervalTime: {  //开始结束时间最大间隔  0：不限制
                type: Number,
                default: 31
            },
            maxYear: {  //可选择的最大年份 默认 -1:不限制
                type: Number,
                default: -1
            },
            minYear: {  //可选择的最小年份 默认 -1:不限制
                type: Number,
                default: -1
            }
        },
        data() {
            return {
                startTime: '',
                endTime: '',
                disabledTime: ''
            }
        },
        watch: {
            startTime(val) {
                if (val && this.endTime) {
                    this.judgementData();
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
            showDateTime(key) {
                const _this = this;

                if (!this.startTime && key == 'endTime') {
                    return false;
                }

                let maxYear = new Date().getFullYear() + this.maxYear;
                this.maxYear < 0 && (maxYear = '');
                let minYear = new Date().getFullYear() - this.minYear;
                this.maxYear < 0 && (minYear = '');

                this.$vux.datetime.hide()
                this.$vux.datetime.show({
                    value: _this[key], // 其他参数同 props
                    format: 'YYYY-MM-DD',
                    minYear: minYear,
                    maxYear: maxYear,
                    // startDate: startDate,
                    // endDate: endData,
                    confirmText: '确定',
                    cancelText: '取消',
                    onConfirm(val) {
                        _this[key] = val;
                    }
                })
            },
            judgementData() {
                let start = new Date(this.startTime).getTime();
                let end = new Date(this.endTime).getTime();
                let max = start + 3600 * 1000 * 24 * this.intervalTime;
                //如果开始时间大于结束时间 或者 结束时间大于最大设定时间，则结束时间清空
                if (start >= end) {
                    this.$vux.toast.text('开始时间必须大于结束时间', 'middle')
                    this.endTime = '';
                }
                if (this.intervalTime && end > max) {
                    this.$vux.toast.text(`前后时间间隔不能大于${this.intervalTime}天`, 'middle')
                    this.endTime = '';
                }
            }
        }

    }
</script>

<style scoped lang="scss">
    .vux-datetime_warp {
        margin: auto;
        text-align: center;

        .data-time {
            display: inline-block;
            width: 45%;
            height: 1.5rem;
            line-height: 1.5rem;
            text-align: center;
            font-size: 1.1rem;

            i {
                margin-left: .2rem
            }
        }

        .slot-text {
            display: inline-block;
            width: 6%;
            height: 1.5rem;
            line-height: 1.5rem;
        }
    }
</style>
