1. hooks需要在顶层调用的原因：react通过hook的调用顺序将state、useState对应起来，需要每次确保有相同的调用顺序，才能正常工作。不能在循环，条件或嵌套函数中调用Hook。如果我们想要有条件地执行一个effect，可以将判断放到Hook的内部。  
   
2. react中有两种流行的方式来共享组件之间的状态逻辑：render pops和高阶组件。hooks可以解决相同问题。
3. 在两个组件中使用相同的 Hook 会共享 state 吗？不会。自定义 Hook 是一种重用状态逻辑的机制(例如设置为订阅并存储当前值)，所以每次使用自定义 Hook 时，其中的所有 state 和副作用都是完全隔离的。
4. 自定义 Hook 如何获取独立的 state？每次调用 Hook，它都会获取独立的 state。由于我们直接调用了 useFriendStatus，从 React 的角度来看，我们的组件只是调用了 useState 和 useEffect。 正如我们在之前章节中了解到的一样，我们可以在一个组件中多次调用 useState 和 useEffect，它们是完全独立的。
5. useEffect 使用浅层比较法来比较数值。函数和数组的浅层比较将总是给出 false。  
解决办法：
* useCallback 返回一个memoized 版本的回调，只在依赖关系改变时才会改变。
```javascript
const getData = useCallback(() => {
  return window.localStorage.getItem("token");
}, []); // <- dependencies
```
* useRef 返回一个可变的对象，.current 具有初始值。
* useMemo 只有在依赖关系发生变化时才会重新计算记忆化的值。
```javascript
import React, { useMemo, useEffect, useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  const data = useMemo(
    () => ({
      is_fetched: false,
    }),
    []
  ); // <- dependencies
  useEffect(() => {
    setCount(count + 1);
  }, [data]);

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
```
1. 