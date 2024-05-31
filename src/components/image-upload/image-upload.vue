<template>
    <div>
        <div class="image-viewer" v-for="(src,index) in fileList" :key="index">
            <img :src="src" alt="" width="100%" height="100%"/>
            <div class="tool" :class="{'visible': maskArr[index]}">
                <div class="masking"></div>
                <div class="masking-btns">
                    <i class="el-icon-zoom-in" v-if="isViewer" @click="onPreview(index)"></i>
                    <el-popover
                        v-if="isDelete"
                        placement="top"
                        width="160"
                        v-model="maskArr[index]">
                        <p>确定要删除此图吗？</p>
                        <div class="t_c">
                            <el-button size="mini" type="text" @click="closeHandler(index)">取消</el-button>
                            <el-button type="primary" size="mini" @click="deleteImg(index)">确定</el-button>
                        </div>
                        <i slot="reference" class="el-icon-delete" style="color: #fff;"></i>
                    </el-popover>
                </div>
            </div>
        </div>
        <div class="el-upload el-upload--picture-card" v-if="(!quantity || fileList.length < quantity) && !disable" @click="changeFile">
            <i class="el-icon-plus"></i>
            <input type="file" :disabled=inputReadyOnly :key="fileKey" v-if="multi" multiple="multiple" ref="file" name="file" :accept="fileTypes" @change="addAttachment" class="el-upload__input">
            <input type="file" :disabled=inputReadyOnly :key="fileKey" v-else ref="file" name="file" :accept="fileTypes" @change="addAttachment" class="el-upload__input">
        </div>
        <ws-image-viewer :visible.sync="currentViewer" :src-list="fileList" :currentIndex="currentIndex"/>
    </div>
</template>

<script>


    export default {
        name: 'ws-image-upload',

        props: {
            actions: {
                type: Object, default: () => {
                    return {
                        // url: '/system/file/addAttachment',   上传地址，优先级高于moduleName
                        // moduleName: '',      //可根据模块名和op自动匹配上传地址
                        // op: 'addAttachment'  //上传op，优先级高于moduleName
                    }
                }
            },
            urlList: {type: Array, default: () => []},  //图片地址集合，可用于修改返回图片地址
            disable: {type: Boolean, default: false},     //是否禁用,屏蔽上传框
            inputReadyOnly: {type: Boolean, default: false},     //是否只展示上传框，不能点击弹出文件选择框
            localPreview: {type: Boolean, default: false},     //是否只本地预览 异步上传
            liveUpload: {type: Boolean, default: false},     //是否实时上传,返回URL展示
            multi: {type: Boolean, default: false},     //是否可以多图上传
            multiple: {type: Boolean, default: true},  //多图上传是否分多次上传
            quantity: {type: Number, default: 1},       //最大上传数量, 0 为不限制
            size: {type: Number, default: 10},           //单张图片上传大小 单位 M,默认10M
            isDelete: {type: Boolean, default: true},   //是否可以删除图片
            isViewer: {type: Boolean, default: true},   //是否需要图片预览

            handlePreview: {   //点击图片预览触发事件，viewer=true 生效
                type: Function, default: () => {
                }
            },
            handleRemove: {     //删除图片触发事件,delete=true生效，返回false可阻止删除图片
                type: Function, default: () => {
                }
            },
            beforeUpdate: {    //上传之前事件，返回false可取消上传,可用于传递上传参数data
                type: Function, default: () => {
                }
            },
            afterUpload: {   //上传成功回调函数，返回响应值,
                type: Function, default: () => {
                }
            },
            asyncResolve: { //所有异步执行完毕回调
                type: Function, default: () => {
                }
            },
            uploadValidate: {   // 上传图片前的异步校验，如上传指定尺寸
                type: Function,
                default: () => true
            },
            formatFile: {   // 重写file对象属性
                type: Function,
                default: v => v
            },
            fileExt: {  // 上传图片类型
                type: Array,
                default: () => ['png', 'jpg', 'jpeg']
            }
        },

        data() {
            return {
                currentViewer: false,
                currentIndex: 0,
                fileKey: 1,
                fileList: [],
                showViewer: false,
                files: [],
                maskArr: [], // 添加 点击删除，操作弹框显示时 按钮父级容器(tool)显示
                isLocked: false // 添加锁定，图片接口上传过程中不允许再上传，接口返回后重置
            };
        },
        watch: {
            urlList: {
                handler: function (val) {
                    this.fileList = Array.from(new Set([...this.fileList, ...val]));
                    //异步上传直接赋值，避免base64和请求返回的地址耦合
                    if((this.localPreview || this.liveUpload) && this.quantity == 1){
                        let list = this.fileList.filter(x => Boolean(x) == true)
                        if(list.length){
                            this.fileList = [list[0]]
                        }
                    }
                },
                immediate: true,
                
            }
        },
        computed: {
            fileTypes() {
                return this.fileExt.map(v => 'image/' + v).join(',')
            }
        },
        methods: {
            async addAttachment() {
                let files = this.$refs.file.files;
                this.$emit('change', files);
                let types = this.fileExt;
                this.fileKey += 1;
                
                if(this.isLocked) {
                    this.$message.error('图片上传中...')
                    return
                }
                for (let file of files) {
                    let ext = file.name.substr(file.name.lastIndexOf('.') + 1);
                    if (!types.includes(ext)) {
                        this.$message.error(`图片仅支持 ${types.join('、')} 格式!`);
                        return false;
                    }
                    if (file.size > 1024 * 1024 * this.size) {
                        this.$message.error(`图片大小不能超过 ${this.size}M!`);
                        return false;
                    }
                    if (this.quantity && files.length + this.fileList.length > this.quantity) {
                        this.$message.error(`最多只能上传 ${this.quantity} 张图片，请重新选择!`);
                        return false;
                    }
                    // 上传前添加异步校验，如校验图片尺寸(默认true，不校验)
                    try {
                        let validateRes = await this.uploadValidate(file)
                        if(!validateRes) return
                    } catch (error) {
                        console.log(error)
                    }
                }
                this.files = files
                if (!this.localPreview) {
                    this.multiple && this.multipleUploadImage() ||
                    this.onceUploadImage();
                } else {
                    this.fileReader()
                }

            },
            fileReader() {
                let self = this;
                for (let file of this.files) {
                    //获取并记录图片的base64编码
                    var reader = new FileReader();
                    reader.readAsDataURL(file); // 读出 base64
                    reader.onloadend = function () {
                        let dataURL = reader.result;//base64
                        self.fileList.push(dataURL);
                    };
                }
            },
            //多图一次性上传
            async onceUploadImage() {
                let url = this.actions.url || this.$getModuleUrl(this.actions.moduleName, this.actions.op);
                let param = this.beforeUpdate();
                if (!url || param === false) {
                    return false;
                }
                param = param || {};

                let formData = new FormData();
                let session = this.$baseMethod.getStore('_ccmUser');
                for (let file of this.files) {
                    formData.append('file', this.formatFile(file)); // 默认不处理
                }
                formData.append('data', JSON.stringify(param));
                formData.append('op', this.actions.op);
                formData.append('token', session.token);
                try {
                    this.isLocked = true
                    const response = await this.$upLoad(url, formData);
                    this.isLocked = false
                    let data = this.afterUpload(response, this.files);
                    this.asyncResolve();
                    if (Array.isArray(data)) {
                        this.fileList.push(...data);
                    } else {
                        console.error('Return value must be an Array')
                    }
                } catch (error) {
                    this.isLocked = false    
                }
            },
            //多图多次上传
            async multipleUploadImage() {
                let url = this.actions.url || this.$getModuleUrl(this.actions.moduleName, this.actions.op);
                let param = this.beforeUpdate();
                if (!url || param === false) {
                    return false;
                }
                param = param || {};
                let session = this.$baseMethod.getStore('_ccmUser');
                const responseMap = Array.from(this.files).map(async file => {
                    let formData = new FormData();
                    formData.append('file', this.formatFile(file)); // 默认不处理
                    formData.append('data', JSON.stringify(param));
                    formData.append('op', this.actions.op);
                    formData.append('token', session.token);
                    return await this.$upLoad(url, formData);
                })
                try {
                    for (const res of responseMap) {
                        this.isLocked = true
                        const response = await res;
                        this.isLocked = false
                        let data = this.afterUpload(response, this.files);
                        if (Array.isArray(data)) {
                            this.fileList.push(...data);
                        }
                        if (typeof data == 'string') {
                            this.fileList.push(data);
                        }
                        if (!data) {
                            this.fileList.push(response.data);
                            //异步上传 上传位为1的时候，确保只展示一个图，当请求返回，取返回的值
                            if(this.localPreview && this.quantity ===1){
                                this.fileList = [response.data]
                            }
                        }
                    }
                } catch (error) {
                    this.isLocked = false
                }
                this.asyncResolve();
            },
            deleteImg(index) {
                let result = this.handleRemove(this.fileList[index]);
                this.$set(this.maskArr, index, false);
                if (result === false) {
                    return false;
                }
                this.fileList.splice(index, 1);
            },
            closeHandler(index) {
                this.$set(this.maskArr, index, false);
            },
            changeFile() {
                this.$refs.file.click();
            },
            onPreview(index) {
                this.currentViewer = true;
                this.handlePreview(this.fileList[index]);
                this.currentIndex = index;
            },
            getUrlList() {
                return [...this.fileList];
            },
        }
    };
</script>

<style scoped lang="scss">
    .image-viewer {
        position: relative;
        width: 150px;
        height: 150px;
        display: inline-block;
        margin: 5px;
        border: 1px solid #c0ccda;
        border-radius: 6px;
        overflow: hidden;

        .tool {
            display: none;
            &.visible {
                display: block;
            }
        }

        .masking {
            position: absolute;
            top: 0;
            width: 100%;
            height: 100%;
            background: #000;
            opacity: .65;
        }

        .masking-btns {
            position: absolute;
            width: 100%;
            top: 50%;
            margin-top: -14px;
            text-align: center;
            color: #fff;
            font-size: 20px;

            i {
                width: 30px;
                cursor: pointer;
            }
        }

        &:hover .tool {
            display: block;
        }
    }

    .el-upload--picture-card {
        width: 150px;
        height: 150px;
        line-height: 150px;
        margin: 5px;
    }
    .t_c {
        text-align: center;
    }
</style>

