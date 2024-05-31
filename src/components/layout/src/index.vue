<template>
    <div :class="[prefix, { 'sub-app': !$showNavBar }]">
        <div :class="prefix + '__header'" ref="tags" v-if="!$showNavBar">
            <slot name="tags">
                <ws-navigation-tabs :menuData="routerData"></ws-navigation-tabs>
            </slot>
        </div>
        <div :class="prefix + '__body'">
            <div :class="prefix + '__sidebar'" ref="sidebar"><slot name="sidebar"></slot></div>
            <div :class="prefix + '__main'" :style="{ marginLeft: sidebarWidth + 'px' }">
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script>
import ResizeObserver from 'resize-observer-polyfill';
export default {
    name: 'ws-layout',
    props: {
        routerData: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            prefix: 'ws-layout',
            sidebarWidth: 0
        };
    },
    computed: {
        styleRight() {
            return `${this.right}px`;
        }
    },
    mounted() {
        this.sidebarWidth = this.$refs.sidebar.offsetWidth;
        // 监听sidebar宽度变化
        const sidebar = new ResizeObserver((entries, observer) => {
            for (const entry of entries) {
                this.sidebarWidth = entry.contentRect.width;
            }
        });
        sidebar.observe(this.$refs.sidebar);
    }
};
</script>

<style lang="scss" scoped>
.ws-layout {
    min-height: 100%;
    background: #f0f2f5;
    display: flex;
    flex-direction: column;

    &__body {
        flex: 1;
        display: flex;
        position: relative;
    }
    &__sidebar {
        height: 100%;
        position: fixed;
        left: 0;
        overflow: hidden;
        z-index: 200;
        box-shadow: 2px 0px 8px 4px rgba(0, 0, 0, 0.04);
        border-radius: 0px 8px 8px 0px;
        .ws-menu-warp {
            position: relative;
        }
    }
    &__main {
        position: relative;
        padding: 66px 16px 20px;
        overflow: auto;
        flex: 1;
        display: flex;
        flex-direction: column;
        height: 100vh;
        // min-width: 1030px;
        .navigation {
            width: 100% !important;
            box-sizing: border-box;
            // left:0;
            right: 0;
        }
    }
}
.nav-tab-list-wrap {
    margin-top: 0 !important;
    height: 49px !important;
    z-index: 1;
    .nav-tab-list {
        li {
            margin-right: 8px;
        }
        .nav-tab-list-border {
            border-right: none !important;
            line-height: 16px !important;
            .menu-title {
                font-size: 13px;
            }
        }
        .nav-tab-list-bg {
            height: 30px !important;
            background: #fff !important;
            border-radius: 15px;
        }
        .router-activation {
            .nav-tab-list-bg {
                background: #f05259 !important;
                color: #fff;
                border-radius: 15px !important;
                .menu-title {
                    color: #fff !important;
                }
            }
        }
    }
}

.sub-app {
    .ws-layout__sidebar {
        position: absolute;
        // top: 0;
        // bottom: 0;
    }
    .ws-layout__main {
        padding-top: 0;
        overflow-y: auto;
        height: calc(100vh - 106px);
    }
}
</style>
