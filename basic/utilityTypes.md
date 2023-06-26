## 泛型约束
> 有时候我们定义的泛型不想过于灵活或者说想继承某些类等，可以通过 extends 关键字添加泛型约束。
```typescript
interface Lengthwise {
  length: number;
}
function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

// 现在这个泛型函数被定义了约束，因此它不再是适用于任意类型：
loggingIdentity(3);  // Error, number doesn't have a .length property

// 这时我们需要传入符合约束类型的值，必须包含必须的属性：
loggingIdentity({length: 10, value: 3});
```
## type和interface的区别
> type和interface非常相似，大多数情况下可以自由选择使用。唯一的区别是，type一旦创建，就不能再在里面添加属性。
```typescript
// Extending an interface
interface Animal {
  name: string
}
interface Bear extends Animal {
  honey: boolean
}
// Extending a type via intersections
type Animal = {
  name: string
}
type Bear = Animal & { 
  honey: boolean 
}
```
# Utility Types
## 1. Partial\<T>
> 将T中所有属性转换为可选属性。返回的类型可以是T的任意子集
```typescript
// 源码解析：
type Partial<T> = { [P in keyof T]?: T[P]; };

// 例子：
export interface UserModel {
  name: string;
  age?: number;
  sex: number;
}
type JUserModel = Partial<UserModel>
// =
type JUserModel = {
    name?: string | undefined;
    age?: number | undefined;
    sex?: number | undefined;
}
```

## 2. Required\<T>
> 通过将T的所有属性设置为必选属性来构造一个新的类型。与Partial相反
```typescript
type JUserModel2 = Required<UserModel>
// =
type JUserModel2 = {
    name: string;
    age: number;
    sex: number;
}
```
## 3. Readonly\<T>
> 将T中所有属性设置为只读
```typescript
type JUserModel3 = Readonly<UserModel>
// =
type JUserModel3 = {
    readonly name: string;
    readonly age?: number | undefined;
    readonly sex: number;
}
```
## 4. Record\<K,T>
> 构造一个类型，该类型具有一组属性K，每个属性的类型为T。可用于将一个类型的属性映射为另一个类型。Record 后面的泛型就是对象键和值的类型。
```typescript
interface CatInfo {
  age: number;
  breed: string;
}
 
type CatName = "miffy" | "boris" | "mordred";
 
const cats: Record<CatName, CatInfo> = {
  miffy: { age: 10, breed: "Persian" },
  boris: { age: 5, breed: "Maine Coon" },
  mordred: { age: 16, breed: "British Shorthair" },
};
```
## 5. Pick<T,K>
> 在一个声明好的对象中，挑选一部分出来组成一个新的声明对象
```typescript
interface Todo {
  title: string;
  description: string;
  done: boolean;
}
type TodoBase = Pick<Todo, "title" | "done">;
// =
type TodoBase = {
    title: string;
    done: boolean;
}
```
## 6. Omit\<T,K>
> 从T中取出除去K的其他所有属性。与Pick相对。
## 7. Exclude<T,U>
> 从T中排除可分配给U的属性，剩余的属性构成新的类型
```typescript
type T0 = Exclude<'a' | 'b' | 'c', 'a'>; 
// = 
type T0 = "b" | "c"
```
## 8. Extract\<T,U>
> 从T中抽出可分配给U的属性构成新的类型。与Exclude相反
```typescript
type T0 = Extract<'a' | 'b' | 'c', 'a'>; 
// = 
type T0 = 'a'
```
## 9. NonNullable\<T>
> 去除T中的 null 和 undefined 类型
## 10. Parameters\<T>
> 返回类型为T的函数的参数类型所组成的数组
```typescript
type T0 = Parameters<() => string>;  // []
type T1 = Parameters<(s: string) => void>;  // [string]
```
## 11. ReturnType\<T>
> function T的返回类型
```typescript
type T0 = ReturnType<() => string>;  // string
type T1 = ReturnType<(s: string) => void>;  // void
```
## 12. InstanceType\<T>
> 返回构造函数类型T的实例类型
```typescript
class C {
  x = 0;
  y = 0;
}
type T0 = InstanceType<typeof C>;  // C
```