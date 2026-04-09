<template>
  <div class="app-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>任务配置管理</span>
          <el-button type="primary" @click="handleAdd">添加任务</el-button>
        </div>
      </template>

      <el-table :data="tasks" v-loading="loading" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="任务标题" width="150" />
        <el-table-column prop="subtitle" label="副标题" width="200" />
        <el-table-column label="图标" width="100">
          <template #default="scope">
            <el-image 
              style="width: 40px; height: 40px"
              :src="scope.row.icon_url" 
              fit="contain"
            />
          </template>
        </el-table-column>
        <el-table-column prop="type" label="任务类型" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.type === 'deposit'" type="success">充值</el-tag>
            <el-tag v-else-if="scope.row.type === 'loss'" type="danger">亏损</el-tag>
            <el-tag v-else-if="scope.row.type === 'bet_slots'" type="warning">电子流水</el-tag>
            <el-tag v-else-if="scope.row.type === 'bet_cards'" type="warning">棋牌流水</el-tag>
            <el-tag v-else>{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="condition" label="条件描述" width="120" />
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

    <!-- 任务编辑对话框 -->
    <el-dialog :title="dialogType === 'add' ? '添加任务' : '编辑任务'" v-model="dialogVisible" width="800px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="任务标题" prop="title">
              <el-input v-model="form.title" placeholder="例如：每日首充福利" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="副标题" prop="subtitle">
              <el-input v-model="form.subtitle" placeholder="例如：每日首充送，最高送588U" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="图标URL" prop="icon_url">
              <el-input v-model="form.icon_url" placeholder="图片链接地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
                <el-option label="充值 (deposit)" value="deposit" />
                <el-option label="亏损 (loss)" value="loss" />
                <el-option label="电子流水 (bet_slots)" value="bet_slots" />
                <el-option label="棋牌流水 (bet_cards)" value="bet_cards" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="条件描述" prop="condition">
              <el-input v-model="form.condition" placeholder="例如：充值>=" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="显示进度条" prop="has_progress">
              <el-switch v-model="form.has_progress" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider>奖励阶梯规则</el-divider>
        
        <div v-for="(rule, index) in form.rules" :key="index" class="rule-item">
          <el-row :gutter="10" align="middle">
            <el-col :span="4">
              <div class="rule-label">阶梯 {{ index + 1 }}</div>
            </el-col>
            <el-col :span="8">
              <el-form-item label="条件值" label-width="60px" :prop="'rules.' + index + '.condition_value'" :rules="{ required: true, message: '请输入条件值', trigger: 'blur' }">
                <el-input-number v-model="rule.condition_value" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="奖励金额" label-width="80px" :prop="'rules.' + index + '.reward_amount'" :rules="{ required: true, message: '请输入奖励金额', trigger: 'blur' }">
                <el-input-number v-model="rule.reward_amount" :min="0" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-button type="danger" icon="Delete" circle @click="removeRule(index)" />
            </el-col>
          </el-row>
        </div>
        
        <div style="text-align: center; margin-top: 10px;">
          <el-button type="dashed" icon="Plus" @click="addRule">添加奖励阶梯</el-button>
        </div>
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
const tasks = ref([])
const dialogVisible = ref(false)
const dialogType = ref('add')
const submitting = ref(false)
const formRef = ref()

const form = reactive({
  id: 0,
  title: '',
  subtitle: '',
  icon_url: '',
  type: 'deposit',
  condition: '',
  has_progress: false,
  sort: 0,
  status: 1,
  rules: [
    { level: 1, condition_value: 0, reward_amount: 0 }
  ]
})

const rules = {
  title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择任务类型', trigger: 'change' }]
}

const fetchTasks = async () => {
  loading.value = true
  try {
    const res = await request.get({ url: '/admin/tasks' })
    tasks.value = res.data || []
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
    title: '',
    subtitle: '',
    icon_url: '',
    type: 'deposit',
    condition: '',
    has_progress: false,
    sort: 0,
    status: 1,
    rules: [
      { level: 1, condition_value: 0, reward_amount: 0 }
    ]
  })
  dialogVisible.value = true
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  Object.assign(form, JSON.parse(JSON.stringify(row)))
  if (!form.rules || form.rules.length === 0) {
    form.rules = [{ level: 1, condition_value: 0, reward_amount: 0 }]
  }
  dialogVisible.value = true
}

const handleStatusChange = async (row: any) => {
  try {
    await request.put({ url: `/admin/tasks/${row.id}`, data: row })
    ElMessage.success('状态更新成功')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确定要删除该任务吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete({ url: `/admin/tasks/${row.id}` })
      ElMessage.success('删除成功')
      fetchTasks()
    } catch (error) {
      console.error(error)
    }
  })
}

const addRule = () => {
  const level = form.rules.length + 1
  form.rules.push({ level, condition_value: 0, reward_amount: 0 })
}

const removeRule = (index: number) => {
  form.rules.splice(index, 1)
  // Reassign levels
  form.rules.forEach((rule, i) => {
    rule.level = i + 1
  })
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      submitting.value = true
      try {
        if (dialogType.value === 'add') {
          await request.post({ url: '/admin/tasks', data: form })
          ElMessage.success('添加成功')
        } else {
          await request.put({ url: `/admin/tasks/${form.id}`, data: form })
          ElMessage.success('更新成功')
        }
        dialogVisible.value = false
        fetchTasks()
      } catch (error) {
        console.error(error)
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.rule-item {
  background-color: #f8f9fa;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
}
.rule-label {
  font-weight: bold;
  color: #606266;
  text-align: center;
}
</style>
