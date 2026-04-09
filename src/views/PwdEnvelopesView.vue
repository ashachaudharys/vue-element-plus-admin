<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <span>口令红包管理</span>
          <el-button type="primary" @click="handleAdd">添加口令红包</el-button>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="code" label="口令" width="150" />
        <el-table-column prop="amount" label="红包金额" width="120" />
        <el-table-column prop="count" label="总个数" width="100" />
        <el-table-column prop="claimed" label="已领取" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '有效' : '已过期/领完' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      :title="dialogType === 'add' ? '添加口令红包' : '编辑口令红包'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="口令" prop="code">
          <el-input v-model="form.code" placeholder="请输入口令" />
        </el-form-item>
        <el-form-item label="红包金额" prop="amount">
          <el-input-number v-model="form.amount" :min="0.01" :precision="2" :step="1" />
        </el-form-item>
        <el-form-item label="总个数" prop="count">
          <el-input-number v-model="form.count" :min="1" :step="1" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="有效"
            inactive-text="无效"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref([])
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const formRef = ref()

const form = ref({
  id: 0,
  code: '',
  amount: 1.00,
  count: 100,
  status: 1
})

const rules = {
  code: [{ required: true, message: '请输入口令', trigger: 'blur' }]
}

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await request.get({ url: '/admin/pwd-envelopes' })
    if (res.data) {
      tableData.value = res.data
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  dialogType.value = 'add'
  form.value = {
    id: 0,
    code: '',
    amount: 1.00,
    count: 100,
    status: 1
  }
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该口令红包吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete({ url: `/admin/pwd-envelopes/${row.id}` })
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error(error)
    }
  })
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (dialogType.value === 'add') {
          await request.post({ url: '/admin/pwd-envelopes', data: form.value })
          ElMessage.success('添加成功')
        } else {
          await request.put({ url: `/admin/pwd-envelopes/${form.value.id}`, data: form.value })
          ElMessage.success('修改成功')
        }
        dialogVisible.value = false
        fetchData()
      } catch (error) {
        console.error(error)
      } finally {
        submitLoading.value = false
      }
    }
  })
}

onMounted(() => {
  fetchData()
})
</script>
