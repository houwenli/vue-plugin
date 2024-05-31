<script>
/**
 * @description: 格式化菜单 组装格式如 pageUrl: { op: { resourcesName, resourcesUrl } }
 * @param {Array} arr
 * @return {*}
 */
let urlPrefix = url => (url.startsWith('/') ? url : '/' + url);
function formMenuList(arr) {
    let collectPages = (menus, pages = []) => {
        for (let i = 0; i < menus.length; i++) {
            let temp = menus[i];
            if (temp.type == 2) {
                let childOps = temp.children && temp.children.reduce((pre, cur) => {
                    pre = pre.concat(cur.category == 2 && cur.children ? cur.children : []);
                    return pre;
                }, []);
                pages.push({ ...temp, children: childOps });
            }
            if (temp.children) {
                collectPages(
                    temp.children,
                    pages
                );
            }
        }
        return pages;
    };
    let help = menus => {
        let map = {};
        for (let i = 0; i < menus.length; i++) {
            let temp = menus[i];
            if (temp.type == 2) {
                map[urlPrefix(temp.resourcesUrl)] = {};
                temp.children && temp.children.map(v => {
                    map[urlPrefix(temp.resourcesUrl)][v.op] = { resourcesName: v.resourcesName, resourcesUrl: urlPrefix(v.resourcesUrl) };
                });
            }
        }
        return map;
    };
    return help(collectPages(arr));
}
// 页面url补全 /
function formatMenuUrl(menuList) {
    let urlMap = {};
    if (menuList && !menuList.length) return { menuList: [], urlMap };
    let list = JSON.parse(JSON.stringify(menuList));
    let help = menus => {
        for (let i = 0; i < menus.length; i++) {
            if (menus[i].type == 2) {
                menus[i].resourcesUrl = urlPrefix(menus[i].resourcesUrl);
                urlMap[menus[i].resourcesUrl] = menus[i].resourcesName;
            }
            if (menus[i].children && menus[i].children.length) {
                help(menus[i].children);
            }
        }
        return menus;
    };
    return {
        menuList: help(list),
        urlMap
    };
}
export default {
    name: 'ws-system-menu',
    props: {
        menuData: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            defaultPath: '',
            isFlod: true,
            menuMap: {},
            isAloned: false
        };
    },
    watch: {
        $route() {
            this.setDefaultPath();
        },
        menuData: {
            immediate: true,
            handler(list) {
                if (!list.length) return;
                this.menuMap = formMenuList(list.slice());
                this.$baseMethod.setStore(this.$baseMethod.getSystemKey(), this.menuMap);
                let { urlMap } = formatMenuUrl(list);
                this.urlMap = urlMap;
                this.setDefaultPath();
            }
        }
    },
    methods: {
        handleOpen() {},
        handleClose() {},
        toggleIcon() {
            this.isFlod = !this.isFlod;
        },
        setDefaultPath() {
            let path = this.$route.path;
            let pageUrls = Object.keys(this.menuMap);
            let currentPath = pageUrls.find(url => path.includes(url));
            this.defaultPath = currentPath || pageUrls[0];
        }
    },
    render() {
        if (!this.menuData.length) return;
        let { menuList } = formatMenuUrl(this.menuData.slice());
        let { activeTextColor = '#F05259', textColor = '#606266', activeItemBg = '#feeeee' } = this.$attrs;
        let colorCssVar = { '--activeTextColor': activeTextColor, '--textColor': textColor, '--activeItemBg': activeItemBg };

        let renderMenu = list => {
            return list.map(menu => {
                if (menu.type == 0) {
                    return (
                        <el-submenu index={menu.id.toString()}>
                            <template slot="title">{menu.resourcesName}</template>
                            {menu.children && menu.children.length ? renderMenu(menu.children) : ''}
                        </el-submenu>
                    );
                } else if (menu.type == 2) {
                    return (
                        <el-menu-item index={menu.resourcesUrl} title={menu.resourcesName}>
                            {menu.resourcesName}
                        </el-menu-item>
                    );
                }
            });
        };
        return (
            <div class={['ws-menu-warp', this.isFlod ? '' : 'open']} style={colorCssVar}>
                <el-scrollbar class="h100">
                    <el-menu ref="menu" default-active={this.defaultPath} router={true} {...{ attrs: this.$attrs, on: this.$listeners }}>
                        {renderMenu(menuList)}
                    </el-menu>
                </el-scrollbar>
                <i vShow={!this.isAloned} class={['el-icon-arrow-right', 'toggle-btn', this.isFlod ? '' : 'el-icon-arrow-left']} onClick={this.toggleIcon}></i>
            </div>
        );
    },
    created() {
        this.isAloned = !window.__POWERED_BY_QIANKUN__;
        this.isFlod = !this.isAloned;
    }
};
</script>

<style lang="scss" scoped>
.h100 {
    height: 100%;
}
.ws-menu-warp ::v-deep {
    width: 144px;
    height: 100%;
    left: 0;
    z-index: 200;
    box-shadow: 2px 0px 8px 4px;
    transition: width 0.5s;
    background-color: #fff;
    padding: 8px 4px;
    box-sizing: border-box;
    position: relative;

    .el-menu {
        border-right: 0;
        & > .el-menu-item {
            font-weight: 800;
            &.is-active {
                background-color: var(--activeItemBg) !important;
                color: var(--activeTextColor);
            }
        }
    }
    .el-menu-item {
        min-width: auto;
        margin: 0;
        color: var(--textColor);
        border-radius: 0 !important;
        padding-right: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .el-submenu {
        &.is-opened > .el-submenu__title .el-submenu__icon-arrow {
            transform: rotateZ(90deg);
        }
        .el-icon-arrow-down::before {
            content: '\e791';
        }
        .el-submenu__title {
            margin: 0;
            padding-right: 24px;
            position: relative;
            font-weight: 800;
            color: var(--textColor);
            border-radius: 0 !important;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            &:hover {
                color: var(--activeTextColor);
            }
            .el-icon-arrow-down {
                position: absolute;
                right: 8px;
            }
        }
        .el-menu-item {
            font-weight: 400;
            &.is-active,
            &:hover {
                background-color: var(--activeItemBg) !important;
                color: var(--activeTextColor);
            }
        }
    }
    .toggle-btn {
        position: absolute;
        right: 0px;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 40px;
        background-color: #f5f7fa;
        border-radius: 5px;
        z-index: 2000;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
.ws-menu-warp.open {
    width: 200px;
}
</style>
