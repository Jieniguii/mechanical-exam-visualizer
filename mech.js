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

    // 铰支座符号（三角形 + 底线 + 斜杠）— 旧版简单支座
    hingedSupport(ctx, x, y, opts = {}) {
      const { color = '#71717a' } = opts;
      const triH = 9, triW = 7, baseW = triW + 3, hatchCount = 4, hatchLen = 6;
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - triW, y + triH);
      ctx.lineTo(x + triW, y + triH);
      ctx.closePath();
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - baseW, y + triH);
      ctx.lineTo(x + baseW, y + triH);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      for (let i = 0; i < hatchCount; i++) {
        const hx = x - baseW + 2 + i * ((2 * baseW - 4) / (hatchCount - 1));
        ctx.beginPath();
        ctx.moveTo(hx, y + triH);
        ctx.lineTo(hx - hatchLen * 0.6, y + triH + hatchLen * 0.6);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    },

    // === 教材标准元件（comp确认参数，scale统一架构）===

    // 固定支座 — 锚点(x,y)=三角顶点，绘制向下
    // 参数来源：comp/fix-support 确认 triH:14 triW:10 baseExtra:4 hatchCount:5 hatchLen:8 lineW:2.0
    fixedSupport(ctx, x, y, scale, opts = {}) {
      const s = scale || 1;
      const col = opts.color || Mech.colors.hinge;
      const tH = 14*s, tW = 10*s, bW = tW + 4*s, lw = 2.0*s;
      // 倒三角
      ctx.strokeStyle = col; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(x, y);
        ctx.lineTo(x - tW, y + tH); ctx.lineTo(x + tW, y + tH); ctx.closePath(); ctx.stroke();
      // 底线
      ctx.lineWidth = lw * 0.8;
      ctx.beginPath(); ctx.moveTo(x - bW, y + tH); ctx.lineTo(x + bW, y + tH); ctx.stroke();
      // 剖面线
      ctx.lineWidth = lw * 0.5;
      for (let i = 0; i < 5; i++) {
        const hx = x - bW + 3*s + i * ((2*bW - 6*s) / 4);
        ctx.beginPath(); ctx.moveTo(hx, y + tH);
          ctx.lineTo(hx - 8*s*0.6, y + tH + 8*s*0.6); ctx.stroke();
      }
    },

    // 偏心圆盘凸轮 — 锚点(x,y)=转轴中心
    // 参数来源：comp/cam-disk 确认 r:44 eccX:15 eccY:-20 shaftR:4 crossR:6 lineW:2.0 fillA:0.01
    camDisk(ctx, x, y, scale, opts = {}) {
      const s = scale || 1;
      const r = 44*s, eX = 15*s, eY = -20*s, sR = 4*s, cR = 6*s, lw = 2.0*s;
      const pCx = x + eX, pCy = y + eY;
      // 轮廓圆
      ctx.beginPath(); ctx.arc(pCx, pCy, r, 0, Math.PI * 2);
        ctx.strokeStyle = Mech.colors.accent; ctx.lineWidth = lw; ctx.stroke();
        ctx.fillStyle = 'rgba(99,102,241,0.01)'; ctx.fill();
      // 转轴圆
      ctx.strokeStyle = Mech.colors.accent; ctx.lineWidth = 2*s;
      ctx.beginPath(); ctx.arc(x, y, sR, 0, Math.PI * 2); ctx.stroke();
      // 十字
      ctx.lineWidth = 1.2*s;
      ctx.beginPath();
        ctx.moveTo(x - cR, y); ctx.lineTo(x + cR, y);
        ctx.moveTo(x, y - cR); ctx.lineTo(x, y + cR); ctx.stroke();
    },

    // 尖顶从动件 — 锚点(x,y)=尖端接触点，绘制向上
    // 参数来源：comp/follower-pointed 确认 tipH:8 tipW:3 stemLen:53 lineW:2.0
    followerPointed(ctx, x, y, scale, opts = {}) {
      const s = scale || 1;
      const col = opts.color || Mech.colors.return;
      const tH = 8*s, tW = 3*s, sL = 53*s, lw = 2.0*s;
      const tipTop = y, tipBase = y - tH;
      // 尖端三角
      ctx.fillStyle = col; ctx.beginPath();
        ctx.moveTo(x, tipTop); ctx.lineTo(x - tW, tipBase); ctx.lineTo(x + tW, tipBase);
        ctx.closePath(); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = lw * 0.8;
      ctx.beginPath();
        ctx.moveTo(x, tipTop); ctx.lineTo(x - tW, tipBase); ctx.lineTo(x + tW, tipBase);
        ctx.closePath(); ctx.stroke();
      // 杆体
      ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(x, tipBase); ctx.lineTo(x, tipBase - sL); ctx.stroke();
    },

    // 导路（左右机架块+中间通道）— 锚点(x,y)=通道底部中心，绘制向上
    // 参数来源：comp/guide 确认 gap:7 blockW:14 guideLen:50 hatchN:4 hatchStep:7 hatchLen:8 lineW:1.8
    guide(ctx, x, y, scale, opts = {}) {
      const s = scale || 1;
      const col = opts.color || Mech.colors.hinge;
      const g = 7*s, bw = 14*s, gL = 50*s, lw = 1.8*s;
      const top = y - gL;
      const lL = x - g - bw, lR = x - g;
      const rL = x + g, rR = x + g + bw;
      // 左机架块（三边框，底不封）
      ctx.strokeStyle = col; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(lL, y); ctx.lineTo(lL, top);
        ctx.lineTo(lR, top); ctx.lineTo(lR, y); ctx.stroke();
      // 左块内侧剖面线（从内壁向左下45°）
      ctx.lineWidth = lw * 0.5;
      for (let i = 0; i < 4; i++) {
        const hy = top + 7*s*(i+1);
        if (hy > y - 2*s) break;
        ctx.beginPath(); ctx.moveTo(lR, hy);
          ctx.lineTo(lR - 8*s*0.6, hy + 8*s*0.6); ctx.stroke();
      }
      // 右机架块（三边框，底不封）
      ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(rL, y); ctx.lineTo(rL, top);
        ctx.lineTo(rR, top); ctx.lineTo(rR, y); ctx.stroke();
      // 右块内侧剖面线（从内壁向右下45°）
      ctx.lineWidth = lw * 0.5;
      for (let i = 0; i < 4; i++) {
        const hy = top + 7*s*(i+1);
        if (hy > y - 2*s) break;
        ctx.beginPath(); ctx.moveTo(rL, hy);
          ctx.lineTo(rL + 8*s*0.6, hy + 8*s*0.6); ctx.stroke();
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
      return { input, valSpan, labelSpan, el: group, set(v) { input.value = v; valSpan.textContent = fmt(v); } };
    },

    // 复选框开关
    checkbox(parent, config) {
      const { label, checked = false, onChange } = config;
      const row = document.createElement('label');
      row.className = 'toggle-row';
      row.innerHTML = `<input type="checkbox"${checked ? ' checked' : ''}><span>${label}</span>`;
      parent.appendChild(row);
      const input = row.querySelector('input');
      input.addEventListener('change', e => { if (onChange) onChange(e.target.checked); });
      return { input, set(v) { input.checked = v; } };
    },
  },
};
