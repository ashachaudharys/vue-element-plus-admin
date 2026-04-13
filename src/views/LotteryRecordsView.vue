<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>抽奖明细管理</span>
          <el-button type="primary" @click="handleAdd">添加模拟记录</el-button>
        </div>
      </template>

      <el-table :data="records" v-loading="loading" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="user_id" label="用户ID" width="120" />
        <el-table-column prop="type" label="抽奖类型" width="150">
          <template #default="scope">
            <el-tag v-if="scope.row.type === 'wheel'" type="success">大转盘</el-tag>
            <el-tag v-else-if="scope.row.type === 'ticket'" type="warning">抽奖券</el-tag>
            <el-tag v-else>{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="抽奖金额" width="150">
          <template #default="scope">
            <span style="color: #67c23a; font-weight: bold">{{ scope.row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="抽奖时间" width="200">
          <template #default="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加模拟记录对话框 -->
    <el-dialog title="添加模拟抽奖记录" v-model="dialogVisible" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="用户ID" prop="user_id">
          <el-input-number v-model="form.user_id" :min="1" style="width: 100%" />
        </el-form-item>

        <el-form-item label="抽奖类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
            <el-option label="大转盘 (wheel)" value="wheel" />
            <el-option label="抽奖券 (ticket)" value="ticket" />
          </el-select>
        </el-form-item>

        <el-form-item label="抽奖金额" prop="amount">
          <el-input-number
            v-model="form.amount"
            :min="0"
            :precision="2"
            :step="1"
            style="width: 100%"
          />
        </el-form-item>
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
const records = ref([])
const dialogVisible = ref(false)
const submitting = ref(false)
const formRef = ref()

const form = reactive({
  user_id: 1,
  type: 'wheel',
  amount: 10.0
})

const rules = {
  user_id: [{ required: true, message: '请输入用户ID', trigger: 'blur' }],
  type: [{ required: true, message: '请选择抽奖类型', trigger: 'change' }],
  amount: [{ required: true, message: '请输入抽奖金额', trigger: 'blur' }]
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
}

const fetchRecords = async () => {
  loading.value = true
  try {
    const res = await request.get({ url: '/admin/lottery-records' })
    records.value = res.data || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  Object.assign(form, {
    user_id: 1,
    type: 'wheel',
    amount: 10.0
  })
  dialogVisible.value = true
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该记录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete({ url: `/admin/lottery-records/${row.id}` })
      ElMessage.success('删除成功')
      fetchRecords()
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
        await request.post({ url: '/admin/lottery-records', data: form })
        ElMessage.success('添加成功')
        dialogVisible.value = false
        fetchRecords()
      } catch (error) {
        console.error(error)
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
