<template>
    <div class="ws-collapse-warp">
        <div class="ws-collapse-header" v-if="title">
            <slot name="title">{{title}}</slot>
            <i v-if="isFold" class="el-icon-arrow-down toggle-icon" :class="open ? 'open' : ''" @click="handleClick()"></i>
            <slot name="header"></slot>
        </div>
        <el-collapse-transition>
            <div class="ws-collapse-body" v-show="open">
                <div class="ws-collapse-main clearfix">
                    <slot></slot>
                </div>
            </div>
        </el-collapse-transition>

    </div>
</template>

<script>
    export default {
        name: 'ws-collapse',
        props: {
            title: {    //标题
                type: String,
                default: ''
            },
            isFold: {    //是否可折叠
                type: Boolean,
                default: true
            },
            expansion: {    //是否默认展开
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                open: this.expansion
            }
        },
        methods: {
            handleClick() {
                this.open = !this.open;
            }
        }
    }
</script>

<style lang="scss">
    .ws-collapse-warp {
        background: rgba(255, 255, 255, 1);
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.2);
        margin-bottom:20px;

        .ws-collapse-header {
            height: 55px;
            padding: 0 20px;
            line-height: 55px;
            border-bottom: 1px solid #ddd;

            .title {
                font-size: 18px;
            }

            .toggle-icon {
                width: 20px;
                height: 20px;
                cursor: pointer;
                line-height: 20px;
                text-align: center;
                cursor: pointer;
                margin-left: 10px;
                transition: transform .3s;
                user-select:none;
            }

            .open {
                transform: rotate(180deg);
            }
        }

        .ws-collapse-main {
            padding: 20px;
        }
    }
</style>
