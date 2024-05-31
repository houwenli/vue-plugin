export default function(options) {
    let rules = [];
    if (options.required) {
        rules.push({
            required: true,
            message: options.message || '该输入项为必填项',
            trigger: ['blur', 'change']
        });
    }
    if (options.max) {
        rules.push({
            min: 1,
            max: options.max,
            message: `最多输入${options.max}个字符`,
            trigger: 'blur'
        });
    }
    if (options.min) {
        rules.push({
            min: options.min,
            message: `至少输入${options.min}个字符`,
            trigger: 'blur'
        });
    }
    if (options.min && options.max) {
        rules.push({
            min: options.min,
            max: options.max,
            message: `字符长度在${options.min}至${options.max}之间`,
            trigger: 'blur'
        });
    }
    if (options.length) {
        rules.push({
            min: options.length,
            max: options.length,
            message: `必须输入${options.length}个字符`,
            trigger: 'blur'
        });
    }

    if (options.type) {
        switch (options.type) {
            case 'url':
                rules.push({
                    type: 'url',
                    message: options.title || '请输入正确的链接地址 如：http://www.wsecar.com',
                    trigger: 'blur,change'
                });
                break;
            case 'email':
                rules.push({
                    pattern: options.reg || this.$regexList.get('email'),
                    message: options.title || '请输入正确的邮箱',
                    trigger: 'blur'
                });
                break;
            case 'mobile':
                rules.push({
                    pattern: options.reg || this.$regexList.get('mobile'),
                    message: options.title || '请输入正确的手机号码',
                    trigger: 'blur'
                });
                break;
            case 'idCode':
                rules.push({
                    pattern: options.reg || this.$regexList.get('idCode'),
                    message: options.title || '请输入正确的身份证号码',
                    trigger: 'blur'
                });
                break;
            case 'name':
                rules.push({
                    pattern: options.reg || this.$regexList.get('int0-1000'),
                    message: options.title || '2-10个汉字，不包括空格',
                    trigger: 'blur'
                });
                break;
            case 'notSpecial':
                rules.push({
                    pattern: options.reg || this.$regexList.get('notSpecial'),
                    message: options.title || '只能输入字母或数字',
                    trigger: 'blur'
                });
                break;
            case 'balance':
                rules.push({
                    pattern: options.reg || this.$regexList.get('balance'),
                    message: options.title || '金额(只能正数金额)',
                    trigger: 'blur'
                });
                break;
            case 'password':
                rules.push({
                    pattern: options.reg || this.$regexList.get('password'),
                    message: options.title || '密码格式不正确，6到12位，同时包含字母和数字',
                    trigger: 'blur'
                });
                break;
            default:
                break;
        }
    }

    return rules;
}
