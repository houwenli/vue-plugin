<template>
    <el-rate v-model="data[item.prop]" v-bind="attrs"></el-rate>
</template>

<script>
export default {
    name: 'table-star',
    props: {
        prop: { type: String, default: '' },
        data: { type: Object, default: () => {} },
        item: { type: Object, default: () => {} }
    },
    computed: {
        attrs() {
            return {
                disabled: true,
                'show-score': true,
                'text-color': '#ff9900',
                ...this.item.attrs
            };
        }
    }
};
</script>

<style scoped></style>
