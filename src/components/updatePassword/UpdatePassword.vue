<template>
    <el-dialog
        title="修改密码"
        width="600px"
        :close-on-click-modal="false"
        append-to-body
        :visible.sync="modelVisible"
        :before-close="close"
        custom-class="change_password_dialog"
    >
        <p v-if="message" class="tips">{{message}}</p>
        <el-form class="register-wrap" :key="formKey" :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px">
            <el-form-item prop="oldPassword" label="原密码：">
                <el-input
                    v-model="ruleForm.oldPassword"
                    placeholder="请输入原始密码"
                    @focus="oldPassword = true"
                    :show-password="oldPassword"
                    autocomplete="off"
                ></el-input>
            </el-form-item>
            <el-form-item prop="newPassword" label="新密码：">
                <el-input
                    v-model="ruleForm.newPassword"
                    placeholder="请输入新密码"
                    @focus="newPassword = true"
                    :show-password="newPassword"
                    autocomplete="off"
                ></el-input>
            </el-form-item>

            <el-form-item prop="confirmPassword" label="确认密码：">
                <el-input
                    v-model="ruleForm.confirmPassword"
                    placeholder="请再次输入新密码"
                    @focus="confirmPassword = true"
                    :show-password="confirmPassword"
                    autocomplete="off"
                ></el-input>
            </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
            <el-button @click="close" plain>取 消</el-button>
            <el-button type="primary" @click="updatePassword">修 改</el-button>
        </div>
    </el-dialog>
</template>

<script>
import md5 from 'md5';
import baseMethods from '../../util/baseMethods';

export default {
    name: 'ws-update-password',
    props: ['visible'],
    data() {
        const newPassword = (rule, value, callback) => {
            // let reg = /^[0-9A-Za-z]{6,16}$/;
            let reg = /^(?![\d]+$)(?![a-zA-Z]+$)(?![@$!%*#_~?&^]+$)[\da-zA-Z@$!%*#_~?&^]{8,16}$/;
            if (value === '') {
                callback(new Error('密码不能为空！'));
            }
            if (!reg.test(value)) {
                // callback(new Error('请输入6-16位的由字母或数字组成的密码！'));
                callback(new Error('请输入8-16位，由数字、字母和特殊字符，任意两种组成的密码！'));
            }
            if (this.ruleForm.confirmPassword !== '') {
                this.$refs.ruleForm.validateField('confirmPassword');
            }
            callback();
        };
        const confirmPassword = (rule, value, callback) => {
            let reg = /^(?![\d]+$)(?![a-zA-Z]+$)(?![@$!%*#_~?&^]+$)[\da-zA-Z@$!%*#_~?&^]{8,16}$/;
            if (value === '') {
                callback(new Error('密码不能为空！'));
            }
            if (!reg.test(value)) {
                callback(new Error('请输入8-16位，由数字、字母和特殊字符，任意两种组成的密码！'));
            }
            if (this.ruleForm.newPassword !== '' && this.ruleForm.newPassword !== this.ruleForm.confirmPassword) {
                callback(new Error('两次输入密码不一致，请重新输入！'));
            }
            callback();
        };
        return {
            oldPassword: false,
            newPassword: false,
            confirmPassword: false,
            formKey: new Date().getTime(),
            ruleForm: {
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            },
            rules: {
                oldPassword: [{ required: true, message: '密码不能为空' }],
                newPassword: [{ required: true, validator: newPassword, trigger: 'blur' }],
                confirmPassword: [{ required: true, validator: confirmPassword, trigger: 'blur' }]
            },
            message: ''
        };
    },
    computed: {
        host() {
            const { namespaced = true, registerModule = 'login' } = $vuex.project;
            return (registerModule && namespaced && registerModule + '/') || '';
        },
        modelVisible: {
            set(val = false) {
                this.$emit('update:visible', val);
            },
            get() {
                this.formKey = new Date().getTime();
                return this.visible;
            }
        }
    },
    watch: {
        visible(newVal, oldVal) {
            if (!newVal && this.message) {
                this.message = '';
            }
        }
    },
    mounted() {
        const _ccmUser = baseMethods.getStore('_ccmUser');
        this.modelVisible = _ccmUser.needUpdatePassword;
        this.message = _ccmUser.message;
    },
    methods: {
        close() {
            this.modelVisible = false;
            this.oldPassword = false;
            this.newPassword = false;
            this.confirmPassword = false;
            this.$refs['ruleForm'].resetFields();
        },
        updatePassword() {
            this.$refs['ruleForm'].validate(valid => {
                if (valid) {
                    this.save();
                }
            });
        },
        save() {
            let parm = {
                data: {
                    oldPassword: md5(this.ruleForm.oldPassword),
                    newPassword: md5(this.ruleForm.newPassword),
                    confirmPassword: md5(this.ruleForm.confirmPassword)
                },
                op: ''
            };
            this.$store.dispatch(`${this.host}requestUpdatePassword`, parm).then(res => {
                this.$emit('update:visible', false);
                this.$message.success('密码修改成功，请重新登录！');
                baseMethods.removeStore('_ccmUser');
                this.$router.replace({ path: '/' });
            });
        }
    }
};
</script>
<style scoped lang="scss">
.change_password_dialog {
    .dialog-footer {
        .el-button {
            width: 98px!important;
        }
    }

    .register-wrap {
        ::v-deep .el-form-item:last-child {
            margin-bottom: 0 !important;
        }
    }

    .tips {
        margin-bottom: 10px;
        color: #f05259;
    }
}
</style>
