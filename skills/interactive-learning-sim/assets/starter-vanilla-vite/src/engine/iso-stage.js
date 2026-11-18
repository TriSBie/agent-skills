const SVG_NS = 'http://www.w3.org/2000/svg';
const TILE_W = 14;
const TILE_H = 7;

const round2 = (n) => Math.round(n * 100) / 100;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Project 3D grid coordinates (x, y, z) onto 2D isometric SVG space.
 */
export function iso(x, y, z = 0) {
  return [round2(TILE_W * (x + y)), round2(TILE_H * (x - y) - z)];
}

export function roundedPath(pts, radius = 10) {
  if (pts.length < 2) return '';
  let d = `M${round2(pts[0][0])},${round2(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const d1 = Math.hypot(x1 - x0, y1 - y0);
    const d2 = Math.hypot(x2 - x1, y2 - y1);
    if (d1 < 0.01 || d2 < 0.01) continue;
    const r = Math.min(radius, d1 / 2, d2 / 2);
    const sx = x1 + ((x0 - x1) / d1) * r;
    const sy = y1 + ((y0 - y1) / d1) * r;
    const ex = x1 + ((x2 - x1) / d2) * r;
    const ey = y1 + ((y2 - y1) / d2) * r;
    d += ` L${round2(sx)},${round2(sy)} Q${round2(x1)},${round2(y1)} ${round2(ex)},${round2(ey)}`;
  }
  const last = pts[pts.length - 1];
  return `${d} L${round2(last[0])},${round2(last[1])}`;
}

function shrinkEndpoints(pts, startTrim = 24, endTrim = 26) {
  if (pts.length < 2) return pts;
  const out = pts.map((p) => [...p]);
  const [x0, y0] = out[0];
  const [x1, y1] = out[1];
  const lenStart = Math.hypot(x1 - x0, y1 - y0) || 1;
  if (lenStart > startTrim * 1.5) {
    out[0] = [x0 + ((x1 - x0) / lenStart) * startTrim, y0 + ((y1 - y0) / lenStart) * startTrim];
  }
  const n = out.length;
  const [xa, ya] = out[n - 2];
  const [xb, yb] = out[n - 1];
  const lenEnd = Math.hypot(xb - xa, yb - ya) || 1;
  if (lenEnd > endTrim * 1.5) {
    out[n - 1] = [xb - ((xb - xa) / lenEnd) * endTrim, yb - ((yb - ya) / lenEnd) * endTrim];
  }
  return out;
}

const PALETTES = {
  light: {
    stroke: '#3a3f46',
    text: '#1f2328',
    sub: '#5b6068',
    link: '#5d636b',
    grid: '#dbd5c9',
    tones: {
      paper: { top: '#faf8f3', left: '#ebe6dc', right: '#d9d2c5' },
      green: { top: '#e6f2dc', left: '#d2e7c3', right: '#b4d4a0' },
      violet: { top: '#efedfb', left: '#e0dcf5', right: '#c6bfe9' },
      orange: { top: '#fbebd9', left: '#f6dabd', right: '#e8bd92' },
      blue: { top: '#e8f1fa', left: '#d3e4f3', right: '#b3cde6' },
      danger: { top: '#fbe5e2', left: '#f3c3bd', right: '#e39c93' },
    },
  },
  dark: {
    stroke: '#c2bfb9',
    text: '#ece8e1',
    sub: '#a6a29b',
    link: '#8f8b85',
    grid: '#2a2d32',
    tones: {
      paper: { top: '#363940', left: '#2c2f35', right: '#23262b' },
      green: { top: '#3d5836', left: '#2e4429', right: '#22341f' },
      violet: { top: '#4a4470', left: '#383356', right: '#2b2743' },
      orange: { top: '#66492f', left: '#4d3825', right: '#3b2a1b' },
      blue: { top: '#33506d', left: '#263b51', right: '#1c2d3e' },
      danger: { top: '#683430', left: '#4f2724', right: '#3c1d1b' },
    },
  },
};

const PACKET_COLORS = {
  req: '#2b7bbf',
  res: '#2d8a4e',
  write: '#6d5ac8',
  slow: '#c7761f',
  drop: '#c0392f',
};

function escapeXml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export class IsoStage {
  constructor(host) {
    this.host = host;
    this.svg = document.createElementNS(SVG_NS, 'svg');
    this.svg.setAttribute('class', 'stage-svg');
    this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    this.svg.setAttribute('role', 'img');

    this.svg.innerHTML = `
      <defs class="defs-theme"></defs>
      <defs>
        <radialGradient id="iso-grid-fade" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="520">
          <stop offset="0%" stop-color="#fff" stop-opacity="0.95" />
          <stop offset="65%" stop-color="#fff" stop-opacity="0.45" />
          <stop offset="100%" stop-color="#fff" stop-opacity="0" />
        </radialGradient>
        <mask id="iso-grid-mask" maskUnits="userSpaceOnUse" x="-2400" y="-2400" width="4800" height="4800">
          <rect x="-2400" y="-2400" width="4800" height="4800" fill="url(#iso-grid-fade)" />
        </mask>
      </defs>
      <rect class="stage-grid" x="-2400" y="-2400" width="4800" height="4800" fill="url(#iso-grid)" mask="url(#iso-grid-mask)" />
      <g class="layer-floor"></g>
      <g class="layer-links"></g>
      <g class="layer-packets"></g>
      <g class="layer-ents"></g>
      <g class="layer-over"></g>
      <g class="layer-hud"></g>
    `;
    host.appendChild(this.svg);

    this.layers = {
      floor: this.svg.querySelector('.layer-floor'),
      links: this.svg.querySelector('.layer-links'),
      packets: this.svg.querySelector('.layer-packets'),
      ents: this.svg.querySelector('.layer-ents'),
      over: this.svg.querySelector('.layer-over'),
      hud: this.svg.querySelector('.layer-hud'),
    };
    this.defs = this.svg.querySelector('.defs-theme');
    this.fadeGrad = this.svg.querySelector('#iso-grid-fade');

    this.scene = null;
    this.linkPaths = new Map();
    this.flows = [];
    this.packets = [];
    this.paused = false;
    this.destroyed = false;

    this.view = [-220, -160, 440, 320];
    this.viewAnim = null;
    this.lastTick = performance.now();

    this.retheme();
    this._bindGestures();

    this._ro = new ResizeObserver(() => {
      if (this.scene) this.fit(false);
    });
    this._ro.observe(host);

    const loop = (now) => {
      if (this.destroyed) return;
      this._tick(now);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  _palette() {
    const isDark = document.documentElement.dataset.theme === 'dark';
    return isDark ? PALETTES.dark : PALETTES.light;
  }

  retheme() {
    const pal = this._palette();
    this.defs.innerHTML = `
      <pattern id="iso-grid" width="28" height="14" patternUnits="userSpaceOnUse">
        <path d="M 14 0 L 28 7 L 14 14 L 0 7 Z" fill="none" stroke="${pal.grid}" stroke-width="0.9" />
      </pattern>
      <marker id="arrow-end" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
        <path d="M 1 1.5 L 8.5 5 L 1 8.5 z" fill="${pal.link}" />
      </marker>
    `;
    if (this.scene) {
      this.setScene(this.scene, { animate: false, preserveView: true });
    }
  }

  setPaused(paused) {
    this.paused = Boolean(paused);
  }

  setScene(scene, opts = {}) {
    const { animate = true, preserveView = false } = opts;
    this.scene = scene || { entities: {}, links: {}, flows: [] };
    const pal = this._palette();

    const entities = this.scene.entities || {};
    const links = this.scene.links || {};

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const expandBox = (x, y, padX = 48, padY = 42) => {
      minX = Math.min(minX, x - padX);
      minY = Math.min(minY, y - padY);
      maxX = Math.max(maxX, x + padX);
      maxY = Math.max(maxY, y + padY);
    };

    const floorSvg = [];
    const entItems = [];
    const anchors = {};

    for (const [id, spec] of Object.entries(entities)) {
      const [gx, gy, gz = 0] = spec.pos || [0, 0, 0];
      if (spec.kind === 'zone') {
        const w = spec.w ?? 5;
        const d = spec.d ?? 4;
        const p0 = iso(gx - w / 2, gy - d / 2, 0);
        const p1 = iso(gx + w / 2, gy - d / 2, 0);
        const p2 = iso(gx + w / 2, gy + d / 2, 0);
        const p3 = iso(gx - w / 2, gy + d / 2, 0);
        [p0, p1, p2, p3].forEach(([px, py]) => expandBox(px, py, 24, 24));
        const tone = pal.tones[spec.tone || 'paper'] || pal.tones.paper;
        floorSvg.push(`
          <g class="iso-zone">
            <polygon points="${[p0, p1, p2, p3].map((p) => p.join(',')).join(' ')}"
              fill="${tone.top}" fill-opacity="0.42"
              stroke="${pal.stroke}" stroke-opacity="0.45" stroke-width="1.3" stroke-dasharray="5 4" />
            ${spec.label ? `<text x="${p2[0]}" y="${p2[1] + 15}" text-anchor="middle" font-family="var(--font-mono)" font-size="10.5" font-weight="700" fill="${pal.sub}">${escapeXml(spec.label)}</text>` : ''}
          </g>
        `);
        anchors[id] = iso(gx, gy, gz);
        continue;
      }

      const rendered = this._renderEntity(id, spec, pal);
      anchors[id] = rendered.anchor;
      expandBox(rendered.anchor[0], rendered.anchor[1], 68, 58);
      entItems.push({
        depth: (gx - gy) * 100 + gz * 0.1,
        body: rendered.body,
        over: rendered.over,
      });
    }

    entItems.sort((a, b) => a.depth - b.depth);
    this.layers.floor.innerHTML = floorSvg.join('');
    this.layers.ents.innerHTML = entItems.map((e) => e.body).join('');
    this.layers.over.innerHTML = entItems.map((e) => e.over).join('');

    // Render links
    this.linkPaths.clear();
    this.layers.links.innerHTML = '';
    for (const [linkId, link] of Object.entries(links)) {
      const a = anchors[link.from];
      const b = anchors[link.to];
      if (!a || !b) continue;
      const viaPts = (link.via || []).map(([vx, vy, vz = 8]) => iso(vx, vy, vz));
      const rawPts = [a, ...viaPts, b];
      rawPts.forEach(([px, py]) => expandBox(px, py, 28, 28));
      const trimmed = shrinkEndpoints(rawPts, 24, 26);
      const d = roundedPath(trimmed, 12);

      const g = document.createElementNS(SVG_NS, 'g');
      const pathEl = document.createElementNS(SVG_NS, 'path');
      pathEl.setAttribute('d', d);
      pathEl.setAttribute('fill', 'none');
      pathEl.setAttribute('stroke', link.style === 'off' ? pal.grid : pal.link);
      pathEl.setAttribute('stroke-width', '1.8');
      if (link.style === 'dashed' || link.style === 'cut') {
        pathEl.setAttribute('stroke-dasharray', '5 4');
      }
      if (link.heads !== 'none' && link.style !== 'off') {
        pathEl.setAttribute('marker-end', 'url(#arrow-end)');
      }
      if (link.heads === 'both' && link.style !== 'off') {
        pathEl.setAttribute('marker-start', 'url(#arrow-end)');
      }
      g.appendChild(pathEl);

      if (link.label) {
        // True midpoint: with 2 points, trimmed[len/2] was the END point (label hid under the target entity).
        const k = trimmed.length / 2;
        const mid = Number.isInteger(k)
          ? [(trimmed[k - 1][0] + trimmed[k][0]) / 2, (trimmed[k - 1][1] + trimmed[k][1]) / 2]
          : trimmed[Math.floor(k)];
        const labelW = Math.max(36, String(link.label).length * 6.2 + 12); // ~6.2px per mono char at 9.5px
        const labelG = document.createElementNS(SVG_NS, 'g');
        labelG.innerHTML = `
          <rect x="${mid[0] - labelW / 2}" y="${mid[1] - 10}" width="${labelW}" height="16" rx="4" fill="${pal.tones.paper.top}" stroke="${pal.stroke}" stroke-width="1" opacity="0.92" />
          <text x="${mid[0]}" y="${mid[1] + 1.5}" text-anchor="middle" font-family="var(--font-mono)" font-size="9.5" font-weight="600" fill="${pal.sub}">${escapeXml(link.label)}</text>
        `;
        g.appendChild(labelG);
      }

      this.layers.links.appendChild(g);
      this.linkPaths.set(linkId, pathEl);
    }

    // Reset packet flows
    this.packets = [];
    this.layers.packets.innerHTML = '';
    this.flows = (this.scene.flows || []).map((f, idx) => ({
      ...f,
      kind: f.kind || 'req',
      rate: f.rate ?? 1.1,
      speed: f.speed ?? 0.55,
      acc: (idx * 0.37) % 1,
    }));

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this._renderStaticPackets();
    }

    if (!Number.isFinite(minX)) {
      minX = -200;
      minY = -140;
      maxX = 200;
      maxY = 140;
    }
    this.sceneBounds = [minX, minY, Math.max(220, maxX - minX), Math.max(170, maxY - minY)];
    const cx = round2(minX + this.sceneBounds[2] / 2);
    const cy = round2(minY + this.sceneBounds[3] / 2);
    this.fadeGrad.setAttribute('cx', String(cx));
    this.fadeGrad.setAttribute('cy', String(cy));
    this.fadeGrad.setAttribute('r', String(Math.max(this.sceneBounds[2], this.sceneBounds[3]) * 0.78));

    if (!preserveView) {
      this.fit(animate);
    }
  }

  _renderEntity(_id, spec, pal) {
    const [gx, gy, gz = 0] = spec.pos || [0, 0, 0];
    const h = spec.h ?? (spec.kind === 'device' ? 12 : spec.kind === 'queue' ? 14 : 24);
    const w = spec.w ?? (spec.kind === 'queue' ? 2.8 : 2.0);
    const d = spec.d ?? (spec.kind === 'queue' ? 1.5 : 2.0);
    const toneName = spec.heat ? 'danger' : spec.tone || 'paper';
    const tone = pal.tones[toneName] || pal.tones.paper;
    const opacity = spec.dead ? '0.45' : '1';
    const heatCls = spec.heat ? 'ent-heat' : '';

    const anchor = iso(gx, gy, gz + h * 0.45);
    const topCenter = iso(gx, gy, gz + h);
    const botCenter = iso(gx, gy, gz);

    let shape = '';
    if (spec.kind === 'db') {
      const rx = 22;
      const ry = 10;
      const [cx, cyTop] = topCenter;
      const cyBot = cyTop + h;
      shape = `
        <g opacity="${opacity}" class="${heatCls}">
          <path d="M ${cx - rx} ${cyTop} L ${cx - rx} ${cyBot} A ${rx} ${ry} 0 0 0 ${cx + rx} ${cyBot} L ${cx + rx} ${cyTop} Z"
            fill="${tone.left}" stroke="${pal.stroke}" stroke-width="1.6" stroke-linejoin="round" />
          <path d="M ${cx - rx} ${cyTop + h * 0.48} A ${rx} ${ry} 0 0 0 ${cx + rx} ${cyTop + h * 0.48}"
            fill="none" stroke="${pal.stroke}" stroke-opacity="0.45" stroke-width="1.2" />
          <ellipse cx="${cx}" cy="${cyTop}" rx="${rx}" ry="${ry}"
            fill="${tone.top}" stroke="${pal.stroke}" stroke-width="1.6" />
        </g>
      `;
    } else if (spec.kind === 'crowd') {
      const offsets = [[-0.45, -0.3], [0.45, -0.35], [0, 0.35]];
      shape = `<g opacity="${opacity}">` + offsets.map(([ox, oy]) => {
        const [px, py] = iso(gx + ox, gy + oy, gz);
        return `
          <ellipse cx="${px}" cy="${py - 4}" rx="9" ry="5.5" fill="${tone.left}" stroke="${pal.stroke}" stroke-width="1.4" />
          <circle cx="${px}" cy="${py - 14}" r="5.5" fill="${tone.top}" stroke="${pal.stroke}" stroke-width="1.4" />
        `;
      }).join('') + `</g>`;
    } else {
      // Isometric extruded prism (block, queue, device, ghost)
      const hw = w / 2;
      const hd = d / 2;
      const tBack = iso(gx - hw, gy + hd, gz + h);
      const tRight = iso(gx + hw, gy + hd, gz + h);
      const tFront = iso(gx + hw, gy - hd, gz + h);
      const tLeft = iso(gx - hw, gy - hd, gz + h);

      const bRight = iso(gx + hw, gy + hd, gz);
      const bFront = iso(gx + hw, gy - hd, gz);
      const bLeft = iso(gx - hw, gy - hd, gz);

      const dash = spec.kind === 'ghost' ? 'stroke-dasharray="4 3" fill-opacity="0.25"' : '';
      let slots = '';
      if (spec.kind === 'queue') {
        const slotCount = 4;
        const filled = Math.round((spec.cpu ?? 0.5) * slotCount);
        for (let s = 0; s < slotCount; s++) {
          const frac = (s + 0.5) / slotCount - 0.5;
          const [sx, sy] = iso(gx + frac * (w * 0.72), gy, gz + h + 0.5);
          slots += `<circle cx="${sx}" cy="${sy}" r="3.1" fill="${s < filled ? '#c7761f' : tone.right}" stroke="${pal.stroke}" stroke-width="1" />`;
        }
      }

      shape = `
        <g opacity="${opacity}" class="${heatCls}">
          <polygon points="${[tLeft, tFront, bFront, bLeft].map((p) => p.join(',')).join(' ')}"
            fill="${tone.left}" ${dash} stroke="${pal.stroke}" stroke-width="1.6" stroke-linejoin="round" />
          <polygon points="${[tFront, tRight, bRight, bFront].map((p) => p.join(',')).join(' ')}"
            fill="${tone.right}" ${dash} stroke="${pal.stroke}" stroke-width="1.6" stroke-linejoin="round" />
          <polygon points="${[tBack, tRight, tFront, tLeft].map((p) => p.join(',')).join(' ')}"
            fill="${tone.top}" ${dash} stroke="${pal.stroke}" stroke-width="1.6" stroke-linejoin="round" />
          ${slots}
        </g>
      `;
    }

    // Labels, CPU bar, and status tags in overlay layer
    const overParts = [];
    const labelY = botCenter[1] + 20;
    if (spec.label) {
      overParts.push(
        `<text x="${botCenter[0]}" y="${labelY}" text-anchor="middle" font-family="var(--font-mono)" font-size="11.5" font-weight="700" fill="${pal.text}" paint-order="stroke" stroke="${pal.tones.paper.top}" stroke-width="4" stroke-linejoin="round">${escapeXml(spec.label)}</text>`
      );
    }
    if (spec.sub) {
      overParts.push(
        `<text x="${botCenter[0]}" y="${labelY + 13}" text-anchor="middle" font-family="var(--font-mono)" font-size="9.8" fill="${pal.sub}" paint-order="stroke" stroke="${pal.tones.paper.top}" stroke-width="3.5" stroke-linejoin="round">${escapeXml(spec.sub)}</text>`
      );
    }

    if (typeof spec.cpu === 'number' && spec.cpu >= 0 && spec.kind !== 'queue') {
      const pct = Math.max(0, Math.min(1, spec.cpu));
      const barColor = pct > 0.85 ? '#c0392f' : pct > 0.65 ? '#c7761f' : '#2d8a4e';
      const bx = topCenter[0] - 18;
      const by = topCenter[1] - 13;
      overParts.push(`
        <rect x="${bx}" y="${by}" width="36" height="5.5" rx="2.5" fill="${pal.tones.paper.top}" stroke="${pal.stroke}" stroke-width="1" />
        <rect x="${bx + 0.8}" y="${by + 0.8}" width="${round2(34.4 * pct)}" height="3.9" rx="2" fill="${barColor}" />
      `);
    }

    const tags = [...(spec.tags || [])];
    if (spec.dead && !tags.some((t) => t.text === 'DOWN')) {
      tags.unshift({ text: 'DOWN', tone: 'red' });
    }
    tags.forEach((tag, idx) => {
      const ty = topCenter[1] - 24 - idx * 17;
      const bg =
        tag.tone === 'red' ? '#b3342b' : tag.tone === 'green' ? '#25713f' : tag.tone === 'amber' ? '#a5461b' : '#4f45a0';
      const wTag = Math.max(36, String(tag.text).length * 6.5 + 12);
      overParts.push(`
        <g>
          <rect x="${topCenter[0] - wTag / 2}" y="${ty - 10}" width="${wTag}" height="15" rx="4" fill="${bg}" stroke="${pal.stroke}" stroke-width="1" />
          <text x="${topCenter[0]}" y="${ty + 0.5}" text-anchor="middle" font-family="var(--font-mono)" font-size="9.2" font-weight="700" fill="#fff">${escapeXml(tag.text)}</text>
        </g>
      `);
    });

    return { anchor, body: shape, over: overParts.join('') };
  }

  _renderStaticPackets() {
    for (const f of this.flows) {
      const pathEl = this.linkPaths.get(f.link);
      if (!pathEl) continue;
      const len = pathEl.getTotalLength();
      [0.35, 0.72].forEach((p) => {
        const dist = f.reverse ? (1 - p) * len : p * len;
        const pt = pathEl.getPointAtLength(dist);
        const c = document.createElementNS(SVG_NS, 'circle');
        c.setAttribute('cx', String(round2(pt.x)));
        c.setAttribute('cy', String(round2(pt.y)));
        c.setAttribute('r', '4');
        c.setAttribute('fill', PACKET_COLORS[f.kind] || PACKET_COLORS.req);
        this.layers.packets.appendChild(c);
      });
    }
  }

  _tick(now) {
    const dt = Math.min(0.05, Math.max(0, (now - this.lastTick) / 1000));
    this.lastTick = now;

    if (this.viewAnim) {
      const p = Math.min(1, (now - this.viewAnim.start) / this.viewAnim.dur);
      const k = easeInOut(p);
      const next = this.viewAnim.from.map((v, i) => v + (this.viewAnim.to[i] - v) * k);
      this._applyView(next);
      if (p >= 1) this.viewAnim = null;
    }

    if (this.paused || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    for (const f of this.flows) {
      f.acc += dt * f.rate;
      while (f.acc >= 1) {
        f.acc -= 1;
        const pathEl = this.linkPaths.get(f.link);
        if (!pathEl) break;
        const el = document.createElementNS(SVG_NS, 'circle');
        el.setAttribute('r', f.kind === 'slow' ? '5' : '4');
        el.setAttribute('fill', PACKET_COLORS[f.kind] || PACKET_COLORS.req);
        el.setAttribute('stroke', '#1f2328');
        el.setAttribute('stroke-width', '1');
        this.layers.packets.appendChild(el);
        this.packets.push({
          el,
          pathEl,
          len: pathEl.getTotalLength(),
          t: 0,
          speed: f.speed,
          reverse: Boolean(f.reverse),
          dropAt: f.kind === 'drop' ? 0.65 : 1.01,
        });
      }
    }

    for (let i = this.packets.length - 1; i >= 0; i--) {
      const pkt = this.packets[i];
      pkt.t += dt * pkt.speed;
      if (pkt.t >= 1 || pkt.t >= pkt.dropAt) {
        pkt.el.remove();
        this.packets.splice(i, 1);
        continue;
      }
      const dist = (pkt.reverse ? 1 - pkt.t : pkt.t) * pkt.len;
      const pt = pkt.pathEl.getPointAtLength(dist);
      pkt.el.setAttribute('transform', `translate(${round2(pt.x)}, ${round2(pt.y)})`);
    }
  }

  fit(animate = true) {
    if (!this.sceneBounds) return;
    const [bx, by, bw, bh] = this.sceneBounds;
    const hostW = this.host.clientWidth || 640;
    const hostH = this.host.clientHeight || 400;
    const hostRatio = hostW / hostH;
    // Cap zoom so small scenes don't blow labels up past ~1.6x; adds margin for labels/tags.
    const MAX_ZOOM = 1.6;
    let vw = Math.max(bw + 80, hostW / MAX_ZOOM);
    let vh = Math.max(bh + 60, hostH / MAX_ZOOM);
    if (vw / vh > hostRatio) {
      vh = vw / hostRatio;
    } else {
      vw = vh * hostRatio;
    }
    const target = [bx - (vw - bw) / 2, by - (vh - bh) / 2, vw, vh]; // centered on scene bounds
    if (!animate || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.viewAnim = null;
      this._applyView(target);
    } else {
      this.viewAnim = { from: [...this.view], to: target, start: performance.now(), dur: 250 };
    }
  }

  _applyView(v) {
    this.view = v;
    this.svg.setAttribute('viewBox', v.map(round2).join(' '));
  }

  _bindGestures() {
    let drag = null;
    this.svg.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      this.svg.setPointerCapture(e.pointerId);
      drag = { x: e.clientX, y: e.clientY, startView: [...this.view] };
      this.viewAnim = null;
    });
    this.svg.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const scaleX = drag.startView[2] / (this.host.clientWidth || 1);
      const scaleY = drag.startView[3] / (this.host.clientHeight || 1);
      const dx = (e.clientX - drag.x) * scaleX;
      const dy = (e.clientY - drag.y) * scaleY;
      this._applyView([drag.startView[0] - dx, drag.startView[1] - dy, drag.startView[2], drag.startView[3]]);
    });
    const endDrag = () => {
      drag = null;
    };
    this.svg.addEventListener('pointerup', endDrag);
    this.svg.addEventListener('pointercancel', endDrag);

    this.svg.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const factor = e.deltaY > 0 ? 1.1 : 0.9;
        const [vx, vy, vw, vh] = this.view;
        const nw = Math.min(1800, Math.max(160, vw * factor));
        const nh = Math.min(1400, Math.max(120, vh * factor));
        const rect = this.svg.getBoundingClientRect();
        const rx = (e.clientX - rect.left) / (rect.width || 1);
        const ry = (e.clientY - rect.top) / (rect.height || 1);
        this.viewAnim = null;
        this._applyView([vx + (vw - nw) * rx, vy + (vh - nh) * ry, nw, nh]);
      },
      { passive: false }
    );
  }

  destroy() {
    this.destroyed = true;
    this._ro.disconnect();
    this.svg.remove();
  }
}
