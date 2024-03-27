# web性能优化
> web应用的执行主要涉及三个任务：取得资源、页面布局和渲染、JavaScript执行。其中，渲染和脚本执行在同一个线程上交错进行。所以，优化思路就有，减少网络阻塞，迅速取得资源，优化运行时的渲染和脚本执行。
## 首屏加载优化
### web性能检测
1. http请求由很多独立的阶段构成：DNS解析、TCP连接握手、TLS协商、发送HTTP请求、下载内容。
2. 可以在WebPageTest测试网页的性能，资源的瀑布图能够揭示页面的结构和浏览器处理顺序。
3. Navigation Timing可以获取应用的真实性能数据，比如DNS和TCP连接时间，而且精确度极高。  
加载页面，在浏览器访问标准的performance.timing对象，然后将其传回服务器分析。
### TCP优化思路
限制web性能的主要因素是客户端和服务器之间的网络往返延迟。这是TCP自身的局限性的影响。
TCP在不可靠的信道上面实现了可靠的网络传输。基本的分组错误检测和纠正、按序交付、丢包重发，以及保证网络最高效率的流量控制、拥塞控制和预防机制，让TCP的性能有所限制。   

核心原理是：
   * TCP三次握手增加了整整一次往返时间
   * TCP慢启动被应用到每一个新连接
   * TCP流量和拥塞控制会影响所有连接的吞吐量
   * TCP的吞吐量由当前拥塞窗口大小控制

优化方法：
1. 服务器配置调优
    * TCP的最佳实践及影响性能的底层算法只在最新内核中实现，让服务器内核保持到最新版本是优化发送端和接受端TCP栈的首要措施。
    * 增大TCP的初始拥塞窗口。可以让TCP在第一次往返就传输较多数据，随后的速度提升也会很明显。对于突发性的短暂连接，这也是特别关键的一个优化。
    * 禁用空闲后的慢启动。在连接空闲时禁用慢启动可以改善瞬时发送数据的长TCP连接的性能。
    * 启动窗口缩放。启用窗口缩放可以增加最大接收窗口的大小，可以让高延迟的连接达到更好吞吐量。
    * TCP快速打开。在某些条件下，允许在第一个SYN分组中发送应用数据。
2. 减少和重用TCP连接
   * 减少传输冗余数据
   * 压缩要传输的数据
   * 把服务器放到离用户近的地方减少往返时间（CDN）
   * 尽最大可能重用已经建立的TCP连接
### 浏览器的优化思路
浏览器可以自动替我们完成以下优化，节省几百毫秒的网络延迟。
1. 基于文档的优化。优先获取资源，提前解析。
2. 推测性优化。浏览器可以学习用户的导航模式，执行推测性优化，尝试预测用户的下一次操作。预先解析DNS、预先连接可能的目标。     

**大多数浏览器有如下4种技术：**
   1. 资源预取和排定优先次序
   2. DNS预解析
   3. TCP预连接
   4. 页面预渲染     

**如何利用浏览器的这些机制？**
1. 关注页面的结构和交付。
   * CSS和JavaScript等重要资源应该尽早在文档中出现。
   * 应该尽早交付CSS，从而解除渲染阻塞。
   * 非关键性JavaScript应该推迟，以避免阻塞DOM和CSSOM构建
   * HTML文档由解析器递增解析，从而保证文档可以间隙性发送
2. 在文档中嵌入提示，以触发浏览器为我们采用其他优化机制：
   * 预解析特定的域名 dns-prefetch
   * 预取得页面后面要用到的关键性资源 subresource
   * 预取得将来导航要用到的资源 prefetch
   * 根据对用户下一个目标的预测，预渲染特点页面 prerender
## 经典的性能优化最佳实践
> 无论什么网络，也不管所用网络协议是什么版本，所有应用的应该致力于消除不必要的网络延迟，将需要传输的数据压缩到最少。
1. 减少DNS查找。
2. 重用TCP连接。尽可能使用持久连接，消除TCP握手和慢启动延迟。
3. 减少HTTP重定向。重定向及其费时，特别是不同域名之间的重定向。
4. 使用CDN
5. 去掉不必要的资源
6. 在客户端缓存资源。避免每次请求都发送相同的内容。强制缓存和协商缓存。
7. 传输压缩过的内容。gzip压缩，html,css,javascript等文本经过gzip压缩可以减少60%-80%。图片：最佳图片格式，不要让图片超过它需要的大小，使用有损压缩，比如JPEG和webP。
8. 消除不必要的请求开销，如减少请求的HTTP首部数据，比如cookie，节省的时间相当于几次往返的延迟时间。却不最传输最低数量的元数据，更好的结构是完全不用cookie
9. 并行处理请求和相应。
    * 使用持久连接，从HTTP1.0升级到HTTP1.1
    * 利用多个HTTP1.1连接实现并行下载
    * 可能的情况下利用HTTP1.1管道
    * 考虑升级到 HTTP2.0提升性能
    * 确保服务器有足够的资源并行处理请求
10. 针对协议版本采取优化措施。  

针对HTTP1.x的优化建议：
* 利用HTTP管道
* 采用域名分区
* 打包资源以减少HTTP请求，如精灵图
* 考虑在父文档中嵌入小资源   

针对HTTP2.0的优化建议  
  * 服务器的初始cwnd应该是10个分组
  * 服务器应该通过ALPN协商支持TLS
  * 服务器应该支持TLS恢复以最小化握手延迟。
  * 杜绝和忘记域名分区、文件拼接、图片精灵等不良习惯，在http2.0之上完全没有必要，反而有害。
***

参考资料：《web性能权威指南》