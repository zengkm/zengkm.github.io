## 断言
> 没有运行时的影响，只是在编译阶段起作用 
### 1. 类型断言
尖括号语法:
```typescript
let someValue: any = "this is a string";
let strLength: number = (<string>someValue).length;
```
as语法:
```typescript
let someValue: any = "this is a string";
let strLength: number = (someValue as string).length;
```
### 2. 非空断言  
> x! 将从 x 值域中排除 null 和 undefined  
 
忽略undefined 和 null 类型：
```typescript
function myFunc(maybeString: string | undefined | null) {
  // Type 'string | null | undefined' is not assignable to type 'string'.
  // Type 'undefined' is not assignable to type 'string'. 
  const onlyString: string = maybeString; // Error
  const ignoreUndefinedAndNull: string = maybeString!; // Ok
}
```
调用函数时忽略 undefined 类型:
```typescript
type NumGenerator = () => number;

function myFunc(numGenerator: NumGenerator | undefined) {
  // Object is possibly 'undefined'.(2532)
  // Cannot invoke an object which is possibly 'undefined'.(2722)
  const num1 = numGenerator(); // Error
  const num2 = numGenerator!(); //OK
}
```
### 3. 确定赋值断言
> 在实例属性和变量声明后面放置一个 ! 号，从而告诉 TypeScript 该属性会被明确地赋值  
```typescript
let x!: number;
initialize();
console.log(2 * x); // Ok

function initialize() {
  x = 10;
}
```
## 

