<template>
    <div class="ws-record">
        <h3 v-if="showHeader">{{title}}</h3>
        <div class="info">
            <div class="item createInfo" v-if="showCreate">
                <p class="border-top" :style="style">
                    <label>{{createUserText}}</label>
                    <span>{{ data[createUserKey] }}</span>
                </p>
                <p  :style="style">
                    <label>{{createTimeText}}</label>
                    <span>{{ data[createTimeKey] }}</span>
                </p>
            </div>
            <div class="item updateInfo" v-if="showUpdate">
                <p class="border-top"  :style="style">
                    <label>{{updateUserText}}</label>
                    <span>{{ data[updateUserKey] }}</span>
                </p>
                <p  :style="style">
                    <label>{{updateTimeText}}</label>
                    <span>{{ data[updateTimeKey] }}</span>
                </p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ws-record',
    props: {
        data: {
            type: Object,
            require: true
        },
        title:{type:String,default:"修改记录"},
        showCreate:{type:Boolean,default:true},
        showUpdate:{type:Boolean,default:true},
        createUserKey:{type:String,default:"createUserName"},
        createUserText:{type:String,default:"创建人"},
        createTimeKey:{type:String,default:"createTime"},
        createTimeText:{type:String,default:"创建时间"},
        updateUserKey:{type:String,default:"updateUserName"},
        updateUserText:{type:String,default:"修改人"},
        updateTimeKey:{type:String,default:"updateTime"},
        updateTimeText:{type:String,default:"修改时间"},
        height:{type:[String,Number],default:"40"},
        showHeader:{type:Boolean,default:true},
    },
    computed:{
        style(){
            return {
                height:parseInt(this.height)+'px',
                lineHeight:parseInt(this.height)+'px'
            }
        }
    },
    data() {
        return {};
    }
};
</script>

<style lang="scss">
.ws-record {
    h3 {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 16px;
    }
    .info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .item {
            flex: 1;
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            &.createInfo {
                margin-right: 16px;
            }
        }
        p {
            width: 100%;
            height: 45px;
            line-height: 45px;
            font-size: 14px;
            color: #606266;
            &.border-top {
                border-bottom: 1px solid #dcdfe6;
            }
            label {
                display: inline-block;
                width: 200px;
                height: 100%;
                padding: 0 16px;
                box-sizing: border-box;
                background: #f5f7fa;
                border-right: 1px solid #dcdfe6;
                text-align: right;
                font-weight: 400;
            }
            span {
                padding: 0 16px;
                font-size: 14px;
                font-family: PingFangSC-Regular, PingFang SC;
                font-weight: 400;
            }
        }
    }
}
</style>
