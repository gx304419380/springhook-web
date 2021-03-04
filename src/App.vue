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
            height="450"
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
          <el-button type="primary">
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
              <el-button type="text" @click="operateMethod(scope.row)">修改</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
      <el-footer>
        <el-button round @click="backToBeanTable">返回</el-button>
      </el-footer>
    </el-container>

    <el-container v-show="showMethodForm">
      <el-header style="text-align: left">
        <el-button size="mini" type="primary" icon="el-icon-back" circle @click="backToBeanDetail"></el-button>
        <b style="margin: 0 10px">{{beanName}}::{{ methodForm.methodName }}</b>
      </el-header>
      <el-main style="text-align: left">
        <el-form ref="form" :model="methodForm" label-width="80px">
          <el-form-item label="修改类型">
            <el-select v-model="methodForm.hookMethodType" placeholder="请选修改方法类型" default-first-option>
              <el-option label="Replace" value="REPLACE"></el-option>
              <el-option label="Before" value="BEFORE"></el-option>
              <el-option label="After" value="AFTER"></el-option>
              <el-option label="Finally" value="FINALLY"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="方法代码">
            <el-input class="codeEditor" :rows="13" type="textarea" v-model="methodForm.methodCode"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onMethodSubmit">Submit</el-button>
            <el-button @click="backToBeanDetail">Back</el-button>
          </el-form-item>
        </el-form>
      </el-main>
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
      showMethodForm: false,
      beanName: null,
      beanDetail: null,
      methodList: [],
      fileList: [],
      uploadUrl: null,
      methodForm: {
        methodName: null,
        argClassList:[],
        beanName: null,
        hookMethodType: 'REPLACE',
        methodCode: null
      },
      searchCondition: {
        beanName: null,
        className: null
      },
      tableData: []
    }
  },
  created() {
    this.getDefaultPackage();
    this.searchBean();
  },
  methods: {
    getDefaultPackage() {
      axios.get('/spring/hook/package')
      .then(res => {
        this.searchCondition.className = res.data;
      })
    },
    searchBean() {
      axios.get('/spring/hook/bean', {
        params: {beanName: this.searchCondition.beanName, className: this.searchCondition.className}
      }).then(res => {
        this.tableData = res.data;
      }).catch(res => {
        console.log(res);
        alert("search bean error")
      })
    },
    onSubmit() {
      this.searchBean();
    },
    operateBean(row) {
      this.beanName = row.beanName;
      this.showBeanTable = false;
      this.showBeanDetail = true;
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
      this.methodForm.methodName = row.methodName;
      this.methodForm.argClassList = row.argClassList;
      this.methodForm.beanName = this.beanName;
      this.methodForm.methodCode = null;
      this.showMethodForm = true;
      this.showBeanDetail = false;
    },
    backToBeanTable() {
      this.showBeanTable = true;
      this.showBeanDetail = false;
    },
    backToBeanDetail() {
      this.showBeanDetail = true;
      this.showMethodForm = false;
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
    onMethodSubmit() {
      console.log(this.methodForm)
      this.$confirm('确定修改方法?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        axios.post('/spring/hook/replaceMethod', this.methodForm)
            .then(res => {
              if (res.data === 'SUCCESS') {
                this.$message({
                  message: '方法修改完毕',
                  duration: 2000,
                  showClose: true,
                  type: 'success'
                })
                return;
              }
              this.$message({
                message: '发生错误：' + res.data,
                duration: 2000,
                showClose: true,
                type: 'error'
              })

            })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    }

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

.codeEditor .el-textarea__inner {
  background-color: #2c3e50;
  color: white;
  font-family: Consolas, sans-serif;
}
</style>
