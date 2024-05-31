<template>
    <li>
        <div class="menu-label" @click="subMenuClick()"
             @mouseenter="mouseenterMenu($event)" @mouseleave="mouseleaveMenu($event)"
             :style="menuLabelStyle">
            <i class="iconfont" v-if="menuData.imgName" :class="menuData.imgName" :style="iconfontStyle"></i>
            <span :style="menuSpanStyle">{{menuData.resourcesName}}</span>
        </div>
        <i class="el-icon-arrow-down toggle-icon" @click="subMenuClick()"
           :class="menuData.open ? 'open' : ''"
           :style="toggleIconSyle" v-if="isToggle && isMenu"></i>
        <el-collapse-transition v-if="isMenu">
            <ul class="sub-menu" v-show="!isToggle || (isToggle && menuData.open)">
                <template v-for="(child,ci) in menuData.children">
                    <submenu :key="uuidKey()" :menuData="child" :level="level + 1" :menuConfig="menuConfig"></submenu>
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
                let _style = {
                    'paddingLeft': this.menuConfig[indent]
                }
                if (this.menuData.active) {
                    _style.background = this.menuConfig.activeBackgroundColor;
                    _style.color = this.menuConfig.activeTextColor;
                }
                return _style;
            },
            menuSpanStyle(){
                let left = parseInt(this.menuConfig.inconFontSize) + 15;
                let style = {
                    fontSize: this.menuConfig.fontSize,
                    marginLeft: this.menuData.imgName ? `${left}px` : 0
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
                return this.menuData.children
            },
            isDisableMenu() {
                return !this.isToggle && this.menuData.children;
            },
        },
        methods: {
            subMenuClick() {
                let data = this.menuData;

                //能收缩展开，并且无页面菜单。则可收缩展开。有children是无页面菜单，没有children是有页面菜单。
                if (this.isToggle && data.children) {
                    this.$eventBus.$emit('traversalData', {
                        ...data,
                        model: 'toggle',
                        level: this.level,
                        open: !this.menuData.open,
                    });
                }
                //有页面菜单则激活选中，并跳转路由
                if (!data.children && this.$route.path !== this.getPath(data)) {
                    this.$eventBus.$emit('traversalData', {
                        ...data,
                        model: 'active',
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
                    e.target.style.setProperty('color', this.menuConfig.textColor);
                }
            },
            uuidKey() {
                return (Math.random() * 10000000).toString(16).substr(0, 4) + '-' + (new Date()).getTime() + '-' + Math.random().toString().substr(2, 5);
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
