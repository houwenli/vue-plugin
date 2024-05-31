<template>
    <el-image :style="item.style" :src="data[item.prop]" :preview-src-list="[data[item.prop]]"></el-image>
</template>

<script>
export default {
    name: 'table-image',
    props: {
        prop: { type: String, default: '' },
        data: { type: Object, default: () => {} },
        item: { type: Object, default: () => {} }
    }
};
</script>

<style scoped></style>
