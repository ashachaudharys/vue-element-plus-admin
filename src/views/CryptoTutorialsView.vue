<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>购买货币教程管理</span>
          <el-button type="primary" @click="handleAdd">添加教程</el-button>
        </div>
      </template>

      <el-table :data="tutorials" v-loading="loading" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="平台名称" width="150" />
        <el-table-column prop="domain" label="域名" width="200" />
        <el-table-column label="图标" width="100">
          <template #default="scope">
            <el-image 
              style="width: 40px; height: 40px"
              :src="scope.row.icon_url" 
              fit="contain"
            />
          </template>
        </el-table-column>
        <el-table-column prop="tutorial_url" label="教程链接" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 教程编辑对话框 -->
    <el-dialog :title="dialogType === 'add' ? '添加教程' : '编辑教程'" v-model="dialogVisible" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="平台名称" prop="name">
          <el-input v-model="form.name" placeholder="例如：火币网" />
        </el-form-item>
        
        <el-form-item label="域名" prop="domain">
          <el-input v-model="form.domain" placeholder="例如：huobi.com" />
        </el-form-item>
        
        <el-form-item label="图标URL" prop="icon_url">
          <el-input v-model="form.icon_url" placeholder="图片链接地址" />
        </el-form-item>
        
        <el-form-item label="教程链接" prop="tutorial_url">
          <el-input v-model="form.tutorial_url" placeholder="教程跳转链接" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/axios'

const loading = ref(false)
const tutorials = ref([])
const dialogVisible = ref(false)
const dialogType = ref('add')
const submitting = ref(false)
const formRef = ref()

const form = reactive({
  id: 0,
  name: '',
  domain: '',
  icon_url: '',
  tutorial_url: '',
  sort: 0,
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入平台名称', trigger: 'blur' }],
  domain: [{ required: true, message: '请输入域名', trigger: 'blur' }]
}

const fetchTutorials = async () => {
  loading.value = true
  try {
    const res = await request.get({ url: '/admin/crypto-tutorials' })
    tutorials.value = res.data || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogType.value = 'add'
  Object.assign(form, {
    id: 0,
    name: '',
    domain: '',
    icon_url: '',
    tutorial_url: '',
    sort: 0,
    status: 1
  })
  dialogVisible.value = true
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  Object.assign(form, JSON.parse(JSON.stringify(row)))
  dialogVisible.value = true
}

const handleStatusChange = async (row: any) => {
  try {
    await request.put({ url: `/admin/crypto-tutorials/${row.id}`, data: row })
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该教程吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete({ url: `/admin/crypto-tutorials/${row.id}` })
      ElMessage.success('删除成功')
      fetchTutorials()
    } catch (error) {
      console.error(error)
    }
  })
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true
      try {
        if (dialogType.value === 'add') {
          await request.post({ url: '/admin/crypto-tutorials', data: form })
          ElMessage.success('添加成功')
        } else {
          await request.put({ url: `/admin/crypto-tutorials/${form.id}`, data: form })
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        fetchTutorials()
      } catch (error) {
        console.error(error)
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  fetchTutorials()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
