## 引言：

> React <b>时间分片</b>、<b>插队机制</b>、<b>延迟任务</b>特性刚出来的时候，非常兴奋，总是想一探究竟, 奈何被业务拉住了脚步 👣。在平常封装业务组件以及公用组件的时候，很少用到里面的技巧，所以对于这些特性，也是非常想探究的，最近，闲下心来，认真学习技术，本文也是对三大特性进行模拟。

## 目标：

认真学习技术

## 学习目录：

1. 时间分片 ✅
2. 多任务调度 ✅
3. 插队机制 ✅
4. 延迟任务 ✅

## 思考 🤔：

1. Fiber 为什么需要时间分片?
2. 时间分片应选择微任务还是宏任务?
3. 为什么不选择 setTimeout(fn, 0)?
4. 为什么不选择 requestAnimationFrame(fn)?
5. setTimeout(fn, 0)和 requestAnimationFrame(fn)回调谁先执行？
6. Scheduler 调度方式和生成器函数（Generator Function）调度方式差不多，为什么不使用生成器函数（Generator Function）调度方式?[参考](https://github.com/facebook/react/issues/7942#issuecomment-254987818)

[掘金](https://juejin.cn/post/6953804914715803678)相信大家如果对事件循环了解，以上问题迎刃而解，

⚠️ 补充：浏览器每次事件循环不一定都会伴随一次更新渲染，由于<b>rendering opportunities (渲染时机)</b>的原因。

> 问题 3: 为什么不选择 setTimeout(fn, 0)?：
> 1、 除了递归浪费 4 毫秒。
> 2、由于渲染时机原因，宏任务可能合并，造成调和某个 Fiber 节点忽略，不稳定，难以把握。[参考](https://github.com/llaurora/KnowledgeNote/blob/master/%E6%B5%8F%E8%A7%88%E5%99%A8%E7%BD%91%E7%BB%9C/Event%20Loop.md)

> 问题 5: setTimeout(fn, 0)和 requestAnimationFrame(fn)回调谁先执行？
> 1、不管谁在前还是后，还是在一起执行。由于渲染时机原因存在，需要看当前渲染时机是否存在渲染更新。在看回调执行时机。

## 参考：

- [eventLoop](https://github.com/llaurora/KnowledgeNote/blob/master/%E6%B5%8F%E8%A7%88%E5%99%A8%E7%BD%91%E7%BB%9C/Event%20Loop.md)
- [Generator Function](https://github.com/facebook/react/issues/7942#issuecomment-254987818)
- [掘金](https://juejin.cn/post/6953804914715803678)
