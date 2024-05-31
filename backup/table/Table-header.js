export default {
    name: 'ws-table-header',
    props: {
        store: {
            required: true
        },
        tableData: {type: Array, default: () => []},     //表格数据
    },
    computed: {
        table() {
            return this.$parent;
        },
        columnFixedStyle(){
            let {scrollLeft,bodyClientWidth,bodyScrollWidth} = this.store;
            let left = scrollLeft == bodyScrollWidth - bodyClientWidth;
            return {
                'box-shadow': left ? '' : '0 0 10px rgba(0,0,0,.12)'
            }
        }
    },
    render(h) {
        return (
            <div class="ws-table-header__warp" style={{width: this.store.bodyOffsetWidth + 'px'}}>
                <table class="ws-table-header" style={{transform: `translateX(${-this.store.scrollLeft}px)`}}
                       cellspacing="0" cellpadding="0" border="0">
                    <thead>
                    <tr>
                        {
                            this.store.columns.map((column, index) => this.renderCell(column, index))
                        }
                    </tr>
                    </thead>
                </table>
                <table class="ws-table-header ws-table-header-fixed"
                       style={this.columnFixedStyle}
                       cellSpacing="0" cellPadding="0" border="0">
                    <thead>
                    <tr>
                        {
                            this.store.columns.map((column, index) => this.renderCellFixed(column, index))
                        }
                    </tr>
                    </thead>
                </table>
            </div>
        )
    },
    methods: {
        renderCell(column, index) {
            let label = column.label;
            if (column.type == 'multi') {
                label = (<el-checkbox
                    value={this.store.isAllSelected}
                    indeterminate={this.store.indeterminate}
                    on-change={(item) => this.table.selected({isAll: item})}></el-checkbox>);
            }
            return column.checked ? (<th>
                <div class="cell" style={{'width': (this.store.bodyClientWidth == this.store.bodyScrollWidth && index==0 ? column.width : column.width - 1) + 'px'}}>{label}</div>
            </th>) : '';
        },
        renderCellFixed(column, index) {
            let label = column.label;
            return column.fixed && column.checked ? (<th>
                <div class="cell" style={{'width': (column.width - 1) + 'px'}}>{label}</div>
            </th>) : '';
        },
    }
}
