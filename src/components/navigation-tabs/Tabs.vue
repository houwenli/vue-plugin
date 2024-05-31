<template>
    <div class="child-sys-tag-list-wrap">
        <div class="nav-tab-list" ref="navWarp" :style="colspanStyle">
                <div
                    v-for="(item, index) in navTabList"
                    ref="navTabList"
                    :key="item.resourcesUrl"
                    @click="tabClick(index)"
                    :class="{ 'router-activation': activeIndex == index, dragTransfer: dragTransfer === index }"
                    class='nav-tab-item'
                >
                    <div class="nav-tab-list-bg">
                        <div class="nav-tab-list-border">
                            <span class="menu-title">{{ item.resourcesName }}</span>
                            <span class="menu-close el-icon-close" @click.stop="removeTab(index)"></span>
                        </div>
                    </div>
                </div>
        </div>

        <!--
          tag 超出2行，翻页控件
          把父容器 / 单个tag整体高度，取整， 如果大于1，就说明大于1行
         -->
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
            dragTransfer: null,
            menuUrlMap: {}
        };
    },
    computed: {
        colspanStyle() {
            return {
              // 49是单个tag的整体高度
                transform: `translateY(-${this.colspan * 49}px)`
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
            const navHeight = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    this.maxColspan = parseInt(entry.target.offsetHeight / 49) || 1;
                }
            });
            navHeight.observe(this.$refs.navWarp);

            // 销毁
            this.$once('hook:beforeDestroy', () => {
              navHeight.disconnect()
            })
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

    created() {
        this.navTabList = baseMethods.getStore(this.systemCode + '-navTabList') || [];
        this.routerToggle();
    }
};
</script>

<style lang="scss" scoped>
$textColor: #676767;
$hilightColor: #f05259;

.child-sys-tag-list-wrap {
    position: relative;
    height: 55px;
    overflow: hidden;
    padding-right: 40px;

    .nav-tab-list {
        display: flex;
        flex-wrap: wrap;
        column-gap: 8px;
        margin-left: 15px;
        height: max-content;
        transition: all 0.2s ease-in-out 0s;

        .dragTransfer {
            transition: none;
            z-index: 99999;
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

.nav-tab-item {
    flex-shrink: 0;
    height: 49px;
    color: $textColor;
    user-select: none;
    padding: 9px 0 8px;
    transition: all 0.1s ease-in-out 0s;
    box-sizing: border-box;

    .nav-tab-list-bg {
        height: 30px;
        line-height: 16px;
        padding: 7px 0;
        background: #fff;
        border-radius: 15px !important;
        color: #676767;
    }

    .nav-tab-list-border {
        padding: 0 10px;
        .menu-close {
            margin-left: 10px;
            cursor: pointer;
        }

        span:hover {
            color: red;
        }
    }
}

.menu-title {
    font-size: 13px;
    cursor: pointer;
}
.router-activation {
    .nav-tab-list-bg {
        background: #f05259 !important;
        color: #fff !important;

        .nav-tab-list-border {
            border: none;
        }
        // 不要设置颜色
        span:hover {
            color: #fff !important;
        }
    }
}

</style>
