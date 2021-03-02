<template>
  <div>
    <h1>
      <b style="color: #5ac754">Spring Hook</b> Dashboard
    </h1>
    <br>
    <el-container v-show="showBeanTable">
      <el-header>
        <el-form :inline="true" :model="searchCondition" class="demo-form-inline">
          <el-form-item label="bean name">
            <el-input @keyup.enter="onSubmit" v-model="searchCondition.beanName" placeholder="beanName"></el-input>
          </el-form-item>
          <el-form-item label="class name">
            <el-input @keyup.enter="onSubmit" v-model="searchCondition.className" placeholder="className"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">查询</el-button>
          </el-form-item>
        </el-form>
      </el-header>
      <el-main>
        <el-table
            :data="tableData"
            stripe border
            height="400"
            style="width: 100%">
          <el-table-column
              type="index"
              label="index"
              align="center"
              width="100">
          </el-table-column>
          <el-table-column
              prop="beanName"
              label="bean name"
              header-align="center"
              width="300">
          </el-table-column>
          <el-table-column
              prop="className"
              label="class name"
              header-align="center"
              width="800">
          </el-table-column>
          <el-table-column
              label="operation"
              min-width="100"
              align="center"
              fixed="right">
            <template v-slot="scope">
              <el-button type="text" @click="operateBean(scope.row)">操作</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>

    <el-container v-show="showBeanDetail">
      <el-header class="beanDetailHeader">
        <el-button size="mini" type="primary" icon="el-icon-back" circle @click="backToBeanTable"></el-button>
        <b style="margin: 0 10px">{{ beanName }}</b>
        <el-upload
            style="float: right"
            ref="upload"
            :action="uploadUrl"
            :before-upload="beforeUploadForm"
            :on-success="uploadSuccess"
            :on-error="uploadError"
            :file-list="fileList"
            limit="1"
            accept=".class"
            multiple="false"
            :auto-upload="true">
          <el-button size="small" type="primary">
            <slot name="trigger"></slot>
            替换bean</el-button>
        </el-upload>
      </el-header>
      <el-main>
        <el-table :data="methodList" stripe border style="width: 100%">
          <el-table-column type="index" label="index" align="center" width="100"></el-table-column>
          <el-table-column prop="methodName" label="name" align="center" width="200"></el-table-column>
          <el-table-column prop="returnClass" label="return type" align="center" width="300"></el-table-column>
          <el-table-column prop="argClassListString" label="args" align="center" width="600"></el-table-column>
          <el-table-column label="operation" min-width="100" align="center" fixed="right">
            <template v-slot="scope">
              <el-button type="text" @click="operateMethod(scope.row)">操作</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
      <el-footer @click="backToBeanTable">
        <el-button >返回</el-button>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'App',
  components: {
  },
  data() {
    return {
      showBeanTable: true,
      showBeanDetail: false,
      beanName: null,
      beanDetail: null,
      methodList: [],
      fileList: [],
      uploadUrl: null,
      searchCondition: {
        beanName: null,
        className: null
      },
      tableData: []
    }
  },
  created() {
    this.searchBean();
  },
  methods: {
    searchBean() {
      axios.get('/spring/hook/bean', {
        params: {beanName: this.searchCondition.beanName, className: this.searchCondition.className}
      }).then(res => {
        this.tableData = res.data;
      })
    },
    onSubmit() {
      this.searchBean();
    },
    operateBean(row) {
      this.beanName = row.beanName;
      this.showBeanTable = false;
      this.showBeanDetail = true;
      this.showReplaceBean = false;
      this.uploadUrl = "/spring/hook/replaceBean?beanName=" + this.beanName;
      axios.get('/spring/hook/bean/detail/' + this.beanName)
          .then(res => {
            console.log(res)
            this.beanDetail = res.data;
            this.methodList = res.data.methodList;
          })
    },
    operateMethod(row) {
      console.log(row)
    },
    backToBeanTable() {
      this.showBeanTable = true;
      this.showBeanDetail = false;
    },
    uploadSuccess(res) {
      if (res === 'SUCCESS') {
        alert("上传成功")
        return;
      }
      alert("上传失败：" + res)
      this.fileList = [];
    },
    uploadError(e) {
      alert("上传失败:" + e)
      this.fileList = [];
    },
    // 开始上传前验证
    beforeUploadForm (file) {
      // 验证文件类型
      let postfix = file.name.substring(file.name.lastIndexOf('.') + 1)
      const extension = postfix === 'class'
      if (!extension) {
        this.$message({
          message: '上传文件只能是class格式!',
          duration: 1000,
          showClose: true,
          type: 'warning'
        })
      }
      return extension
    },
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 30px;
}
.el-footer {
  text-align: center;
  line-height: 60px;
}

.beanDetailHeader{
  text-align: left;
  padding-top: 10px;
}
</style>
