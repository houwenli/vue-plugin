import TableScrollBar from './Table-scroll-bar';

export default {
    name: 'ws-table-footer',
    props: {
        store: {
            required: true
        },
    },
    components: {
        TableScrollBar,
    },
    data() {
        return {}
    },
    mounted() {
    },

    computed: {
        table() {
            return this.$parent;
        },
        layoutList() {
            let layout;
            if (this.table.$props.lazyQuery) {
                let {selectCount} = this.table.$props.lazyQuery.op
                layout = ['total', 'sizes', 'prev', 'pager', 'next', 'jumper'];
                if (this.table.pageId) {
                    layout = ['sizes', 'prev', 'slot', 'next'];
                }
                if (this.table.pageId && selectCount) {
                    layout = ['total','sizes', 'prev', 'slot', 'next'];
                }
            } else {
                layout = ['total','sizes', 'prev', 'slot', 'next'];
            }
            return layout.join(',');
        },
        pageNumbers() {
            return Math.ceil(this.store.total / this.store.pageSize);
        },
        paginationStyle() {
            if (this.store.paginationFixed) {
                return {
                    position: 'fixed',
                    bottom: 0,
                    width: this.store.bodyOffsetWidth + 'px',
                    background: '#f0f2f5',
                }
            }
        },
        scrollBarStyle() {
            if (this.store.paginationFixed) {
                return {
                    top: -14 + 'px',
                    background: 'none',
                }
            }
        }
    },
    render(h) {
        const data = this.data || [];
        let scrollBar = null;
        scrollBar = (<table-scroll-bar style={this.scrollBarStyle} store={this.store}></table-scroll-bar>);

        return (
            <div class="ws-table__footer-pagination" style={this.paginationStyle} ref="pagination">
                {scrollBar}
                <el-pagination
                    currentPage={this.store.currentPage}
                    {...{
                        on: {
                            'size-change': this.handleSizeChange,
                            'current-change': this.handleCurrentChange
                        }
                    }}
                    pageSizes={this.table.pageSizeList}
                    pageSize={this.store.pageSize}
                    layout={this.layoutList}
                    total={this.store.total}>
                    <span class="tc">{this.store.currentPage}</span>
                </el-pagination>
            </div>
        )
    },
    methods: {
        handleSizeChange(data) {
            this.table.commitStore('pageSize', data);
            this.table.commitStore('currentPage', 1);
            this.table.handleCurrentChange();
        },
        handleCurrentChange(data) {
            this.table.commitStore('currentPage', data);
            this.table.handleCurrentChange();
        },
    }
}
