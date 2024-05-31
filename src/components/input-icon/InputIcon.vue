<template>
    <div :class="prefix">
        <el-input
            placeholder="请输入内容"
            v-model="selectedIcon"
            maxlength="20"
            autocomplete="off"
            clearable
        >
            <el-button
                slot="append"
                :icon="selectedIcon"
                @click="showDialog = true"
            ></el-button>
        </el-input>
        <el-dialog
            title="请选择图标"
            :visible.sync="showDialog"
            width="60%"
            class="icon-dialog"
            append-to-body
            :before-close="handleClose"
        >
            <div class="tab-wrap">
                <el-tabs v-model="activeTab" @tab-click="changeTab">
                    <el-tab-pane label="elementUI图标" name="elementui">
                        <div class="icon-list">
                            <div
                                class="icon-list-item"
                                v-for="item of elementuiList"
                                :key="item"
                                @click="selected(item)"
                            >
                                <i :class="item"></i>
                                <p>{{ item }}</p>
                            </div>
                        </div>
                    </el-tab-pane>
                    <el-tab-pane label="iconfont图标" name="iconfont">
                        <div class="icon-list">
                            <div
                                class="icon-list-item"
                                v-for="item of iconfontList"
                                :key="item"
                                @click="selected(item)"
                            >
                                <i :class="['iconfont', item]"></i>
                                <p>{{ item }}</p>
                            </div>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showDialog = false">取 消</el-button>
                <el-button type="primary" @click="showDialog = false"
                    >确 定</el-button
                >
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: "ws-input-icon",
    props: {
        value: {
            type: String,
            default: ""
        }
    },
    // watch:{
    //     value(val){
    //         this.selectedIcon=val
    //     }
    // },
    data() {
        return {
            prefix: "ws-input-icon",
            icon: "el-icon-search",
            showDialog: false,
            activeTab: "elementui",
            elementuiList: [
                "el-icon-platform-eleme",
                "el-icon-eleme",
                "el-icon-delete-solid",
                "el-icon-delete",
                "el-icon-s-tools",
                "el-icon-setting",
                "el-icon-user-solid",
                "el-icon-user",
                "el-icon-phone",
                "el-icon-phone-outline",
                "el-icon-more",
                "el-icon-more-outline",
                "el-icon-star-on",
                "el-icon-star-off",
                "el-icon-s-goods",
                "el-icon-goods",
                "el-icon-warning",
                "el-icon-warning-outline",
                "el-icon-question",
                "el-icon-info",
                "el-icon-remove",
                "el-icon-circle-plus",
                "el-icon-success",
                "el-icon-error",
                "el-icon-zoom-in",
                "el-icon-zoom-out",
                "el-icon-remove-outline",
                "el-icon-circle-plus-outline",
                "el-icon-circle-check",
                "el-icon-circle-close",
                "el-icon-s-help",
                "el-icon-help",
                "el-icon-minus",
                "el-icon-plus",
                "el-icon-check",
                "el-icon-close",
                "el-icon-picture",
                "el-icon-picture-outline",
                "el-icon-picture-outline-round",
                "el-icon-upload",
                "el-icon-upload2",
                "el-icon-download",
                "el-icon-camera-solid",
                "el-icon-camera",
                "el-icon-video-camera-solid",
                "el-icon-video-camera",
                "el-icon-message-solid",
                "el-icon-bell",
                "el-icon-s-cooperation",
                "el-icon-s-order",
                "el-icon-s-platform",
                "el-icon-s-fold",
                "el-icon-s-unfold",
                "el-icon-s-operation",
                "el-icon-s-promotion",
                "el-icon-s-home",
                "el-icon-s-release",
                "el-icon-s-ticket",
                "el-icon-s-management",
                "el-icon-s-open",
                "el-icon-s-shop",
                "el-icon-s-marketing",
                "el-icon-s-flag",
                "el-icon-s-comment",
                "el-icon-s-finance",
                "el-icon-s-claim",
                "el-icon-s-custom",
                "el-icon-s-opportunity",
                "el-icon-s-data",
                "el-icon-s-check",
                "el-icon-s-grid",
                "el-icon-menu",
                "el-icon-share",
                "el-icon-d-caret",
                "el-icon-caret-left",
                "el-icon-caret-right",
                "el-icon-caret-bottom",
                "el-icon-caret-top",
                "el-icon-bottom-left",
                "el-icon-bottom-right",
                "el-icon-back",
                "el-icon-right",
                "el-icon-bottom",
                "el-icon-top",
                "el-icon-top-left",
                "el-icon-top-right",
                "el-icon-arrow-left",
                "el-icon-arrow-right",
                "el-icon-arrow-down",
                "el-icon-arrow-up",
                "el-icon-d-arrow-left",
                "el-icon-d-arrow-right",
                "el-icon-video-pause",
                "el-icon-video-play",
                "el-icon-refresh",
                "el-icon-refresh-right",
                "el-icon-refresh-left",
                "el-icon-finished",
                "el-icon-sort",
                "el-icon-sort-up",
                "el-icon-sort-down",
                "el-icon-rank",
                "el-icon-loading",
                "el-icon-view",
                "el-icon-c-scale-to-original",
                "el-icon-date",
                "el-icon-edit",
                "el-icon-edit-outline",
                "el-icon-folder",
                "el-icon-folder-opened",
                "el-icon-folder-add",
                "el-icon-folder-remove",
                "el-icon-folder-delete",
                "el-icon-folder-checked",
                "el-icon-tickets",
                "el-icon-document-remove",
                "el-icon-document-delete",
                "el-icon-document-copy",
                "el-icon-document-checked",
                "el-icon-document",
                "el-icon-document-add",
                "el-icon-printer",
                "el-icon-paperclip",
                "el-icon-takeaway-box",
                "el-icon-search",
                "el-icon-monitor",
                "el-icon-attract",
                "el-icon-mobile",
                "el-icon-scissors",
                "el-icon-umbrella",
                "el-icon-headset",
                "el-icon-brush",
                "el-icon-mouse",
                "el-icon-coordinate",
                "el-icon-magic-stick",
                "el-icon-reading",
                "el-icon-data-line",
                "el-icon-data-board",
                "el-icon-pie-chart",
                "el-icon-data-analysis",
                "el-icon-collection-tag",
                "el-icon-film",
                "el-icon-suitcase",
                "el-icon-suitcase-1",
                "el-icon-receiving",
                "el-icon-collection",
                "el-icon-files",
                "el-icon-notebook-1",
                "el-icon-notebook-2",
                "el-icon-toilet-paper",
                "el-icon-office-building",
                "el-icon-school",
                "el-icon-table-lamp",
                "el-icon-house",
                "el-icon-no-smoking",
                "el-icon-smoking",
                "el-icon-shopping-cart-full",
                "el-icon-shopping-cart-1",
                "el-icon-shopping-cart-2",
                "el-icon-shopping-bag-1",
                "el-icon-shopping-bag-2",
                "el-icon-sold-out",
                "el-icon-sell",
                "el-icon-present",
                "el-icon-box",
                "el-icon-bank-card",
                "el-icon-money",
                "el-icon-coin",
                "el-icon-wallet",
                "el-icon-discount",
                "el-icon-price-tag",
                "el-icon-news",
                "el-icon-guide",
                "el-icon-male",
                "el-icon-female",
                "el-icon-thumb",
                "el-icon-cpu",
                "el-icon-link",
                "el-icon-connection",
                "el-icon-open",
                "el-icon-turn-off",
                "el-icon-set-up",
                "el-icon-chat-round",
                "el-icon-chat-line-round",
                "el-icon-chat-square",
                "el-icon-chat-dot-round",
                "el-icon-chat-dot-square",
                "el-icon-chat-line-square",
                "el-icon-message",
                "el-icon-postcard",
                "el-icon-position",
                "el-icon-turn-off-microphone",
                "el-icon-microphone",
                "el-icon-close-notification",
                "el-icon-bangzhu",
                "el-icon-time",
                "el-icon-odometer",
                "el-icon-crop",
                "el-icon-aim",
                "el-icon-switch-button",
                "el-icon-full-screen",
                "el-icon-copy-document",
                "el-icon-mic",
                "el-icon-stopwatch",
                "el-icon-medal-1",
                "el-icon-medal",
                "el-icon-trophy",
                "el-icon-trophy-1",
                "el-icon-first-aid-kit",
                "el-icon-discover",
                "el-icon-place",
                "el-icon-location",
                "el-icon-location-outline",
                "el-icon-location-information",
                "el-icon-add-location",
                "el-icon-delete-location",
                "el-icon-map-location",
                "el-icon-alarm-clock",
                "el-icon-timer",
                "el-icon-watch-1",
                "el-icon-watch",
                "el-icon-lock",
                "el-icon-unlock",
                "el-icon-key",
                "el-icon-service",
                "el-icon-mobile-phone",
                "el-icon-bicycle",
                "el-icon-truck",
                "el-icon-ship",
                "el-icon-basketball",
                "el-icon-football",
                "el-icon-soccer",
                "el-icon-baseball",
                "el-icon-wind-power",
                "el-icon-light-rain",
                "el-icon-lightning",
                "el-icon-heavy-rain",
                "el-icon-sunrise",
                "el-icon-sunrise-1",
                "el-icon-sunset",
                "el-icon-sunny",
                "el-icon-cloudy",
                "el-icon-partly-cloudy",
                "el-icon-cloudy-and-sunny",
                "el-icon-moon",
                "el-icon-moon-night",
                "el-icon-dish",
                "el-icon-dish-1",
                "el-icon-food",
                "el-icon-chicken",
                "el-icon-fork-spoon",
                "el-icon-knife-fork",
                "el-icon-burger",
                "el-icon-tableware",
                "el-icon-sugar",
                "el-icon-dessert",
                "el-icon-ice-cream",
                "el-icon-hot-water",
                "el-icon-water-cup",
                "el-icon-coffee-cup",
                "el-icon-cold-drink",
                "el-icon-goblet",
                "el-icon-goblet-full",
                "el-icon-goblet-square",
                "el-icon-goblet-square-full",
                "el-icon-refrigerator",
                "el-icon-grape",
                "el-icon-watermelon",
                "el-icon-cherry",
                "el-icon-apple",
                "el-icon-pear",
                "el-icon-orange",
                "el-icon-coffee",
                "el-icon-ice-tea",
                "el-icon-ice-drink",
                "el-icon-milk-tea",
                "el-icon-potato-strips",
                "el-icon-lollipop",
                "el-icon-ice-cream-square",
                "el-icon-ice-cream-round"
            ],
            iconfontList: [
                "iconic_guanli",
                "iconkechengfenxi",
                "iconicon_jixiaofen_fuhe",
                "iconyunliguanli",
                "iconexpyunli",
                "iconbaseconf",
                "iconic_yingxiaojilu",
                "iconic_huodongguanli",
                "iconic_yingxiaoqudao",
                "iconic_jixiaopeizhi",
                "iconic_jixiaomingxi",
                "iconic_grade",
                "iconic_information",
                "iconic_model",
                "iconic_download",
                "iconic_order",
                "iconic_Finance",
                "iconic_Partner",
                "icon-quanxian-cooperation",
                "icon-quanxian-download",
                "icon-workflow-accountgroup",
                "icon-workflow-notes",
                "icon-wrokflow-userpic",
                "icon-workflow-process",
                "iconiconfont1",
                "icontguanli",
                "iconiconfont",
                "iconic_set",
                "iconic_yongyin",
                "iconic_renyuanguanli",
                "icon-shangxia",
                "icon-zuoyou",
                "icon-quanxian-account",
                "icon-quanxian-journal",
                "icon-quanxian-starts",
                "icon-quanxian-manage",
                "icon-quanxian-stopbeifen",
                "icon-quanxian-branch",
                "icon-quanxian-modify",
                "icon-quanxian-role",
                "icon-quanxian-menu",
                "icon-xuanzhongxingxing",
                "icon-xingxing",
                "icondaiban4",
                "iconxiazai",
                "iconliucheng1",
                "icon-wenjianxiazaihouxuan",
                "icon-jixiaofendengji",
                "icon-celue",
                "icon-guanli",
                "icon-tongji",
                "icon-mingxi",
                "icon-guize",
                "icon-pingjunzhi",
                "icon-dengjijixiaofen",
                "icon-dengji",
                "icon-jixiaopaiming",
                "icon-zijinjiesuan",
                "icon-xiazai",
                "icon-yufu",
                "icon-jilu",
                "icon-jiesuan",
                "icon-gongsi",
                "icon-tixian",
                "icon-manage",
                "icon-date",
                "icon-suanfa",
                "icon-index",
                "icon-rule",
                "icon-biz",
                "icon-reports",
                "icon-jiankong"
            ]
        };
    },
    computed: {
        selectedIcon: {
            get() {
                return this.value.startsWith("icon")
                    ? "iconfont " + this.value
                    : this.value;
            },
            set(val) {
                this.$emit("input", val);
            }
        }
    },
    methods: {
        handleClose() {},
        changeTab(tab, event) {},
        //   选择图标
        selected(icon) {
            this.selectedIcon = icon;
            this.$emit("input", icon);
            this.showDialog = false;
        }
    }
};
</script>

<style lang="scss" scoped>
.icon-list {
    display: flex;
    flex-wrap: wrap;
    height: 400px;
    overflow-y: auto;
    &-item {
        text-align: center;
        max-width: 120px;
        padding: 20px;
        transition: all 0.2s;
        cursor: pointer;
        &:hover {
            transform: scale(1.4);
        }
        i {
            font-size: 32px;
        }
        p {
            font-size: 12px;
        }
    }
}
.icon-dialog {
    ::v-deep .el-dialog {
        padding: 40px;
    }
}
</style>
