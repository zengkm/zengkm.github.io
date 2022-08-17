## 1. 为对象动态分配属性  
在 JavaScript 中，我们可以很容易地为对象动态分配属性
```typescript
let developer = {};
developer.name = "semlinker";
```
在 TypeScript 中，编译器会提示以下异常信息：
```typescript
Property 'name' does not exist on type '{}'.
```
**解决办法**：
使用索引签名的形式定义一个 interface 可以接受 key 类型是字符串，值的类型是 any 类型的字段
```typescript
interface LooseObject {
  [key: string]: any
}
```
## 2. 