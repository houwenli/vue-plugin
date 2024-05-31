<template>
    <transition name="el-fade-in">
        <div v-if="visible" @click.stop="handleClick" :style="{'right': styleRight,'bottom': styleBottom}" class="el-backtop ws-backtop">
            <slot>
                <el-icon name="caret-top"></el-icon>
            </slot>
        </div>
    </transition>
</template>

<script>
    import baseMethods from '../../util/baseMethods'

    export default {
        name: 'ws-backtop',
        props: {
            visibilityHeight: {
                type: Number,
                default: 200
            },
            right: {
                type: Number,
                default: 20
            },
            bottom: {
                type: Number,
                default: 110
            },
        },
        data() {
            return {
                visible: false
            }
        },
        computed: {
            styleBottom() {
                return `${this.bottom}px`;
            },
            styleRight() {
                return `${this.right}px`;
            }
        },
        mounted() {
            this.throttledScrollHandler = baseMethods.throttle(this.onScroll, 200);
            baseMethods.addHandler(document, 'scroll', this.throttledScrollHandler);
        },
        methods: {
            onScroll() {
                let doc = document.documentElement || document.body;
                this.visible = doc.scrollTop >= this.visibilityHeight;
            },
            handleClick(e) {
                baseMethods.scrollBackTop(true);
                this.$emit('click', e);
            },
        },
        beforeDestroy() {
            baseMethods.removeHandler(document, 'scroll', this.throttledScrollHandler);
        }

    }
</script>

<style scoped lang="scss">
    .ws-backtop{
        z-index: 99;
    }
</style>
