<template>
    <div class="ws-descriptions" :style="{ borderBottom: show?'':borderStyle}" :class="{'single': isOneItem }">
        <div class="ws-descriptions__header" v-if="isShowHeader" ref='header'>
            <div class="ws-descriptions__title">
                <slot name="title">{{ title }}</slot>
            </div>
            <div class="ws-descriptions__extra"><slot name="extra"></slot>
                <div class="toggle" v-if="showToggle" @click="show = !show">
                    {{show?'收起':'展开'}} <i class="el-icon-arrow-right" :class="{active:show}"></i>
                </div>
                </div>
        </div>
        <el-collapse-transition>
            <div class="ws-descriptions__body" v-show="show">
                 <!-- 通用容器 -->
                <div class="ws-descriptions__container" v-if="isContainer" ><slot></slot></div>
                <!-- 详情展示 -->
                <div class="ws-descriptions__detail" v-else :style="{ borderTop: borderStyle,borderLeft: borderStyle}"><slot></slot></div>


            </div>
        </el-collapse-transition>
    </div>
</template>

<script>
export default {
    name: 'ws-descriptions',
    props: {
        title: { type: String },
        align: { type: String, default: 'right' },
        showToggle: { type: Boolean, default: true },
        border: { type: Boolean, default: true },
        background: { type: String, default: '#f5f7fa' },
        labelWidth: { type: [Number, String], default: '150' },
        height:{type:[String,Number],default:"40"},
        type:{type:String,default:"detail"},//类型(detail:详情展示，container:通用容器)
        showHeader:{type:Boolean,default:true},//是否展示头部
        showTip: { type: Boolean, default: true }, //是否展示tooltip
        
    },
    data() {
        return {
            show: true,
            isShowHeader:true,
        };
    },
    computed:{
        borderStyle(){
            return this.border?'1px solid #ebeef5':''
        },
        isContainer(){
            // 兼容不写type的情况
            return this.type==='container'||!this.$slots.default||!this.$slots.default[0].tag||(!this.$slots.default[0].tag.includes('ws-descriptions-item')&&this.type==='detail')
        },
        isOneItem() {
            return !this.isContainer && this.$slots.default.length == 1
        }
    },
    mounted() {
        if(!this.showHeader||!this.$refs.header.innerText.length){
            this.isShowHeader=false
        }
    },
};
</script>

<style lang="scss" scoped>
.ws-descriptions {
    margin-bottom: 32px;
    &__header {
        display: flex;
        justify-content: space-between;
        padding-bottom: 16px;
        line-height: 28px;
    }
    &__title {
        font-size: 16px;
        font-weight: bold;
    }
    &__extra {
        display: flex;
        font-size: 14px;
        font-style: inherit;
        .toggle{
            color: #f05259;
            cursor: pointer;
            margin-left: 20px;
            i{transition: all 0.3s;}
            .active{
                transform: rotate(90deg);
            }
        }
    }
    &__body {

    }
    &__container {
        padding: 0;
    }
    &__detail {
        display: flex;
        flex-wrap: wrap;
        overflow: hidden;
        border-radius: 8px;
        overflow: hidden;
    }
}
.ws-descriptions.single ::v-deep {
    .ws-descriptions__detail {
        border-top: 0 !important;
        .ws-descriptions__item {
            border-top: 1px solid #ebeef5;
        }
    }
}
</style>
