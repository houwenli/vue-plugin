<template>
    <div class="ws-menu-warp" :class="{'open': !isFold}" :style="!showToggle?menuWarpStyle:''">
        <el-scrollbar style="height:100%;width:100%">
            <slot name="logo"></slot>
            <slot></slot>
            <ul class="menu" :style="menuLiStyle">
                <template v-for="(item,index) in defaultMenuData">
                    <submenu :key="index" :menuData="item" :level="0" :menuConfig="defaultMenuConfig"></submenu>
                </template>
            </ul>
        </el-scrollbar>
        <i v-if="showToggle" class="el-icon-arrow-right toggle-btn" :class="isFold ? 'el-icon-arrow-right' : 'el-icon-arrow-left'" @click="isFold=!isFold"></i>
    </div>
</template>

<script>
    import Submenu from './Submenu.vue'

    export default {
        name: 'ws-system-menu',
        props: {
            menuData: {
                type: Array,
                required: true
            },
            routerData: {
                type: Array,
            },
            menuConfig: {   //Menu Attribute
                type: Object,
            },
            isRefresh: {   // 点菜单是否刷新缓存
                type: Boolean,
                default: false
            },
        },
        data() {
            return {
                routerLinkList: [],
                simpleList: [],         //转换简单数据列表
                methodList: {},         //接口op菜单集合
                defaultMenuData: [],    //权限菜单列表
                defaultActiveData: null,         //当前默认模块匹配的菜单
                routerActiveData: null,         //当前路由匹配的菜单，优先级高于defaultActiveData
                fullPath: [],           //当前默认选中菜单的路径
                defaultMenuConfig: {
                    menuWidth: this.showToggle?'144px':'256px',            //菜单宽度
                    lineHeight: '40px',            //菜单子项高度,行高
                    fontSize: '14px',              //菜单字体大小
                    inconFontSize: '14px',         //菜单字体图标大小
                    backgroundColor: '#fff',    //菜单背景颜色
                    textColor: '#606266',             //菜单字体颜色
                    activeTextColor: '#F05259',       //激活选中菜单字体颜色
                    activeBackgroundColor: '#F0F2F5',   //激活选中菜单背景颜色
                    hoverBackgroundColor: '#F0F2F5',    //hover菜单背景颜色
                    hoverTextColor: '#F05259',             //hover菜单字体颜色
                    disableTextColor: '#606266',           //禁用收缩和展开菜单字体颜色,固定降低透明度0.5喽
                    uniqueOpened: false,            //是否只保持一个子菜单的展开
                    routerModel: true,             //是否开启路由模式，路由模式下router作为路由连接，并默认选中打开当前路由对应菜单
                    defaultActiveId: '',           //默认激活选中的菜单的id，id优先级高于moduleName
                    defaultActiveModuleName: '',   //默认激活选中的菜单的模块名moduleName
                    indentLevelA: '',              //一级菜单缩进值
                    indentLevelB: '',              //二级菜单缩进值
                    indentLevelC: '',              //三级菜单缩进值
                    toggleLevelA: false,           //一级菜单是否可收缩，默认false
                    toggleLevelB: true,            //二级菜单是否可收缩，默认true
                    toggleLevelC: true,            //三级菜单是否可收缩，默认true
                },
                isFold: true
            }
        },
        components: {
            Submenu
        },
        computed: {
            menuWarpStyle() {
                return {
                    'width': this.defaultMenuConfig.menuWidth,
                    'background-color': this.defaultMenuConfig.backgroundColor,
                    'color': this.defaultMenuConfig.textColor
                }
            },
            menuLiStyle() {
                return {
                    'line-height': this.defaultMenuConfig.lineHeight,
                }
            },
            showToggle(){
                return window.__POWERED_BY_QIANKUN__
            }
        },
        watch: {
            menuData: {
                handler(val) {
                    this.methodList = {};
                    this.routerLinkList = [];
                    this.defaultMenuData = JSON.parse(JSON.stringify(val));
                    this.$nextTick(this.init);
                },
                immediate: true,
                deep: true
            },
            menuConfig: {
                handler(val) {
                    this.defaultMenuConfig = {...this.defaultMenuConfig, ...val};
                    let indentLevelA = parseInt(this.defaultMenuConfig.indentLevelA) || 12;
                    let indentLevelB = indentLevelA + 12;
                    let indentLevelC = indentLevelB + indentLevelA;
                    this.defaultMenuConfig = {
                        ...this.defaultMenuConfig, ...{
                            indentLevelA: indentLevelA + 'px',
                            indentLevelB: indentLevelB + 'px',
                            indentLevelC: indentLevelC + 'px'
                        }
                    };
                },
                immediate: true
            },
            $route(to, from) {
                //监听路由，判断当前路由是否命中当前选中菜单，否则重新init。
                // 防止手动调用$router.push() 改变路由命中不上当前选中菜单
                let path = this.getPath(this.defaultActiveData);
                let matched = this.$route.matched.filter(cp => cp.path == path);
                let index = this.$route.path.indexOf(path);
                if (!matched.length || index == -1) {
                    this.init(true);
                }
            },
            showToggle:{
                handler(val){
                    this.defaultMenuConfig.lineHeight=val?'40px':'58px'
                },
                immediate:true
            }
        },
        created() {
            this.$eventBus.$off('traversalData');
            this.$eventBus.$on('traversalData', (data) => this.bfsTraversalData(data));
        },
        methods: {
            init(isRouter = false) {
                this.routerActiveData = null;
                this.defaultActiveData = null;
                this.dfsTraversalData(this.defaultMenuData, isRouter);
                if (!isRouter) {
                    sessionStorage.setItem(this.$baseMethod.getSystemKey(), JSON.stringify(this.methodList));
                    //事件发布，由订阅者接受，，用于防止权限接口返回慢导致页面组件调用$getModuleUrl得到未更新权限问题
                    // this.$eventBus.$emit('dispatchMethodList');
                }
                this.getFullPath();
                this.bfsTraversalData({model: 'init'});
                this.$emit('update:routerData', this.routerLinkList);
            },
            //深度搜索优先递归算法,用于初始化数据
            dfsTraversalData(menuData = this.defaultMenuData, isRouter = false) {
                for (let item of menuData) {
                    let path = this.getPath(item);
                    //type 0：无页面菜单，1：功能菜单（方法）2：有页面菜单
                    if (item.type == 1) {
                        continue;
                    }
                    if (item.type == 2) {
                        this.routerLinkList.push({
                            resourcesUrl: path,
                            resourcesName: item.resourcesName
                        });
                    }
                    //当前菜单路径是否命中路由
                    if (!this.routerActiveData) {
                        this.isActive(item);
                    }
                    if (!isRouter && item.type == 2 && item.children) {
                        this.getMethodList(this.getPath(item), item.children);
                    }
                    !isRouter && this.simpleList.push(item);
                    if (item.children) {
                        this.dfsTraversalData(item.children, isRouter);
                    }
                }
            },
            //广度搜索优先非递归算法
            bfsTraversalData(data) {
                let menuData = [];
                //需搜索的队列
                let childList = this.defaultMenuData;

                do {
                    //把上一轮子集需循环的队列添加当前循环，清空下轮需循环的队列
                    menuData = childList;
                    childList = [];
                    for (let item of menuData) {
                        //type 0：无页面菜单，1：功能菜单（方法）2：有页面菜单
                        //功能菜单，非页面菜单，无需遍历
                        if (item.type == 1) {
                            continue;
                        }
                        let path = this.getPath(item);
                        let active = false;

                        switch (data.model) {
                            case 'init':
                                //如果没有指定默认选中菜单则默认选中第一个有路由的菜单
                                if (!this.defaultActiveData && item.type == 2) {
                                    this.defaultActiveData = item;
                                    this.getFullPath();
                                }
                                if (path && this.defaultActiveData && this.defaultActiveData.id === item.id) {
                                    active = true;
                                    // 导致路由多次跳转先注释
                                    if (!this.routerActiveData) {
                                        this.$router.push({path});
                                    }
                                }
                                active && this.$emit('active', {data: item, path: this.fullPath});
                                let _list = this.fullPath.filter(ci => ci.id == item.id);
                                this.$set(item, 'active', active);
                                this.$set(item, 'open', _list.length ? true : (item.open ? true : false));
                                break;
                            case 'active':
                                if (this.isActive(item, data)) {
                                    active = true;
                                    this.getFullPath();
                                    path && (this.isRefresh ? this.$router.back({path}) : this.$router.push({path})) && this.$emit('active', {
                                        data: data.data,
                                        path: this.fullPath
                                    });
                                }
                                this.$set(item, 'active', active);
                                break;
                            case 'toggle':
                                if (this.isToggle(data) && item.id === data.data.id) {
                                    //一次只能打开一个同级菜单，匹配成功，关闭其他菜单并退出遍历
                                    if (this.defaultMenuConfig.uniqueOpened) {
                                        menuData = menuData.map(menu => {
                                            let open = data.data.id === menu.id ? data.open : false;
                                            this.$set(menu, 'open', open);
                                            return menu;
                                        })
                                        return false;
                                    } else {
                                        this.$set(item, 'open', data.open);
                                    }
                                }
                                break;
                        }
                        //如有子集则添加到队列，等待下轮遍历
                        if (item.children && item.children.length) {
                            childList.push(...item.children);
                        }
                    }
                } while (childList.length)
            },

            getMethodList(path, data) {
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
            isActive(item, data) {
                let path = this.getPath(item);
                let activeId = this.defaultMenuConfig.defaultActiveId;
                let modeuleName = this.defaultMenuConfig.defaultActiveModuleName;
                let matched = [];
                //active
                if (data && data.data.type == 2 && item.id === data.data.id) {
                    this.routerActiveData = item;
                    this.defaultActiveData = item;
                    return true;
                }
                //init
                if (!data && item.type == 2) {
                    //判断当前路由是否有匹配菜单，如果有则激活路由匹配菜单，
                    //子路由或当前路由地址成功匹配菜单路径
                    matched = this.$route.matched.filter(cp => cp.path == path);
                    let idnex = this.$route.path.indexOf(path);
                    if (matched.length || idnex != -1) {
                        this.routerActiveData = item;
                        this.defaultActiveData = item;
                        return true;
                    }
                    if (item.id == activeId || path == modeuleName) {
                        this.defaultActiveData = item;
                        return true;
                    }
                }
                return false;
            },
            isToggle(data) {
                let toggle = {
                    '0': 'toggleLevelA',
                    '1': 'toggleLevelB',
                    '2': 'toggleLevelC',
                }[data.level];
                return this.defaultMenuConfig[toggle];
            },
            //获取当前菜单全路径
            getFullPath() {
                let _this = this;
                _this.fullPath = [];
                let activeRouter = _this.routerActiveData || _this.defaultActiveData;
                try {
                    function getNodePath(node) {
                        _this.fullPath.push(node);
                        //找到符合条件的节点，通过throw终止掉递归
                        if (node.id === activeRouter.id) {
                            throw ('');
                        }
                        if (node.type != 1 && node.children && node.children.length) {
                            for (let child of node.children) {
                                getNodePath(child);
                            }
                            //当前节点的子节点遍历完依旧没找到，则删除路径中的该节点
                            _this.fullPath.pop();
                        } else {
                            //找到叶子节点时，删除路径当中的该叶子节点
                            _this.fullPath.pop();
                        }
                    }

                    for (let data of this.defaultMenuData) {
                        getNodePath(data);
                    }
                } catch (e) {
                    return _this.fullPath;
                }
            },
            getPath(item) {
                let path = item.resourcesUrl || '';
                if (path && !path.startsWith('/')) {
                    path = '/' + path;
                }
                return path;
            }
        }

    }
</script>

<style lang="scss">
    .ws-menu-warp {
        width: 144px;
        height: 100%;
        // flex-shrink: 0;
        position: fixed;
        left: 0;
        overflow: hidden;
        z-index: 200;
        box-shadow: 2px 0px 8px 4px rgba(0, 0, 0, 0.04);
        transition: width .5s;
        background-color: #fff;
        padding: 8px 4px;
        box-sizing: border-box;
        // position: relative;
        .el-scrollbar__wrap{
            overflow: auto !important;
        }
        &.open {
            width: 200px;
        }
        .toggle-btn {
            position: absolute;
            right: 0px;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 40px;
            background-color: #f5f7fA;
            border-radius: 5px;
            z-index: 2000;
            cursor: pointer;
            &::before {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        }
        .menu-label {
            // padding-left: 20px;
            position: relative;
            padding-right: 24px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
            /*transition: border-color .2s, background .2s, color .2s;*/
        }

        .iconfont {
            position: absolute;
        }

        .toggle-icon {
            position: absolute;
            right: 8px;
            transition: transform .3s;
            color: #C0C4CC;
        }

        .open {
            transform: rotate(90deg);
        }

        .menu {
            width: 100%;
            overflow: hidden;
            user-select: none;
            
            .sub-menu {
                overflow: hidden;
            }

            li {
                cursor: pointer;
                position: relative;
                &.menuActiveBg {
                    background-color: #F5F7FA;
                }
            }
        }
    }
</style>
