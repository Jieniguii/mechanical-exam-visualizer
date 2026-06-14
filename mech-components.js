/**
 * 机械原理可视化组件库
 * 统一的元件绘制函数，供各模块复用
 */

const MechComponents = {
  // === 颜色体系 ===
  colors: {
    body: '#1a1a1a',        // 黑色：杆件、主体
    contact: '#f97316',     // 橙色：接触点
    annotation: '#3b82f6',  // 蓝色：标注线
    highlight: '#a855f7',   // 紫色：高亮（压力角等）
    guide: '#64748b',       // 灰色：导路、机架
    ground: '#475569'       // 深灰：固定支座
  },

  // === 从动件系统 ===
  follower: {
    /**
     * 尖底从动件（三角形尖头）
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} contact - 接触点 {x, y}
     * @param {number} guideX - 导路 x 坐标
     * @param {Object} opts - 可选参数 {tipSize, stemLength}
     */
    knife(ctx, contact, guideX, opts = {}) {
      const tipSize = opts.tipSize || 6;
      const stemLength = opts.stemLength || 80;
      const color = opts.color || MechComponents.colors.body;
      const contactColor = opts.contactColor || MechComponents.colors.contact;

      // 三角形尖头（▽）
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(contact.x, contact.y);
      ctx.lineTo(contact.x - tipSize / 2, contact.y - tipSize);
      ctx.lineTo(contact.x + tipSize / 2, contact.y - tipSize);
      ctx.closePath();
      ctx.fill();

      // 杆体
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(guideX, contact.y - tipSize);
      ctx.lineTo(guideX, contact.y - stemLength);
      ctx.stroke();

      // 接触点
      ctx.fillStyle = contactColor;
      ctx.beginPath();
      ctx.arc(contact.x, contact.y, 3, 0, 2 * Math.PI);
      ctx.fill();
    },

    /**
     * 滚子从动件（带中心销轴）
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} contact - 接触点 {x, y}
     * @param {Object} normal - 法线方向 {x, y}（单位向量）
     * @param {number} guideX - 导路 x 坐标
     * @param {Object} opts - 可选参数 {rollerRadius, stemLength}
     */
    roller(ctx, contact, normal, guideX, opts = {}) {
      const rr = opts.rollerRadius || 8;
      const stemLength = opts.stemLength || 80;
      const color = opts.color || MechComponents.colors.body;
      const contactColor = opts.contactColor || MechComponents.colors.contact;
      const scale = opts.scale || 1;

      // 滚子中心（沿法线偏移 rr）
      const rollerCX = contact.x + normal.x * rr * scale;
      const rollerCY = contact.y + normal.y * rr * scale;

      // 滚子外圆
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(rollerCX, rollerCY, rr * scale, 0, 2 * Math.PI);
      ctx.stroke();

      // 滚子中心销轴（小空心圆）
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(rollerCX, rollerCY, 3, 0, 2 * Math.PI);
      ctx.stroke();

      // 杆体
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(guideX, rollerCY);
      ctx.lineTo(guideX, rollerCY - stemLength);
      ctx.stroke();

      // 接触点
      ctx.fillStyle = contactColor;
      ctx.beginPath();
      ctx.arc(contact.x, contact.y, 3, 0, 2 * Math.PI);
      ctx.fill();
    },

    /**
     * 平底从动件（带焊接符号）
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} contact - 接触点 {x, y}
     * @param {number} guideX - 导路 x 坐标
     * @param {Object} opts - 可选参数 {flatWidth, stemLength}
     */
    flat(ctx, contact, guideX, opts = {}) {
      const flatWidth = opts.flatWidth || 40;
      const stemLength = opts.stemLength || 80;
      const color = opts.color || MechComponents.colors.body;
      const contactColor = opts.contactColor || MechComponents.colors.contact;

      const tipY = contact.y;

      // 平底（水平线）
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(guideX - flatWidth, tipY);
      ctx.lineTo(guideX + flatWidth, tipY);
      ctx.stroke();

      // 焊接符号（两条短线）
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(guideX - 8, tipY - 5);
      ctx.lineTo(guideX - 8, tipY + 5);
      ctx.moveTo(guideX + 8, tipY - 5);
      ctx.lineTo(guideX + 8, tipY + 5);
      ctx.stroke();

      // 杆体
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(guideX, tipY);
      ctx.lineTo(guideX, tipY - stemLength);
      ctx.stroke();

      // 接触点
      ctx.fillStyle = contactColor;
      ctx.beginPath();
      ctx.arc(contact.x, contact.y, 3, 0, 2 * Math.PI);
      ctx.fill();
    }
  },

  // === 辅助绘图 ===
  draw: {
    /**
     * 导路/导轨（两条平行线）
     */
    guide(ctx, x, y1, y2, opts = {}) {
      const width = opts.width || 30;
      const color = opts.color || MechComponents.colors.guide;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(x - width / 2, y1);
      ctx.lineTo(x - width / 2, y2);
      ctx.moveTo(x + width / 2, y1);
      ctx.lineTo(x + width / 2, y2);
      ctx.stroke();
      ctx.setLineDash([]);
    },

    /**
     * 角度弧线（带箭头）
     */
    angleArc(ctx, cx, cy, r, startAngle, endAngle, opts = {}) {
      const color = opts.color || MechComponents.colors.highlight;
      const label = opts.label;
      const labelOffset = opts.labelOffset || 20;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.stroke();

      // 标签
      if (label) {
        const midAngle = (startAngle + endAngle) / 2;
        const lx = cx + Math.cos(midAngle) * (r + labelOffset);
        const ly = cy + Math.sin(midAngle) * (r + labelOffset);
        ctx.fillStyle = color;
        ctx.font = opts.font || 'bold 14px sans-serif';
        ctx.fillText(label, lx, ly);
      }
    },

    /**
     * 虚线
     */
    dashed(ctx, x1, y1, x2, y2, opts = {}) {
      const color = opts.color || MechComponents.colors.annotation;
      const lineWidth = opts.lineWidth || 2;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.setLineDash([]);
    },

    /**
     * 实心圆点
     */
    dot(ctx, x, y, radius, color) {
      ctx.fillStyle = color || MechComponents.colors.contact;
      ctx.beginPath();
      ctx.arc(x, y, radius || 4, 0, 2 * Math.PI);
      ctx.fill();
    },

    /**
     * 空心圆
     */
    circle(ctx, x, y, radius, opts = {}) {
      const color = opts.color || MechComponents.colors.body;
      const lineWidth = opts.lineWidth || 2;
      const fill = opts.fill || false;
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      if (fill) {
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
  },

  // === 运动副 ===
  joint: {
    /**
     * 转动副（链）
     */
    revolute(ctx, x, y, opts = {}) {
      const radius = opts.radius || 5;
      const color = opts.color || MechComponents.colors.body;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.stroke();
      // 中心点
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
      ctx.fill();
    },

    /**
     * 固定支座（机架）
     */
    fixed(ctx, x, y, opts = {}) {
      const size = opts.size || 20;
      const color = opts.color || MechComponents.colors.ground;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      // 三角形
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - size / 2, y + size);
      ctx.lineTo(x + size / 2, y + size);
      ctx.closePath();
      ctx.stroke();
      // 底部阴影线
      ctx.beginPath();
      for (let i = -size / 2; i <= size / 2; i += 4) {
        ctx.moveTo(x + i, y + size);
        ctx.lineTo(x + i - 5, y + size + 5);
      }
      ctx.stroke();
    }
  }
};

// 导出（浏览器环境）
if (typeof window !== 'undefined') {
  window.MechComponents = MechComponents;
}
