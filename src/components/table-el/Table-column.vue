<template>
    <el-table-column
        ref="elTableColumn"
        v-if="($scopedSlots.default || $scopedSlots.header) && columnVisible"
        :min-width="columnWidth"
        :key="$attrs.prop"
        :class-name="columnClassName"
        :align="$parent.$parent.align"
        v-bind="$attrs"
        v-on="$listeners"
    >
        <template slot-scope="scope">
            <slot :row="scope.row" :$index="scope.$index">{{ scope.row[$attrs.prop] }}</slot>
        </template>
        <template slot="header" slot-scope="scope">
            <slot name="header" :column="scope.column" :$index="scope.$index">{{ $attrs.label }}</slot>
        </template>
    </el-table-column>
    <el-table-column
        v-else-if="!$scopedSlots.default && !$scopedSlots.header && columnVisible"
        :min-width="columnWidth"
        :align="$parent.$parent.align"
        :class-name="columnClassName"
        v-bind="$attrs"
        :key="$attrs.prop"
        v-on="$listeners"
    ></el-table-column>
</template>

<script>
export default {
    name: 'ws-table-column-el',
    data() {
        return {
            columnWidthInit: 0
        };
    },
    computed: {
        columnVisible() {
            let checkedList = this.$parent.$parent.checkedColumnList || [];
            return checkedList.includes(this.$attrs.label);
        },
        // table数据
        columnData() {
            let data = this.$parent.$parent.tableData || [];
            return data.map(item => item[this.$attrs.prop]);
        },
        columnWidth() {
            return this.$attrs.width || this.$attrs['min-width'] || this.columnWidthInit;
        },
        // 为存在scope的添加className
        columnClassName() {
            const parentClass = this.$attrs['class-name'] || '';
            const classPre = this.$attrs.prop || `encode-${this.transChar(this.$attrs.label)}`; // 有的列因为有slotScope而不给prop
            return classPre ? `${parentClass} ${classPre}-column` : '';
        }
    },
    watch: {
        columnData: {
            immediate: true,
            handler(val) {
               if(! val.length) return
                this.$nextTick(() => {
                    this.getWidth();
                });
            }
        }
    },
    methods: {
        // 转换汉字为class支持的字母
        transChar(char) {
            return encodeURIComponent(char).replace(/[^a-zA-z]/g, 'eUC');
        },

        // 获取列宽
        getWidth() {
            // 表头宽度，每列默认宽度
            let labelWidth = this.getTextWidthByCanvas(this.$attrs.label);
            let columnWidth = 80;
            if (this.$scopedSlots.default) {
                // 存在自定义节点
                // 可能存在贴边列, 需要使用包含 fixed 的类名
                const bodyWrapper = this.$attrs.fixed
                    ? document
                          .querySelector(`.el-table__fixed${this.$attrs.fixed === 'right' ? `-${this.$attrs.fixed}` : ''}`)
                          .querySelector('.el-table__fixed-body-wrapper')
                    : document.querySelector('.el-table__body-wrapper');
                const nodes = bodyWrapper.querySelectorAll(`.${this.$attrs.prop || `encode-${this.transChar(this.$attrs.label)}`}-column`);
                if (nodes.length) {
                    let getComputedWidths = [...nodes].map(item => {
                        if(this.$attrs.label==='操作'){
                            let Obtns=item.querySelectorAll('button')
                            let buttonWidth=[...Obtns].reduce((total,cur)=>{
                                return cur.offsetWidth+total
                            },0)
                        return buttonWidth+[Obtns.length-1]*10//加上按钮之间的margin
                        }else{
                            return this.getTextWidthByCanvas(item.innerText)
                        }
                    });
                    // this.getTextWidth(item.innerText)
                    columnWidth = Math.max(labelWidth, ...getComputedWidths);
                    // 这里直接给columnWidth赋值DOM宽度不会调整
                }
                this.columnWidthInit = columnWidth + 24;
            } else {
                let columnWidths = this.columnData.map(item => this.getTextWidthByCanvas(item));
                this.columnWidthInit = Math.max(labelWidth, ...columnWidths) + 32; //加上表格的内边距
            }
        },
        // 获取文本实际宽度
        getTextWidth(val) {
            let span = document.createElement('span');
            span.innerText = val;
            span.style.visibility = 'hidden';
            document.body.appendChild(span);
            let width = span.getBoundingClientRect().width;
            document.body.removeChild(span);
            return width;
        },
        getTextWidthByCanvas(text, font = '14px "Microsoft YaHei"') {
            text = (text===null||text===undefined)?'':text.toString();
            if (text.includes('\n')) {
                // 这里从性能方面考虑就只是进行字符长度的比较，而不是递归查询渲染后的真实宽度
                text = text.split('\n').reduce((pre, cur) => {
                    return pre.length > cur.length ? pre : cur;
                });
            }
            // 使用canvas能极大提高性能
            let canvas = this.getTextWidthByCanvas.canvas || (this.getTextWidthByCanvas.canvas = document.createElement('canvas'));
            let context = canvas.getContext('2d');
            context.font = font;
            let metrics = context.measureText(text);
            return metrics.width;
        }
    }
};
</script>
