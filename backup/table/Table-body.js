export default {
    name: 'ws-table-body',
    props: {
        store: {
            required: true
        },
        tableData: {type: Array, default: () => []},     //表格数据
    },
    data() {
        return {
            currentIndex: null
        }
    },
    computed: {
        table() {
            return this.$parent;
        },
        columnFixedStyle(){
            let {scrollLeft,bodyClientWidth,bodyScrollWidth} = this.store;
            let left = scrollLeft == bodyScrollWidth - bodyClientWidth;
            return {
                display: left ? 'none' : 'block',
                transform: `translateX(${scrollLeft}px)`,
                'box-shadow': left ? '' : '0 0 10px rgba(0,0,0,.12)'
            }
        }
    },
    render() {
        return (
            <div class="ws-table__body-warp">
                <table class="ws-table__body" ref="tableBody" cellspacing="0" cellpadding="0" border="0">
                    <thead>
                    <tr>
                        {
                            this.store.columns.map((column, index) => this.renderHeader(column, index))
                        }
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.tableData.map((row, rowIndex) => this.renderRow(row, rowIndex))
                    }
                    </tbody>
                </table>
                <table class="ws-table__body ws-table__column-fixed" ref="columnFixed" cellSpacing="0"
                       style={this.columnFixedStyle}
                       cellPadding="0" border="0">
                    <thead>
                    <tr>
                        {
                            this.store.columns.map((column, index) => this.renderHeaderCellFixed(column, index))
                        }
                    </tr>
                    </thead>
                    <tbody>
                    {
                        this.tableData.map((row, index) => (<tr
                            class={{'current-row': this.currentIndex === index}}
                            on-mousedown={($event) => this.mousedown($event, row, index)}>
                            {
                                this.store.columns.reduce((curr, column) => this.renderCellFixed(curr, {row, column, index}), [])
                            }
                        </tr>))
                    }
                    </tbody>
                </table>
            </div>
        )
    },
    methods: {
        renderRow(row, rowIndex){
            return (<tr
                class={{'current-row': this.currentIndex === rowIndex}}
                on-mousedown={($event) => this.mousedown($event, row, rowIndex)}>
                {this.store.columns.map((column, columnIndex) => column.renderCell({row, column, rowIndex,columnIndex}))}
            </tr>)
        },
        renderHeader(column, index) {
            let label = column.label;
            if (column.type == 'multi') {
                label = (<el-checkbox
                    value={this.store.isAllSelected}
                    indeterminate={this.store.indeterminate}
                    on-change={(item) => this.table.selected({isAll: item})}>
                </el-checkbox>);
            }
            return column.checked ? (<th>
                <div class="cell">{label}</div>
            </th>) : '';
        },
        renderCellFixed(curr,data) {
            let {row, column, index} = data;
            if (column.fixed && column.checked) {
                curr.push(column.renderCell(data,true));
            }
            return curr;
        },
        renderHeaderCellFixed(column,index) {
            let label = column.label;
            return column.checked && column.fixed ? (<th>
                <div class="cell" style={{'width': (column.width - 31) + 'px'}}>{label}</div>
            </th>) : '';
        },
        mousedown(event, row, index) {
            this.currentIndex = index;
            if (event.button === 2) {
                this.table.rightContextmenu(event, row, index);
            }
        }
    }
}
