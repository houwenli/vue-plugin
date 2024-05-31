<template>
    <div class="ws-tags-nav">
         <el-tabs v-model="activeTag" type="card"  @tab-remove="cloaseTag" @tab-click="changeTag" @contextmenu.prevent.native="openContextmenu">
  <el-tab-pane
    v-for="(item, index) in visitedViews"
    :key="item.path"
    :label="item.meta.title"
    :name="item.path"
    :closable="visitedViews.length>1"
  >
    {{item.content}}
  </el-tab-pane>
</el-tabs>
<ul class="contextmenu" v-if="showContextmenu" :style="{left,top}">
    <li @click="closeOther('other')">关闭其他</li>
    <li @click="closeOther('left')">关闭左侧</li>
    <li @click="closeOther('right')">关闭右侧</li>
    <li @click="closeAll('all')">关闭全部</li>
</ul>   
    </div>
</template>

<script>
    export default {
        name:'ws-tags-nav',
        computed:{
            visitedViews(){
                return this.$store.state.tagsView.visitedViews
            }
        },
        data() {
            return {
                activeTag:'',
                showContextmenu:false,
                left:'',
                top:''
            }
        },
        watch:{
            $route(val){
                this.addTag(val)
            }
        },
        methods: {
            addTag(view){
                this.$store.commit('tagsView/addVisitedView',view)
                this.activeTag=view.path
            },
            changeTag(instance){
                let route= this.visitedViews.find(item=>item.path===instance.name)
                this.$router.push(route)
            },
            cloaseTag(target){
                if(this.visitedViews.length===1)return this.$message.error('已经是最后一项了！')
                if(this.activeTag===target){
                    this.visitedViews.forEach((item,index)=>{
                        if(item.path===target){
                            let nextTag=this.visitedViews[index+1]||this.visitedViews[index-1]
                            if(nextTag){
                                this.activeTag=nextTag.path
                            }
                        }
                    })
                }
                this.$store.commit('tagsView/closeVisitedView',target)
            },
            // 打开右键菜单
            openContextmenu(e){
                let {clientX,clientY}=e
                this.left=clientX+'px'
                this.top=clientY+'px'
                this.showContextmenu=true
                let path=e.target.id.replace('tab-','')
                this.$store.commit('tagsView/openContextmenu',path)
            },
            closeAll(){
                this.$store.commit('tagsView/closeAll')
                this.showContextmenu=false
                this.$router.push('/ehr/')
            },
            closeOther(type){
                this.$store.commit('tagsView/closeOther',type)
                this.showContextmenu=false
            }
        },
    }
</script>

<style lang="scss" scoped>
.ws-tags-nav{
.el-tabs__header .el-tabs__item {
    height: 38px;
    padding: 0 30px 0 30px;
    margin-top: 5.95px;
    margin-right: -18px;
    line-height: 38px;
    text-align: center;
    border: 0;
    outline: none;
    transition: padding .3s cubic-bezier(.645,.045,.355,1)!important;
}
    ::v-deep .el-tabs-item{
    height: 38px;
    padding: 0 30px 0 30px;
    margin-top: 5.95px;
    margin-right: -18px;
    line-height: 38px;
    text-align: center;
    }
::v-deep .is-active{
    color:#1890ff !important;
    background: #e8f4ff !important;
}
}

.contextmenu{
    position: fixed;
    background: #fff;
    border-radius: 10px;
    font-size: 12px;
    line-height: 24px;
    padding: 10px 0;
    z-index: 1000;
    li{
        padding: 5px 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        &:hover{
            background: #e8f4ff;
            color: #1890ff;
        }
    }
}

</style>