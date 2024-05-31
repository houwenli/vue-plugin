<template>
    <span v-if="item.filter">{{ data[item.prop] | propsFilters(item.filter) }}</span>
    <span v-else>{{ item.formatter ? item.formatter(data) : data[item.prop] }}</span>
</template>

<script>
export default {
    name: 'table-text',
    props: {
        prop: { type: String, default: '' },
        data: { type: Object, default: () => {} },
        item: { type: Object, default: () => {} }
    },
};
</script>

<style scoped></style>
