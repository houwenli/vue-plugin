export default {
    namespaced: true,
    state: {
        visitedViews: [],
        openContextmenu:''
    },
    mutations: {
        addVisitedView(state, view) {
            let hasView = state.visitedViews.some(item => item.path === view.path);
            if (!hasView) {
                state.visitedViews.push(view);
            }
        },
        closeVisitedView(state, path) {
            let index = state.visitedViews.findIndex(item => item.path === path);
            state.visitedViews.splice(index, 1);
        },
        openContextmenu(state,path){
            state.openContextmenu=path
        },
        closeAll(state) {
            state.visitedViews = [];
        },
        closeOther(state, type) {
            let index = state.visitedViews.findIndex(item => item.path === state.openContextmenu);
            if (type === 'left') {
                state.visitedViews.splice(0,index)
            }
            if(type==='right'){
                state.visitedViews.splice(index+1)
            }
            if(type==='other'){
                state.visitedViews = state.visitedViews.filter(item=>item.path===state.openContextmenu)
            }
        }
    },
    actions: {}
};