<template>
    <div class="table-scroll-bar-warp" :style="scrollWarpStyle">
        <div ref="scrollBar" :style="scrollBarStyle" @mousedown="clickScrollBarHandler" class="table-scroll-bar-view"></div>
    </div>
</template>

<script>
    import baseMethods from '../../util/baseMethods';

    export default {
        name: 'table-scroll-bar-el',
        props: {
            scrollLeft: {
                type: Number,
                default: 0
            },
            scrollWidth: {
                type: Number,
                default: 0
            },
            isShowFixedPagination: {
                type: Boolean
            }
        },
        computed: {
            scrollWarpStyle(){
                let style = {};
                if (!this.isShowFixedPagination){
                    style = {
                        height: '20px',
                        paddingTop: '5px',
                        top: `-${this.getScrollbarWidth()}px`
                    }
                }
                return style;
            },
            scrollBarStyle() {
                let scrollWidth = this.scrollWidth >= 100 ? 0 : this.scrollWidth;
                return {
                    transform: `translateX(${this.scrollLeft}%)`,
                    width: scrollWidth + '%'
                }
            },
        },
        methods: {
            clickScrollBarHandler(e) {
                if (e.ctrlKey || e.button === 2) {
                    return;
                }
                this.startDrag(e);
                this.positionX = (e.currentTarget.offsetWidth - (e.clientX - e.currentTarget.getBoundingClientRect().left));
            },
            startDrag(e) {
                e.stopImmediatePropagation();
                this.cursorDown = true;
                baseMethods.addHandler(document, 'mousemove', this.mouseMoveDocumentHandler);
                baseMethods.addHandler(document, 'mouseup', this.mouseUpDocumentHandler);
                document.onselectstart = () => false;
            },
            mouseMoveDocumentHandler(e) {
                if (this.cursorDown === false) return;
                let scrollWarp = this.$parent.scrollWarp;
                const offset = ((this.$el.getBoundingClientRect().left - e.clientX) * -1);
                const barClickPosition = (this.$refs.scrollBar.offsetWidth - this.positionX);
                const barPositionPercentage = ((offset - barClickPosition) * 100 / this.$el.offsetWidth);
                scrollWarp.scrollLeft = (barPositionPercentage * scrollWarp.scrollWidth / 100);
            },
            mouseUpDocumentHandler(e) {
                this.cursorDown = false;
                this.positionX = 0;
                baseMethods.removeHandler(document, 'mousemove', this.mouseMoveDocumentHandler);
                baseMethods.removeHandler(document, 'mouseup', this.mouseUpDocumentHandler);
                document.onselectstart = false;
            },
            getScrollbarWidth() {
                const outer = document.createElement('div');
                outer.className = 'ws-scrollbar__wrap';
                outer.style.visibility = 'hidden';
                outer.style.width = '100px';
                outer.style.position = 'absolute';
                outer.style.top = '-9999px';
                document.body.appendChild(outer);

                const widthNoScroll = outer.offsetWidth;
                outer.style.overflow = 'scroll';

                const inner = document.createElement('div');
                inner.style.width = '100%';
                outer.appendChild(inner);

                const widthWithScroll = inner.offsetWidth;
                outer.parentNode.removeChild(outer);
                return widthNoScroll - widthWithScroll;
            }
        },
        destroyed() {
            baseMethods.removeHandler(document, 'mousemove', this.mouseMoveDocumentHandler);
            baseMethods.removeHandler(document, 'mouseup', this.mouseUpDocumentHandler);
        }
    }
</script>

<style scoped lang="scss">
    .table-scroll-bar-warp {
        position: absolute;
        z-index:1;
        width: 100%;
        height: 10px;
        background:#fff;
        .table-scroll-bar-view {
            height: 10px;
            border-radius: 8px;
            cursor: pointer;
            background-color: rgba(144, 147, 153, .7);
        }
    }
</style>
