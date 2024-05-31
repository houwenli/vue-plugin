<template>
    <el-tag :type="type" v-bind="item.attrs" v-if="item.filter">{{ data[item.prop] | propsFilters(item.filter) }}</el-tag>
    <el-tag :type="type" v-bind="item.attrs" v-else>{{ item.formatter ? item.formatter(data) : data[item.prop] }}</el-tag>
</template>

<script>
export default {
    name: 'table-tag',
    props: {
        prop: { type: String, default: '' },
        data: { type: Object, default: () => {} },
        item: { type: Object, default: () => {} }
    },
    computed: {
        type() {
            return { ...(this.item.types || ['', 'success', 'info', 'warning', 'danger']) }[this.data[this.item.prop]];
        }
    }
};
</script>

<style scoped></style>
