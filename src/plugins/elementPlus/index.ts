import type { App } from 'vue'
import ElementPlus, { ElLoading } from 'element-plus'

export const setupElementPlus = async (app: App<Element>) => {
  // 这套后台里大量页面直接使用了 <el-*> 组件，必须全局注册 Element Plus，
  // 否则运行时会退化成原生自定义标签，登录页和业务页都会出现“只剩壳子”的异常。
  app.use(ElementPlus)
  app.use(ElLoading)

  // 统一加载完整版样式，保证直接使用的组件都有对应的样式输出。
  await import('element-plus/dist/index.css')
}
