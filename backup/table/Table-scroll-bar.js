import baseMethods from '../../util/baseMethods';

export default {
    name: 'ws-table-scroll-bar',
    props: {
        store: {
            required: true
        },
    },
    data() {
        return {
        }
    },
    computed: {
        table(){
            return this.$parent.$parent;
        },
        scrollWarpStyle() {
            let scrollWidth = this.store.scrollWidth >= 100 ? 0 : 100;
            let style = {
                width: scrollWidth + '%'
            }
            if (!this.store.paginationFixed){
                style = {
                    ...style,
                    height: '20px',
                    paddingTop: '5px',
                    top: `-${this.getScrollbarWidth()}px`
                }
            }
            return style;
        },
        scrollBarStyle() {
            let scrollWidth = this.store.scrollWidth >= 100 ? 0 : this.store.scrollWidth;
            return {
                transform: `translateX(${this.store.translateX}%)`,
                width: scrollWidth + '%'
            }
        },
    },
    render(h) {
        return (
            <div class="ws-table__scroll-bar-warp" style={this.scrollWarpStyle}>
                <div ref="scrollBar" style={this.scrollBarStyle} on-mousedown={this.clickScrollBarHandler}
                     class="ws-table__scroll-bar-view"></div>
            </div>
        );
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
            let scrollWarp = this.table.$refs.tableBody.$el;
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
