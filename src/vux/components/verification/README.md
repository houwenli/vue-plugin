# 获取验证码插件
> 点击发送验证码，通过isSend属性控制是否开启倒计时，

> 使用方法：
> * isSend： 是否已发送验证码，true则禁用并开始倒计时。默认false
> * verifyCodeHandle： 验证码点击事件

```vue
    <template>
         <ws-verification 
             :isSend.sync="isSend" 
             @verifyCodeHandle="verifyCodeHandle">
         </ws-verification>
    </template>
 
    export default {
        data () {
            isSend: false    //是否已发送验证码，默认false
        }，
        methods: { 
            //验证码点击事件，设置isSend=true手动开启倒计时，
            verifyCodeHandle(){
                this.isSend = true;
                //一般结合表单验证和后台接口返回来设置 ，栗子：
                // sendVerifyCode(data).then((res) => {
                //      if (res.code === 1){
                //          this.isSend = true;
                //      }
                // });
            }
        }
    }
```

