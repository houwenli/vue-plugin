<template>
    <span v-if="item.callback">{{ item.callback(data[item.prop]) }}</span>
</template>

<script>
export default {
    name: 'table-function',
    props: {
        prop: { type: String, default: '' },
        data: { type: Object, default: () => {} },
        item: { type: Object, default: () => {} }
    }
};
</script>

<style scoped></style>
