import baseMethods from '../../util/baseMethods';


export default {
    name: 'ws-table-column',
    props: {
        label: String,
        prop: String,
        align: String,
        formatter: Function,
        renderCell: Function,
        rowSpan: Boolean,
        fixed: Boolean,
    },
    data() {
        return {}
    },
    computed: {
        table() {
            return this.$parent;
        },
    },
    created() {
        this.setColumnRenders();
    },
    render(h) {
        return h('div', this.$slots.default);
    },
    methods: {
        setColumnRenders() {
            let columns = {
                ...this.$props,
                type: 'slot',
                align: 'center',
                checked: true,  //是否显示
                renderCell: this.renderCell || this.renderCellColumn,
            }
            this.table.insertColumn(columns);
        },
        renderCellColumn(data, fixed) {
            let children = null;
            let { row, column, rowIndex, columnIndex, } = data;
            if (this.$scopedSlots.default) {
                children = this.$scopedSlots.default(data);
            }
            const label = column.formatter ? column.formatter(row, column, row[column.prop], rowIndex) : row[column.prop];
            const width = parseInt((this.$attrs['width'] || this.$attrs['min-width'])) + 'px'
            return column.checked ? (<td style={{ 'text-align': column.align, width: width, 'min-width': width }}>
                <div class="cell">{children || label}</div>
            </td>) : '';
        }
    },

}
