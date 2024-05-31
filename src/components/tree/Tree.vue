<template>
    <div class="ws-tree-warp">
        <el-checkbox v-if="showCheckAll" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
        <el-tree v-loading="loading" :data="data" ref="tree" v-bind="$attrs" v-on="$listeners" :props="defaultProps" :node-key="nodeKey" :show-checkbox="checkBox" highlight-current
            @node-click="handleNodeClick"
            @node-contextmenu="rightContextmenu">
            <span slot-scope="{ node, data }">
                {{node.label}}
                <slot name="options" :row="{node, data}"></slot>
            </span>
        </el-tree>

        <div v-click-outside.self="destroyContextmenu" ref="contextmenu" id="contextmenu">
            <slot name="contextmenu" :row="{scopeNode,scopeRow}"></slot>
        </div>
    </div>
</template>

<script>
    import baseMethods from '../../util/baseMethods';

    export default {
        name: 'ws-tree',
        props: {
            treeData: {type: Array, default: () => []}, //树形数据
            selectedNode: {type: Function, default: () => {}}, // 选中的节点
            defaultProps: {type: Object, default: () => {}},
            lazyQuery: {type: Object, default: () => {}},
            checkBox: {type: Boolean, default: false}, // 节点是否可被选择
            nodeKey: {type: String, default: 'id'}, // 树节点唯一标识
            showCheckAll: {type: Boolean, default: false}, // 是否全选
            isBread: {type: Boolean, default: false}, // 用于面包屑
        },
        data() {
            return {
                loading: false,
                checkAll: false,
                data: [],
                scopeRow: {}, // 右键选择行数据
                scopeNode: {}, // 选中的节点
                contextmenuVisible: false, //右键弹窗是否可见
                enableContextmenu: false, //是否开启右键菜单功能
            };
        },
        watch: {
            treeData: {
                handler(val) {
                    this.data = JSON.parse(JSON.stringify(val));
                },
                immediate: true,
                deep: true
            },
            lazyQuery: {
                handler(val) {
                    if (val) {
                        if (val.immediate !== false) {
                            this.$nextTick(this.query(val));
                        }
                    }
                },
                immediate: true,
                deep: true
            },
        },
        computed: {},
        mounted() {
            //检测是否开启右键功能
            if (this.$scopedSlots.contextmenu) {
                this.enableContextmenu = true;
                baseMethods.addHandler(window, 'mouseup', this.contextmenuHandler);
            }
        },
        methods: {
            query(options) {
                let data = {
                    data: options.data,
                    op: options.op
                };
                this.loading = true;
                this.$axios(options.url, data).then(res => {
                    this.loading = false;
                    this.data = JSON.parse(res.data);
                    this.$emit("treeLoaded", this.data);
                }).catch((err) => {
                    this.data = [];
                    this.loading = false;
                });
            },
            /*treeDataSetNode(data) { // 修改树结构数据
                let key = this.nodeKey;
                let child = function (v) {
                    if (v.children && typeof(v.children) != 'undefined' && v.children.length > 0) {
                        for (var i = 0; i < v.children.length; i++) {
                            if(v.children[i].data && v.children[i].data.id){
                                v.children[i][key] = v.children[i].data.id;
                                child(v.children[i])
                            }
                        }
                    }
                }
                for (var k = 0; k < data.length; k++) {
                    if(data[k].data && data[k].data.id){
                        data[k][key] = data[k].data.id;
                        if (data[k].children && typeof(data[k].children) != 'undefined' && data[k].children.length != 0) {
                            child(data[k])
                        }
                    }
                }
                return data
            },*/
            // 全选事件
            handleCheckAllChange(val) {
                if (val) {
                    this.$refs.tree.setCheckedNodes(this.data)
                } else {
                    this.$refs.tree.setCheckedKeys([]);
                }
            },
            // 节点被点击时的回调
            handleNodeClick(node) {
                if (this.enableContextmenu || this.contextmenuVisible) {
                    this.destroyContextmenu();
                }
                if (this.isBread) {
                    this.breadList = []; //初始化
                    this.getTreeNode(this.$refs.tree.getNode(node.id));
                    this.selectedNode(node, this.breadList)
                } else {
                    this.selectedNode(node);
                }
            },
            getTreeNode(node) { //获取当前树节点和其父级节点
                if (node && node.label !== undefined) {
                    this.breadList.unshift(node.label);
                    this.getTreeNode(node.parent); //递归
                }
            },
            setCheckedKeys(val) {
                if (val) {
                    this.$refs.tree.setCheckedKeys(val);
                    this.checkAll = false;
                }
            },
            /********************************鼠标右键事件******************************************/
            //右键全局鼠标事件
            contextmenuHandler(event) {
                if (!!this.$refs.contextmenu.contains(event.target)) return;
                this.destroyContextmenu();
            },
            //右键点击表格行事件
            rightContextmenu(event, row, node, comp) {
                this.currentRow(event.currentTarget);
                if (!this.enableContextmenu) {
                    return false;
                }
                //阻止浏览器默认右键行为
                if (event.preventDefault) {
                    event.preventDefault(); //标准格式
                } else {
                    event.returnValue = false;  //IE格式
                }
                this.scopeRow = row;
                this.scopeNode = node;
                this.$refs.contextmenu.style.cssText = `display: block;left: ${event.clientX}px;top: ${event.clientY - 0}px`;
                if (!this.contextmenuVisible) {
                    document.body.appendChild(this.$refs.contextmenu);
                    this.contextmenuVisible = true;
                    baseMethods.addHandler(window, 'scroll', this.scroll, true);
                }
            },
            scroll(){
                this.destroyContextmenu();
            },
            //关闭右键菜单
            destroyContextmenu() {
                if (!this.enableContextmenu || !this.contextmenuVisible) {
                    return false;
                }
                document.body.removeChild(this.$refs.contextmenu);
                this.contextmenuVisible = false;
                baseMethods.removeHandler(window, 'scroll', this.scroll, true);
            },
            currentRow(trNode) {
                if (!baseMethods.hasClass(trNode, 'current-row')) {
                    Array.from(trNode.parentNode.childNodes).map(tr => baseMethods.removeClass(tr, 'current-row'));
                    baseMethods.addClass(trNode, 'current-row');
                }
            },
            /********************************鼠标右键事件End******************************************/
        },
        destroyed() {
            baseMethods.removeHandler(window, 'mouseup', this.contextmenuHandler);
        }
    };
</script>

<style scoped lang="scss">
    .ws-tree-warp {
        overflow-y: auto;
        width: 100%;
        height: 100%;
        background-color: #ffffff;
    }

    .el-tree {
        width: 100%;
        height: 100%;
        overflow-y: auto;
        background-color: #ffffff;
    }

    .el-tree-node__content:hover {
        background-color: #fff !important;
    }

    .el-tree-node:focus > .el-tree-node__content {
        background-color: #fff !important;
    }

    ::v-deep .el-tree-node__content {
        height: 35px !important;
    }

    ::v-deep .el-tree-node__expand-icon {
        color: #909399;
    }

    #contextmenu {
        display: none;
        position: fixed;
        min-width: 100px;
        border: 1px solid #D8DCE6;
        border-radius: 4px;
        background: #fff;
        padding: 0;
        font-size: 14px;
        color: #606266;
        line-height: 24px;
    }
</style>
