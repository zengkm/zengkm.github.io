阅读指南
阅读前建议：使用过Form.List，Form.Item，对于 源码中的Field有一定了解会更有利于理解
阅读时间：15分钟 ～ 20分钟
你能了解到：
  1. FormList 的 实现机制
  2. FormList 怎么处理增删移的操作？
  3. 为什么 FormList 下的Form.Item 不能用initialValue，preserve也无效？
  4. 为什么FormList 下的Form.Item，name只需要给出相对路径，且必须带有为[field.name，xxx]的形式？
Antd 4.x FormList的使用
假如实现一个form表单，用于收集登记班级信息，填写班级名称，班主任名字，以及同学的名字
返回的jsx代码结构大致如下
```javascript
<Form form={form} onFinish={handleFinish}>
  <Form.Item name={['baseInfo'，"class"]} label="班级">
    <Input />
  </Form.Item>
  <Form.Item name="teacher" label="老师">
    <Input />
  </Form.Item>
  <Form.List name="students">
    {(fields, { add }) => {
      return (
        <>
          {fields.map(field => (
            <div key={field.key}>
              <Space align="baseline">
                <Form.Item {...field} name={[field.name, 'name']} label="名字">
                  <Input />
                </Form.Item>
                <Form.Item name={[field.name, 'age']} label="年龄">
                  <Input />
                </Form.Item>
              </Space>
            </div>
          ))}
          <Form.Item>
            <Button onClick={() => add()}>add</Button>
          </Form.Item>
        </>
      );
    }}
  </Form.List>
</Form>
```
如果用Form.Item 写类似Form.List 的功能？
注意到官网有这样一句话：
[图片]
用Form.Item 去维护数组结构
```javascript
<Form form={form} onFinish={handleFinish}>
  <Form.Item name="class" label="班级">
    <Input />
  </Form.Item>
  <Form.Item name="teacher" label="老师">
    <Input />
  </Form.Item>
  <Form.Item name="students">
    ...
  </Form.Item>
</Form>
```
需要做的事情，思考：
1. 将数据交给form，我们期待的数据结构应如下：
```javascript
{
  class: 'bsdsdsd',
  teacher: 'Miss huang',
  students: [
    { name: 'sijia', age: 18 },
    { name: 'tangtang', age: 19 },
    ...
  ],
}
```
1. students 的数据如何去管理？
  1. 如何获取students的值？
  2. 如何管理formstore里list值结构，怎么去实现新增，删除，移动功能？
  3. 初始值怎么绑定？
  4. 数据变化了，如何触发组件的更新？
    ...

---
大概会写得出下述这样结构的代码
```javascript
<Form.Item name="students">
  <MyStudents prefixName="students" />
</Form.Item>
const MyStudents:React.FC<{ prefixName: string, form?: FormInstance, value?: any[], onChange?: (value: any) => void }>
  = ({ value = [], onChange, prefixName }) => {
  const handleAdd = (defaultValue?: any) => {
    const newVlaue = [...value, defaultValue];
 
    onChange?.(newVlaue);
  };

  return (
    <>
      {
        value?.map((item: any, index: number) => (
          <div>
            <Space align="baseline">
              <Form.Item name={[prefixName, index, 'name']} label="名字">
                <Input />
              </Form.Item>
              <Form.Item name={[prefixName, index, 'age']} label="年龄">
                <Input />
              </Form.Item>
            </Space>
          </div>
        ))
      }
      <Button onClick={() => handleAdd()}>add MyStudents</Button>
    </>
  );
};
```
问题： 移动，删除怎么处理？是否可以复用原来的节点，节约性能？
嘘！可能你心中已经有了答案，不如往下看，我们一起来确认一下

对比两个版本代码，我们猜测FormList 大概帮我们做了如下几件事：
1. prefixName 会加到每一个FormItem下
2. add，remove， move 函数帮忙封装了
3. 数组的坐标进行了管理（上述代码未实现）

antd 源码

看下来，只是在field上面，新增了字段 fieldKey
  import { List } from 'rc-field-form';
  ...
  return (
    <List {...props}>
      {(fields, operation, meta) => (
        <FormItemPrefixContext.Provider value={contextValue}>
          {children(
            fields.map(field => ({ ...field, fieldKey: field.key })),
            operation,
            {
              errors: meta.errors,
              warnings: meta.warnings,
            },
          )}
        </FormItemPrefixContext.Provider>
      )}
    </List>
  );

rc-field-form源码
几句话总结
  🐽  FormList 根本上还是由一组一组的Field组件组成的，最顶层的Field会用 isList 做标识，而内部的Field则会用 isListField 做标识。
  🐽 FormList 用ref.current ，挂载了{ keys: [], id: 0 } 这样的结构，keys中的 值 用于实现组件复用，而下标index用于与formStore中list的值做绑定，下标保持一致，而 id 用于生产新的keys，从而实现增删移。
  🐽 FormList 会将 form的 fieldContext 重写，加入前缀，从而 内部的Field 可以获取到每个字段的绝对路径，index 也是作为路径的一部分
  🐽 isListField 标识的字段会影响到字段的注销，Field对key值的处理，getFieldsValue返回值会忽略此字段实例，只能在 父字段 取


https://github1s.com/react-component/field-form/blob/master/src/List.tsx
export interface ListProps {
  name: NamePath;
  rules?: ValidatorRule[];
  // antd未暴露出来的api
  validateTrigger?: string | string[] | false;
  // formList 初始值
  initialValue?: any[];
  // 渲染函数
  children?: (
    fields: ListField[],
    operations: ListOperations,
    meta: Meta,
  ) => JSX.Element | React.ReactNode;
}
[图片]
Q： 为什么官网有这样的一条注意，原因是什么？
MyAnswer： initialValue 需要绝对路径去赋予，FormList设置初始值，
拦截Form 的 fieldContext
拦截后，内部的字段实例，只需要给出相对路径

// src/List.tsx

// line 41
const context = React.useContext(FieldContext);


// line 48

/* getNamePath 输出数组
 * 'a' => ['a']
 * 123 => [123]
 * ['a', 123] => ['a', 123]
 */
const prefixName: InternalNamePath = React.useMemo(() => {
  const parentPrefixName = getNamePath(context.prefixName) || [];
  return [...parentPrefixName, ...getNamePath(name)];
}, [context.prefixName, name]);

const fieldContext = React.useMemo(() => ({ ...context, prefixName }), [context, prefixName]);
  
// line 82
<FieldContext.Provider value={fieldContext}>
Field 中获取 fieldContext 的 prefixName 重新组合成新的 namePath，为绝对路径
仅FormList 下的字段实例，获取到 fieldContext 含有 prefixName
// src/Field.tsx

// line 189
public getNamePath = (): InternalNamePath => {
  const { name, fieldContext } = this.props;
  const { prefixName = [] }: InternalFormInstance = fieldContext;

  return name !== undefined ? [...prefixName, ...name] : [];
};

---
Q： 为什么list的字段实例传给 Field 的 name 是 [] ?
// src/Field.tsx

// line 81
<ListContext.Provider value={listContext}>
  <FieldContext.Provider value={fieldContext}>
    <Field
      name={[]}
      shouldUpdate={shouldUpdate}
      rules={rules}
      validateTrigger={validateTrigger}
      initialValue={initialValue}
      isList
    >
      {({ value = [], onChange }, meta) => {
         ...
         
         return children(...)
      }}
    </Field>
  </FieldContext.Provider>
</ListContext.Provider>

Ps:  isList 在源码中没有啥实际作用
/** @private Passed by Form.List props. Do not use since it will break by path check. */
isList?: boolean;

数据的管理&增删改移
暂时无法在飞书文档外展示此内容

keyManager
为实现 FormList 下一个 Item 的复用，FormList 给每一个item赋予了唯一的key值，并管理他们，而list的值还是在formStore里存取，每一个item的key值和其实际的数据需要保持一致，这里将保持其index的一致性，进行绑定，即，对于FormList中的每一个Item，实际数据，在formStore中维护（调用onChange去修改值），而其复用节点的key值，则在FormList的keys中维护，二者保持下标的一致性
- 用 ref.current 保存数据keys和id，keys 保留已有数据每一个组合的key值，而id记录了下一个新增组合的key值
- id 从 0 开始，依次递增，与当前的 index无关
- 每个key下标与formStore中List中对应的下标保持一致

// src/Field.tsx

// line 42
const keyRef = React.useRef({
  keys: [],
  id: 0,
});
const keyManager = keyRef.current;
ListOperations 
三个操作函数的定义
export interface ListOperations {
  add: (defaultValue?: StoreValue, index?: number) => void;
  remove: (index: number | number[]) => void;
  move: (from: number, to: number) => void;
}
其实现的原则无外乎不脱离以下几点：
1. 保持 key 和 valueList 的一致性，即同时操作key和valueList
2. id 使用后需 + 1，且永远向前看，作为下一个组合的key值记录
3. 对于 valueList 的操作，用onChange去触发
add的实现
- 获取到list的数据，对keys 和 list 执行同样的插入操作
- 用Field 的 onChange 方法将新数组更新到formStore里面
- 把id 加 1，作为下一个组合的key值
// src/List.tsx

// line 43

<Field
  name={[]}
  ...
  isList
>
  {({ value = [], onChange }, meta) => {
    const { getFieldValue } = context;
    const getNewValue = () => {
      const values = getFieldValue(prefixName || []) as StoreValue[];
      return values || [];
    };
    /**
     * Always get latest value in case user update fields by `form` api.
     */
    const operations: ListOperations = {
      add: (defaultValue, index?: number) => {
        // Mapping keys
        const newValue = getNewValue();

        if (index >= 0 && index <= newValue.length) {
          keyManager.keys = [
            ...keyManager.keys.slice(0, index),
            keyManager.id,
            ...keyManager.keys.slice(index),
          ];
          onChange([...newValue.slice(0, index), defaultValue, ...newValue.slice(index)]);
        } else {
          ...
          keyManager.keys = [...keyManager.keys, keyManager.id];
          onChange([...newValue, defaultValue]);
        }
        // 依次递增
        keyManager.id += 1;
      },
      remove: ...,
      move: ...,
    };
  }
</Field>

remove的实现

- 接受 参数为要移除数据的实际下标，number[] 时，移除多个
- 操作keys，移除对应的下标的值
- 同样通过onChange去操作valueList的值
// src/List.tsx

// line 127

remove: (index: number | number[]) => {
    const newValue = getNewValue();
    const indexSet = new Set(Array.isArray(index) ? index : [index]);

    if (indexSet.size <= 0) {
      return;
    }
    keyManager.keys = keyManager.keys.filter(
      (_, keysIndex) => !indexSet.has(keysIndex),
    );

    // Trigger store change
    onChange(newValue.filter((_, valueIndex) => !indexSet.has(valueIndex)));
  },

move 的实现

// src/List.tsx

import { move, getNamePath } from './utils/valueUtil';
...

  // line 141
  move(from: number, to: number) {
    if (from === to) {
      return;
    }
    const newValue = getNewValue();

    // Do not handle out of range
    if (from < 0 || from >= newValue.length || to < 0 || to >= newValue.length) {
      return;
    }

    keyManager.keys = move(keyManager.keys, from, to);

    // Trigger store change
    onChange(move(newValue, from, to));
  },
 ...

// src/utils/valueUtil.ts

// line 131

/**
 * Moves an array item from one position in an array to another.
 *
 * Note: This is a pure function so a new array will be returned, instead
 * of altering the array argument.
 *
 * @param array         Array in which to move an item.         (required)
 * @param moveIndex     The index of the item to move.          (required)
 * @param toIndex       The index to move item at moveIndex to. (required)
 */
export function move<T>(array: T[], moveIndex: number, toIndex: number) {
  const { length } = array;
  if (moveIndex < 0 || moveIndex >= length || toIndex < 0 || toIndex >= length) {
    return array;
  }
  const item = array[moveIndex];
  const diff = moveIndex - toIndex;

  if (diff > 0) {
    // move left
    return [
      ...array.slice(0, toIndex),
      item,
      ...array.slice(toIndex, moveIndex),
      ...array.slice(moveIndex + 1, length),
    ];
  }
  if (diff < 0) {
    // move right
    return [
      ...array.slice(0, moveIndex),
      ...array.slice(moveIndex + 1, toIndex + 1),
      item,
      ...array.slice(toIndex + 1, length),
    ];
  }
  return array;
}
对于 isListField 字段的处理
使用一： 调用getFieldsValue () 时，优化代码用
目的： FormList可以拿到所有list的值，无需去遍历剩余的每一个字段值
- getFieldsValue() 未传任何值时，会拿到所有有name的fieldEntities，通过entity.getNamePath()获取绝对路径，再通过绝对路径，获取其中的值，组成一个store返回
- 对于FormList来说，本身是一个实例，可以直接拿到其路径，返回所有的FormList的值，所以再去拿每一个item的某个实例，显得没有意义

  // src/useForm.ts
  
  // line 268
  private getFieldsValue = (nameList?: NamePath[] | true, filterFunc?: (meta: Meta) => boolean) => {
    ...
    const fieldEntities = this.getFieldEntitiesForNamePathList(
      Array.isArray(nameList) ? nameList : null,
    );

    const filteredNameList: NamePath[] = [];
    fieldEntities.forEach((entity: FieldEntity | InvalidateFieldEntity) => {
      const namePath =
        'INVALIDATE_NAME_PATH' in entity ? entity.INVALIDATE_NAME_PATH : entity.getNamePath();

      // Ignore when it's a list item and not specific the namePath,
      // since parent field is already take in count
      if (!nameList && (entity as FieldEntity).isListField?.()) {
        return;
      }

      if (!filterFunc) {
        filteredNameList.push(namePath);
      } else {
        ...
      }
    });

    return cloneByNamePathList(this.store, filteredNameList.map(getNamePath));
  };
使用二：Field组件卸载时，cancelRegisterFunc传参数使用
  // src/Field.ts
  
  // line 173
    
  public componentWillUnmount() {
    this.cancelRegister();
    this.triggerMetaEvent(true);
    this.mounted = false;
  }

  public cancelRegister = () => {
    const { preserve, isListField, name } = this.props;

    if (this.cancelRegisterFunc) {
      this.cancelRegisterFunc(isListField, preserve, getNamePath(name));
    }
    this.cancelRegisterFunc = null;
  };


private registerField = (entity: FieldEntity) => {
  ...
  // un-register field callback
  return (isListField?: boolean, preserve?: boolean, subNamePath: InternalNamePath = []) => {
    this.fieldEntities = this.fieldEntities.filter(item => item !== entity);

    // Clean up store value if not preserve
    if (!this.isMergedPreserve(preserve) && (!isListField || subNamePath.length > 1)) {
      const defaultValue = isListField ? undefined : this.getInitialValue(namePath);
      
      if(
        namePath.length &&
        this.getFieldValue(namePath) !== defaultValue &&
        this.fieldEntities.every(
          field =>
            // Only reset when no namePath exist
            !matchNamePath(field.getNamePath(), namePath),
        ) {
        const prevStore = this.store;
        this.updateStore(setValue(prevStore, namePath, defaultValue, true));
        ...
      }
    }
    ...
   }

 
使用三： Field内部对key值处理

//  src/Field.tsx

// line 628
  ...
  let key: string = 'keep';
  if (!restProps.isListField) {
    key = `_${(namePath || []).join('_')}`;
  }
  
   // Warning if it's a directly list field.
  // We can still support multiple level field preserve.
  if (
    process.env.NODE_ENV !== 'production' &&
    restProps.preserve === false &&
    restProps.isListField &&
    namePath.length <= 1
  ) {
    warning(false, '`preserve` should not apply on Form.List fields.');
  }

  return <Field key={key} name={namePath} {...restProps} fieldContext={fieldContext} />;
  ...
奇怪点一：
对于， isListField = true 来说，使用正确的话，namePath.length >= 2，是一定的
故同时满足  isListField && namePath.length <= 1 ，我认为使用正确的情况下，不可能发生
同「使用二」，!isListField || subNamePath.length > 1 肯定为 true
因为 isListField = true时，namePath.length >= 2
奇怪点二：
为什么一个FormList下的Item，每个Field组件的key值都一样，为'keep'


总结（划重点）
{
    fieldKey: 0 // antd封装
    isListField: true // 子字段的标识
    key: 0  // 每个item用key，react复用组件
    name: 0  // 内部field用，也是访问某个item的下标数据
}
1. 使用Form.List时，对于field中给的参数，key给到每一个item的节点上，方便react复用
2. 初始值要通过Form.List的intialValue去传递，或者form去传递，新增每一个item的默认值，可以用add里的参数去传递
3. 使用Form.List时，其字段的name都是相对Form.List父字段的相对路径，且必须为[field.name, xxx]的形式
4. 依赖Form.List下的某个字段的时候，一定要写绝对路径，不要忘记带上index下标
5. 如果你只想修改 Form.List 中单项值，请通过 setFieldValue 进行指定
(setFieldValue 是antd 4.22 新增的api，走的是setFields函数）
