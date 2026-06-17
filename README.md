# 机械考研可视化学习平台

> Mechanical Engineering Graduate Exam — Interactive Visualization Platform

交互式机械原理可视化演示工具，面向考研学子，帮助理解核心知识点。

## 演示模块

| 章节 | 模块 | 文件 | 说明 | 状态 |
|------|------|------|------|------|
| 第3章 平面连杆机构 | 四杆机构 | `four-bar-linkage.html` | 曲柄摇杆机构运动学可视化，参数调节、传动角/压力角实时显示 | ✅ 已完成 |
| 第3章 平面连杆机构 | 曲柄摇杆急回运动对比 | `crank-rocker-quick-return.html` | 动画对比推程/回程速度差异，极位夹角θ、摆角ψ、φ₁/φ₂标注 | ✅ 已完成 |
| 第4章 凸轮机构 | 凸轮反转法设计 | `cam-inversion.html` | 凸轮反转法设计交互演示 | 🔧 开发中 |
| 第4章 凸轮机构 | 凸轮压力角 | `cam-pressure-angle.html` | 凸轮压力角动态变化演示 | 🔧 开发中 |
| 第5章 齿轮机构 | 渐开线形成过程 | `involute-generation.html` | 渐开线形成原理动画演示 | ✅ 已完成 |
| 第5章 齿轮机构 | 齿轮啮合 | `gear-meshing.html` | 渐开线齿轮啮合交互演示 | ✅ 已完成 |

### 各章节完成进度

- ✅ 第3章：2/2 模块完成
- 🔧 第4章：2 模块开发中
- ✅ 第5章：2/2 模块完成
- 📋 第1、2、6~10章：规划中

## 使用方式

直接在浏览器中打开对应的 HTML 文件即可运行，无需安装任何依赖。每个文件都是完整的单页应用，包含交互控件和实时动画。

在线访问：[GitHub Pages](https://jieniguii.github.io/mechanical-exam-visualizer/)

## 技术选型

- 前端：原生 HTML5 + Canvas API + CSS
- 可视化引擎：Canvas 2D
- 部署：GitHub Pages
- 响应式布局适配手机和电脑

## 设计规范

- 暗色主题：bg=#0f1117, card=#1a1d27
- 颜色体系：紫色(#6366f1) / 绿色(#34d399) / 黄色(#fbbf24) / 橙色(#f97316)
- 元件画法须符合教材标准
- 移动端兼容优先

## 组件库

`mech-components.js` — 可复用的机械绘图组件库，支持层级命名+合成参数+单文件引用。

## License

MIT
