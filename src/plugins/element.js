import Vue from 'vue'
// 导入需要的表单组件
import { Form, FormItem, Input, Button, Message } from 'element-ui'

Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Button)

// 将弹框组件绑定到Vue的原型上
Vue.prototype.$message = Message
