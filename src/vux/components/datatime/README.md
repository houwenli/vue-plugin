#移动端联动时间插件
> 联动时间插件支持开始和结束日期，可设置结束日期范围

> 使用方法：
> * modelStartTime： 绑定开始时间属性
> * modelEndTime： 绑定结束时间属性

> props 属性：
> * defaultTime： 选定默认时间，可自选择时间，不选则为: XXXX-XX-XX 00:00:00
> * valueFormat： 时间格式,默认：yyyy-MM-dd HH:mm:ss
> * type： 时间类型，默认datatime 日期时间选择器
> * intervalTime： 可选最大范围日期，默认为31天
> * modelStartTime： 双向绑定开始时间value
> * modelEndTime： 双向绑定结束时间value


```vue
    <template>
        <ws-date 
            :modelStartTime.sync="startTime" 
            :modelEndTime.sync="endTime" 
            <span>注册时间：</span>
        </ws-date>
    </template>
 
    export default {
        data () {
            startTime: null,  //开始时间
            endTime: null,    //结束时间
        }
    }
```

> 插件参数属性（同element-ui dataPicker参数）[data传送门](http://element-cn.eleme.io/#/zh-CN/component/datetime-picker)

