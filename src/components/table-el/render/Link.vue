<template>
    <a :href="item.href || data[item.prop]" :target="item.target || '_black'">{{ data[item.prop] }}</a>
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
