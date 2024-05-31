import Table from './Table.vue';
import SearchGroup from './Search-group.vue';
import TableColumn from './Table-column.vue';

Table.install = function(Vue) {
    Vue.component(Table.name, Table);
    Vue.component(SearchGroup.name, SearchGroup);
    Vue.component(TableColumn.name, TableColumn);
};

export default Table;
