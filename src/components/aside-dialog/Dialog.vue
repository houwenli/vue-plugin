<template>
    <div class="ws-aside-dialog-warp">
        <div class="ws-aside-dialog-shadow" :class="{'shade-close' : !visible}" @click="shadowhandler"></div>
        <div class="ws-aside-dialog-content" :style="this[placement]" :class="placement">
            <slot name="title">
                <div class="ws-aside-dialog-title">{{title}}</div>
            </slot>
            <div v-if="showClose" @click="closeDialog" class="ws-aside-dialog-close el-icon-close"></div>
            <el-scrollbar style="height:100%;">
                <div class="ws-aside-dialog-body" :key="renderedKey">
                    <slot></slot>
                </div>
            </el-scrollbar>

        </div>
    </div>
</template>

<script>
    import baseMethods from '../../util/baseMethods'

    export default {
        name: 'ws-aside-dialog',
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: ''
            },
            placement: { //弹窗的出现位置
                type: String,
                default: 'right'
            },
            modal: {    //是否需要遮罩层
                type: String,
                default: 'true'
            },
            destroyOnClose: {   //是否在关闭之后将组件节点重新渲染
                type: Boolean,
                default: false
            },
            beforeClose: Function,  //关闭前回调
            beforeOpen: Function,  //打开前回调,页面还未渲染
            afterOpen: Function,  //打开前回调，页面渲染完毕
            showClose: {    //是否显示关闭按钮
                type: Boolean,
                default: true
            },
            closeOnClickModal: {    //是否可以通过点击 modal 关闭 Dialog
                type: Boolean,
                default: true
            },
            closeOnPressEscape: {   //是否可以通过按下 ESC 关闭 Dialog
                type: Boolean,
                default: true
            },
        },
        data() {
            return {
                renderedKey: 1
            }
        },
        computed: {
            right() {
                return {
                    transform: `translateX(${this.visible ? 0 : 100}%)`
                }
            },
            left() {
                return {
                    transform: `translateX(${this.visible ? 0 : -100}%)`
                }
            },
            top() {
                return {
                    transform: `translateY(${this.visible ? 0 : -100}%)`
                }
            },
            bottom() {
                return {
                    transform: `translateY(${this.visible ? 0 : 100}%)`
                }
            }
        },
        watch: {
            visible(val) {
                if (val) {
                    baseMethods.disableBodyScroll();
                } else {
                    baseMethods.enableBodyScroll();
                    return;
                }
                if (typeof this.beforeOpen === 'function') {
                    if (this.beforeOpen() === false) {
                        this.$emit('update:visible', false);
                        return;
                    }
                }
                this.$nextTick(() => {
                    if (typeof this.afterOpen === 'function') {
                        this.afterOpen();
                    }
                })
            }
        },

        mounted() {
            //此处添加keydown 事件在组件销毁时需解除事件绑定
            this.$baseMethod.addHandler(window, 'keydown', this.escHandler);
        },
        methods: {
            closeDialog() {
                if (typeof this.beforeClose === 'function') {
                    if (this.beforeClose() === false) {
                        return;
                    }
                }
                this.destroyOnClose && (++this.renderedKey);
                this.$emit('update:visible', false);
            },
            //按ESC关闭dialog事件
            escHandler(event) {
                let keyCode = event.keyCode || event.which || event.charCode;
                if (keyCode === 27 && this.closeOnPressEscape) {
                    this.closeDialog();
                }
            },
            shadowhandler() {
                if (this.closeOnClickModal) {
                    this.closeDialog();
                }
            }
        },
        destroyed() {
            //销毁事件绑定
            this.$baseMethod.removeHandler(window, 'keydown', this.escHandler);
        }
    }
</script>

<style scoped lang="scss">

    .ws-aside-dialog-warp {


        .ws-aside-dialog-shadow {
            position: fixed;
            top: 0;
            width: 100%;
            left: 0;
            height: 100%;
            background: #000;
            opacity: .25;
            visibility: visible;
            transition: opacity 0.25s ease-in-out 0s;
            z-index: 200;

        }

        .shade-close {
            opacity: 0;
            visibility: hidden;
        }

        .ws-aside-dialog-content {
            display: flex;
            flex-direction: column;
            position: fixed;
            z-index: 1000;
            transition: all 0.25s ease-in-out 0s;
            background: #fff;
            position: fixed;

            .ws-aside-dialog-title {
                font-size: 22px;
                color: #1f2f3d;
                padding: 25px 60px 25px 25px;
            }

            .ws-aside-dialog-body {
                flex: 1;
                padding: 0 25px 25px;
            }

            .ws-aside-dialog-close {
                font-size: 28px;
                position: absolute;
                right: 20px;
                top: 20px;
                cursor: pointer;
                z-index: 300;
            }
        }

        .right {
            width: auto;
            height: 100%;
            top: 0;
            right: 0;
        }

        .left {
            width: auto;
            height: 100%;
            top: 0;
            left: 0;
        }

        .top {
            width: 100%;
            height: auto;
            max-height: 45%;
            top: 0;
            left: 0;
        }

        .bottom {
            width: 100%;
            height: auto;
            max-height: 45%;
            bottom: 0;
            left: 0;
        }
    }

</style>
