<template>
    <button type="button" class="code_btn" :class="[isDisabled ? 'disabled': '',customClass]" :disabled="isDisabled" @click="verificationClick">
        {{isDisabled ? `(${this.verificationTime}s)重新获取` : '获取验证码'}}
    </button>
</template>

<script>
    export default {
        name: 'ws-verification',
        props: {
            isSend: {type: Boolean, default: false},
            customClass: {  //自定义dialog类名
                type: String,
                default: ''
            },
        },
        data() {
            return {
                verificationTime: 60,
                isDisabled: false,
            };
        },
        watch: {
            isSend: {
                handler(val) {
                    if (val) {
                        this.init();
                        this.isDisabled = true;
                        this.timer = setInterval(() => {
                            this.verificationTime--;
                            if (this.verificationTime == 0) {
                                this.init();
                                this.$emit('update:isSend', false);
                            }
                        }, '1000');
                    }
                },
                immediate: true
            }
        },
        methods: {
            verificationClick() {
                this.$emit('verifyCodeHandle');
            },
            init(){
                this.verificationTime = 60;
                this.isDisabled = false;
                clearInterval(this.timer);
            }
        }
    };
</script>

<style scoped lang="scss">
    .code_btn {
        height: 40px;
        border: 1px solid #ddd;
        margin-left: 12px;
        width: 113px;
        border-radius: 4px;
        cursor: pointer;
        color: #606266;
    }

    .disabled {
        background: #f0f2f5;
        color: #c8cbd3;
    }
</style>
