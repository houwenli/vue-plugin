<template>
    <div class="verification-wrapper">
        <label for="verificationCode">
            <ul class="security-code-container">
                <li :class="customClass" v-for="(item, index) in maxlength" :key="index">
                    <span>{{value[index]}}</span>
                </li>
            </ul>
        </label>
        <input id="verificationCode" ref="verificationInput" @keyup="handleInput($event)" v-model="value" :maxlength="maxlength" class="input-code" name="verificationCode" type="tel" autocorrect="off" autocomplete="off" autocapitalize="off"/>
    </div>

</template>

<script>
    export default {
        name: 'ws-vux-verification',
        model: {
            prop: 'verCode',
            event: 'verCodeEvent'
        },
        props: {
            maxlength: {
                type: Number, default: 4
            },
            callBack: Function,  //输入完回调
            customClass: {  //自定义输入框类名
                type: String,
                default: ''
            },
            verCode: {
                type: String,
                default: ''
            }

        },
        data() {
            return {
                numList: [],
                value: ''
            }
        },
        watch: {
            verCode(val) {
                this.value = val;
            }
        },
        methods: {
            hideKeyboard() {
                // 输入完成隐藏键盘
                document.activeElement.blur() // ios隐藏键盘
                this.$refs.verificationInput.blur() // android隐藏键盘
            },
            handleSubmit() {
                this.$emit('verCodeEvent', this.value)
            },
            handleInput(e) {
                this.value = parseInt(this.value) + '';
                //验证是否输入的数字
                if (isNaN(this.value)) {
                    this.value = '';
                }
                this.$refs.verificationInput.value = this.value
                if (this.value.length >= this.maxlength) {
                    this.hideKeyboard()
                    this.$nextTick(() => {
                        if (typeof this.callBack === 'function') {
                            this.callBack();
                        }
                    })
                }
                this.handleSubmit()
            }
        }
    }
</script>

<style scoped lang="scss">
    .verification-wrapper {
        position: relative;

        .security-code-container {
            display: flex;
            justify-content: center;
            z-index: 99;

            li {
                list-style: none;
                display: block;
                width: 45px;
                height: 45px;
                line-height: 45px;
                font-size: 16px;
                background-color: #fff;
                border: 1px solid #ddd;
                margin-left: -1px;
                color: #333;
                text-align: center;
                line-height: 45px;
            }
        }

        .input-code {
            position: absolute;
            left: 0px;
            top: 0px;
            width: 100%;
            height: 45px;
            opacity: 0;
            overflow: visible;
            z-index: -1;
        }

        input {
            text-indent: -999rem; /*文本左缩进*/
            margin-left: -100%; /*输入框光标起始点向左移*/
            width: 200%; /*输入框增大一倍*/
            opacity: 0;
        }
    }

</style>
