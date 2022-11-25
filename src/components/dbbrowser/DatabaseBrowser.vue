<template>
  <div style="height: 100%">
    <el-row>
      <el-col :span="16">
        <el-input v-model="queryForm.sql" placeholder="Please input" @change="onSQLChange" />
      </el-col>
      <el-col :span="8">
        <el-button> Help </el-button>
        <el-popover placement="bottom-start" title="All Tables:" width="18vw" trigger="hover">
          <template #reference>
            <el-button>Desc</el-button>
          </template>
          <div class="tablenames">
            <div v-for="tableName in tableNames" :key="tableName" @click="queryData(tableName)" class="table-name-item">
              {{ tableName }}
            </div>
          </div>

        </el-popover>

        <el-popover placement="bottom-start" title="Settings" :width="200" trigger="hover">
          <template #reference>
            <el-button>Settings</el-button>
          </template>
          <el-form>
            <el-form-item label="Auto Limit">
              <el-switch v-model="queryForm.autoLimit"></el-switch>
            </el-form-item>
          </el-form>
        </el-popover>
        <el-button @click="queryTable">Query</el-button>
      </el-col>
    </el-row>
    <el-row style="height: calc(100% - var(--el-component-size))" class="tableContainer">
      <el-table :data="tableData" @scroll="handleScroll" height="100%">
        <el-table-column :prop="col.name" :label="col.name" v-for="col in columns" :key="col.name"
          :width="60 + 10 * col.name.length">
        </el-table-column>
      </el-table>
    </el-row>
  </div>
</template>

<script lang="ts">
import { getTableNames, query } from "@/api/db";
import { defineComponent } from "@vue/runtime-core";
import { ElMessage } from "element-plus";
import { QueriedData } from "@/models/data_mani";
import parser from "js-sql-parser";
export default defineComponent({
  props: {
    sqlitePath: String,
  },
  data() {
    return {
      queryForm: {
        sql: "select * from scenarios LIMIT 100;",
        autoLimit: true,
      },
      rowsOnPage: 15,
      firstRowIndex: 0,
      tableNames: [] as string[],
      columns: [] as { name: string; type: string }[],
      tableData: [] as { [key: string]: string | number }[],
    };
  },
  computed: {
    sliderMax(): number {
      if (this.tableData.length > this.rowsOnPage) {
        return this.tableData.length - this.rowsOnPage;
      } else {
        return 0;
      }
    },
    rowsToShow(): any {
      let firstIndex = this.tableData.length - this.firstRowIndex;
      let lastIndex = firstIndex + this.rowsOnPage;
      if (lastIndex >= this.tableData.length) {
        lastIndex = this.tableData.length - 1;
      }
      return this.tableData.slice(firstIndex, lastIndex);
    },
  },
  watch: {
    // tableData: {
    //   handler: function (this: any) {
    //     if (this.tableData.length > this.rowsOnPage) {
    //       this.firstRowIndex = this.tableData.length - this.rowsOnPage;
    //     } else {
    //       this.firstRowIndex = 0;
    //     }
    //   },
    // },
  },
  mounted() {
    this.getAllTableNames();
    // this.getTables();
    // window.addEventListener("mousewheel", this.handleScroll, true); // 监听（绑定）滚轮滚动事件
  },
  methods: {
    async queryData(tableName: string) {
      const sql = `select * from ${tableName} LIMIT 100`;
      this.queryForm.sql = sql;
      await this.$nextTick();
      this.queryTable();
    },
    handleScroll(evt) {
      return;
    },
    onSQLChange() {
      let ast: any = {};
      try {
        ast = parser.parse(this.queryForm.sql);
      } catch (err) {
        console.error(err, typeof err);
        ElMessage.warning((err as any).message as string);
        return;
      }
      const limit = ast.value.limit;
      if (this.queryForm.autoLimit) {
        if (limit == null) {
          ast.value.limit = { type: "Limit", value: ["100"] };
        }
      }
      console.log(limit, ast, parser.stringify(ast));
      this.queryForm.sql = parser.stringify(ast);
    },
    async queryTable() {
      const data: QueriedData = await query({
        connectionString: `sqlite:///${this.sqlitePath}` as string,
        sql: this.queryForm.sql as string,
      });
      this.columns = data.schema.fields;
      this.tableData = data.data;
      this.getAllTableNames();
    },
    async getAllTableNames() {
      const tableNames = await getTableNames({
        connectionString: `sqlite:///${this.sqlitePath}` as string,
      });
      this.tableNames = tableNames;
    },
  },
});
</script>

<style>
.tableContainer .el-table td {
  padding: 0 0;
}

.tablenames {
  max-height: 30vh;
  overflow-y: auto;
}

.table-name-item{
  margin-top: 6px;
}

.table-name-item:hover {
  color: #409eff;
  cursor: default;
}
</style>
