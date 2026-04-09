<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <span>红包管理</span>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="user_id" label="发红包用户ID" width="120" />
        <el-table-column prop="total_amount" label="总金额" width="120" />
        <el-table-column prop="count" label="红包个数" width="100" />
        <el-table-column prop="type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.type === 'newbie' ? 'success' : 'warning'">
              {{ row.type === 'newbie' ? '新手红包' : '福利红包' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="wager_multiplier" label="流水倍数" width="100">
          <template #default="{ row }">
            {{ row.wager_multiplier === 0 ? '无' : row.wager_multiplier + '倍' }}
          </template>
        </el-table-column>
        <el-table-column prop="expire_days" label="有效期" width="100">
          <template #default="{ row }">
            {{ row.expire_days }}天
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" />
        <el-table-column prop="description" label="说明" />
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
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

const loading = ref(false)
const tableData = ref([])

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await request.get({ url: '/admin/red-envelopes' })
    if (res.data) {
      tableData.value = res.data
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该红包记录吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await request.delete({ url: `/admin/red-envelopes/${row.id}` })
      ElMessage.success('删除成功')
      fetchData()
    } catch (error) {
      console.error(error)
    }
  })
}

onMounted(() => {
  fetchData()
})
</script>
