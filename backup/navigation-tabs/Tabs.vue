<template>
    <div class="nav-tab-list-wrap">
        <div class="nav-tab-list" ref="navWarp" :style="colspanStyle">
            <ul :key="navWarpKey">
                <li
                    v-for="(item, index) in navTabList"
                    ref="navTabList"
                    :key="item.resourcesUrl"
                    @click="tabClick(index)"
                    :class="{ 'router-activation': activeIndex == index, dragTransfer: dragTransfer === index }"
                >
                    <div class="nav-tab-list-bg">
                        <div class="nav-tab-list-border">
                            <span class="menu-title">{{ item.resourcesName }}</span>
                            <span class="menu-close el-icon-close" @click.stop="removeTab(index)"></span>
                        </div>
                    </div>
                </li>
            </ul>
        </div>

        <div class="nav-tab-icon" v-if="maxColspan > 1">
            <button type="button" :disabled="colspan == 0" class="icon-arrow" @click="previous">
                <i class="el-icon-arrow-up"></i>
            </button>
            <div class="column-number">
                {{ this.colspan + 1 }}
            </div>
            <button type="button" :disabled="colspan + 1 == maxColspan" class="icon-arrow" @click="next()">
                <i class="el-icon-arrow-down"></i>
            </button>
        </div>
    </div>
</template>

<script>
import ResizeObserver from 'resize-observer-polyfill';
import baseMethods from '../../util/baseMethods';
function formatPageMenu(menus, map = {}) {
    for (let i = 0; i < menus.length; i++) {
        if (menus[i].type == 2 && menus[i].category == 1) {
            map[menus[i].resourcesUrl] = menus[i].resourcesName;
        }
        if (menus[i].children) {
            formatPageMenu(menus[i].children, map);
        }
    }
    return map;
}

export default {
    name: 'ws-navigation-tabs',
    props: {
        menuData: {
            type: Array,
            required: true
        },
        include: {
            type: Array
        },
        click: Function, //点击事件
        close: Function, //关闭页签,返回false可阻止页签关闭
        open: Function //新开页签
    },
    data() {
        return {
            colspan: 0,
            maxColspan: 1,
            navTabList: [], //导航页签栏
            navTabIndex: null, //当前定位的导航页签
            navWarpKey: new Date().getTime(),
            dragTransfer: null,
            menuUrlMap: {}
        };
    },
    computed: {
        colspanStyle() {
            return {
                transform: `translateY(-${this.colspan * 55}px)`
            };
        },
        menuList() {
            return this.$store.state.login.menuList;
        },
        pagePaths() {
            return Object.keys(this.menuUrlMap);
        },
        activeIndex() {
            return this.navTabList.findIndex(v => this.$route.path.includes(v.resourcesUrl));
        }
    },
    watch: {
        menuList: {
            immediate: true,
            handler(val) {
                if (!val.length) return;
                this.menuUrlMap = formatPageMenu(val);
                this.routerToggle()
            }
        },
        maxColspan(val, oldValue) {
            if (this.colspan + 1 > this.maxColspan) {
                this.colspan--;
            }
        },
        navTabList: {
            handler(val) {
                baseMethods.setStore(baseMethods.getPrefix() + '-navTabList', val);
            },
            deep: true
        },
        // menuData: {
        //     handler(val) {
        //         if (val.length) {
        //             let navTabList = baseMethods.getStore(baseMethods.getPrefix() + '-navTabList') || [];
        //             let methodList = baseMethods.getStore(baseMethods.getPrefix() + '-methodList') || {};
        //             for (let [key, value] of navTabList.entries()) {
        //                 !Object.keys(methodList).includes(value.resourcesUrl) && navTabList.splice(key, 1);
        //             }
        //             this.navTabList = navTabList;
        //             this.enterRouter();
        //         }
        //     },
        //     immediate: true
        // },
        $route() {
            this.routerToggle();
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        // 根据授权页面路由来匹配当前路由path，如果包含添加tag，切换详情时更新fullPath
        routerToggle() {
            let {
                $route: { path, fullPath },
                menuUrlMap,
                pagePaths
            } = this;
            let matchPageUrl = pagePaths.find(url => path.includes(url));
            if (matchPageUrl) {
                let i = this.navTabList.map(v => v.resourcesUrl).findIndex(v => v == matchPageUrl);
                if (i == -1) {
                    this.navTabList.push({ resourcesUrl: matchPageUrl, resourcesName: menuUrlMap[matchPageUrl], fullPath });
                } else {
                    this.navTabList[i].fullPath = fullPath;
                }
            }
        },
        init() {
            // 监听nav高度变化
            const navHeight = new ResizeObserver((entries, observer) => {
                for (const entry of entries) {
                    this.maxColspan = parseInt(entry.target.offsetHeight / 55) || 1;
                }
            });
            navHeight.observe(this.$refs.navWarp);
        },
        cursorDown(e, index) {
            if (e.ctrlKey || e.button === 2) {
                return;
            }
            if (baseMethods.hasClass(e.target, 'menu-close')) {
                return this.closeTab(index);
            }
            this.$targetParent = this.$refs.navWarp;
            this._dragList = this.getDragList();
            let _index = this.getCurrentTargetIndex(index);
            const currentTarget = this.$refs.navTabList[index];
            this.dragTransfer = index;
            let maxTranslateXEl = this._dragList[this._dragList.length - 1].el;
            this._dragTransfer = {
                el: currentTarget,
                event: e,
                minTranslateX: -(currentTarget.getBoundingClientRect().left - this.$targetParent.getBoundingClientRect().left),
                maxTranslateX: -(currentTarget.getBoundingClientRect().right - maxTranslateXEl.getBoundingClientRect().right),
                positionX: e.clientX,
                index: _index,
                dragIndex: _index,
                targetIndex: index
            };
            this.calculateTranslateX();
            this.startDrag(e);
        },
        startDrag(e) {
            // e.stopImmediatePropagation();
            this._cursorDown = true;
            // baseMethods.addHandler(document, 'mousemove', this.mouseMoveDocumentHandler);
            baseMethods.addHandler(document, 'mouseup', this.mouseUpDocumentHandler);
            document.onselectstart = () => false; //禁止页面选择和复制
        },
        mouseMoveDocumentHandler(e) {
            if (this._cursorDown === false) return;
            let translateX = e.clientX - this._dragTransfer.positionX;
            if (translateX <= this._dragTransfer.minTranslateX || translateX >= this._dragTransfer.maxTranslateX) {
                return;
            }
            for (let [key, value] of this._translateXMap.entries()) {
                if (translateX >= key[0] && translateX <= key[1]) {
                    this._dragList[value[0]].el.style.transform = `translateX(${value[1]}px)`;
                    this._dragTransfer.dragIndex = value[1] ? value[0] : translateX > 0 ? value[0] - 1 : value[0] + 1;
                    break;
                }
            }
            this._dragTransfer.el.style.transform = `translateX(${translateX}px)`;
        },
        mouseUpDocumentHandler(e) {
            this._cursorDown = false;
            this.dragTransfer = null;
            document.onselectstart = null;
            baseMethods.removeHandler(document, 'mousemove', this.mouseMoveDocumentHandler);
            baseMethods.removeHandler(document, 'mouseup', this.mouseUpDocumentHandler);
            if (this._dragTransfer.event.clientX === e.clientX && this._dragTransfer.event.clientY === e.clientY) {
                if (baseMethods.hasClass(this._dragTransfer.event.target, 'menu-title')) {
                    return this.clickTab(this._dragTransfer.targetIndex);
                }
            }
            const transfer = this._dragList[this._dragTransfer.dragIndex];
            const index = this._dragTransfer.targetIndex;
            for (let [tindex, data] of this.navTabList.entries()) {
                if (transfer.data.resourcesUrl === data.resourcesUrl) {
                    this.navTabList = baseMethods.moveArray(this.navTabList, index, tindex);
                    this.navWarpKey = new Date().getTime();
                    return this.getNavTabIndex();
                }
            }
        },
        getDragList() {
            let [offsetWidth, index, list] = [0, 0, [[]]];
            for (let [i, vnode] of Array.from(this.$refs.navTabList).entries()) {
                let realWidth = vnode.getBoundingClientRect().width;
                let { marginRight } = getComputedStyle(vnode, null);
                offsetWidth += realWidth + parseInt(marginRight);
                if (offsetWidth > this.$targetParent.getBoundingClientRect().width) {
                    list[++index] = [];
                    offsetWidth = realWidth;
                }
                list[index].push({
                    el: vnode,
                    data: this.navTabList[i],
                    width: realWidth
                });
            }
            return list[this.colspan];
        },
        getCurrentTargetIndex(index) {
            for (let [key, value] of this._dragList.entries()) {
                if (value.data.resourcesUrl == this.navTabList[index].resourcesUrl) {
                    return key;
                }
            }
        },
        //计算偏移量
        calculateTranslateX() {
            this._translateXMap = new Map();
            let radix = this._dragTransfer.minTranslateX;
            for (let [key, value] of this._dragList.entries()) {
                if (key === this._dragTransfer.index) {
                    continue;
                }
                let _index = key - this._dragTransfer.index;
                let point = Math.round(value.width / 2);
                let translateX = this._dragList[this._dragTransfer.index].width;
                _index > 0 && (translateX *= -1);
                this._translateXMap.set([radix, radix + point], [key, _index > 0 ? 0 : translateX]);
                this._translateXMap.set([radix + point + 1, radix + value.width], [key, _index > 0 ? translateX : 0]);
                radix += value.width + 1;
            }
        },
        enterRouter() {
            let path = this.$route.path;
            this._isChild = false;
            //如果当前路由在navTabList里，则为切换页签。否则为新开页签
            for (let [index, data] of this.navTabList.entries()) {
                this._isChild = this.isChildRouter(data.resourcesUrl, path);
                if (data.resourcesUrl === path || this._isChild) {
                    return this.switchTab(index);
                }
            }
            //打开新页签
            this.openTab();
        },
        //切换页签
        switchTab(index) {
            let { path, fullPath } = this.$route;
            let navData = this.navTabList[index];
            //切换子路由有两种情况，一种是从父路由进入子路由，一种是从别的页面直接进入子路由
            let _data = {
                ...navData,
                fullPath: this._isChild ? navData.fullPath : fullPath
            };
            (this._isChild &&
                Object.assign(_data, {
                    children: {
                        fullPath: fullPath,
                        resourcesUrl: path,
                        resourcesName: ''
                    }
                })) ||
                delete _data.children;
            this.navTabIndex = index;
            this.navTabList.splice(index, 1, _data);
        },

        //打开新页签
        openTab() {
            let { path, fullPath } = this.$route;
            for (let [index, data] of this.menuData.entries()) {
                this._isChild = this.isChildRouter(data.resourcesUrl, path);
                if (data.resourcesUrl === path || this._isChild) {
                    let _data = {
                        fullPath: this._isChild ? data.resourcesUrl : fullPath,
                        resourcesUrl: data.resourcesUrl,
                        resourcesName: data.resourcesName
                    };
                    this._isChild &&
                        Object.assign(_data, {
                            children: {
                                fullPath: fullPath,
                                resourcesUrl: path,
                                resourcesName: ''
                            }
                        });
                    this.navTabList.push(_data);
                    this.navTabIndex = this.navTabList.length - 1;
                    typeof this.open === 'function' && this.open(this.navTabList[this.navTabIndex]);
                    return false;
                }
            }
            this.navTabIndex = null;
        },

        //关闭页签
        closeTab(index) {
            let data = this.navTabList[index];
            let path = this.$route.path;
            if (typeof this.close === 'function' && this.close(index, this.navTabList) === false) {
                return;
            }
            this.$eventBus.$emit('clearKeepAlive', new RegExp(this.navTabList[index].resourcesUrl));
            this.navTabList.splice(index, 1);
            if (!this.navTabList.length) {
                return false;
            }
            if (this.navTabIndex === index) {
                return this.clickTab(index ? index - 1 : index);
            }
            this.navTabIndex > index && this.navTabIndex--;
        },

        //点击页签
        clickTab(index) {
            let data = this.navTabList[index];
            let path = data.children ? data.children.fullPath : data.fullPath;
            this.navTabIndex = index;
            this.$router.push({ path });
            if (typeof this.click === 'function') {
                this.click(data);
            }
        },
        getNavTabIndex() {
            let path = this.$route.path;
            for (let [index, data] of this.navTabList.entries()) {
                let isChild = this.isChildRouter(data.resourcesUrl, path);
                if (data.resourcesUrl === path || isChild) {
                    this.navTabIndex = index;
                    return;
                }
            }
        },
        //判断是否为子路由
        isChildRouter(path, child) {
            if (path === child) {
                return false;
            }
            // let pathList = path.split('/');
            // let childPathList = child.split('/');
            // for (let data of pathList.values()) {
            //     if (!childPathList.includes(data)) {
            //         return false;
            //     }
            // }
            // return true;
            // 上面这种情况如果路径的顺序不一致也会判断为子集("/driver/list",'/list/driver')

            return child.includes(path);
        },
        previous() {
            this.colspan && --this.colspan;
        },
        next() {
            if (this.colspan + 1 < this.maxColspan) {
                this.colspan++;
            }
        },
        tabClick(index) {
            this.$router.push(this.navTabList[index].fullPath);
        },
        removeTab(index) {
            let { navTabList } = this;
            this.navTabList.splice(index, 1);
            if (!this.navTabList.length) return;
            this.$router.push(navTabList[navTabList.length - 1].fullPath);
        }
    },
    destroyed() {
        baseMethods.removeHandler(document, 'mousemove', this.mouseMoveDocumentHandler);
        baseMethods.removeHandler(document, 'mouseup', this.mouseUpDocumentHandler);
    },
    created() {
        this.navTabList = baseMethods.getStore(this.systemCode + '-navTabList') || [];
        this.routerToggle();
    }
};
</script>

<style lang="scss" scoped>
.nav-tab-list-wrap {
    position: relative;
    height: 55px;
    overflow: hidden;
    padding-right: 40px;

    .nav-tab-list {
        margin-left: 15px;
        height: max-content;
        transition: all 0.2s ease-in-out 0s;

        li {
            display: inline-block;
            height: 55px;
            color: #676767;
            user-select: none;
            padding: 9px 0 8px;
            transition: all 0.1s ease-in-out 0s;

            .nav-tab-list-bg {
                height: 38px;
                padding: 7px 0;
            }

            .nav-tab-list-border {
                border-right: 1px solid #ddd;
                padding: 0 10px;
                height: 24px;
                line-height: 24px;

                .menu-title {
                    cursor: pointer;
                }

                .menu-close {
                    margin-left: 10px;
                    cursor: pointer;
                }

                span:hover {
                    color: red;
                }
            }

            .no-border {
                border: none !important;
            }
        }

        .dragTransfer {
            transition: none;
            z-index: 99999;
        }

        .router-activation {
            .nav-tab-list-bg {
                background: rgba(242, 242, 242, 1);
                box-shadow: -1px 0 0 rgba(242, 242, 242, 1);
                border-radius: 4px;

                .nav-tab-list-border {
                    border: none;
                }
            }

            .menu-title {
                color: red;
            }
        }
    }

    .nav-tab-icon {
        position: absolute;
        top: 0;
        right: 8px;
        width: 25px;
        height: 55px;
        text-align: center;

        .column-number {
            font-size: 12px;
            color: #f05259;
        }

        .icon-arrow {
            padding: 0 3px;
            cursor: pointer;

            &:hover {
                color: red;
            }

            &:disabled {
                color: #c0c4cc;
                cursor: auto;
            }
        }
    }
}
</style>
