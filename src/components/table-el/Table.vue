<template>
    <div class="ws-table-warp" ref="tableWrap">
        <div class="search-wrap" ref="searchWrap" v-if="$slots.search">
            <!-- <el-row :gutter="gutter" type="flex"> -->
            <slot name="search"></slot>
            <!-- </el-row> -->
            <!-- <el-row :gutter="0" type="flex" justify="end"> -->
            <SearchBtn></SearchBtn>
            <!-- </el-row> -->
        </div>

        <div class="option-box clearfix" v-if="$slots.options || $slots.encrypt || $slots.searchBtns">
            <slot name="options"></slot>

            <slot name="encrypt">
                <!--加密列表 需要权限控制-->
                <!-- 这里不能使用$getModuleUrl去判断，encryptList不存在时，会清掉moduleName -->
                <ws-throttle
                    v-if="
                        lazyQuery &&
                        ($getModuleOpList(lazyQuery.moduleName)[lazyQuery.op.selectList]||$getBaseMenuList()[lazyQuery.op.selectList]) &&
                        ($getModuleOpList(lazyQuery.moduleName)[lazyQuery.op.encryptList]||$getBaseMenuList()[lazyQuery.op.encryptList])
                    "
                >
                    <el-button type="primary" @click="isEncrypt = !isEncrypt" :plain="isEncrypt">{{ !isEncrypt ? '解密' : '加密' }}</el-button>
                </ws-throttle>
            </slot>

            <div class="fr ws-table__toolbar">
                <div class="searchBtns clearfix">
                    <slot name="searchBtns"></slot>
                </div>
                <div class="filterColumns" v-if="filterColumns">
                    <el-popover placement="bottom-end" trigger="click">
                        <el-checkbox-group v-model="checkedColumnList" @change="handleCheckedChange" :min="4">
                            <div class="popover-headers" v-for="(item, index) in columnList" :key="index">
                                <el-checkbox :label="item" :key="index">
                                    {{ item }}
                                </el-checkbox>
                            </div>
                        </el-checkbox-group>
                        <el-button slot="reference" style type="primary" icon="el-icon-menu">表头</el-button>
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

        <!--空数据表头-->
        <div
            class="empty-table"
            ref="emptyTable"
            v-loading="tableLoading"
            element-loading-background="rgba(0, 0, 0, 0.2)"
            v-show="!tableData.length"
            :style="{ height: tableHeight }"
        >
            <table class="el-table empty_table_header">
                <thead class="has-gutter">
                    <tr class>
                        <th class="table_header" v-for="(item, index) in emptyColumnList" :key="index">
                            <div class="cell">{{ item }}</div>
                        </th>
                    </tr>
                </thead>
            </table>
            <div class="empty_text">
                <img src="https://wsjc-web-1301582899.cos.ap-guangzhou.myqcloud.com/oa/vue-plugin/default-table-content.png" alt />
                <p>{{ emptyText }}</p>
            </div>
        </div>
        <div v-show="tableData.length">
            <div ref="tableView">
                <!--固定顶部表头-->
                <template v-if="layout == 'flow'">
                    <div :style="clientRectHeader" v-show="isShowFixedHeader" class="fixed_header_warp">
                        <div v-if="multi" ref="fixedHeaderCheckbox" class="fixed_table_header_checkbox">
                            <el-checkbox :indeterminate="isIndeterminate" v-model="isAllChecked" @change="handleCheckAllChange"></el-checkbox>
                        </div>
                        <div ref="fixedHeader" class="fixed_table_header el-table el-table--striped el-table--border el-table__header-wrapper"></div>
                    </div>
                </template>
                <el-table
                    :key="tableKey"
                    ref="elTable"
                    :class="layout"
                    @select="tableSelect"
                    @select-all="tableSelectAll"
                    @row-contextmenu="rightContextmenu"
                    @row-click="rowClick"
                    :data="tableData"
                    border
                    stripe
                    :empty-text="emptyText"
                    :[attr]="tableHeight"
                    v-loading="tableLoading"
                    element-loading-background="rgba(0, 0, 0, 0.2)"
                    header-cell-class-name="table_header"
                    v-bind="receivedAttrs"
                    v-on="$listeners"
                >
                    <el-table-column
                        v-if="multi"
                        column-key="selection"
                        key="selection"
                        :align="align"
                        type="selection"
                        width="60"
                        :selectable="selectable"
                        reserve-selection
                    ></el-table-column>
                    <el-table-column
                        v-if="isShowIndexColumn"
                        key="index"
                        :align="align"
                        label="序号"
                        type="index"
                        width="75"
                        :index="indexFormat"
                    ></el-table-column>
                    <template v-if="columns">
                        <template v-for="(item, index) of showColumns">
                            <el-table-column :align="align" v-if="item.type && item.type === 'slot' && item.slotName === item.prop + '-header'">
                                <template slot="header" slot-scope="scope">
                                    <slot :name="item.prop + '-header'" v-bind="scope"></slot>
                                </template>
                            </el-table-column>
                            <el-table-column v-else :align="align" v-bind="item">
                                <template v-if="!item.type || (item.type && item.slotName !== item.prop + '-header')" slot-scope="scope">
                                    <slot v-if="item.type === 'slot'" :name="item.slotName" v-bind="scope"></slot>
                                    <component
                                        v-else
                                        :is="item.type ? 'table-' + item.type : 'table-text'"
                                        :prop="item.prop"
                                        :data="scope.row"
                                        :item="item"
                                    ></component>
                                </template>
                            </el-table-column>
                        </template>
                    </template>
                    <slot v-if="$slots.default"></slot>
                </el-table>
            </div>

            <!--固定底部分页组件-->
            <template v-if="showPagination && layout == 'flow' && paginationFlag">
                <div :style="clientRectPagination" v-show="isShowFixedPagination" class="pagination-fixed pagination-warp" ref="paginationFixed">
                    <el-pagination
                        :disabled="tableLoading"
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange()"
                        :current-page.sync="currentPage"
                        :page-sizes="pageSizeList"
                        :page-size="pageSize"
                        :layout="layoutList"
                        :total="tableTotal"
                    >
                        <span class="tc" v-if="lazyQuery && lazyQuery.op.selectCount">
                            {{ currentPage + ' / ' + pageNumbers }}
                        </span>
                        <span class="tc" v-else>{{ currentPage }}</span>
                    </el-pagination>
                </div>
            </template>
            <!--分页组件-->
            <div v-if="showPagination && paginationFlag" class="paginationClass pagination-warp" ref="pagination">
                <table-scroll-bar
                    v-if="layout == 'flow'"
                    :isShowFixedPagination="isShowFixedPagination"
                    :style="scrollBarStyle"
                    v-show="scrollWidth > 0 && scrollWidth < 100"
                    :scrollLeft="scrollLeft"
                    :scrollWidth="scrollWidth"
                ></table-scroll-bar>
                <el-pagination
                    :disabled="tableLoading"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange()"
                    :current-page.sync="currentPage"
                    :page-sizes="pageSizeList"
                    :page-size="pageSize"
                    :layout="layoutList"
                    :total="tableTotal"
                    v-bind="$attrs.paginationa"
                    v-on="$attrs.paginationa"
                >
                    <span class="tc" v-if="lazyQuery && lazyQuery.op.selectCount">
                        {{ currentPage + ' / ' + pageNumbers }}
                    </span>
                    <span class="tc" v-else>{{ currentPage }}</span>
                </el-pagination>
            </div>
        </div>
        <!--右键菜单功能-->
        <div v-click-outside.self="destroyContextmenu" ref="contextmenu" id="contextmenu">
            <slot name="contextmenu" :row="scopeRow"></slot>
        </div>
    </div>
</template>

<script>
import baseMethods from '../../util/baseMethods';
import TableScrollBar from './Table-scroll-bar.vue';
import ResizeObserver from 'resize-observer-polyfill';
import Global from '../../store/global';
import SearchBtn from './SearchBtn.vue';
const files = require.context('./render/', false, /\.vue$/);
const modules = {};
files.keys().forEach(item => {
    const _name = 'table-' + item.replace(/(.*\/)*([^.]+).*/gi, '$2').toLowerCase();
    const _component = files(item).default || files(item);
    modules[_name] = _component;
});

export default {
    name: 'ws-table-el',
    components: {
        TableScrollBar,
        SearchBtn,
        ...modules
    },
    props: {
        data: { type: Array, default: () => [] }, //表格数据
        total: { type: Number, default: 0 }, //表格数据条数
        pageSizeList: { type: Array, default: () => [20, 30, 40, 50] },
        filterColumns: { type: Boolean, default: true },
        indexColumn: { type: Boolean, default: true }, //表格是否显示自增index序号列
        hideColumnList: { type: Array, default: () => [] }, //表格默认屏蔽项
        emptyModel: { type: Boolean, default: true }, //表格无数据时显示样式模板，默认显示表格，true显示表格图片
        emptyText: { type: String, default: '暂无您需要的数据' }, //表格无数据时显示内容
        pagination: { type: [Boolean, Object], default: true }, //是否需要分页组件，默认true
        pageId: { type: String, default: '' }, //分页组件为true生效，是否为pageId分页。
        pageCreateTime: { type: String, default: '' }, //分页组件为true生效，pageId分页排序规则 。
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
        loading: { type: Boolean, default: true }, //是否需要遮罩
        layout: { type: String, default: 'fixed' }, //布局方式，默认固定高度布局fixed， 流式布局flow,无固定高度
        topFixedRange: { type: Number, default: 0 }, //流式布局flow下，表头固定距离顶部距离，layout为fixed下无效
        multi: { type: Boolean, default: false }, //是否需要多选框
        selectable: { type: Function, default: () => true }, //多选框是否禁用
        labelWidth: { type: String, default: '126px' }, //表单域文字宽度
        col: { type: Number, default: 8 }, //栅格占据的列数
        gutter: { type: Number, default: 40 }, //栅格间隔
        align: { type: String, default: 'left' }, //对齐方式
        columns: { type: Array, default: () => [] }, //表格数据
        autoHeight: { type: Boolean, default: true } //高度是否自适应（列表页使用）
    },
    data() {
        return {
            isShowIndexColumn: false, //是否显示index 列
            tableLoading: false, //是否开启loadding
            tableData: [], //表格数据
            tableTotal: 0, //条数
            currentPage: 1, //当前页码
            pageSize: 20, //每页条数
            isShowFixedPagination: false, //flow模式下生效，是否显示固定分页组件，
            isShowFixedHeader: false, //flow模式下生效，是否显示固定表头
            tableViewClientRect: {}, //flow模式下生效，表格位置
            keepalived: true, //flow模式下生效，是否为缓存组件
            isAllChecked: false, //flow模式下生效，多选模式下是否全选
            isIndeterminate: false, //flow模式下生效，多选模式下是否半选状态
            enableContextmenu: false, //是否开启右键菜单功能
            contextmenuVisible: false, //右键弹窗是否可见
            scopeRow: {}, //右键选择行数据,右键开启下生效
            checkedColumnList: [], //选中显示表格列
            columnList: [], //表格列
            scrollLeft: 0, //表格自定义滚动条偏移量
            scrollWidth: 0, //表格自定义滚动条宽度
            tableScrollLeft: 0, //表格自身偏移量
            scrollWarp: null, //表格滚动区域元素
            tableKey: this.rowKey(), //可通过改变key强制更新表格
            isEncrypt: false, // 加密列表控制
            originSearchOptions: null, //缓存初始查询条件
            tableHeight: 'auto',
            paginationFlag: true, //是否展示分页信息
            defaultSlotList: ['default'],
            attr: 'max-height', //行高是自定义的，并非标准medium对应的高度，直接设置height=auto，计算会有误差
            $tableBodyObserver: null
        };
    },
    watch: {
        lazyQuery: {
            handler(val) {
                if (val) {
                    //默认自动初始化数据，查询列表和条数op绑定一起
                    this.searchUrl = val.url || this.$getModuleUrl(val.moduleName, val.op.selectList) || this.$getModuleUrl(val.moduleName, val.op.encryptList);
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
                if (this.layout == 'flow') {
                    this.$nextTick(this.scrollY);
                }
            },
            immediate: true,
            deep: true
        },
        pageSizeList: {
            handler(val) {
                this.pageSize = parseInt(val[0]) || 20;
            },
            immediate: true,
            deep: true
        },
        currentPage: {
            handler(val, old) {
                if (this.pageId) {
                    let data = this.tableData[val > old ? this.pageSize - 1 : 0];
                    this._prevCurrentPage = {
                        next: val === 1 ? null : val - old,
                        pageId: val === 1 ? null : data[this.pageId],
                        pageCreateTime: val === 1 ? null : data[this.pageCreateTime]
                    };
                }
            },
            immediate: true
        },
        indexColumn: {
            handler(val) {
                this.isShowIndexColumn = val;
            },
            immediate: true
        },
        total: {
            handler(val) {
                this.tableTotal = val;
            },
            immediate: true
        },
        checkedColumnList: {
            handler(val) {
                if (this.filterColumns) {
                    let tableColumns = baseMethods.getStore(baseMethods.getPrefix() + '-tableColumns') || {};
                    tableColumns[this.$route.path] = val;
                    baseMethods.setStore(baseMethods.getPrefix() + '-tableColumns', tableColumns);
                }
            },
            deep: true
        },
        isEncrypt() {
            this.$nextTick(this.search);
        },
        tableScrollLeft() {
            this.setHeaderTranslateX();
        },
        tableKey() {
            this.$nextTick(this.scrollX);
        },
        autoHeight: {
            handler(val) {
                !val && (this.attr = '');
            },
            immediate: true
        }
    },
    computed: {
        layoutList() {
            let {
                op: { selectCount }
            } = this.lazyQuery || {
                op: {}
            };
            let layout = ['total', 'sizes', 'prev', 'pager', 'next', 'jumper'];
            if (this.pageId) {
                layout = ['sizes', 'prev', 'slot', 'next'];
            }
            if (this.pageId && selectCount) {
                layout = ['total', 'sizes', 'prev', 'slot', 'next'];
            }
            return layout.join(',');
        },
        clientRectHeader() {
            return {
                top: this.topFixedRange + 'px',
                left: this.tableViewClientRect.left + 'px',
                width: this.tableViewClientRect.width + 'px !important'
            };
        },
        clientRectPagination() {
            return {
                width: this.tableViewClientRect.width + 'px',
                left: this.tableViewClientRect.left + 'px'
            };
        },
        scrollBarStyle() {
            if (this.isShowFixedPagination) {
                return {
                    position: 'fixed',
                    bottom: '56px',
                    left: this.tableViewClientRect.left + 'px',
                    width: this.tableViewClientRect.width + 'px',
                    background: 'none'
                };
            } else {
                return null;
            }
        },
        emptyColumnList() {
            return this.columnList.filter(item => this.checkedColumnList.includes(item));
        },
        pageNumbers() {
            return Math.ceil(this.tableTotal / this.pageSize);
        },
        isDefaultSlot() {
            return function (slotName) {
                return this.defaultSlotList.includes(slotName);
            };
        },
        showColumns() {
            return this.columns.filter(item => this.checkedColumnList.includes(item.label));
        },
        receivedAttrs() {
            return { rowKey: 'id', ...this.$attrs };
        },
        showPagination() {
            return typeof this.pagination === 'boolean' ? this.pagination : this.pagination.show === false ? false : true;
        }
    },
    created() {
        this.init();
        this.uidSearchMap();
    },
    mounted() {
        // 缓存初始查询条件
        this.originSearchOptions = Object.freeze(_.cloneDeep(this.$parent.searchOptions));
        //这里必须在activated之前手动调用一次scroll事件，否则表头和分页无法初始化状态
        if (this.layout == 'flow') {
            baseMethods.addHandler(window, 'scroll', this.scroll, true);
        }
        //检测是否开启右键功能
        if (this.$scopedSlots.contextmenu) {
            this.enableContextmenu = true;
            baseMethods.addHandler(window, 'mouseup', this.contextmenuHandler);
        }

        let _el = !this.tableData.length ? (this.emptyModel ? this.$refs.emptyTable : this.$refs.tableWrap) : this.$refs.tableView;
        const isInView = baseMethods.isElementInViewport(_el);
        if (this.$attrs.height || this.$attrs['max-height'] || !this.autoHeight || !isInView) return;
        // 监听table宽度变化
        this.$tableBodyObserver = new ResizeObserver(baseMethods.debounce(this.handleResize, 16));
        window.requestAnimationFrame(() => {
            this.handleObserve(this.$refs.elTable.$refs.bodyWrapper.children[0]);
            this.handleObserve(this.$refs.emptyTable);
            this.handleObserve(this.$refs.tableWrap);
            this.handleObserve(this.$refs.searchWrap);
        });
    },
    activated() {
        //缓存组件设置keepalived为true，第一次则不执行scroll事件，并重新绑定鼠标滚动事件
        this.keepalived = true;
        this.removeHandler();
        if (this.layout == 'flow') {
            if (this.$refs.elTable) {
                this.$refs.elTable.$el.children[2].scrollLeft = this.tableScrollLeft;
            }
            baseMethods.addHandler(window, 'scroll', this.scroll, true);
        }
        if (this.enableContextmenu) {
            baseMethods.addHandler(window, 'mouseup', this.contextmenuHandler);
        }
        Global.commit('table_uid', this._uid);
    },
    beforeDestroy() {
        this.destroy();
    },
    deactivated() {
        this.destroy();
    },
    methods: {
        handleResize(entries, observer) {
            if (this.autoHeight) {
                // TODO 因为异步原因，上面获取的el可能并不准确
                let _el = !this.tableData.length ? (this.emptyModel ? this.$refs.emptyTable : this.$refs.tableWrap) : this.$refs.tableView;
                let _clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
                // let _height=_clientHeight-_el.getBoundingClientRect().top-48
                let _top = window.__POWERED_BY_QIANKUN__ ? 105 : 0; //乾坤环境下减去页签和面包屑高度
                let _height = _clientHeight - _el.offsetTop - 68 - _top; //减去分页高度
                this.tableHeight = (_height < 300 ? 300 : _height) + 'px';
            }
            for (const entry of entries) {
                this.scrollX(entry.target);
            }
        },
        handleObserve(el) {
            el && this.$tableBodyObserver.observe(el);
        },
        destroy() {
            //每当路由发生`变化，则销毁绑定的scroll事件
            this.removeHandler();
            //如果开启右键功能 ，页面跳转则关闭右键菜单
            this.destroyContextmenu();
            this.$tableBodyObserver&&this.$tableBodyObserver.disconnect();
        },
        init() {
            let tableColumns;
            //缓存组件不执行created函数，则不为缓存组件，设置keepalived=false
            this.keepalived = false;
            if (this.$slots.default) {
                this.columnList = this.$slots.default
                    .filter(item => item.data)
                    .map(item => {
                        if (item.componentOptions && item.componentOptions.tag == 'ws-table-column-el') {
                            return item.data.attrs.label;
                        }
                        return item.componentOptions && item.componentOptions.propsData.label;
                    });
            } else {
                this.columnList = this.columns.map(item => item.label);
            }

            if (this.filterColumns) {
                let columns = baseMethods.getStore(baseMethods.getPrefix() + '-tableColumns') || {};
                tableColumns = columns[this.$route.path];
            }
            this.indexColumn && this.columnList.unshift('序号');
            this.checkedColumnList = tableColumns || this.getDefalutColumn() || [...this.columnList];
            if (this.indexColumn && !this.checkedColumnList.includes('序号')) {
                this.isShowIndexColumn = false;
            }
        },

        scroll(event) {
            //#table scrollX
            if (event.target.nodeName === 'DIV' && event.target.className.includes('el-table__body-wrapper')) {
                this.scrollX(event);
            }
            //#document scrollY
            if (event.target.nodeName === '#document') {
                this.scrollY();
            }
        },
        scrollX(event = {}) {
            let target = event.target || event.parentNode || this.$refs.elTable.$el.children[2];
            if (target) {
                this.scrollWarp = target;
                this.tableScrollLeft = target.scrollLeft;
                this.scrollLeft = (target.scrollLeft * 100) / target.clientWidth || 0;
                this.scrollWidth = (target.clientWidth * 100) / target.scrollWidth || 0;
            }
            if (!this.$refs.tableView || (this.showPagination && !this.$refs.pagination)) {
                return false;
            }
            this.tableViewClientRect = this.$refs.tableView.getBoundingClientRect();
            if (this.showPagination) {
                let paginationClientRec = this.$refs.pagination.getBoundingClientRect();
                setTimeout(() => {
                    this.isShowFixedPagination = !baseMethods.isElementInViewport(this.$refs.pagination);
                    if (
                        paginationClientRec.top < this.topFixedRange ||
                        this.tableViewClientRect.top + this.topFixedRange > (window.innerHeight || document.documentElement.clientHeight)
                    ) {
                        this.isShowFixedPagination = false;
                    }
                }, 0);
            }
        },
        scrollY() {
            //如果开启右键功能 ，则页面滚动是否关闭右键菜单
            this.destroyContextmenu();

            //此处判断是否为缓存组件，缓存组件第一次加载不执行scroll，然后设置keepalived为false，保证后续鼠标滚动事件能正常执行
            if (this.keepalived) {
                this.keepalived = false;
                return false;
            }

            if (!this.$refs.tableView || (this.showPagination && !this.$refs.pagination)) {
                return false;
            }
            this.tableViewClientRect = this.$refs.tableView.getBoundingClientRect();
            // let showFixedHeader = this.isShowFixedHeader;
            if (this.showPagination) {
                let paginationClientRec = this.$refs.pagination.getBoundingClientRect();
                setTimeout(() => {
                    this.isShowFixedPagination = !baseMethods.isElementInViewport(this.$refs.pagination);
                    if (
                        paginationClientRec.top < this.topFixedRange ||
                        this.tableViewClientRect.top + this.topFixedRange > (window.innerHeight || document.documentElement.clientHeight)
                    ) {
                        this.isShowFixedPagination = false;
                    }
                }, 0);
            }

            if (this.tableViewClientRect.width && this.tableViewClientRect.height) {
                this.isShowFixedHeader = this.tableViewClientRect.top < this.topFixedRange;
                if (this.isShowFixedHeader && this.tableViewClientRect.bottom < this.topFixedRange + 60) {
                    this.isShowFixedHeader = false;
                }
                this.isShowFixedHeader && this.cloneHeader();
            }
        },

        //克隆表格表头数据
        cloneHeader() {
            let node = this.$refs.elTable.$refs.tableHeader.$el;
            let cloneNode = node.cloneNode(true);
            this.$refs.fixedHeader.innerHTML = '';
            this.$refs.fixedHeader.appendChild(cloneNode);
            this.setHeaderTranslateX();
        },
        //设置浮动表头偏移量
        setHeaderTranslateX() {
            if (this.isShowFixedHeader && this.$refs.fixedHeader) {
                if (this.multi) {
                    this.$refs.fixedHeaderCheckbox.style.transform = `translateX(${-this.tableScrollLeft}px)`;
                }
                this.$refs.fixedHeader.children[0].style.transform = `translateX(${-this.tableScrollLeft}px)`;
            }
        },

        //重置搜索条件 type=true重置并搜索，false则只重置条件
        reset(type = true) {
            this.$parent.searchOptions = _.cloneDeep(this.originSearchOptions);
            type && this.search();
        },
        //type 0:只查询list，1：查询list && count ，2：重置页码并查询list && count
        search(type = 2) {
            let query = this.lazyQuery || {};
            let param = this.$parent.searchOptions || {};
            if (typeof query.beforeQuery === 'function') {
                param = query.beforeQuery();
                if (!param) return;
            }
            if (!this.searchUrl || !query.op || (!query.op.selectList && !query.op.encryptList)) {
                this.$message.error('您暂未开通查看此列表权限！');
                console.error(
                    `当前请求无权限：[路由地址]：${location.pathname} ; [op]: ${query.op.selectList || query.op.encryptList} ;[请求参数]: ${JSON.stringify(
                        param
                    )}`
                );
                return false;
            }

            if (type !== 0 && query.op.selectCount && query.moduleName && !$vuex.$getModuleUrl(query.moduleName,query.op.selectCount)) {
                this.$message.error('您暂未开通查看总数权限！');
                console.error(`当前请求无权限：[路由地址]：${location.pathname} ; [op]: ${query.op.selectCount} ;[请求参数]: ${JSON.stringify(param)}`);
                return false;
            }
            type === 2 && this.refresh();
            let opt = {
                pageSize: this.pageSize,
                currentPage: this.currentPage,
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
                if (this.showPagination && this.pageId) {
                    opt = { ...opt, ...this._prevCurrentPage };
                }
                let op = query.url ? query.op.selectList : this.isEncrypt ? query.op.encryptList : query.op.selectList;
                // 修改moduleName
                this.$getModuleUrl(query.moduleName, op);

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
            this.tableLoading = this.loading;
            this.$axios(this.searchUrl, options)
                .then(res => {
                    if (op == this.lazyQuery.op.selectList || op == this.lazyQuery.op.encryptList) {
                        let data = baseMethods.typeOf(res.data) === 'string' ? JSON.parse(res.data) : res.data;
                        if (typeof this.lazyQuery.afterQuery === 'function') {
                            data = this.lazyQuery.afterQuery(data);
                        }
                        if (!this.lazyQuery.op.selectCount) {
                            let total = baseMethods.typeOf(res.data) === 'string' ? parseInt(data.count) : res.total;
                            this.tableTotal = total || 0
                        }
                        if (data && !Array.isArray(data)) {
                            data = data.body || [];
                        }
                        this.tableData = Object.freeze(data);
                        this.tableLoading = false;
                    }
                    if (op == this.lazyQuery.op.selectCount) {
                        let count = JSON.parse(res.data);
                        if (baseMethods.typeOf(count) === 'object') {
                            count = count.count;
                        }
                        this.tableTotal = +count;
                    }
                    if (this.pageId && !this.lazyQuery.op.selectCount) {
                        //pageId为true 不存在selectCount  根据返回数量计算临时总数
                        this.tableTotal = parseInt(this.tableData.length < this.pageSize ? this.currentPage : this.currentPage + 1) * this.pageSize;
                    }
                    // 当总数小于20时隐藏翻页，-1是为了兼容pageId分页时，第一页返回的数据刚好等于pageSize的情况
                    this.paginationFlag = this.tableTotal < +this.pageSizeList[0] - 1 ? false : true;
                    if (this.layout == 'flow') {
                        this.$nextTick(() => setTimeout(this.scrollY, 0));
                    }
                    this.isIndeterminate = false;
                    this.isAllChecked = false;
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
            this.$confirm('确定要删除吗', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                center: true
            }).then(() => {
                this.$axios(url, opt).then(res => {
                    this.$message.success('删除成功');
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
                1: status ? '上线' : '下线',
                2: status ? '停用' : '启用'
            }[type];
            this.$confirm(`确定要${msg}吗`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
                center: true
            }).then(() => {
                this.$axios(url, opt).then(res => {
                    this.$message.success(`${msg}成功`);
                    this.search(1);
                });
            });
        },
        // 每页条数切换,切换后页码跳转至第一页
        handleSizeChange(pageSize) {
            this.refresh();
            this.pageSize = pageSize;
            this.handleCurrentChange();
        },
        //页面切换触发事件
        handleCurrentChange() {
            this.isIndeterminate = false;
            this.isAllChecked = false;
            //可手动触发表格更新
            let opt = {
                currentPage: this.currentPage, //翻页后页码
                pageSize: this.pageSize //当前每页条数
            };
            this.$nextTick(() => {
                if (this.showPagination && this.pageId) {
                    opt = { ...opt, ...this._prevCurrentPage };
                }
                this.$emit('currentChange', opt);
                if (this.lazyQuery) {
                    this.search(0);
                }
            });
        },
        //可手动触发表格更新重置页码
        refresh() {
            this.currentPage = 1;
            this.isIndeterminate = false;
            this.isAllChecked = false;
        },

        /********************************表格复制事件******************************************/
        //单元格点击复制
        rowClick(row, column, event) {
            let trNode = event.currentTarget;
            //alt + 鼠标左键复制一行数据，可连续复制
            if (event.altKey) {
                baseMethods.toggleClass(trNode, 'copy-command');
                this.$message({
                    message: '复制成功',
                    type: 'success',
                    duration: 800
                });
                baseMethods.copyCommand(this.copyCommandData(trNode));
                this.altKeyCopyCommand = true;
                return;
            }
            //如果有复制选中状态 则清除复制选中数据
            this.altKeyCopyCommand && this.clearCopyCommand(trNode);
            this.currentRow(trNode);
        },
        currentRow(trNode) {
            if (!baseMethods.hasClass(trNode, 'current-row')) {
                Array.from(trNode.parentNode.childNodes).map(tr => baseMethods.removeClass(tr, 'current-row'));
                baseMethods.addClass(trNode, 'current-row');
            }
        },
        //复制所有选中数据
        copyCommandData(trNode) {
            let copyCommandText = '';
            let tbodyNode = trNode.parentNode;
            for (let tr of Array.from(tbodyNode.childNodes)) {
                if (!baseMethods.hasClass(tr, 'copy-command')) {
                    continue;
                }
                Array.from(tr.childNodes).map(tnode => {
                    if (!baseMethods.hasClass(tnode, 'el-table-column--selection')) {
                        copyCommandText += tnode.innerText + '\t';
                    }
                });
                copyCommandText += '\n';
            }
            return copyCommandText;
        },
        //清除所有表格选中复制状态
        clearCopyCommand(trNode) {
            this.altKeyCopyCommand = false;
            let tbodyNode = trNode.parentNode;
            Array.from(tbodyNode.childNodes).map(tr => baseMethods.removeClass(tr, 'copy-command'));
        },
        /********************************表格复制事件******************************************/

        /********************************鼠标右键事件******************************************/
        //右键全局鼠标事件
        contextmenuHandler(event) {
            if (event.which != 1) {
                this.destroyContextmenu();
            }
        },
        //右键点击表格行事件
        rightContextmenu(row, column, event) {
            this.currentRow(event.currentTarget);
            if (!this.enableContextmenu) {
                return false;
            }
            //阻止浏览器默认右键行为
            if (event.preventDefault) {
                event.preventDefault(); //标准格式
            } else {
                event.returnValue = false; //IE格式
            }
            this.scopeRow = row;
            this.$refs.contextmenu.style.cssText = `display: block;left: ${event.clientX}px;top: ${event.clientY}px`;
            if (!this.contextmenuVisible) {
                document.body.appendChild(this.$refs.contextmenu);
                this.contextmenuVisible = true;
            }
        },
        //关闭右键菜单
        destroyContextmenu() {
            if (!this.enableContextmenu || !this.contextmenuVisible) {
                return false;
            }
            document.body.removeChild(this.$refs.contextmenu);
            this.contextmenuVisible = false;
        },
        /********************************鼠标右键事件End******************************************/

        /********************************table-column 切换显示隐藏事件******************************************/
        //重置table-column 显示状态
        resetCheckBox() {
            this.checkedColumnList = this.getDefalutColumn() || [...this.columnList];
            this.handleCheckedChange();
        },
        //table-column 切换显示隐藏
        handleCheckedChange() {
            if (this.indexColumn) {
                this.isShowIndexColumn = this.checkedColumnList.includes('序号') ? true : false;
            }
            //通过变更table-key强制更新table
            this.isAllChecked = false;
            this.tableKey = this.rowKey();
        },
        //获取默认显示的列
        getDefalutColumn() {
            let defaultList;
            if (this.hideColumnList.length) {
                defaultList = [];
                for (let item of this.columnList) {
                    if (!this.hideColumnList.includes(item)) {
                        defaultList.push(item);
                    }
                }
            }
            return defaultList;
        },
        /********************************table-column 切换显示隐藏事件End******************************************/

        /********************************表格多选事件******************************************/
        //表格全选事件
        handleCheckAllChange(val) {
            this.isIndeterminate = false;
            (val && this.toggleAllSelection()) || this.clearSelection();
        },
        //当用户手动勾选数据行的 Checkbox 时触发的事件
        tableSelect(selection, row) {
            if (selection.length == 0) {
                this.isIndeterminate = false;
                this.isAllChecked = false;
                return;
            }
            if (selection.length < this.pageSize) {
                this.isIndeterminate = true;
                this.isAllChecked = false;
                return;
            }
            this.isIndeterminate = false;
            this.isAllChecked = true;
        },
        //当用户手动勾选全选 Checkbox 时触发的事件
        tableSelectAll(selection) {
            this.isIndeterminate = false;
            this.isAllChecked = selection.length ? true : false;
        },
        /********************************表格多选事件End******************************************/

        //行key ，优化表格渲染
        rowKey() {
            return (Math.random() * 10000000).toString(16).substr(0, 4) + '-' + new Date().getTime() + '-' + Math.random().toString().substr(2, 5);
        },
        //Table Methods 用于多选表格，清空用户的选择
        clearSelection() {
            return this.$refs.elTable.clearSelection();
        },
        //Table Methods 用于多选表格，切换某一行的选中状态，如果使用了第二个参数，则是设置这一行选中与否（selected 为 true 则选中）
        toggleRowSelection(row, selected) {
            return this.$refs.elTable.toggleRowSelection(row, selected);
        },
        //Table Methods 用于多选表格，切换所有行的选中状态
        toggleAllSelection() {
            return this.$refs.elTable.toggleAllSelection();
        },
        //自增列index
        indexFormat(index) {
            return index + (this.currentPage - 1) * this.pageSize + 1;
        },
        removeHandler() {
            baseMethods.removeHandler(window, 'scroll', this.scroll, true);
            baseMethods.removeHandler(window, 'mouseup', this.contextmenuHandler);
        },
        // 清空表格
        clear() {
            this.refresh();
            this.$parent.searchOptions = _.cloneDeep(this.originSearchOptions);
            this.tableData = [];
        },
        // 保存每个列表的搜索方法
        uidSearchMap() {
            Global.commit('uidMap', {
                ...(Global.getState('uidMap') || {}),
                [this._uid]: () => this.search(0)
            });
        },
        // 删除列表的搜索方法
        deleteUidInMap() {
            let uidMap = Global.getState('uidMap');
            delete uidMap[this._uid];
            Global.commit('uidMap', uidMap);
        }
    },
    destroyed() {
        this.removeHandler();
        this.deleteUidInMap();
    }
};
</script>

<style lang="scss">
:root {
    --formMinWidth: 330px;
}
.el-table__body tr.current-row > td {
    background-color: #ecf5ff !important;
}

.el-table__body tr.copy-command > td,
.el-table__body tr > td.copy-command {
    background-color: #c0c4cc !important;
}

.el-checkbox-group {
    .popover-headers {
        padding: 4px 8px;
    }
}
.el-table__fixed-body-wrapper {
    z-index: 10;
}
.el-table__fixed-right {
    // z-index: 10;
    height: 100% !important;
    background: #fff;
}
.el-pager {
    font-weight: 500;
    font-size: 14px;
    color: #606266;
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
}

.ws-table-warp {
    border-radius: 8px;
    padding: 24px;
    background: #fff;
    width: 100%;
    .option-box {
        margin: 20px 0;
    }
    .searchBtns {
        margin-right: 20px;
    }
    .el-button-group {
        vertical-align: top;
    }
    .ws-table__toolbar {
        display: flex;
        .filterColumns {
            display: flex;
        }
    }

    .empty_table_header {
        overflow-x: auto;
        th {
            text-align: center;
            border: 1px solid #ebeef5;
            .cell {
                white-space: nowrap;
            }
        }
    }
    .el-table {
        border-radius: 8px;
    }
    .table-column-header-button {
        padding: 0 8px;
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

    .el-table td,
    .el-table th {
        padding: 0px 0px;
        height: 40px;
        .el-button {
            padding: 0 !important;
        }
    }

    .el-table .cell {
        line-height: initial;
    }

    .paginationClass {
        height: 60px;
        padding: 15px 0;

        .el-pagination {
            margin-left: 15px;
            text-align: right;
        }
    }

    .table_header {
        font-size: 14px;
        font-weight: 600;
        color: #666;
        background-color: #f5f7fa !important;
    }

    .fixed .el-table__body-wrapper {
        // max-height: 510px !important;
    }

    .pagination-warp {
        position: relative;
    }

    .pagination-fixed {
        position: fixed;
        bottom: 0;
        width: 100%;
        padding: 10px 15px;
        background: #f0f2f5;
        z-index: 99;

        .el-pager li {
            background: #f0f2f5;
        }
        .el-pagination {
            text-align: right;
        }

        .el-pagination .btn-next,
        .el-pagination .btn-prev {
            background: center center no-repeat #f0f2f5;
        }
    }

    .fixed_header_warp {
        position: fixed;
        z-index: 99;
        width: auto !important;
        max-width: initial !important;
        overflow: hidden;

        .fixed_table_header_checkbox {
            z-index: 99;
            position: absolute;
            top: 16px;
            left: 21px;
            width: 16px;
            height: 16px;
            background: #fff;
        }
    }

    //表格搜索框样式
    .search-wrap {
        position: relative;
        // margin: 0 auto;
        padding: 24px 24px 8px 24px;
        border: 1px solid #ebeef5;
        border-radius: 8px;
        background: #f5f7fa;
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;

        .el-row--flex {
            flex-wrap: wrap;
        }
        .search-item__wrap {
            width: 33.33%;
        }
        .search-item {
            display: flex;
            align-items: center;
            margin-bottom: 16px;
            line-height: 1;
            padding-left: 12px;
            padding-right: 12px;
            label {
                display: inline-block;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
                word-break: break-all;
                text-align: right;
            }
            > .el-input,
            > .el-select,
            > .el-autocomplete,
            > .ws-daterange,
            > .el-date-editor,
            > .ws-organization,
            > .ws-city,
            .el-cascader,
            > .el-cascader,
            > .ws-organization-options {
                width: 100% !important;
                min-width: var(--formMinWidth) !important;
            }
            .el-range-input {
                width: 140px;
            }
            .el-range__close-icon {
                width: 25px;
            }
            .el-range-separator {
                width: 20px;
                padding: 0;
            }
            .ws-daterange {
                overflow: hidden;
            }
            .el-date-editor--datetimerange.el-input__inner {
                width: 100%;
            }
            .el-cascader {
                line-height: 36px;
            }
        }
    }
    .empty-table {
        flex: 1;
        border: 1px solid #ebeef5;
        border-top: none;
        overflow-x: auto;
        display: flex;
        flex-direction: column;
        border-radius: 8px;
        .el-table {
            flex: 0;
        }
        .empty_text {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin-top: 0;
            padding: 25px 0;
            p {
                margin-top: 10px;
                color: #4e5052;
            }
        }
        .el-table {
            border: none;
        }
    }
    .el-table__body-wrapper {
        overflow-x: auto;
    }
}
@media screen and (max-width: 1680px) {
    .search-item__wrap {
        width: 50% !important;
    }
}
@media screen and (max-width: 1366px) {
    :root {
        --formMinWidth: 100px;
    }
    .search-item__wrap {
        width: 50% !important;
    }
}
@media screen and (max-width: 900px) {
    :root {
        --formMinWidth: auto;
    }
    .search-item__wrap {
        width: 100% !important;
    }
}
</style>
