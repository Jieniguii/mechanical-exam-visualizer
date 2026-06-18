/* ===== 机械原理可视化平台 - 公共 JS 工具库 ===== */

const Mech = {
  // === 统一颜色体系 ===
  colors: {
    bg: '#12141d',
    body: '#e4e4e7',
    text: '#e4e4e7',
    textDim: '#a1a1aa',
    hinge: '#71717a',
    hingeFixed: '#71717a',
    machine: '#71717a',
    work: '#3b82f6',
    return: '#34d399',
    warning: '#fbbf24',
    orange: '#f97316',
    accent: '#6366f1',
    purple: '#a855f7',
    dark: '#12141d',
  },

  // === Canvas 初始化（自动处理 DPR + 响应式）===
  setupCanvas(canvasEl) {
    const ctx = canvasEl.getContext('2d');
    function getDimensions() {
      const rect = canvasEl.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvasEl.width = rect.width * dpr;
      canvasEl.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: rect.width, h: rect.height };
    }
    return { ctx, getDimensions, canvas: canvasEl };
  },

  // === 基于时间增量的动画循环 ===
  createAnimator(updateFn, drawFn) {
    let playing = false, rafId = null, lastTs = null;
    function frame(ts) {
      if (!playing) return;
      if (lastTs !== null) {
        const dt = Math.min((ts - lastTs) / 1000, 0.1);
        updateFn(dt);
      }
      lastTs = ts;
      drawFn();
      rafId = requestAnimationFrame(frame);
    }
    return {
      play() { if (!playing) { playing = true; lastTs = null; rafId = requestAnimationFrame(frame); } },
      pause() { playing = false; lastTs = null; if (rafId) cancelAnimationFrame(rafId); },
      isPlaying() { return playing; },
    };
  },

  // === 数学工具 ===
  math: {
    norm(a) { return ((a % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI); },
    diff(a, b) {
      let d = a - b;
      while (d > Math.PI) d -= 2*Math.PI;
      while (d < -Math.PI) d += 2*Math.PI;
      return d;
    },
    rad2deg(r) { return r * 180 / Math.PI; },
    deg2rad(d) { return d * Math.PI / 180; },
  },

  // === 绘图元件 ===
  draw: {
    // 实心杆件（支持标签）
    link(ctx, x1, y1, x2, y2, opts = {}) {
      const { color = '#e4e4e7', width = 2.5, label, labelOffset = 14 } = opts;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.stroke();
      if (label) {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const dx = x2 - x1, dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0) {
          const nx = -dy / len * labelOffset, ny = dx / len * labelOffset;
          ctx.fillStyle = color;
          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(label, mx + nx, my + ny);
        }
      }
    },

    // 网格
    grid(ctx, cx, cy, w, h, scale, opts = {}) {
      const { color = 'rgba(255,255,255,0.03)', step = 40 } = opts;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      const s = step * scale;
      for (let x = cx % s; x < w; x += s) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = cy % s; y < h; y += s) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
    },

    // 铰链点（活动）
    hinge(ctx, x, y, opts = {}) {
      const { color = '#e4e4e7', r = 4, stroke = '#12141d' } = opts;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    },

    // 固定铰链点
    fixedHinge(ctx, x, y, opts = {}) {
      this.hinge(ctx, x, y, { color: '#71717a', ...opts });
    },

    // 铰支座符号（三角形 + 底线 + 斜杠）
    hingedSupport(ctx, x, y, opts = {}) {
      const { color = '#71717a' } = opts;
      const triH = 9, triW = 7, baseW = triW + 3, hatchCount = 4, hatchLen = 6;
      ctx.strokeStyle = color;
      // 倒三角
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - triW, y + triH);
      ctx.lineTo(x + triW, y + triH);
      ctx.closePath();
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // 底线
      ctx.beginPath();
      ctx.moveTo(x - baseW, y + triH);
      ctx.lineTo(x + baseW, y + triH);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // 斜杠
      for (let i = 0; i < hatchCount; i++) {
        const hx = x - baseW + 2 + i * ((2 * baseW - 4) / (hatchCount - 1));
        ctx.beginPath();
        ctx.moveTo(hx, y + triH);
        ctx.lineTo(hx - hatchLen * 0.6, y + triH + hatchLen * 0.6);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    },

    // 虚线
    dashedLine(ctx, x1, y1, x2, y2, opts = {}) {
      const { color = '#71717a', width = 1.5, dash = [4, 4] } = opts;
      ctx.beginPath();
      ctx.setLineDash(dash);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
      ctx.setLineDash([]);
    },

    // 实线弧
    arc(ctx, cx, cy, r, start, end, ccw, opts = {}) {
      const { color = '#f97316', width = 2 } = opts;
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, end, ccw);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    },

    // 虚线弧
    dashedArc(ctx, cx, cy, r, start, end, ccw, opts = {}) {
      const { color = '#3b82f6', width = 1.5, dash = [4, 3] } = opts;
      ctx.beginPath();
      ctx.setLineDash(dash);
      ctx.arc(cx, cy, r, start, end, ccw);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
      ctx.setLineDash([]);
    },

    // 文字
    text(ctx, text, x, y, opts = {}) {
      const { color = '#a1a1aa', font = '12px sans-serif', align = 'center', baseline = 'alphabetic' } = opts;
      ctx.fillStyle = color;
      ctx.font = font;
      ctx.textAlign = align;
      ctx.textBaseline = baseline;
      ctx.fillText(text, x, y);
    },

    // 小圆点
    point(ctx, x, y, opts = {}) {
      const { color = '#3b82f6', r = 3 } = opts;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    },

    // 圆（空心/填充）
    circle(ctx, cx, cy, r, opts = {}) {
      const { color = '#71717a', width = 1.5, dash = [], fill = null } = opts;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(r, 0.1), 0, Math.PI * 2);
      if (dash.length) ctx.setLineDash(dash);
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
      if (dash.length) ctx.setLineDash([]);
    },

    // 箭头（从 from→to 方向，箭头尖端在 to 点）
    arrow(ctx, fromX, fromY, toX, toY, opts = {}) {
      const { color = '#71717a', size = 10 } = opts;
      const angle = Math.atan2(toY - fromY, toX - fromX);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(toX, toY);
      ctx.lineTo(toX - size * Math.cos(angle - 0.35), toY - size * Math.sin(angle - 0.35));
      ctx.lineTo(toX - size * Math.cos(angle + 0.35), toY - size * Math.sin(angle + 0.35));
      ctx.closePath();
      ctx.fill();
    },
  },

  // === UI 构建器 ===
  ui: {
    // 滑块
    slider(parent, config) {
      const { label, min, max, value, step = 1, onChange, format } = config;
      const group = document.createElement('div');
      group.className = 'control-group';
      const fmt = format || (v => v);
      group.innerHTML = `<label>${label}:</label><input type="range" min="${min}" max="${max}" value="${value}" step="${step}"><span class="value">${fmt(value)}</span>`;
      parent.appendChild(group);
      const input = group.querySelector('input');
      const valSpan = group.querySelector('.value');
      input.addEventListener('input', e => {
        const v = parseFloat(e.target.value);
        valSpan.textContent = fmt(v);
        if (onChange) onChange(v);
      });
      return { input, valSpan, set(v) { input.value = v; valSpan.textContent = fmt(v); } };
    },

    // 按钮
    button(parent, config) {
      const { text, onClick, variant = 'secondary' } = config;
      const btn = document.createElement('button');
      btn.className = `btn btn-${variant}`;
      btn.textContent = text;
      btn.addEventListener('click', onClick);
      parent.appendChild(btn);
      return btn;
    },

    // 信息面板
    infoPanel(parent, items) {
      const panel = document.createElement('div');
      panel.className = 'info-panel';
      const refs = {};
      items.forEach(item => {
        const div = document.createElement('div');
        div.className = `info-item${item.variant ? ' ' + item.variant : ''}`;
        div.innerHTML = `<div class="label">${item.label}</div><div class="value" id="${item.id}">${item.initial || '—'}</div>`;
        panel.appendChild(div);
        refs[item.id] = div.querySelector('.value');
      });
      parent.appendChild(panel);
      return refs;
    },

    // 图例
    legend(parent, items) {
      const leg = document.createElement('div');
      leg.className = 'legend';
      items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'legend-item';
        div.innerHTML = `<div class="dot" style="background: ${item.color};"></div><span>${item.label}</span>`;
        leg.appendChild(div);
      });
      parent.appendChild(leg);
      return leg;
    },

    // 侧边栏面板（带标题）
    panel(parent, title) {
      const p = document.createElement('div');
      p.className = 'panel';
      p.innerHTML = `<div class="panel-title">${title}</div>`;
      parent.appendChild(p);
      return p;
    },

    // 侧边栏滑块（垂直布局，带标签和数值显示）
    sidebarSlider(parent, config) {
      const { label, min, max, value, step = 1, onChange, format } = config;
      const group = document.createElement('div');
      group.className = 'slider-group';
      const fmt = format || (v => v);
      group.innerHTML = `
        <div class="slider-header">
          <span class="slider-label">${label}</span>
          <span class="slider-value">${fmt(value)}</span>
        </div>
        <input type="range" min="${min}" max="${max}" value="${value}" step="${step}">
      `;
      parent.appendChild(group);
      const input = group.querySelector('input');
      const valSpan = group.querySelector('.slider-value');
      const labelSpan = group.querySelector('.slider-label');
      input.addEventListener('input', e => {
        const v = parseFloat(e.target.value);
        valSpan.textContent = fmt(v);
        if (onChange) onChange(v);
      });
      return { input, valSpan, labelSpan, set(v) { input.value = v; valSpan.textContent = fmt(v); } };
    },
  },
};
