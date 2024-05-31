<template>
    <li>
        <div class="menu-label" @click="subMenuClick()"
             @mouseenter="mouseenterMenu($event)" @mouseleave="mouseleaveMenu($event)"
             :style="menuLabelStyle">
            <!-- <i class="iconfont" v-if="menuData.imgName" :class="menuData.imgName" :style="iconfontStyle"></i> -->
            <span :style="menuSpanStyle" :title="menuData.resourcesName">{{menuData.resourcesName}}</span>
        </div>
        <i class="el-icon-caret-right toggle-icon"
           :class="menuData.open ? 'open' : ''"
           :style="toggleIconSyle" v-if="isToggle && isMenu" @click="subMenuClick()"></i>
        <el-collapse-transition v-if="isMenu">
            <ul class="sub-menu" v-show="!isToggle || (isToggle && menuData.open)">
                <template v-for="(child,ci) in menuData.children">
                    <submenu :key="ci" :menuData="child" :level="level + 1" :menuConfig="menuConfig"></submenu>
                </template>
            </ul>
        </el-collapse-transition>
    </li>
</template>

<script>

    export default {
        name: 'Submenu',
        props: ['level', 'menuData', 'menuConfig'],
        data() {
            return {}
        },
        computed: {
            toggleIconSyle() {
                let top = (parseInt(this.menuConfig.lineHeight) - 15) / 2;
                return {
                    'top': top + 'px'
                }
            },
            iconfontStyle(){
                return {
                    fontSize: this.menuConfig.inconFontSize,
                }
            },
            menuLabelStyle() {
                let indent = {
                    '0': 'indentLevelA',
                    '1': 'indentLevelB',
                    '2': 'indentLevelC',
                }[this.level]
                let levelStyle = {
                    0: { fontWeight: 600, color: '#606266' },
                    1: { fontWeight: 400, color: '#606266' },
                    2: { fontWeight: 400, color: '#606266' }
                }
                let _style = {
                    'paddingLeft': this.menuConfig[indent]
                }
                if (this.menuData.active) {
                    _style.background = this.menuConfig.activeBackgroundColor;
                    _style.color = this.menuConfig.activeTextColor;
                }
                return { ...levelStyle[this.level], ..._style };
            },
            menuSpanStyle(){
                let style = {
                    fontSize: this.menuConfig.fontSize,
                }
                if (this.isDisableMenu) {
                    style = {
                        ...style, ...{
                            color: this.menuConfig.disableTextColor,
                            opacity: 0.5
                        }
                    }
                }
                return style;
            },
            //当前菜单是否可收缩展开
            isToggle() {
                let toggle = {
                    '0': 'toggleLevelA',
                    '1': 'toggleLevelB',
                    '2': 'toggleLevelC',
                }[this.level];
                return this.menuConfig[toggle];
            },
            //判断当前是否是菜单列
            isMenu() {
                return this.menuData.type != '2'
            },
            isDisableMenu() {
                return !this.isToggle && this.menuData.type != '2';
            },
        },
        methods: {
            subMenuClick() {
                let data = this.menuData;
                //能收缩展开，并且无页面菜单。则可收缩展开。type 0：无页面菜单，1：功能菜单（方法）2：有页面菜单
                if (this.isToggle && data.type == 0) {
                    this.$eventBus.$emit('traversalData', {
                        data: data,
                        model: 'toggle',
                        level: this.level,
                        open: !this.menuData.open,
                    });
                }
                //有页面菜单则激活选中，并跳转路由
                if (data.type == 2 && this.$route.path !== this.getPath(data)) {
                    this.$eventBus.$emit('traversalData', {
                        data: data,
                        model: 'active'
                    });
                }
            },
            mouseenterMenu(e) {
                if (!this.menuData.active && !this.isDisableMenu) {
                    e.target.style.setProperty('background', this.menuConfig.hoverBackgroundColor);
                    e.target.style.setProperty('color', this.menuConfig.hoverTextColor);
                }
            },
            mouseleaveMenu(e) {
                if (!this.menuData.active && !this.isDisableMenu) {
                    e.target.style.setProperty('background', this.menuConfig.backgroundColor);
                    e.target.style.setProperty('color', '#606266');
                }
            },
            getPath(item) {
                let path = item.resourcesUrl || '';
                if (path && !path.startsWith('/')) {
                    path = '/' + path;
                }
                return path;
            },
        }
    }
</script>

