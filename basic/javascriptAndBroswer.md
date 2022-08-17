# 运行环境
> javascript是脚本语言，不能编译后直接运行，必须借助引擎（解释器），只能在封装了引擎的环境下运行。
1. 浏览器环境  
   * javascript由三部分组成：ECMAScript BOM DOM
   
2. 非浏览器环境：node.js、mongodb  
   * nodejs: 以ECMAScript为基础，扩展出I/O操作、文件操作、数据库操作等。
   * mongodb: 作为shell脚本操作数据库
# 浏览器环境
浏览器的核心是两部分：渲染引擎和javascript解释器
## 渲染引擎
> 渲染引擎的主要作用是，将网页代码渲染为用户视觉可以感知的平面文档。  

渲染引擎处理网页的四个阶段（并非严格按顺序执行）：
1. 解析代码：HTML 代码解析为 DOM，CSS 代码解析为 CSSOM（CSS Object Model）
2. 对象合成：将 DOM 和 CSSOM 合成一棵渲染树（render tree）
3. 布局：计算出渲染树的布局（layout）
4. 绘制：将渲染树绘制到屏幕
## 重排和重绘
布局流（flow）：渲染树转换为网页布局
绘制（paint）：布局显示到页面。
布局流和绘制都具有阻塞效应，并且会耗费很大时间和计算资源。
重排（reflow）：改变元素布局
重绘（repaint）：改变元素颜色透明度等
> 降低重排和重绘次数的优化技巧: 
> 1. 读取 DOM 或者写入 DOM，尽量写在一起，不要混杂
> 2. 不要一项一项地改变样式，而是使用 CSS class 一次性改变样式
> 3. 缓存 DOM 信息
> 4. 使用documentFragment操作 DOM
> 5. 动画使用absolute定位或fixed定位，这样可以减少对其他元素的影响
> 6. 只在必要时才显示隐藏元素
> 7. 使用window.requestAnimationFrame()，因为它可以把代码推迟到下一次重流时执行，而不是立即要求页面重流
> 8. 使用虚拟DOM（virtual DOM）库
## javascript引擎
javascript是一种解释型语言，由解释器实时运行。但每次运行都要调用解释器，为了提高运行速度，现代浏览器都会进行一定程度的预编译。 

预编译期：
* 全局预编译
* var和function的声明提升
* 与编译后顺序执行
# 运行机制
事件循环