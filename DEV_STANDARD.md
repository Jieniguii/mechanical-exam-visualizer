# 机械考研可视化平台 — 开发规范 v2.0

> 基于 CH01~CH10 全模块的实战经验总结，2026-06-22 更新

---

## 一、文件结构

```
/
├── index.html              # 首页（10章节导航卡片）
├── ch1-structure.html      # 各章节页面
├── ch2-kinematics.html
├── ch3-linkage.html        # ✅ 已完成
├── ch4-cam.html            # ✅ 已完成
├── ch5-gear.html           # ✅ 已完成
├── ch6-geartrain.html      # ✅ 已完成
├── ch7-force.html          # ✅ 已完成
├── ch8-balance.html        # ✅ 已完成
├── ch9-flywheel.html       # 🚧 待开发
├── ch10-intermittent.html   # ✅ 已完成
├── [module-name].html       # 各模块页面（独立文件）
├── mech.js                 # 公共JS库（颜色/绘图/UI组件/动画器）
├── mech.css                # 公共CSS（布局/样式/响应式）
└── DEV_STANDARD.md          # 本文件
```

**命名规范：**
- 章节页：`ch{序号}-{英文短名}.html`（如 `ch6-geartrain.html`）
- 模块页：`{功能英文名}.html`（如 `four-bar-linkage.html`）
- 全部小写，单词用连字符 `-` 分隔

---

## 二、三类页面

### 2.1 首页（index.html）
- 自带内联样式，不依赖 mech.css
- 10个章节卡片，显示状态标签（已完成/待开发）
- 点击卡片跳转到对应章节页

### 2.2 章节页（chX-xxx.html）
- 自带内联样式，不依赖 mech.css
- 返回按钮 → index.html
- 章节标题 + 描述
- 模块卡片网格，点击跳转到模块页
- 未开发章节显示"🚧 开发中"占位

### 2.3 模块页（module-name.html）
- **必须引用** `mech.css` 和 `mech.js`
- 核心布局结构：

```html
<body>
<a href="chX-xxx.html" class="back-btn">← 返回章节</a>
<div class="header">
  <h1>模块标题 <span class="version-badge">v2.0</span></h1>
  <p>一句话描述</p>
</div>
<div class="app">
  <div class="main-layout">
    <div>
      <div class="canvas-card">
        <div class="canvas-wrapper">
          <canvas id="canvas"></canvas>
        </div>
        <div class="canvas-toolbar" id="toolbar"></div>
      </div>
    </div>
    <div class="sidebar" id="sidebar"></div>
  </div>
</div>
<script src="mech.js"></script>
<script> /* 模块代码 */ </script>
</body>
```

---

## 三、布局规范（三端响应式）

### 3.1 核心规则：宽度够就左右排列，不够就上下堆叠

不管是什么设备，只看视口宽度：

| 视口宽度 | 布局 | 画布 | 侧边栏 |
|---------|------|------|--------|
| ≥ 768px | 左右排列 | 左侧 flex:3，70vh（max 640px） | 右侧 flex:2，280~420px |
| < 768px | 上下堆叠 | 顶部 42vh（max 320px） | 底部单列 |

**适用场景：**
- 电脑全屏 → 左右布局
- 平板全屏 → 左右布局
- 电脑缩小窗口 → 自动切上下布局
- 平板分屏 → 自动切上下布局
- 手机 → 上下布局

### 3.2 画布自适应缩放

所有带 canvas 的模块，机构绘制需自适应画布大小：

```javascript
var REF_W = 460, REF_H = 340; // 参考坐标系（根据机构实际范围调整）
function draw() {
  var dims = getDimensions();
  var w = dims.w, h = dims.h;
  var padX = 20, padY = 40;
  var sx = (w - padX * 2) / REF_W;
  var sy = (h - padY * 2) / REF_H;
  var sc = Math.min(sx, sy);
  var ox = (w - REF_W * sc) / 2;
  var oy = (h - REF_H * sc) / 2;

  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(sc, sc);
  // ... 绘制机构 ...
  ctx.restore();
  // 公式框、标题等在 restore 之后绘制（不受缩放影响）
}
```

### 3.3 工具栏（toolbar）
- 位于画布下方，始终与画布一起 sticky
- 标配：播放/暂停按钮 + 步进按钮 + 速度滑块

### 3.4 侧边栏（sidebar）
- 用 `Mech.ui.panel()` 分面板
- 常见面板顺序：模式切换 → 参数调节 → 显示选项 → 实时信息 → 知识点提示
- 宽屏下宽度 280~420px，面板纵向排列
- 窄屏下全宽，面板单列

### 3.5 防抖动
- `body { scrollbar-gutter: stable; overflow-y: scroll; }` — 滚动条出现/消失不导致宽度偏移
- 不使用 `display: flex; align-items: center` 在 body 上

---

## 四、代码规范

### 4.1 必须使用公共库
| 功能 | API | 说明 |
|------|-----|------|
| 画布初始化 | `Mech.setupCanvas(canvasEl)` | 返回 `{ ctx, getDimensions, canvas }`，自动处理 DPR |
| 动画器 | `Mech.createAnimator(updateFn, drawFn)` | 返回 `{ play, pause, isPlaying }` |
| 取色 | `Mech.colors.xxx` | 禁止硬编码颜色值 |
| 绘图 | `Mech.draw.xxx()` | link/grid/hinge/fixedHinge/dashedLine/arc/text/point/circle/arrow |
| UI组件 | `Mech.ui.xxx()` | button/slider/panel/infoPanel/legend/sidebarSlider/checkbox |

### 4.2 模块特有逻辑
- 运动规律计算、廓线参数化、特殊绘制函数 → 留在模块文件内
- 跨模块复用的功能 → 提取到 mech.js
- 提取原则：**确有2+模块需要时才提取，不过度封装**

### 4.3 动画时间
- 使用 `dt`（秒）增量，不用帧增量
- 保证帧率无关：`delta += speed * factor * dt`

### 4.4 resize 监听
- 所有模块页需监听 `window.addEventListener('resize', draw)` 确保窗口变化时重绘
- 结合 canvas 缩放变换，机构自动适配新尺寸

---

## 五、视觉规范

### 5.1 颜色体系（Mech.colors）
| 语义 | 变量 | 色值 | 用途 |
|------|------|------|------|
| 背景 | bg | #0f1117 | 画布背景 |
| 主体 | body | #1a1d27 | 面板/卡片背景 |
| 文字 | text | #e4e4e7 | 主文字 |
| 暗文字 | textDim | #71717a | 次要文字 |
| 工作 | work | #34d399 | 工作行程/从动件 |
| 回程 | return | #f97316 | 回程/实际廓线 |
| 基准 | accent | #6366f1 | 基圆/理论值/杆件 |
| 警告 | warning | #ef4444 | 压力角超限 |
| 接触点 | — | #fbbf24 | 黄色，接触点/高亮 |
| 低副标注 | — | #06b6d4 | cyan，转动/移动低副标注 |
| 高副标注 | — | #f97316 | 橙色，高副点+光环 |
| 机架 | hinge/hingeFixed | — | 铰支座符号 |

### 5.2 元件画法
- **机架**：铰支座（三角形+底线+斜杠）+ 虚线AD，不画实线机架杆
- **从动件**：绿色 `#34d399` 杆件 + 黄色 `#fbbf24` 接触点
  - 尖底：三角形尖头 + 直杆
  - 滚子：圆圈轮廓 + 中心点 + 直杆
  - 平底：横线 + 两端短竖 + 直杆
- **运动副标注**：
  - 转动低副：cyan 虚线圆（r=10, setLineDash([4,3])）+ 中心实心点（r=3）+ 标签 "PL(转动)"
  - 移动低副：cyan 虚线垂直于导路方向 + 中心实心点 + 标签 "PL(移动)"
  - 高副：橙色 `#f97316` 实心点 + 光环 + 标签 "PH"
  - 低副颜色必须与杆件蓝色(#6366f1)区分
- **运动方向**：弧线箭头标注 ω 或 -ω
- **标注**：符合教材标准，极位夹角必须是锐角

### 5.3 图表
- 内嵌在画布右下角，半透明背景
- 尺寸控制在 160×85 以内，不遮挡主画面
- 文字不小于 8px

---

## 六、交互规范

### 6.1 标配控件
- 播放/暂停按钮
- 角度步进按钮（◀ ▶，步进 5°~10°）
- 速度滑块（0.1x ~ 3x）
- 角度滑块（0° ~ 360°，可拖拽定位）

### 6.2 参数调节
- 用 `Mech.ui.sidebarSlider()`，带标签和实时数值
- 参数变化时立即重绘

### 6.3 显示选项
- 用 `Mech.ui.checkbox()`，勾选/取消即时生效
- 常见选项：基圆/理论廓线/实际廓线/压力角/运动区间

### 6.4 知识点提示
- 每个模块底部一个 `tip` 面板
- 根据当前状态动态更新提示文字

### 6.5 分步解题交互（CH01 模块）
- 系统引导式逐步标注，学生不需要点击画布
- 侧边栏"下一步"按钮控制进度
- 画布渐进式高亮（一个一个标注，不能一次全标）
- 进度条 + 步骤描述 + 上一步/下一步导航

---

## 七、模块清单（16个）

| 章节 | 模块文件 | 版本 | 说明 |
|------|---------|------|------|
| CH01 | freedom-calculator.html | v2.0 | 纯HTML/CSS计算器，无canvas |
| CH01 | freedom-simple-step.html | v1.0 | 简单分步解题（四杆+凸轮） |
| CH01 | freedom-complex-step.html | v1.0 | 复杂分步解题（复合铰链/局部自由度/虚约束） |
| CH02 | instant-center.html | v1.0 | 瞬心法求速度，Kennedy定理 |
| CH03 | four-bar-linkage.html | v2.0 | 铰链四杆机构 |
| CH03 | crank-rocker-quick-return.html | v6.1 | 曲柄摇杆急回运动 |
| CH04 | cam-inversion.html | v2.0 | 凸轮反转法 |
| CH04 | cam-pressure-angle.html | v2.0 | 凸轮压力角 |
| CH05 | involute-generation.html | v2.1 | 渐开线形成过程 |
| CH05 | gear-meshing.html | v2.0 | 齿轮啮合 |
| CH06 | fixed-gear-train.html | v1.0 | 定轴轮系 |
| CH06 | planetary-gear.html | v1.0 | 行星轮系 |
| CH07 | friction-self-lock.html | v1.0 | 摩擦自锁 |
| CH08 | rotor-balance.html | v1.0 | 转子平衡 |
| CH10 | ratchet-mechanism.html | v1.0 | 棘轮机构 |
| CH10 | geneva-mechanism.html | v1.0 | 槽轮机构 |

**待处理：**
- CH04 凸轮反转法拖动不同步（traceUpTo 遗留 bug）
- CH09 飞轮模块待开发
- CH02 待改为解题型

---

## 八、开发优先级

| 批次 | 章节 | 状态 |
|------|------|------|
| 第一批 | CH01 + CH02 | CH01 ✅ 已完成改版，CH02 待改解题型 |
| 第二批 | CH06 + CH07 | 待明确解题思路 |
| 暂缓 | CH08 + CH09 | 院校不考/基本不考 |

---

## 九、Git 推送工作流

```bash
# 1. 克隆到临时目录
cd /tmp && rm -rf mech-fresh
HTTPS_PROXY="" http_proxy="" git clone https://github.com/Jieniguii/mechanical-exam-visualizer.git mech-fresh

# 2. 编辑文件（通过 Python 脚本或直接修改）

# 3. 配置并提交
cd /tmp/mech-fresh
git config user.email "m1048894371@outlook.com"
git config user.name "Jieniguii"
git add -A && git commit -m "描述"
HTTPS_PROXY="" http_proxy="" git push origin main
```

---

*本规范随开发进展持续迭代，版本号在文件名中体现。*
