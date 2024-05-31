import Table from './Table.vue';
import TableColumn from './Table-column';
import SearchGroup from './Search-group';

Table.install = function(Vue) {
    Vue.component(Table.name, Table);
    Vue.component(TableColumn.name, TableColumn);
    Vue.component(SearchGroup.name, SearchGroup);
};

export default Table;
