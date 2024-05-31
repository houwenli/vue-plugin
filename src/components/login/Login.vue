<template>
    <div class="ws-login" :style="{ background: defaultOptions.background }">

            <div class="ws-login__img">
                <slot name="img" v-if="$slots.img"><img :src="defaultOptions.loginImg" /></slot>
                <img v-else :src="defaultOptions.loginImg" />
            </div>

            <div class="ws-login__main">
                <slot name="header">
                    <div class="header">
                        <img :src="defaultOptions.logo" class="logo" alt />
                        <div class="system-name" :style="{ fontSize: defaultOptions.fontSize, color: defaultOptions.color, borderColor: defaultOptions.lineColor||defaultOptions.color }">
                            {{ defaultOptions.systemName }}
                        </div>
                    </div>
                </slot>
                <div class="ws-login__from">
                    <el-form :model="formData" status-icon :rules="rules" ref="loginRuleForm">
                        <el-form-item prop="userName">
                            <el-input  class='login-panel-input' v-model.trim="formData.userName" :style="inputStyle" placeholder="账号" maxlength="20" clearable></el-input>
                        </el-form-item>
                        <el-form-item prop="passWord">
                            <el-input
                                type="password"
                                v-model.trim="formData.passWord"
                                :style="inputStyle"
                                autocomplete="off"
                                placeholder="密码"
                                show-password
                                class='login-panel-input'
                            ></el-input>
                        </el-form-item>
                        <el-form-item prop="checkCode">
                            <el-input
                                class="verification_input login-panel-input"
                                maxlength="4"
                                :style="codeInputStyle"
                                v-model.trim="formData.checkCode"
                                placeholder="验证码"
                                type="text"
                            ></el-input>
                            <div class="login_security_code" @click="getValidateCode()">
                                <img v-if="captcha.authCode" :src="'data:image/png;base64,' + captcha.authCode" class="security_img" alt="验证码" />
                                <span class="next_img">换一张</span>
                            </div>
                        </el-form-item>
                        <div
                            v-if="defaultOptions.isReset"
                            @click="resetPasswordsDialog = true"
                            :style="resetStyle"
                            style="margin: -5px 0 15px; float: right; position: relative; z-index: 10; cursor: pointer;color:#606266"
                        >
                            忘记密码？
                        </div>
                        <el-form-item style="margin-bottom:0;">
                            <ws-enter-event listenEnter>
                                <el-button
                                    type="primary"
                                    :style="{ ...buttonStyle, ...defaultOptions.buttonStyle }"
                                    :loading="logining"
                                    class="login_btn"
                                    @click="validateForm"
                                >
                                    登录
                                </el-button>
                            </ws-enter-event>
                        </el-form-item>
                    </el-form>
                </div>
            </div>

        <el-dialog
            custom-class="dialog_"
            title="短信验证"
            :visible.sync="centerDialogVisible"
            :before-close="beforeClose"
            width="604px"
            :close-on-click-modal="false"
        >
            <div class="sms-block">已经给手机号{{ (contactPhone || formData.userName) | hidePhoneNumber }}发送了一条验证码，请将验证码输入框内：</div>
            <div class="item-code">
                <el-input v-model.trim="smsCode" placeholder="请输入验证码" :maxlength="smsMaxlength" class="smsCode"></el-input>
                <ws-verification :customClass="'verification'" :isSend.sync="isSend" @verifyCodeHandle="getVerifyCode(1)"></ws-verification>
            </div>

            <div slot="footer" class="dialog-footer">
                <el-button type="danger" @click="login" :disabled="disabled">确 定</el-button>
            </div>
        </el-dialog>

        <!-- 忘记密码start -->
        <el-dialog
            custom-class="dialog_"
            title="重置登录密码"
            :visible.sync="resetPasswordsDialog"
            :before-close="resetClose"
            width="604px"
            :close-on-click-modal="false"
        >
            <el-form :model="resetOptions" :rules="rules" ref="resetForm" label-width="100px" class="ruleForm">
                <template v-if="!isResetConfirm">
                    <el-form-item label="登录账号：" prop="loginName" v-if="$vuex.project.type == 'company'">
                        <el-input v-model.trim="resetOptions.loginName" placeholder="请输入分支机构账号" maxlength="30" class="smsCode"></el-input>
                    </el-form-item>
                    <el-form-item label="手机号：" prop="phone">
                        <el-input v-model.trim="resetOptions.phone" placeholder="请输入手机号" maxlength="11" class="smsCode"></el-input>
                    </el-form-item>

                    <el-form-item label="验证码：" prop="smsCode">
                        <div class="item-code">
                            <el-input v-model.trim="resetOptions.smsCode" placeholder="请输入验证码" :maxlength="smsMaxlength" class="smsCode"></el-input>
                            <ws-verification :customClass="'verification'" :isSend.sync="isResetSend" @verifyCodeHandle="getVerifyCode(2)"></ws-verification>
                        </div>
                    </el-form-item>
                </template>

                <template v-else>
                    <el-form-item label="新密码：" prop="newPassword">
                        <el-input
                            type="password"
                            autocomplete="off"
                            show-password
                            v-model.trim="resetOptions.newPassword"
                            placeholder="请输入密码"
                            maxlength="16"
                        ></el-input>
                    </el-form-item>
                </template>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetClose">取 消</el-button>
                <el-button type="danger" @click="resetPasswords">确 定</el-button>
            </div>
        </el-dialog>
        <!-- 忘记密码END -->
    </div>
</template>

<script>
import md5 from 'md5';
import global from '../../store/global';

export default {
    name: 'ws-login',
    props: {
        inputStyle: { type: Object, default: () => {} }, //登录和密码输入框样式
        buttonStyle: { type: Object, default: () => {} }, //登录按钮样式
        codeInputStyle: { type: Object, default: () => {} }, //验证码框样式
        commonSystemParams: { type: Object, default: () => {} }, // 获取验证码、登录需要的额外参数
        resetStyle: { type: Object, default: () => {} },
        options: { type: Object, default: () => ({}) }
    },
    data() {
        return {
            defaultOptions: {
                loginImg: 'https://wsjc-web-1301582899.cos.ap-guangzhou.myqcloud.com/oa/vue-plugin/login-img.png',
                logo: 'https://wsjc-web-1301582899.cos.ap-guangzhou.myqcloud.com/oa/vue-plugin/logo.png',
                systemName: this.$vuex.project.moduleName,
                fontSize: '26px',
                color: '#F05259',
                lineColor: '#606266',
                background: 'linear-gradient(45deg, #F1F9F6 0%, #FFF6F6 100%)',
                buttonStyle: {},
                isReset: true,
                ...this.options
            },
            isResetConfirm: false,
            resetOptions: {
                loginName: '',
                phone: '',
                smsCode: '',
                newPassword: ''
            },
            resetPasswordsDialog: false, // 重置密码
            isResetSend: false,
            logining: false,
            isSend: true,
            centerDialogVisible: false,
            disabled: false,
            captcha: {},
            formData: {
                userName: '',
                passWord: '',
                checkCode: ''
            },
            contactPhone: '',
            smsCode: '',
            rules: {
                userName: [{ required: true, trigger: 'blur', message: '账号不能为空' }],
                passWord: [
                    { required: true, trigger: 'blur', message: '密码不能为空' },
                    // {
                    //     pattern: /^[a-zA-Z0-9]{6,15}$/,
                    //     // pattern: /^(?![\d]+$)(?![a-zA-Z]+$)(?![@$!%*#_~?&^]+$)[\da-zA-Z@$!%*#_~?&^]{8,16}$/,
                    //     message: "密码格式有误",
                    //     trigger: "blur"
                    // }
                ],
                checkCode: [{ required: true, trigger: 'blur', message: '验证码不能为空' }],
                loginName: [{ required: true, trigger: 'blur', message: '账号不能为空' }],
                phone: [
                    { required: true, trigger: 'blur', message: '手机号不能为空' },
                    { pattern: /^1\d{10}$/, trigger: 'blur', message: '手机号输入有误！' }
                ],
                smsCode: [{ required: true, trigger: 'blur', message: '验证码不能为空' }],
                newPassword: [
                    { required: true, trigger: 'blur', message: '密码不能为空' },
                    {
                        // pattern: /^[a-zA-Z0-9]{6,15}$/,
                        pattern: /^(?![\d]+$)(?![a-zA-Z]+$)(?![@$!%*#_~?&^]+$)[\da-zA-Z@$!%*#_~?&^]{8,16}$/,
                        message: "密码格式有误，8到16位，必须同时包含字母数字特殊字符",
                        trigger: "blur"
                    }
                ]
            },
            smsMaxlength: null
        };
    },
    async created() {
        sessionStorage.removeItem('_ccmUser');
        sessionStorage.removeItem(this.$baseMethod.getSystemKey());
        sessionStorage.removeItem('moduleName');
        document.cookie = 'WS_KEY=' + JSON.stringify('') + '; domain=wsecar.com;path=/';
        await this.getSmsLength()
        this.getValidateCode();
    },
    computed: {
        host() {
            const { namespaced = true, registerModule = 'login' } = $vuex.project;
            return (namespaced && registerModule && registerModule + '/') || '';
        },
        jumpLink() {
            const { jumpLink = 'home' } = global.getState('project');
            return jumpLink;
        }
    },
    methods: {
      /**
       * 获取短信验证码长度
       */
      async getSmsLength() {
        try {
          let res = await this.$store.dispatch(`${this.host}requestGetSmsCodeLen`)
          if (res.data && JSON.parse(res.data)) {
            this.smsMaxlength = Number(JSON.parse(res.data).smsLength)
          }
        } catch (error) {
          console.log('获取短信验证码长度报错');
          console.log(error);
        }
      },

        //获取验证码
        getValidateCode() {
            const parm = {
                data: this.commonSystemParams,
                op: 'select'
            };
            this.$store.dispatch(`${this.host}requestGetValidateCode`, parm).then(res => (this.captcha = JSON.parse(res.data)));
        },
        //获取短信验证码
        async getVerifyCode(smsType) {
            let reg = /^(1)\d{10}$/;
            if (this.resetPasswordsDialog && !reg.test(this.resetOptions.phone)) {
                this.$message.error('手机号输入有误！');
                return false;
            }
            const parm = {
                data: {
                    phone: this.resetOptions.phone || this.contactPhone || this.formData.userName,
                    smsType
                },
                op: ''
            };

            try {
              await this.$store.dispatch(`${this.host}requestGetSmsCode`, parm)

              if(this.resetPasswordsDialog) {
                this.isResetSend = true
              } else {
                this.isSend = true
              }
            } catch (error) {
            }
        },
        //发送登陆请求
        validateForm() {
            this.$refs['loginRuleForm'].validate(valid => {
                if (valid) {
                    this.login();
                } else {
                    return false;
                }
            });
        },
        login() {
            let { moduleName: systemName } = this.$vuex.project;
            const parm = {
                data: {
                    loginName: this.formData.userName,
                    password: md5(this.formData.passWord),
                    keyCode: this.captcha.keyCode,
                    authCode: this.formData.checkCode,
                    smsCode: this.smsCode,
                    systemName
                },
                op: 'select'
            };

            parm.data = Object.assign(parm.data, this.commonSystemParams);

            if (!this.smsCode && this.centerDialogVisible) {
                this.$message.error('请输入短信验证码！');
                return false;
            }
            if (!this.smsCode && !this.centerDialogVisible) {
                delete parm.data.smsCode;
            }

            this.logining = true;
            this.$store
                .dispatch(`${this.host}requestLogin`, parm)
                .then(res => {
                  // 登录接口：非第一次登录
                    let userData = JSON.parse(res.data);
                    userData.loginTime = this.$baseMethod.formatData(new Date(), 'yyyy-MM-dd hh:mm:ss');
                    this.$baseMethod.setStore('_ccmUser', JSON.stringify(userData));
                    document.cookie = 'WS_KEY=' + JSON.stringify(userData) + '; domain=wsecar.com;path=/';
                    this.$store.commit(`${this.host}setUserInfo`, userData); //登陆信息保存到state里面
                    this.logining = false;
                    this.centerDialogVisible = false;
                    this.$router.replace({ path: this.jumpLink });
                })
                .catch(res => {
                  // 登录接口：第一次登录
                    this.logining = false;
                    if (this.centerDialogVisible == false) {
                        this.$baseMethod.removeStore('_ccmUser');
                    }
                    let userData = JSON.parse(res.data) || {};
                    if (userData && userData.phone) {
                        this.contactPhone = userData.phone || ''; //发送短信验证手机号
                    }
                    // 需要验证码
                    if (res.code === 50) {
                        this.centerDialogVisible = true;
                        this.isSend = true;
                        return;
                    }
                    this.smsCode = '';
                    this.getValidateCode();
                });
        },
        beforeClose() {
            this.$baseMethod.removeStore('_ccmUser');
            this.smsCode = '';
            this.isSend = false;
            this.centerDialogVisible = false;
            this.getValidateCode();
        },
        resetClose() {
            this.resetPasswordsDialog = false;
            this.$refs.resetForm.resetFields();
            setTimeout(() => {
                this.resetOptions = {};
                this.isResetSend = false;
                this.isResetConfirm = false;
            }, 300);
        },
        resetPasswords() {
            this.$refs.resetForm.validate(valid => {
                if (valid) {
                    this.handleReset();
                } else {
                    return false;
                }
            });
        },
        handleReset() {
            let { phone, smsCode, loginName, newPassword } = this.resetOptions;

            if (!this.isResetConfirm) {
                let params = {
                    data: {
                        phone,
                        smsCode,
                        loginName: loginName || phone
                    },
                    op: ''
                };
                this.$store.dispatch(`${this.host}requestSmsLogin`, params).then(res => {
                    this.$baseMethod.setStore('_ccmUser', res.data);
                    this.isResetSend = false;
                    this.isResetConfirm = true;
                });
            } else {
                this.$store
                    .dispatch(`${this.host}requestResetPassword`, {
                        data: {
                            newPassword: md5(newPassword)
                        },
                        op: ''
                    })
                    .then(() => {
                        this.$message.success('密码修改成功，请重新登录！');
                        this.resetClose();
                    });
            }
        }
    }
};
</script>

<style lang="scss">
@import "./index.scss";
</style>
