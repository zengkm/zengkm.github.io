1、整体架构
[图片]

2、数据流
Antd的表单数据管理思路类似于Redux：用一个单一的大对象来存储整个表单的数据，且数据流与UI渲染相互独立。每次修改数据时，antd会手动去触发UI更新。

数据存放
表单数据是一个普通的JS对象，存放在formStore实例的store字段。
表单项的值与表单项的meta数据（如 name、touched、validating、errors 等）分开存放。
数据读取
调用form.getFieldsValue(true)会直接返回store对象；
如果不传参调用，即 form.getFIeldsValue()，那么 formStore 会根据自己持有的字段实例（fieldEntity，详见下文）到store上进行取值操作，最终返回的值对象可能会补上一些store里没有的字段；
如果传入了namePath数组，那么再加一层筛选逻辑。
读取数据都是同步返回结果。
数据修改
调用form.setFieldsValue(values)会用传入的values对象对原来的store对象进行 immutable 的增量更新。
调用form.setFieldValue、form.setFields则是以 immutable 的方式『修改』原store，将指定namepath的值换掉。
调用form.resetFields()是用initialValues对象（由<Form>组件的props传入）直接替换掉store。
这些操作都是同步更新store，故set之后立即get能取到最新的值。
UI输入修改数据
见下文。

3、数据与UI双向绑定
3.1 form实例绑定到<form>元素
<Form>组件拿到formInstance，返回一个原生<form>元素，在onSubmit时调用formInstance.submit()，onReset时调用formInstance.resetFields()，如此将这两个方法绑定到DOM API（但是只绑定了触发时机，没有使用原生的事件，自然没有使用原生的数据收集功能）。

3.2 表单数据映射到<Form.Item>
先看数据侧如何持有字段管理对象。formStore实例有一个私有属性fieldEntities，是维护表单所有字段的数组。同时提供了一个内部方法registerField，暴露给组件调用。
Antd对外暴露的字段组件是<Form.Item>，它内部引用了<Field>来实现。而<Field>既是个ReactComponent，同时也是管理字段元数据的实例，二合一（是的，它还在用class component）。
class Field extends React.Component<InternalFieldProps, FieldState> implements FieldEntity { ... }
当一个Field实例&组件被创建完成时（componentDidMount：没错，正是在下），它会利用context提供的registerField方法，将自己添加进fieldEntities数组，这样formStore就能操作它了。
PS：这就可以理解，为什么对字段的管理强依赖于其组件的渲染。

3.3 输入控件获取value
接下来看看，输入控件如何取到值？
<Form.Item>向<Field>传入一个匿名函数作为children，在这个函数里定义了如何渲染输入控件。该函数签名为：
(control, renderMeta, context) => { ... }
查看<Field>组件内部调用该匿名函数的逻辑，可以发现这个 control 是一个信息含量很丰富的对象，其中就有value（以及valuePropName），值自然是根据字段的 namePath 从 store 里取出来的。
<Form.Item>这边拿到control后，整合一下，传递给children，也就是我们定义的输入控件。
const mergedControl = { ...control }; // 这里包含value
const childProps = { ...children.props, ...mergedControl }; // 这里用React.memo包了一层
childNode = (
  <MemoInput
    value={mergedControl[props.valuePropName || 'value']}
    update={children}
  >
    {cloneElement(children, childProps)} // value传递给children
  </MemoInput>
);
这样输入控件就拿到包括value在内的props啦！

3.4 字段组件响应store的变化
再来看看，修改数据如何引起字段组件重新渲染。
注意到 store 并非<Form>或<Form.Item>的props，也没有放在state或context里，所以修改其值不会自动引起字段组件的重新渲染，需要手动去触发。
以 form.setFields 为例，调用这个方法除了会将 store 对象换掉以外，还会调用一个内部方法notifyObservers，看名字就知道用了观察者模式。这个方法主要就干一件事：遍历 fieldEntities 数组，对每个Field实例调用其onStoreChange方法。
Field实例对外暴露的onStoreChange方法类似于reducer，其参数签名如下：
public onStoreChange = (
  // 旧的store
  prevStore: Store,
  // 本次修改涉及的namePath，如果是修改整个store就传null
  namePathList: InternalNamePath[] | null,
  // 本次修改的具体信息，包括新的store，以及不同的字段操作type及其payload
  info: ValuedNotifyInfo
) => { ... }
完整的NotifyInfo定义看这里，简单理解，把info类比成Redux里的action就行了。
每个字段在收到这3个入参之后，会自行判断如何响应。比如，一个字段发现namePathList里含有自己的namePath，而 info.type 是’setField’，那么它就会相应修改自己的元数据，然后执行reRender（实现就是 forceUpdate），这样就实现了UI的同步更新。
顺便说一句，如果给<Form.Item>传了 shouldUpdate 或 dependencies，也是在这个方法里处理。

梳理一下，数据修改引起表单重新渲染的大致流程：
1. 字段组件渲染完成后，将自己添加到 formStore 的字段实例数组
2. 用户调用 form.setFieldxxx 修改表单值
3. 存储表单值的 store 对象首先被同步替换掉
4. formStore 遍历字段实例数组，挨个通知（调用 onStoreChange）
5. 每个字段判断自己要不要重新渲染，要的话就执行一下 forceUpdate，用最新的value渲染输入控件

3.5 用户输入触发store变化
最后来看看用户输入如何反应到 store。
我们知道 antd 里输入控件的 props 必须支持传入一个收集字段值的回调函数，默认名为 onChange，可以通过在<Form.Item>上设置trigger属性来修改。
回想上文提到的<Form.Item>给<Field>传的匿名函数，其 control 入参对象上除了有value，还有 onChange，代码逻辑很简单，贴一下核心点：
// Add trigger
 control[trigger] = (...args: EventArgs) => {
    let newValue: StoreValue;
    if (getValueFromEvent) {
      newValue = getValueFromEvent(...args);
    } else {
      newValue = defaultGetValueFromEvent(valuePropName, ...args);
    }
    if (normalize) {
      newValue = normalize(newValue, value, getFieldsValue(true));
    }
    // dispatch 来自 formStore 实例
    dispatch({
      type: 'updateValue',
      namePath,
      value: newValue,
    });
};
这意味着当输入控件触发onChange事件时，字段实例会dispatch一个action，formStore实例收到后进行相应的处理，将store更新。同时还调用notifyObservers昭告所有字段，这样和当前字段有依赖关系的字段都会收到通知，可以执行相应的操作。

4、小结&推论
- 表单的数据修改是同步的
- 表单的渲染是异步的，由各个字段独立控制，一般不会触发表单整体渲染
- 表单字段的功能（如校验、联动）与字段组件的渲染强绑定
- 数据与UI的绑定采用观察者模式，每个字段独立观察store的变化，并自主判断响应动作
- 表单逻辑比较重，每次onChange都会同步触发所有字段的响应，在字段较多时进行输入，可能遇到性能问题
- 表单项组件的封装层级比较深，DOM结点多
- 长表单性能优化思路：分页/虚拟滚动。由于表单数据与UI是独立的，故可以考虑每次只渲染部分表单项（但需确保与未渲染的表单项不存在联动关系，且要解决校验问题）。

参考
- rc-field-form
- antd-form