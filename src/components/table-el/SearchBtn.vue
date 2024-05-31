<template>
    <div class="fold-btn" :style="style" v-if="showFold" @click="toggle">
            <span>{{ isFold ? '展开' : '收起' }}</span><i :class="isFold ? 'el-icon-arrow-down' : 'el-icon-arrow-up'"></i>
    </div>
</template>
<script>
export default {
    data() {
        return {
            showFold: false,
            isFold: true
        };
    },
    computed:{
        table(){
            return this.$parent
        },
        style(){
            return {
                color:this.isFold?'#0088FF':'#303133'
            }
        }
    },
    mounted() {
        let searchWrap = this.table.$refs.searchWrap;
        let lists = Array.from(searchWrap.children) || [];
        lists.length > 6 && (this.showFold = true);
        this.$nextTick(()=>{
            lists = Array.from(searchWrap.children) || [];
            lists.forEach((item, index) => {
            if (index > 5 && index !== lists.length - 1) {
                item.style.display = 'none';
            }
        });
        })

    },
    methods: {
        toggle() {
            this.isFold = !this.isFold;
            let searchWrap = this.table.$refs.searchWrap;
            let lists = Array.from(searchWrap.children) || [];
            lists.forEach((item, index) => {
                if (!this.isFold) {
                    item.style.display = 'block';
                } else {
                    if (index > 5 && index !== lists.length - 1) {
                        item.style.display = 'none';
                    }
                }
            });
        }
    }
};
</script>

<style lang="scss" scoped>
.fold-btn{
    position:absolute;
    bottom:-20px;
    left:50%;
    transform: translateX(-50%);
    background: #f5f7fa;
    width: 80px;
    height: 20px;
    cursor: pointer;
    font-size: 12px;
    text-align: center;
    line-height: 20px;
    color: #0088FF;
    background: url('https://wsjc-web-1301582899.cos.ap-guangzhou.myqcloud.com/oa/vue-plugin/icon-search-toggle.png') no-repeat;
    background-size: 80px 20px;
    span{
        font-size: 12px;
        display: inline-block;
        transform: scale(0.83);
    }
}
</style>
