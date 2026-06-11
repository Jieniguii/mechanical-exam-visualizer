# 机械考研可视化学习平台

> Mechanical Engineering Graduate Exam — Interactive Visualization Platform

交互式机械原理可视化演示工具，面向考研学子，帮助理解核心知识点。

## 演示模块

| 模块 | 文件 | 说明 | 状态 |
|------|------|------|------|
| 四杆机构 | `four-bar-linkage.html` | 平面连杆机构交互演示 | ✅ 已定稿 |
| 齿轮啮合 | `gear-meshing.html` | 渐开线齿轮啮合交互演示 | ✅ 已定稿 |
| 凸轮反转法 | `cam-inversion.html` | 凸轮反转法设计交互演示 | 🔧 开发中 |

## 使用方式

直接在浏览器中打开对应的 HTML 文件即可运行，无需安装任何依赖。每个文件都是完整的单页应用，包含交互控件和实时动画。

## 技术选型

- 前端：原生 HTML5 + Canvas API + Tailwind CSS
- 可视化引擎：Canvas 2D（后期可选 Three.js 做 3D）
- AI 答疑：大模型 API + RAG 知识库（规划中）
- 部署：GitHub Pages / Vercel

## 设计规范

- 暗色主题：bg=#0f1117, card=#1a1d27
- 颜色体系：紫色(#6366f1) / 绿色(#34d399) / 黄色(#fbbf24) / 橙色(#f97316)
- 凸轮线型：轮廓实线、基圆虚线[5,4]
- 滚子从动件：滚子为主体，杆件弱化
- 响应式布局适配手机和电脑

## 项目档案

开发上下文和工作日志保存在 `docs/memory/` 目录：
- `MEMORY.md` — 项目长期档案
- `2026-06-08.md` ~ `2026-06-11.md` — 每日工作日志

## 规划路线

1. ✅ 上传机械原理教材到知识库，整理考点
2. ✅ 四杆机构互动演示
3. ✅ 渐开线齿轮啮合演示
4. 🔧 凸轮反转法演示（开发中）
5. 📋 网站首页整合 + AI答疑窗口
6. 📋 Vercel / GitHub Pages 部署

## License

MIT