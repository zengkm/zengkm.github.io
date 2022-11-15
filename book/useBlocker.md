useBlocker—未保存退出拦截的通用解决方案
使用场景
在用户填写较大的表单时，防止因误操作跳出页面而丢失未保存的数据。
用户如果修改了表单值而没有保存，那么当：
- 执行history.push/go/replace等操作时；
- 用户点击页面上任何链接时；
- 用户点击浏览器前进后退按钮时；
均出现如下样式的弹窗提示：

点击确定则继续跳转，点击取消则留在当前页面。

用法
import { Form } from 'antd';
import { useBlocker } from 'src/utils';

const [form] = Form.useForm();
// 注册拦截器
// 内部调用了useHistory，所以把history实例返出来，可直接使用
const { resetForm, history } = useBlocker(form);

return (
  <DataFormLayout form={form} {...其他配置项} />
);

// 在以下三个场景下，调用 resetForm 重置表单初始值，而不要直接使用form.setFieldsValue：
//   - 进入新建页/复制页时，自动填充默认值
//   - 进入编辑页时，回填值
//   - 保存成功时

// 以『保存成功时』为例:
const submit = () => {
  form.validateFields().then(() => {
    const formValues = form.getFieldsValue(true);
    submitRequestFn(formValues)
      .then(() => {
        message.success('保存成功。');
        // 保存成功后一定要重置表单初始值，否则退出编辑页时会弹窗拦截
        resetForm(formValues);
        onCancel();
      });
  });
}


完整的 API 详见 src/utils/useBlocker/index.ts

建议：form里的数据格式与提交给后端的请求体格式尽量保持一致。 
对于不需要渲染成表单项的字段（如 id、objectCode 等），可以用一个hidden的<Form.Item>来收纳。
const info: DataFormLayoutInfoBlock[] = [
  {
    title: '基本信息',
    items: _.compact([
      { name: 'type', hidden: true },
      { name: 'objectCode', hidden: true },
      isEdit ? { name: 'id', hidden: true } : null,
      {
        label: '布局名称',
        name: 'name',
        rules: [
          { required: true, message: '布局名称必填' },
        ],
        render: () => <Input placeholder="请输入" />,
      },
      // ...
    ],
  },
  // ...
];


核心原理
Antd
- form.isFieldsTouched() 检查所有字段是否被改动过。 （经实践验证，该方法存在很大局限，改为使用值比较。详见下文。）
- form.resetFields() 重置所有字段，不仅value置为初始值，isTouched也会置为false。
- form.getFieldsValue(true) 取表单所有字段，包括当前未渲染FormItem的字（注：form.validateFields() 只能取到当前渲染出来的<Form.Item>里的字段）
Lodash
- _.isEqual(a, b) 递归进行值比较。直接用这个方法比较表单值相对于初始值是否有变化。
History（React-router-dom）
- history.block() 阻止跳转。其内部通过监听window的popstate事件来阻止页面跳转。（5.x改为使用beforeunload）
更多详见 Window: beforeunload event - Web API 接口参考 | MDN
Window
- window.confirm() 弹出一个阻塞式的弹窗，让用户确认是否跳转。
注：无法使用自定义弹窗（如antd的Modal.confirm）来代替window.confirm，因为history.block()的回调函数必须同步返回是否阻止跳转（return false则阻止跳转）。

与<Prompt>的比较
react-router-dom提供的<Prompt>组件同样可以拦截页面跳转，但它存在一个难以克服的缺陷：
因为<Prompt>是一个组件，只有渲染出来（或when值为true时）才有拦截之效；而form值的变化并不会引起父组件的重新渲染，这意味着当form值改变时，<Prompt>并不会实时重新渲染，也就起不到拦截的作用，除非我们手动去更新<Prompt>的状态。
而useBlocker并不依赖于渲染，它只是在进入页面时注册一个回调函数blocker，直到用户离开页面时blocker才会去检查form，故可以确保拿到最新的表单值。

如果编辑页是一个弹窗or抽屉
首先，useBlocker仍然可以阻止用户误点浏览器的返回按钮；
然后，以弹窗为例，为了防止用户误关弹窗丢失未保存数据，你可以加一道拦截判断：
import { useBlocker } from 'src/utils';

const { resetForm, shouldLeave } = useBlocker(form);

const onClose = () => shouldLeave() && setVisible(false);

效果：


Debug模式
如果在不该弹弹窗的时候弹弹窗，那么可以开启debug模式，打印出参与比较的 初始值（initialValues) 和 现值（formValues），看到底哪里出了问题。
const { resetForm, history } = useBlocker(form, { debug: true });


可以看出，现值比初始值多出了一个字段。可以通过引入一个 hidden 表单项的方式解决。

为什么不用 isFieldsTouched ?
form.isFieldsTouched() 可以直接判断是否有 <Form.Item> 被用户输入过。看起来是一个理想的解决方案，但在实践中发现其适用范围很窄。
原因在于，form.isFieldsTouched() 只判断当前页面上渲染出来的 <Form.Item> 的touched状态，而我们系统中，大量存在表单值不完全对应<Form.Item>的情况，如：分页表单、分步表单、『滑动窗口』表单（如SOP的控件列表，右侧的编辑区只显示当前选中的控件的值）。

分页表单

『滑动窗口』表单
以SOP控件编辑器为例，此时调用 form.isFieldsTouched()，只能判断当前控件的值对应的 <Form.Item> 是否被touch过，而无法判断其他控件的值有无修改。
所以 isFieldsTouched 只适用于非常简单的单页表单，这使它在我们的业务场景里基本没有实用价值。
