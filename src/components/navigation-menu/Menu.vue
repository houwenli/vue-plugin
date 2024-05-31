<template>
    <div class="ws-nav-menu-warp">
        <div class="ws-nav-menu-shade" @click="close" :class="{'shade-close' : !visible}"></div>
        <div class="ws-nav-menu-main" :style="asideStyle">
            <div class="ws-nav-menu-list-left">
                <div class="ws-nav-menu-aside">
                    <i class="el-icon-menu"></i>
                    <span>所有业务</span>
                    <i class="el-icon-arrow-right"></i>
                </div>
                <el-scrollbar style="height:100%">
                    <ws-drag vertical :data-list.sync="markingMenuList" :dragEnd="dragEnd">
                        <ul class="ws-nav-menu-marking-list">
                            <li v-for="(data,index) in markingMenuList">
                                <span @click="routerLink(data)">{{data.resourcesName}}</span>
                                <i @click="marking(data)" class="icon-close el-icon-close"></i>
                            </li>
                        </ul>
                    </ws-drag>
                </el-scrollbar>
            </div>
            <div class="ws-nav-menu-list-right">
                <div class="ws-nav-menu-autocomplete">
                    <i class="el-icon-search"></i>
                    <el-autocomplete
                        class="inline-input"
                        v-model="restaurants"
                        :fetch-suggestions="querySearch"
                        placeholder="请输入关键字"
                        :trigger-on-focus="false"
                        @select="routerLink"
                    ></el-autocomplete>
                </div>


                <el-scrollbar style="height:100%">
                    <div :style="meunListStyle">
                        <ul class="ws-nav-menu-list" v-for="(item,index) in defaultMenuData" :style="layout(index)">
                            <li v-for="(data,ci) in item" :class="data.type == 2 ? 'link-menu' : 'link-title'">
                                <span class="router-link" v-if="data.type == 2" @click="routerLink(data)">{{data.resourcesName}}</span>
                                <span v-else>{{data.resourcesName}}</span>
                                <i v-if="data.type == 2 && !data.marking" @click="marking(data)" class="sign icon iconfont icon-xingxing"></i>
                                <i v-if="data.type == 2 && data.marking" @click="marking(data)" class="icon iconfont icon-xuanzhongxingxing"></i>
                            </li>
                        </ul>
                    </div>
                </el-scrollbar>
            </div>
        </div>
    </div>

</template>

<script>
    import baseMethods from '../../util/baseMethods'

    export default {
        name: 'ws-navigation-menu',
        props: {
            menuData: {
                type: Array,
                required: true
            },
            menuConfig: {   //Menu Attribute
                type: Object,
            },
            visible: {
                type: Boolean,
                default: false
            },
            routerData: {
                type: Array,
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
                defaultMenuData: [],
                methodList: {}, //权限菜单
                markingMenu: new Map(),    //星标菜单
                restaurants: '', //关键字
                columnHeight: [0, 0, 0],
                maxHeight: 0,
                columnStyle: [],
                routerLinkList: [],
                markingMenuList: []
            }
        },
        computed: {

            asideStyle() {
                return {
                    transform: `translateX(${this.visible ? 0 : -100}%)`
                }
            },
            meunListStyle() {
                return {
                    position: 'relative',
                    marginLeft: '35px',
                    height: this.maxHeight + 'px'
                }
            },
            heightList() {
                return this.defaultMenuData.map(item => 32 * item.length + 55);
            },
        },
        watch: {
            markingMenu: {
                handler(val) {
                    let list = [];
                    for (let [key, value] of this.markingMenu) {
                        list.push(value);
                    }
                    this.markingMenuList = list;
                },
                immediate: true,
            },
            menuData: {
                handler(val) {
                    if (!val.length){
                        return;
                    }
                    this.reset();
                    let markingMenu = baseMethods.objectToMap(baseMethods.getStore('markingMenu'));
                    this.markingMenu = new Map(markingMenu);
                    for (let data of val) {
                        this._simpleList = [];
                        this.dfsTraversalData(data.children);
                        this.defaultMenuData.push([data, ...this._simpleList]);
                    }
                    let routerLinkList = this.routerLinkList.map(item => item.resourcesUrl);
                    for (let key of markingMenu.keys()) {
                        !routerLinkList.includes(key) && markingMenu.delete(key);
                    }
                    this.markingMenu = new Map(markingMenu);
                    this.$emit('update:routerData', this.routerLinkList);
                    baseMethods.setStore(this.$baseMethod.getSystemKey(), this.methodList);
                    baseMethods.setStore('markingMenu', baseMethods.mapToObject(this.markingMenu));
                },
                immediate: true,
            },
        },
        created() {
            //此处添加keydown 事件在组件销毁时需解除事件绑定
            this.closeOnPressEscape && this.$baseMethod.addHandler(window, 'keydown', this.escHandler);
        },
        methods: {
            reset() {
                this.routerLinkList = [];
                this.defaultMenuData = [];
                this.columnStyle = [];
                this.columnHeight = [0, 0, 0];
                this.maxHeight = 0;
            },
            //深度搜索优先递归算法,用于初始化数据
            dfsTraversalData(menuData) {
                if(!menuData) return;
                for (let item of menuData) {
                    let path = this.getPath(item);
                    //type 0：无页面菜单，1：功能菜单（方法）2：有页面菜单
                    if (item.type == 1) {
                        continue;
                    }
                    if (item.type == 2) {
                        Array.isArray(item.children) && this.getMethodList(path, item.children);
                        this.routerLinkList.push({
                            resourcesUrl: path,
                            resourcesName: item.resourcesName
                        });
                    }
                    item.type && this._simpleList.push({
                        ...item,
                        resourcesUrl: path,
                        marking: this.markingMenu.has(path)
                    });
                    if (item.children) {
                        this.dfsTraversalData(item.children);
                    }
                }
            },
            //瀑布流布局算法
            layout(index) {
                if (this.columnStyle[index]) {
                    return this.columnStyle[index];
                }
                let minH = Math.min.apply(null, this.columnHeight);
                let minIndex = 0;
                for (let i = 0; i < this.columnHeight.length; i++) {
                    if (this.columnHeight[i] == minH) {
                        minIndex = i;
                        break;
                    }
                }
                this.columnHeight[minIndex] += this.heightList[index];
                this.maxHeight = Math.max.apply(null, this.columnHeight) + 70;
                let style = {
                    position: 'absolute',
                    top: minH + 'px',
                    left: minIndex * 240 + 'px'
                }
                this.columnStyle.push(style);
                return style
            },
            //标记菜单
            marking(data) {
                data.marking && this.markingMenu.delete(data.resourcesUrl) ||
                this.markingMenu.set(data.resourcesUrl, {
                    ...data,
                    marking: true
                });
                this.markingMenu = new Map(this.markingMenu);

                baseMethods.setStore('markingMenu', baseMethods.mapToObject(this.markingMenu));
                this.defaultMenuData = this.defaultMenuData.map(item => item.map(_data => {
                    if (data.resourcesUrl == _data.resourcesUrl) {
                        _data.marking = !_data.marking;
                    }
                    return _data;
                }));
            },
            getMethodList(path, data = []) {
                let methodList = {};
                for (let item of data) {
                    if (!item.children) {
                        continue;
                    }
                    for (let child of item.children) {
                        methodList[child.op] = {
                            resourcesName: child.resourcesName,
                            resourcesUrl: this.getPath(child)
                        };
                    }
                }
                this.methodList[path] = methodList;
            },
            routerLink(data) {
                this.close();
                this.$router.push({path: data.resourcesUrl});
            },
            getPath(data) {
                let path = data.resourcesUrl || '';
                if (path && !path.startsWith('/')) {
                    path = '/' + path;
                }
                return path;
            },
            querySearch(queryString, callback) {
                let results = [];
                for (let menu of this.defaultMenuData) {
                    results.push(...menu.filter(item => item.type == 2 && item.resourcesName.toLowerCase().includes(queryString.toLowerCase())));
                }
                // 调用 callback 返回建议列表的数据
                callback(results.map(item => {
                    return {
                        ...item,
                        value: item.resourcesName
                    }
                }));
            },
            close() {
                this.$emit('update:visible', false);
            },
            //按ESC关闭dialog事件
            escHandler(event) {
                let keyCode = event.keyCode || event.which || event.charCode;
                if (keyCode === 27 && this.closeOnPressEscape) {
                    this.close();
                }
            },
            dragEnd() {
                let map = new Map();
                for (let menu of this.markingMenuList) {
                    map.set(menu.resourcesUrl, this.markingMenu.get(menu.resourcesUrl));
                }
                this.markingMenu = map;
                baseMethods.setStore('markingMenu', baseMethods.mapToObject(this.markingMenu));
            },
        },
        destroyed() {
            //销毁事件绑定
            this.$baseMethod.removeHandler(window, 'keydown', this.escHandler);
        }
    }
</script>

<style lang="scss">
    .ws-nav-menu-warp {
        .ws-nav-menu-btn {
            position: fixed;
            top: 0;
            left: 0;
            width: 60px;
            height: 60px;
            background: red;
            cursor: pointer;
        }

        .ws-nav-menu-shade {
            display: flex;
            position: fixed;
            top: 56px;
            width: 100%;
            height: 100%;
            background: #000;
            opacity: .25;
            visibility: visible;
            transition: opacity 0.25s ease-in-out 0s;
            z-index: 999;
        }

        .shade-close {
            opacity: 0;
            visibility: hidden;
        }

        .ws-nav-menu-main {
            display: flex;
            position: fixed;
            top: 56px;
            bottom: 0px;
            left: 0;
            z-index: 1000;
            transition: all 0.25s ease-in-out 0s;
            width: 1050px;

            .ws-nav-menu-list-left {
                float: left;
                position: relative;
                box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 4px 0px;
                background-color: rgb(255, 255, 255);
                width: 240px;
                height: 100%;
                user-select: none;
                padding-bottom: 20px;

                .ws-nav-menu-aside {
                    line-height: 48px;
                    padding: 0 15px;
                    cursor: pointer;
                    border-bottom: 1px solid #ddd;
                    background: rgba(247, 247, 247, 1);

                    .iconfont {
                        position: relative;
                        top: 2px;
                        font-size: 20px;
                    }

                    .el-icon-arrow-right {
                        position: absolute;
                        right: 15px;
                        top: 17px;
                    }

                    span {
                        margin-left: 10px;
                    }
                }

                .ws-nav-menu-marking-list {
                    margin-top: 8px;
                    padding-bottom: 40px;

                    li {
                        position: relative;
                        padding: 0 20px;
                        width: 240px;
                        height: 40px;
                        line-height: 40px;

                        span {
                            cursor: pointer;
                        }

                        .icon-close {
                            display: none;
                            position: absolute;
                            right: 20px;
                            top: 14px;
                            cursor: pointer;

                            &:hover {
                                color: red;
                            }
                        }

                        &:hover {
                            background: #ddd;
                        }

                        &:hover .icon-close {
                            display: inline-block;
                        }
                    }
                }

            }

            .ws-nav-menu-list-right {
                float: left;
                position: relative;
                background-color: #f7f7f7;
                width: 810px;
                box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 4px 0px;

                .ws-nav-menu-autocomplete {
                    margin: 24px 35px;
                    border-bottom: 1px solid #ddd;

                    .el-input__inner {
                        border: none !important;
                        background-color: #f7f7f7 !important;
                    }

                    .el-input__inner:focus {

                    }
                }

                .ws-nav-menu-list {
                    li {
                        position: relative;
                        padding: 0 20px 0 10px;
                        width: 240px;
                        height: 32px;
                        line-height: 32px;
                    }

                    .icon {
                        position: absolute;
                        right: 15px;
                        font-size: 12px;
                        cursor: pointer;
                    }

                    .icon-xingxing {
                        color: #929292;
                    }

                    .icon-xuanzhongxingxing {
                        color: #f7b500;
                    }

                    .sign {
                        display: none;
                    }

                    .link-menu {
                        &:hover {
                            background: #ddd;
                        }

                        &:hover .sign {
                            display: inline-block;
                        }

                        .router-link {
                            cursor: pointer;
                        }
                    }

                    .link-title {
                        font-weight: 600;
                    }

                }
            }
        }


    }

</style>
