<template>
    <div class="ws-descriptions__item" :style="itemStyle">
        <div
            class="ws-descriptions__label"
            :style="{
                borderBottom: borderStyle,
                borderRight: borderStyle,
                textAlign: $parent.align,
                width: parseInt($parent.labelWidth) + 'px',
                background: $parent.background
            }"
        >
            {{ label }}
        </div>
        <!-- 增加内容的定制 -->
        <slot name="content"></slot>

        <div v-if="!$slots.content" class="ws-descriptions__content" @mouseenter="mouseEnterHander" :style="{ borderBottom: borderStyle, borderRight: borderStyle }">
            <el-tooltip :disabled="disableTips" class="item" effect="light" :content="content" placement="top-start">
                <span class="text"><slot></slot></span>
            </el-tooltip>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ws-descriptions-item',
    props: {
        label: { type: String, require: true }, //标签名
        showTip: { type: Boolean, default: true }, //是否展示tooltip
    },
    data() {
        return {
            disableTips: true,
            content: ''
        }
    },
    computed: {
        borderStyle() {
            return this.$parent.border ? '1px solid #ebeef5' : '';
        },
        itemStyle() {
            return {
                height: parseInt(this.$parent.height) + 'px',
                lineHeight: parseInt(this.$parent.height) + 'px'
            };
        }
    },
    methods: {
        mouseEnterHander(e) {
            let getStyle = (el, name) => parseInt(window.getComputedStyle(el, null).getPropertyValue(name))
            let wrapEl = e.target
            let textEl = wrapEl.querySelector('.text')
            let wrapWidth = wrapEl.clientWidth - getStyle(wrapEl, 'padding-left') - getStyle(wrapEl, 'padding-right')
            this.content = textEl.innerText
            this.disableTips = (this.$parent.showTip===false||this.showTip===false)?true:wrapWidth > textEl.offsetWidth
        }
    }
};
</script>

<style lang="scss" scoped>
.ws-descriptions {
    &__item {
        display: flex;
        width: 50%;
        height: 40px;
        line-height: 40px;
        font-size: 14px;
        overflow: hidden;
        &:nth-child(2) {
            .ws-descriptions__content {
                border-top-left-radius: 8px;
            }
        }
        &:last-child {
            .ws-descriptions__content {
                border-bottom-right-radius: 8px;
            }
        }
        &:nth-of-type(odd){
            .ws-descriptions__content {
                border-bottom-right-radius: 0px;
            }
        }
    }
    &__label {
        min-width: 150px;
        padding: 0 15px;
        text-align: left;
        padding-left: 16px;
    }
    &__content {
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        padding: 0 16px;
        background: #ffffff;
    }
}
</style>
