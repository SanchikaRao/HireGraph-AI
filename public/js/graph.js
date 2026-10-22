/**
 * Cross-Platform Evidence Knowledge Graph Engine
 * High-performance HTML5 Canvas physics-based force graph
 * Tailored for light theme with solid vibrant colors
 */
class EvidenceGraph {
  constructor(canvasId, inspectorCallback) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.inspectorCallback = inspectorCallback;

    this.nodes = [];
    this.edges = [];
    this.nodeMap = new Map();

    // Physics parameters
    this.zoom = 1;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.draggedNode = null;
    this.hoveredNode = null;
    this.lastMouse = { x: 0, y: 0 };
    this.animId = null;

    this.initCanvasSize();
    this.setupEventListeners();
  }

  initCanvasSize() {
    const parent = this.canvas.parentElement;
    this.width = parent.clientWidth || 800;
    this.height = parent.clientHeight || 580;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.scale(dpr, dpr);

    this.panX = this.width / 2;
    this.panY = this.height / 2;
  }

  setData(graphData) {
    if (!graphData) return;
    this.nodes = [];
    this.edges = [];
    this.nodeMap.clear();

    const count = graphData.nodes.length;
    graphData.nodes.forEach((n, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = n.type === 'candidate' ? 0 : (n.type === 'platform' ? 140 : 250);
      const node = {
        ...n,
        x: Math.cos(angle) * radius + (Math.random() * 20 - 10),
        y: Math.sin(angle) * radius + (Math.random() * 20 - 10),
        vx: 0,
        vy: 0,
        radius: n.size || 22
      };
      this.nodes.push(node);
      this.nodeMap.set(n.id, node);
    });

    graphData.edges.forEach(e => {
      const source = this.nodeMap.get(e.source);
      const target = this.nodeMap.get(e.target);
      if (source && target) {
        this.edges.push({
          source,
          target,
          label: e.label,
          color: e.color || '#94a3b8'
        });
      }
    });

    this.startSimulation();

    // Select candidate root node by default
    const rootNode = this.nodes.find(n => n.type === 'candidate');
    if (rootNode && this.inspectorCallback) {
      this.inspectorCallback(rootNode);
    }
  }

  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.initCanvasSize();
      this.render();
    });

    this.canvas.addEventListener('mousedown', e => this.handleMouseDown(e));
    window.addEventListener('mousemove', e => this.handleMouseMove(e));
    window.addEventListener('mouseup', () => this.handleMouseUp());
    this.canvas.addEventListener('wheel', e => this.handleWheel(e), { passive: false });
  }

  screenToWorld(sx, sy) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (sx - rect.left - this.panX) / this.zoom,
      y: (sy - rect.top - this.panY) / this.zoom
    };
  }

  getNodeAt(worldX, worldY) {
    for (let i = this.nodes.length - 1; i >= 0; i--) {
      const n = this.nodes[i];
      const dx = worldX - n.x;
      const dy = worldY - n.y;
      if (dx * dx + dy * dy <= n.radius * n.radius) {
        return n;
      }
    }
    return null;
  }

  handleMouseDown(e) {
    const worldPos = this.screenToWorld(e.clientX, e.clientY);
    const clickedNode = this.getNodeAt(worldPos.x, worldPos.y);

    if (clickedNode) {
      this.draggedNode = clickedNode;
      if (this.inspectorCallback) {
        this.inspectorCallback(clickedNode);
      }
    } else {
      this.isDragging = true;
      this.lastMouse = { x: e.clientX, y: e.clientY };
    }
  }

  handleMouseMove(e) {
    const worldPos = this.screenToWorld(e.clientX, e.clientY);

    if (this.draggedNode) {
      this.draggedNode.x = worldPos.x;
      this.draggedNode.y = worldPos.y;
      this.draggedNode.vx = 0;
      this.draggedNode.vy = 0;
      this.render();
      return;
    }

    if (this.isDragging) {
      const dx = e.clientX - this.lastMouse.x;
      const dy = e.clientY - this.lastMouse.y;
      this.panX += dx;
      this.panY += dy;
      this.lastMouse = { x: e.clientX, y: e.clientY };
      this.render();
      return;
    }

    const hovered = this.getNodeAt(worldPos.x, worldPos.y);
    if (hovered !== this.hoveredNode) {
      this.hoveredNode = hovered;
      this.canvas.style.cursor = hovered ? 'pointer' : 'grab';
      this.render();
    }
  }

  handleMouseUp() {
    this.isDragging = false;
    this.draggedNode = null;
  }

  handleWheel(e) {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(2.5, Math.max(0.4, this.zoom * zoomFactor));

    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    this.panX = mx - (mx - this.panX) * (newZoom / this.zoom);
    this.panY = my - (my - this.panY) * (newZoom / this.zoom);
    this.zoom = newZoom;

    this.render();
  }

  zoomIn() {
    this.zoom = Math.min(2.5, this.zoom * 1.2);
    this.render();
  }

  zoomOut() {
    this.zoom = Math.max(0.4, this.zoom / 1.2);
    this.render();
  }

  resetView() {
    this.zoom = 1;
    this.panX = this.width / 2;
    this.panY = this.height / 2;
    this.render();
  }

  startSimulation() {
    let iterations = 0;
    const maxIterations = 200;

    const step = () => {
      if (iterations >= maxIterations) {
        this.render();
        return;
      }

      // 1. Repulsion between nodes
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const n1 = this.nodes[i];
          const n2 = this.nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          if (dist < 320) {
            const force = (320 - dist) / (dist * 12);
            n1.vx -= dx * force;
            n1.vy -= dy * force;
            n2.vx += dx * force;
            n2.vy += dy * force;
          }
        }
      }

      // 2. Spring attraction along edges
      this.edges.forEach(e => {
        const dx = e.target.x - e.source.x;
        const dy = e.target.y - e.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = e.source.type === 'candidate' ? 140 : 110;
        const force = (dist - targetDist) * 0.035;

        e.source.vx += (dx / dist) * force;
        e.source.vy += (dy / dist) * force;
        e.target.vx -= (dx / dist) * force;
        e.target.vy -= (dy / dist) * force;
      });

      // 3. Center gravity & update positions
      this.nodes.forEach(n => {
        if (n !== this.draggedNode) {
          n.vx -= n.x * 0.015;
          n.vy -= n.y * 0.015;

          n.vx *= 0.85;
          n.vy *= 0.85;

          n.x += n.vx;
          n.y += n.vy;
        }
      });

      iterations++;
      this.render();
      this.animId = requestAnimationFrame(step);
    };

    if (this.animId) cancelAnimationFrame(this.animId);
    step();
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.save();
    this.ctx.translate(this.panX, this.panY);
    this.ctx.scale(this.zoom, this.zoom);

    // 1. Draw Edges
    this.edges.forEach(e => {
      const isConnected = this.hoveredNode && (e.source === this.hoveredNode || e.target === this.hoveredNode);

      this.ctx.beginPath();
      this.ctx.moveTo(e.source.x, e.source.y);
      this.ctx.lineTo(e.target.x, e.target.y);

      this.ctx.strokeStyle = isConnected ? e.color : '#cbd5e1';
      this.ctx.lineWidth = isConnected ? 3 : 1.5;
      this.ctx.stroke();

      // Draw subtle edge label if connected or hovered
      if (isConnected) {
        const midX = (e.source.x + e.target.x) / 2;
        const midY = (e.source.y + e.target.y) / 2;
        this.ctx.font = '700 10px -apple-system, sans-serif';
        this.ctx.fillStyle = '#1e293b';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(e.label, midX, midY - 4);
      }
    });

    // 2. Draw Nodes
    this.nodes.forEach(n => {
      const isHovered = n === this.hoveredNode;
      const r = n.radius;

      // Outer solid ring
      this.ctx.beginPath();
      this.ctx.arc(n.x, n.y, r + (isHovered ? 4 : 2), 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fill();
      this.ctx.lineWidth = isHovered ? 3 : 2;
      this.ctx.strokeStyle = n.color;
      this.ctx.stroke();

      // Inner solid fill
      this.ctx.beginPath();
      this.ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      this.ctx.fillStyle = n.color;
      this.ctx.fill();

      // Node label
      this.ctx.font = `700 ${n.type === 'candidate' ? '12px' : '11px'} -apple-system, sans-serif`;
      this.ctx.fillStyle = '#0f172a';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';

      // Truncate label if too long
      const labelText = n.label.length > 22 ? n.label.slice(0, 20) + '...' : n.label;
      this.ctx.fillText(labelText, n.x, n.y + r + 6);
    });

    this.ctx.restore();
  }
}
