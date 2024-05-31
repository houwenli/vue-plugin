<template>
    <div class="ws-table__wrapper">
        <div class="hidden-columns" ref="hiddenColumns">
            <slot></slot>
        </div>
        <div v-if="$slots.search" class="ws-table__search">
            <slot name="search"></slot>
        </div>
        <div class="option-box clearfix">
            <slot name="options"></slot>

            <slot name="encrypt">
                <!--加密列表 需要权限控制-->
                <ws-throttle v-if="lazyQuery && $getModuleOpList(lazyQuery.moduleName)[lazyQuery.op.selectList] && $getModuleOpList(lazyQuery.moduleName)[lazyQuery.op.encryptList]">
                    <el-button type="primary" @click="isEncrypt = !isEncrypt" :plain="isEncrypt">{{!isEncrypt?'解密':'加密'}}</el-button>
                </ws-throttle>
            </slot>

            <div  class="fr ws-table__toolbar">
                <div class="searchBtns">
                    <slot name="searchBtns"></slot>
                </div>

                <div class="filterColumns" v-if="filterColumns">
                    <el-popover placement="bottom-end" trigger="click">
                    <template v-for="(item, index) in store.columns">
                        <div class="popover-headers" v-if="item.type == 'slot'">
                            <el-checkbox
                                :disabled="
                                    columnSelection.length <= 3 && item.checked
                                "
                                v-model="item.checked"
                                :label="item.label"
                                @change="handleCheckedChange"
                                :key="index"
                                >{{ item.label }}</el-checkbox
                            >
                        </div>
                    </template>
                    <el-button
                        slot="reference"
                        type="primary"
                        icon="el-icon-menu"
                        >表头</el-button
                    >
                </el-popover>
                <el-button
                    type="primary"
                    class="table-column-header-button table-column-header-button-refresh"
                    @click="resetCheckBox"
                    icon="el-icon-refresh-left"
                ></el-button>
                </div>
            </div>
        </div>

        <div :key="tableKey" class="ws-table__view" ref="tableView" v-loading="loading && tableLoading" element-loading-background="rgba(0, 0, 0, 0.2)">
            <div
                v-if="store.headerFixed"
                class="ws-table__header-wrapper"
                :style="{ top: this.topFixedRange + 'px' }"
                ref="headerWarpper"
            >
                <table-header
                    ref="tableHeader"
                    :store="store"
                    :tableData="tableData"
                ></table-header>
            </div>
            <div class="ws-table__body-wrapper" ref="bodyWarpper">
                <table-body
                    ref="tableBody"
                    :store="store"
                    :tableData="tableData"
                ></table-body>
            </div>
            <div class="empty_text" v-if="!tableData.length">
                <img src="https://wsjc-web-1301582899.cos.ap-guangzhou.myqcloud.com/oa/vue-plugin/default-table-content.png" alt />
                <p>暂无您需要的数据</p>
            </div>
            <div
                class="ws-table__footer-wrapper"
                v-if="pagination && tableData.length"
                ref="footerWarpper"
            >
                <table-footer ref="tableFooter" :store="store"></table-footer>
            </div>
        </div>

        <!--右键菜单功能-->
        <div
            v-click-outside.self="destroyContextmenu"
            ref="contextmenu"
            id="contextmenu"
        >
            <slot name="contextmenu" :row="contextmenu.row"></slot>
        </div>
    </div>
</template>

<script>
import baseMethods from "../../util/baseMethods";
import TableHeader from "./Table-header";
import TableBody from "./Table-body";
import TableFooter from "./Table-footer";
import ResizeObserver from "resize-observer-polyfill";

export default {
    name: "ws-table",
    components: {
        TableHeader,
        TableBody,
        TableFooter
    },
    props: {
        data: { type: Array, default: () => [] }, //表格数据
        total: { type: Number, default: 0 }, //表格数据条数
        pageSizeList: { type: Array, default: () => [20, 50, 100, 200] },
        filterColumns: { type: Boolean, default: true },
        indexColumn: { type: Boolean, default: true }, //表格是否显示自增index序号列
        hideColumnList: { type: Array, default: () => [] }, //表格默认屏蔽项
        pagination: { type: Boolean, default: true }, //是否需要分页组件，默认true
        pageId: { type: String, default: "" }, //分页组件为true生效，是否为pageId分页。
        pageCreateTime: { type: String, default: "" }, //分页组件为true生效，pageId分页排序规则 。
        /**lazyQuery参数配置
             * lazyQuery: {
             *    moduleName: '',
                  url: '',
                  op: {
                      selectList: 'selectList',
                      selectCount: 'selectCount',
                      encryptList: 'encryptList' // 是否为敏感列表
                  },
                  beforeQuery: this.beforeQuery,
                  afterQuery: this.afterQuery,
                  immediate: true //是否立即查询，默认true,立即查询
               }
             */
        lazyQuery: { type: Object }, //配置自动查询列表参数，参数 url 和 op 为必须参数
        loading: { type: Boolean, default: false }, //是否需要遮罩
        topFixedRange: { type: Number, default: 80 }, //流式布局flow下，表头固定距离顶部距离
        multi: { type: Boolean, default: false }, //是否需要多选框
        spanMethod: { type: Function },
        labelWidth: { type: String, default:'126px' }//表单域文字宽度
    },
    data() {
        return {
            store: {
                columns: [],
                total: 0,
                currentPage: 1, //当前页码
                pageSize: 20, //每页条数
                scrollLeft: 0, //表格scrollLeft值
                translateX: 0, //滚动条左区间值,百分比
                scrollWidth: 0, //滚动条宽度百分比
                bodyOffsetWidth: 0, //表格宽度
                bodyScrollWidth: 0,
                bodyClientWidth: 0,
                headerFixed: false, //表头是否固定
                paginationFixed: false, //表格滚动条是否固定底部
                isAllSelected: false,
                indeterminate: false,
                selection: [], //选中行数据
                spanMethod: this.spanMethod
            },
            contextmenu: {
                enable: false, //是否开启右键菜单功能
                visible: false, //右键弹窗是否可见
                row: null,
                index: null
            },
            columnSelection: [],
            tableData: [], //表格数据
            isEncrypt: false, // 加密列表控制
            tableLoading: false, //是否开启loading
            tableKey: this.rowKey(), //可通过改变key强制更新表格
        };
    },
    watch: {
        lazyQuery: {
            handler(val) {
                if (val) {
                    const selectListOp = this.$getModuleUrl(val.moduleName, val.op.selectList),
                        encryptList = this.$getModuleUrl(val.moduleName, val.op.encryptList);
                    if (!selectListOp && encryptList) this.isEncrypt = true;
                    //默认自动初始化数据，查询列表和条数op绑定一起
                    this.searchUrl = val.url || selectListOp || encryptList;
                    if (val.immediate !== false) {
                        this.$nextTick(this.search);
                    }
                }
            },
            immediate: true,
            deep: true
        },
        data: {
            handler(val) {
                this.tableData = Object.freeze(JSON.parse(JSON.stringify(val)));
                this.$nextTick(this.headerRender);
            },
            immediate: true,
            deep: true
        },
        total: {
            handler(val) {
                this.store.total = val;
            },
            immediate: true
        },
        "store.currentPage": {
            handler(val, old) {
                if (this.pageId) {
                    let data =
                        this.tableData[
                            val > old ? this.store.pageSize - 1 : 0
                        ] || [];
                    this._prevCurrentPage = {
                        next: val === 1 ? null : val - old,
                        pageId: val === 1 ? null : data[this.pageId],
                        pageCreateTime:
                            val === 1 ? null : data[this.pageCreateTime]
                    };
                }
            },
            immediate: true
        },
        "store.columns": {
            handler(val) {
                let columnSelection = [];
                for (let column of val) {
                    if (column.type == "slot" && column.checked) {
                        columnSelection.push(column.label);
                    }
                }
                this.columnSelection = columnSelection;
            },
            deep: true,
            immediate: true
        },
        isEncrypt() {
            this.$nextTick(this.search);
        },
        tableKey() {
            this.$nextTick(this.scrollX);
        }
    },
    created() {
        this.store.pageSize = this.pageSizeList[0] || 20;
        baseMethods.addHandler(window, "scroll", this.scroll, true);
        if (this.multi) {
            this.store.columns.push(this.setColumnRenders("multi"));
        }
        if (this.indexColumn) {
            this.store.columns.push(this.setColumnRenders("index"));
        }
        this.$eventBus.$on("activated", () => {
            this.search(0);
        });
    },
    mounted() {
        //检测是否开启右键功能
        if (this.$scopedSlots.contextmenu) {
            this.contextmenu.enable = true;
        }
    },
    activated() {
        this.destroy();
        baseMethods.addHandler(window, "scroll", this.scroll, true);
    },
    beforeDestroy() {
        this.destroy();
    },
    deactivated() {
        this.destroy();
    },
    methods: {
        setColumnRenders(type) {
            let columns = {
                type: type,
                label: type == "index" ? "序号" : null,
                align: "center",
                checked: true
            };
            columns.renderCell = data => {
                let children = null;
                let { row, column, rowIndex } = data;
                let columnIndex =
                    rowIndex +
                    (this.store.currentPage - 1) * this.store.pageSize +
                    1;
                let columnMulti = (
                    <el-checkbox
                        value={this.store.selection.includes(rowIndex)}
                        on-change={selected =>
                            this.selected({ selected, rowIndex })
                        }
                    ></el-checkbox>
                );

                return column.checked ? (
                    <td style={{ "text-align": column.align, width: "75px" }}>
                        <div class="cell">
                            {type == "index" ? columnIndex : columnMulti}
                        </div>
                    </td>
                ) : (
                    ""
                );
            };
            return columns;
        },
        selected(options) {
            let { selected, rowIndex: index, isAll } = options;
            let store = this.store;
            if (isAll === true) {
                store.isAllSelected = true;
                store.indeterminate = false;
                store.selection = new Array(this.tableData.length)
                    .fill(null)
                    .map((item, index) => index);
                return this.$emit(
                    "selection-change",
                    store.selection.map(rIndex => this.tableData[rIndex])
                );
            }
            if (isAll === false) {
                store.isAllSelected = false;
                store.indeterminate = false;
                store.selection = [];
                return this.$emit("selection-change", []);
            }
            if (selected) {
                store.selection = [...store.selection, index].sort();
            } else {
                let ind = store.selection.indexOf(index);
                ind > -1 && store.selection.splice(ind, 1);
            }
            this.store.isAllSelected = !!(
                store.selection.length &&
                store.selection.length === this.tableData.length
            );
            this.store.indeterminate = !!(
                store.selection.length &&
                store.selection.length !== this.tableData.length
            );
            this.$emit(
                "selection-change",
                store.selection.map(rIndex => this.tableData[rIndex])
            );
        },
        clearSelection() {
            this.selected({ isAll: false });
        },
        scroll(event) {
            this.destroyContextmenu();
            //#table scrollX
            if (
                event.target.nodeName === "DIV" &&
                event.target.className === "ws-table__body-warp"
            ) {
                this.scrollX(event);
            }
            //#document scrollY
            if (event.target.nodeName === "#document") {
                this.scrollY(event);
            }
        },
        scrollX() {
            if (!this.$refs.tableBody) return;
            let target = this.$refs.tableBody.$el;
            this.store.scrollLeft = target.scrollLeft;
            this.store.translateX =
                (target.scrollLeft * 100) / target.clientWidth || 0;
            this.store.scrollWidth =
                (target.clientWidth * 100) / target.scrollWidth || 0;
        },
        scrollY() {
            if (!this.$refs.bodyWarpper) return;
            let clientHeight =
                window.innerHeight || document.documentElement.clientHeight;
            let {
                top,
                bottom
            } = this.$refs.bodyWarpper.getBoundingClientRect();
            this.store.headerFixed =
                top < this.topFixedRange && bottom - 50 > this.topFixedRange;
            if (this.pagination) {
                this.store.paginationFixed =
                    bottom + 60 > clientHeight && top < clientHeight - 60;
            }
        },
        headerRender() {
            let $el = this.$refs.tableBody.$el;
            let tr = $el.firstChild.lastChild.firstChild;
            let td = (tr && tr.children) || [];
            let arr = Array.from(td).map(node => node.offsetWidth);
            arr.length && this.store.columns.map(item => item.checked && (item.width = arr.shift()));

            // 监听table宽度变化
            const tableBody = new ResizeObserver((entries, observer) => {
                for (const event of entries) {
                    this.store.bodyOffsetWidth = event.target.offsetWidth;
                    this.store.bodyClientWidth = event.target.clientWidth;
                    this.store.bodyScrollWidth = event.target.scrollWidth;
                    this.scrollX();
                }
            });
            this.scrollY();
            tableBody.observe($el);
        },
        commitStore(type, data) {
            this.store[type] = data;
        },
        //右键点击表格行事件
        rightContextmenu(event, row, index) {
            if (!this.contextmenu.enable) {
                return false;
            }
            //阻止浏览器默认右键行为
            if (event.preventDefault) {
                event.preventDefault(); //标准格式
            } else {
                event.returnValue = false; //IE格式
            }
            this.contextmenu.row = row;
            this.$refs.contextmenu.style.cssText = `display: block;left: ${event.clientX}px;top: ${event.clientY}px`;
            if (!this.contextmenu.visible) {
                document.body.appendChild(this.$refs.contextmenu);
                this.contextmenu.visible = true;
            }
        },
        //关闭右键菜单
        destroyContextmenu() {
            if (!this.contextmenu.enable || !this.contextmenu.visible) {
                return false;
            }
            document.body.removeChild(this.$refs.contextmenu);
            this.contextmenu.visible = false;
        },

        /********************************table-column 切换显示隐藏事件******************************************/
        insertColumn(column) {
            let checked = true;
            if (this.filterColumns) {
                this._tableColumns =
                    this._tableColumns ||
                    baseMethods.getStore(baseMethods.getPrefix()+"-tableColumns") ||
                    {};
                let showColumns = this._tableColumns[this.$route.path] || [];
                checked = showColumns.length
                    ? showColumns.includes(column.label)
                    : !this.hideColumnList.includes(column.label);
            }
            column.checked = checked;
            this.store.columns.push(column);
            let columnsFixed = [];
            let columns = this.store.columns.filter(column => {
                if (column.fixed) {
                    columnsFixed.push(column);
                }
                return !column.fixed;
            });
            this.store.columns = [...columns, ...columnsFixed];
        },
        //重置table-column 显示状态
        resetCheckBox() {
            this.store.columns.map(
                column =>
                    (column.checked = !this.hideColumnList.includes(
                        column.label
                    ))
            );
            this.handleCheckedChange();
        },
        //table-column 切换显示隐藏
        handleCheckedChange() {
            this.tableKey = this.rowKey();
            let tableColumns = baseMethods.getStore(baseMethods.getPrefix()+"-tableColumns") || {};
            tableColumns[this.$route.path] = this.store.columns
                .filter(item => item.label && item.checked)
                .map(item => item.label);
            baseMethods.setStore(baseMethods.getPrefix()+"-tableColumns", tableColumns);
            this.$nextTick(this.headerRender);
        },

        /********************************table-column 切换显示隐藏事件End******************************************/
        destroy() {
            //每当路由发生`变化，则销毁绑定的scroll事件
            baseMethods.removeHandler(window, "scroll", this.scroll, true);
            //如果开启右键功能 ，页面跳转则关闭右键菜单
            this.destroyContextmenu();
        },
        //页面切换触发事件
        handleCurrentChange() {
            this.selected({ isAll: false });

            //可手动触发表格更新
            let opt = {
                currentPage: this.store.currentPage, //翻页后页码
                pageSize: this.store.pageSize //当前每页条数
            };
            this.$nextTick(() => {
                if (this.pagination && this.pageId) {
                    opt = { ...opt, ...this._prevCurrentPage };
                }
                this.$emit("currentChange", opt);
                if (this.lazyQuery) {
                    this.search(0);
                }
            });
        },
        //重置搜索条件 type=true重置并搜索，false则只重置条件
        reset(type = true) {
            this.$parent.searchOptions = _.cloneDeep(this._searchOptions);
            type && this.search();
        },
        //type 0:只查询list，1：查询list && count ，2：重置页码并查询list && count
        search(type = 2) {
            let query = this.lazyQuery || {};
            let param = this.$parent.searchOptions || {};

            if (typeof query.beforeQuery === "function") {
                if (!query.beforeQuery()) {
                    return;
                }
                param = query.beforeQuery() || param;
            }
            if (!this._searchOptions) {
                this._searchOptions = _.cloneDeep(param);
            }
            if (!this.searchUrl || !query.op || (!query.op.selectList && !query.op.encryptList)) {
                this.$message.error("您暂未开通查看此列表权限！");
                return false;
            }
            type === 2 && (this.store.currentPage = 1);
            let opt = {
                pageSize: this.store.pageSize,
                currentPage: this.store.currentPage,
                sort: query.sort,
                body: param
            };
            if (query.params && Object.keys(query.params).length) {
                Object.assign(opt, query.params);
            }
            if (!query.sort) {
                delete opt.sort;
            }

            this.$nextTick(() => {
                if (this.pagination && this.pageId) {
                    opt = { ...opt, ...this._prevCurrentPage };
                }
                let op = query.url ? query.op.selectList : (this.isEncrypt ? query.op.encryptList : (this.$getModuleUrl(query.moduleName, query.op.selectList) ? query.op.selectList : query.op.encryptList))
                this.initTable(op, opt);
                if (type && query.op.selectCount) {
                    this.initTable(query.op.selectCount, opt);
                }
            });
        },
        initTable(op, opt) {
            let options = {
                data: opt,
                op: op
            };
            // 请求前先清空数据，避免后面请求失败时显示之前的数据
            this.tableData = [];
            this.tableLoading = true;
            this.$axios(this.searchUrl, options)
                .then(res => {
                    if (op == this.lazyQuery.op.selectList || op == this.lazyQuery.op.encryptList) {
                        let data = JSON.parse(res.data);
                        if (typeof this.lazyQuery.afterQuery === "function") {
                            data = this.lazyQuery.afterQuery(data);
                        }
                        if (!this.lazyQuery.op.selectCount) {
                            this.store.total = parseInt(data.count) || 0;
                        }
                        if (data && !Array.isArray(data)) {
                            data = data.body || [];
                        }
                        this.tableData = Object.freeze(data);
                        this.tableLoading = false;
                    }
                    if (op == this.lazyQuery.op.selectCount) {
                        let count = JSON.parse(res.data);
                        if (baseMethods.typeOf(count) === "object") {
                            count = count.count;
                        }
                        this.store.total = +count;
                    }

                    if (this.pageId && !this.lazyQuery.op.selectCount) {
                        //pageId为true 不存在selectCount  根据返回数量计算临时总数
                        let { pageSize, currentPage } = this.store;
                        this.store.total =
                            parseInt(
                                this.tableData.length < pageSize
                                    ? currentPage
                                    : currentPage + 1
                            ) * pageSize;
                    }
                    this.selected({ isAll: false });
                    this.$nextTick(this.headerRender);
                })
                .catch(err => {
                    this.tableData = [];
                    this.tableLoading = false;
                });
        },
        //删除操作
        delData(op, url, data) {
            let opt = {
                data,
                op
            };
            this.$confirm("确定要删除吗", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                center: true
            }).then(() => {
                this.$axios(url, opt).then(res => {
                    this.$message.success("删除成功");
                    this.search();
                });
            });
        },
        //修改状态,注意 此方法不再使用
        updateStatus(op, url, data, type = 1) {
            //1上线 0下线'。0：启用 1：停用
            let opt = {
                data,
                op
            };
            let status = data.status || data.state;
            let msg = {
                1: status ? "上线" : "下线",
                2: status ? "停用" : "启用"
            }[type];
            this.$confirm(`确定要${msg}吗`, "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
                center: true
            }).then(() => {
                this.$axios(url, opt).then(res => {
                    this.$message.success(`${msg}成功`);
                    this.search(1);
                });
            });
        },
        rowKey() {
            return (
                (Math.random() * 10000000).toString(16).substr(0, 4) +
                '-' +
                new Date().getTime() +
                '-' +
                Math.random()
                    .toString()
                    .substr(2, 5)
            );
        },
    }
};
</script>

<style lang="scss">
.ws-table__wrapper {
    .ws-table__header-wrapper {
        position: fixed;
        z-index: 2;

        .ws-table-header-fixed{
            tr th{
                border-left: none !important;
            }
        }

        .ws-table-header__warp {
            overflow: hidden;
            position: absolute;
            background: rgb(240, 242, 245);
            z-index: -1;
            border: 1px solid #DCDFE6;


            tr th {
                background: rgb(240, 242, 245);
                line-height: 49px;
                color: #333333;
                font-weight: 500;
                border-right: 1px solid #DCDFE6;
                &:last-child{
                    border-right: 0;
                }
            }

            .ws-table-header {
                //margin-left: 1px;
            }

            .ws-table-header-fixed {
                background: rgb(240, 242, 245);
                position: absolute;
                top: 0;
                right: 0;
            }
        }
    }

    .ws-table__body-warp {
        position: relative;
        width: 100%;
        overflow-y: auto;
        white-space: nowrap;
        border: 1px solid #DCDFE6;
        table {
            min-width: 100%;

            tr.current-row {
                background-color: #ecf5ff !important;
            }

            tbody tr:nth-child(odd) {
                /* 匹配奇数行 */
                background-color: #fff;
            }

            tbody tr:nth-child(even) {
                /* 匹配偶数行 */
                background-color: #fafafa;
            }

            tr td,
            tr th {
                height: 50px;
                border-right: 1px solid #DCDFE6;
                padding: 0 15px;
                &:last-child{
                    border-right: 0;
                }
            }
            tr th {
                .cell {
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    color: #333333;
                    font-weight: 500;
                }
            }
            tr td {
                .cell {
                    //white-space: normal;
                    color: #606266;
                    font-weight: 500;
                }
            }

            tr th {
                background: rgb(240, 242, 245);
            }
        }

        .ws-table__column-fixed {
            position: absolute;
            top: 0;
            right: 0;
            min-width: auto !important;
        }
    }

    .ws-table__footer-wrapper {
        height: 60px;

        .ws-table__footer-pagination {
            height: 60px;
            padding: 15px 0;
            position: relative;
            z-index: 2;

            .el-pagination {
                margin-left: 15px;
                text-align: right;
            }
        }

        .ws-table__footer-pagination-fixed {
            top: -14px;
            background: none;
        }

        //表格虚拟滚动条样式
        .ws-table__scroll-bar-warp {
            position: absolute;
            z-index: 1;
            height: 20px;
            background: #fff;

            .ws-table__scroll-bar-view {
                height: 10px;
                border-radius: 8px;
                cursor: pointer;
                background-color: rgba(144, 147, 153, 0.7);
            }
        }
    }

    //表格搜索框样式
    .ws-table__search {
        margin: 20px 0;
        padding: 0 20px 20px;
        border: 1px solid #d9d9d9;
        border-radius: 8px;
        background: #f0f2f5;

        .search_group {
            display: inline-block;
            margin-right: 50px;
            margin-top: 20px;
            line-height: 1;
            label{
                display: inline-block;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                word-break: break-all;
                text-align: right;
            }
            .el-input {
                width: 200px;
            }
        }
    }

    .option-box {
        margin-bottom: 24px;
    }
    .searchBtns{
        margin-right: 20px;
    }

    .ws-table__toolbar{
        display: flex;
    }

    .table-column-header-button {
        padding: 12px;
    }

    .table-column-header-button-refresh {
        position: relative;
        left: -3px;
        border-left-color: rgba(255, 255, 255, 0.5);
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;

        &:hover {
            border-left-color: rgba(255, 255, 255, 0.5);
        }

        &:focus {
            border-left-color: rgba(255, 255, 255, 0.5);
        }
    }

    .el-pager li {
        background: none;
    }

    .el-pagination button:disabled {
        background: none;
    }

    .el-pagination .btn-next,
    .el-pagination .btn-prev {
        background: none;
    }
}

.empty_text {
    text-align: center;
    margin-top: 30px;

    p {
        margin-top: 10px;
        color: #4e5052;
    }
}

.el-pager {
    font-weight: 500;
    font-size: 14px;
    color: #606266;
}

.popover-headers {
    padding: 3px 5px;
}

#contextmenu {
    display: none;
    position: fixed;
    min-width: 100px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fff;
    padding: 5px 10px;
    font-size: 14px;
    color: #606266;
    line-height: 24px;
    z-index: 999;
}
</style>
