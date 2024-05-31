<template>
    <div class="ws-menu-warp" :style="menuWarpStyle">
        <slot name="logo"></slot>
        <slot></slot>
        <ul class="menu" :style="menuLiStyle">
            <template v-for="(item,index) in defaultMenuData">
                <submenu :key="uuidKey()" :menuData="item" :level="0" :menuConfig="defaultMenuConfig"></submenu>
            </template>
        </ul>
    </div>
</template>

<script>
    import Submenu from './Submenu.vue'

    export default {
        name: 'ws-menu',
        props: {
            menuData: {
                type: Array,
                required: true
            },
            menuConfig: {   //Menu Attribute
                type: Object,
            }
        },
        data() {
            return {
                defaultMenuData: [],    //菜单列表
                defaultActiveData: null,         //当前默认选中的菜单
                defaultActivePath: '',           //当前默认选中的菜单path
                routerActiveData: null,         //当前路由匹配的菜单，优先级高于defaultActiveData
                fullPath: [],           //当前默认选中菜单的路径
                defaultMenuConfig: {
                    menuWidth: '256px',            //菜单宽度
                    lineHeight: '48px',            //菜单子项高度,行高
                    fontSize: '14px',              //菜单字体大小
                    inconFontSize: '14px',         //菜单字体图标大小
                    backgroundColor: '#393f52',    //菜单背景颜色
                    textColor: '#fff',             //菜单字体颜色
                    activeTextColor: '#fff',       //激活选中菜单字体颜色
                    activeBackgroundColor: '#2b2f42',   //激活选中菜单背景颜色
                    hoverBackgroundColor: '#2b2f42',    //hover菜单背景颜色
                    hoverTextColor: '#fff',             //hover菜单字体颜色
                    disableTextColor: '#fff',           //禁用收缩和展开菜单字体颜色,固定降低透明度0.5喽
                    uniqueOpened: true,            //是否只保持一个子菜单的展开
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
            }
        },
        watch: {
            menuConfig: {
                handler(val) {
                    this.defaultMenuConfig = {...this.defaultMenuConfig, ...val};
                    let indentLevelA = parseInt(this.defaultMenuConfig.indentLevelA) || 20;
                    let indentLevelB = indentLevelA + parseInt(this.defaultMenuConfig.inconFontSize) + 15;
                    let indentLevelC = indentLevelB + indentLevelA;
                    this.defaultMenuConfig = {
                        ...this.defaultMenuConfig, ...{
                            indentLevelA: indentLevelA + 'px',
                            indentLevelB: indentLevelB + 'px',
                            indentLevelC: indentLevelC + 'px'
                        }
                    };
                },
                immediate: true,
                deep: true
            },
            menuData:{
                handler(val){
                    this.defaultMenuData = JSON.parse(JSON.stringify(val));
                    this.init();
                },
                immediate: true,
                deep: true
            },
            $route(to, from) {
                //监听路由，判断当前路由是否命中当前选中菜单，否则重新init。
                // 防止手动调用$router.push() 改变路由命中不上当前选中菜单
                let path = this.getPath(this.defaultActiveData);
                let matched = this.$route.matched.filter(cp => cp.path == path);
                let idnex = this.$route.path.indexOf(path);
                if (!matched.length || idnex == -1) {
                    this.init();
                }
            }
        },
        created() {
            this.$eventBus.$off('traversalData');
            this.$eventBus.$on('traversalData', (data) => this.bfsTraversalData(data));
        },
        methods: {
            init() {
                this.routerActiveData = null;
                this.defaultActiveData = null;
                this.dfsTraversalData(this.defaultMenuData);
                this.getFullPath();
                this.bfsTraversalData({model: 'init'});
            },
            //深度搜索优先递归算法,用于初始化数据
            dfsTraversalData(menuData = this.defaultMenuData) {
                for (let item of menuData) {
                    //当前菜单路径是否命中路由
                    if (!this.routerActiveData) {
                        this.isActive(item);
                    }
                    if (item.children) {
                        this.dfsTraversalData(item.children);
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
                        //功能菜单，非页面菜单，无需遍历
                        let path = this.getPath(item);
                        let active = false;

                        switch (data.model) {
                            case 'init':
                                //如果没有指定默认选中菜单则默认选中第一个有路由的菜单
                                if (!this.defaultActiveData && item.children) {
                                    this.defaultActiveData = item;
                                }
                                if (path && this.defaultActiveData && this.defaultActiveData.id === item.id) {
                                    active = true;
                                    if (!this.routerActiveData) {
                                        this.defaultActivePath = path;
                                        this.$router.push({path});
                                    }
                                }
                                let _list = this.fullPath.filter(ci => ci.id == item.id);
                                this.$set(item, 'active', active);
                                this.$set(item, 'open', _list.length ? true : false);
                                break;
                            case 'active':
                                if (this.isActive(item, data)) {
                                    active = true;
                                    path && this.$router.push({path});
                                    if (!path) {
                                        this.defaultActivePath = path;
                                        this.$router.push({path});
                                    }
                                }
                                this.$set(item, 'active', active);
                                break;
                            case 'toggle':
                                if (this.isToggle(data) && item.id === data.id) {
                                    //一次只能打开一个同级菜单，匹配成功，关闭其他菜单并退出遍历
                                    if (this.defaultMenuConfig.uniqueOpened) {
                                        menuData = menuData.map(menu => {
                                            let open = data.id === menu.id ? data.open : false;
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
            isActive(item, data) {
                let path = this.getPath(item);
                // let activeId = this.defaultMenuConfig.defaultActiveId;
                let modeuleName = this.defaultMenuConfig.defaultActiveModuleName;
                let matched = [];

                //active
                if (data && !data.children && item.id === data.id) {//有children是无页面菜单，没有children是有页面菜单。
                    this.routerActiveData = item;
                    this.defaultActiveData = item;
                    return true;
                }
                //init
                if (!data && !item.children) {
                    //判断当前路由是否有匹配菜单，如果有则激活路由匹配菜单，
                    //子路由或当前路由地址成功匹配菜单路径
                    matched = this.$route.matched.filter(cp => cp.path == path);
                    let idnex = this.$route.path.indexOf(path);
                    if (matched.length || idnex != -1) {
                        this.routerActiveData = item;
                        this.defaultActiveData = item;
                        return true;
                    }
                    if (path == modeuleName) {
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
                try {
                    function getNodePath(node) {
                        _this.fullPath.push(node);
                        //找到符合条件的节点，通过throw终止掉递归
                        if (node.id === _this.defaultActiveData.id) {
                            throw ('');
                        }
                        if (node.children && node.children.length) {
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
            },
            uuidKey() {
                return (Math.random() * 10000000).toString(16).substr(0, 4) + '-' + (new Date()).getTime() + '-' + Math.random().toString().substr(2, 5);
            },
        }
    }
</script>

<style lang="scss">
    .ws-menu-warp {
        height: 100%;
        position: fixed;
        left: 0;
        overflow-y: auto;
        z-index: 200;

        .menu-label {
            padding-left: 20px;
            position: relative;
        }

        .iconfont {
            position: absolute;
        }

        .toggle-icon {
            position: absolute;
            right: 20px;
            transition: transform .3s;
        }

        .open {
            transform: rotate(180deg);
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
            }
        }
    }
</style>
