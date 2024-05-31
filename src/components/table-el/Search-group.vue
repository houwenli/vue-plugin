<template>
    <div class="search-item__wrap">
        <div class="search-item"><slot></slot></div>
    </div>
    <!-- <el-col :span="6" class="search-col">
    <div class="search-item">
      <label class="search-item__label">{{ label }}</label>
      <div class="search-item__content"><slot></slot></div>
    </div>
  </el-col> -->
</template>

<script>
export default {
    name: 'search-group',
    props: {
        labelWidth: { type: String },
        col:{type:Number},//栅格占据的列数
    },
    computed: {
        width() {
            const _width = this.labelWidth || this.$parent.labelWidth;
            return isNaN(_width) ? _width : parseInt(_width) + 'px';
        },
        span(){
            return this.col || this.$parent.$parent.col
        },
        isDateRange(){
            return this.$slots.default&&this.$slots.default.length>1&&this.$slots.default[1].componentOptions.tag==='ws-date-range'?true:false
        },
    },
    mounted() {
        if (this.$slots.default) {
            let label = this.$slots.default.find(item => item.tag == 'label');
            if(label){
                label.elm.style.width = this.width
                label.elm.style.flex = `0 0 ${this.width}`
            }
        }
    }
};
</script>

<style scoped></style>
