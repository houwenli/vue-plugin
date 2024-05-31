<template>
    <div class="ws-steps__warp">
        <ul class="ws-steps__vertical">
            <li v-for="(item,index) in list" class="ws-steps__li clearfix">
                <div class="ws-steps__left">
                    <div class="top" :style="{'background': getColor(index)}" v-if="index"></div>
                    <div class="center" :style="{'border': `1px solid ${getColor(index)}`}">
                        <div class="step" :style="{'background': getColor(index)}">{{index + 1}}</div>
                    </div>
                    <div class="bottom" :style="{'background': getColor(index,2)}" v-if="index !== list.length - 1"></div>
                </div>
                <div class="ws-steps__content" :style="verticalContentStyle(index)">
                    <div class="fl">
                        <p>{{item.taskName}}</p>
                        <p v-if="index < currentProcess">时间： {{item.createTime}}</p>
                    </div>
                    <div class="fl" v-if="item.auditName" style="margin-left:80px;">
                        <p>审核状态： {{item.auditStatus === 'Y' ? '审核通过' : '审核不通过'}}</p>
                        <p>审核人： {{item.auditName}}</p>
                    </div>
                </div>
            </li>
        </ul>
        <ul class="ws-steps__horizontal">
            <li class="ws-steps__li">

            </li>
        </ul>
    </div>


</template>

<script>
    /**
     *  [
            {
                "auditName": "wsecar",  //审核人
                "auditStatus": "Y", //审核结果 Y审核通过 N审核不通过，未审核为空
                "createTime": "2020-06-24 09:49:44", //创建/审核时间
                "executeOrder": 1, //节点步骤
                "isCurrentProcess": "N", //是否当前节点
                "taskId": 1345,
                "taskName": "提交申请"  //节点名称
            }
        ]
     */
    export default {
        name: 'ws-steps',
        props: {
            list: {
                type: Array,
                default: () => []
            },
            vertical: {
                type: Boolean,
                default: true
            },
            colors: {
                type: Object,
                default() {
                    return {
                        normal: '#0088ff',
                        failed: '#ef5158',
                        inactive: '#C7C9CC'
                    }
                }
            }
        },
        data() {
            return {}
        },
        computed: {
            currentProcess() {
                for (let [index, data] of this.list.entries()) {
                    if (data.auditStatus === 'N') {
                        return index + 1;
                    }
                    if (data.isCurrentProcess === 'Y') {
                        return index;
                    }
                }
                return this.list.length;
            }
        },
        methods: {
            verticalContentStyle(index) {
                return {
                    lineHeight: index >= this.currentProcess ? '48px' : '24px',
                    color: this.getColor(index),
                    marginTop: index ? '32px' : 0
                }
            },
            getColor(index,type) {
                let data = this.list[index];
                if (index >= this.currentProcess) {
                    return this.colors.inactive;
                }
                if (data.auditStatus === 'N') {
                    return type ? this.colors.inactive : this.colors.failed;
                }
                return this.colors.normal;
            }
        }

    }
</script>

<style scoped lang="scss">
    .ws-steps__warp {
        .ws-steps__vertical {
            .ws-steps__li {
                .ws-steps__left {
                    width: 32px;
                    float: left;

                    .top {
                        width: 2px;

                        border-bottom-left-radius:2px;
                        border-bottom-right-radius:2px;
                        height: 32px;
                        margin: auto;
                    }

                    .center {
                        width: 32px;
                        height: 32px;
                        text-align: center;
                        line-height: 26px;
                        color: #fff;
                        border-radius: 50%;

                        overflow: hidden;
                        padding: 3px;
                        margin: 8px 0;

                        .step {
                            width: 100%;
                            height: 100%;
                            border-radius: 50%;
                        }
                    }

                    .bottom {
                        margin: auto;
                        width: 2px;
                        height: 32px;
                        border-top-left-radius:2px;
                        border-top-right-radius:2px;
                    }
                }

                .ws-steps__content {
                    float: left;
                    padding-left: 20px;
                }

            }
        }

    }
</style>
