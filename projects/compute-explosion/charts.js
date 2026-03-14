// ============================================================
// compute-scale/assets/charts.js
// Four D3 charts for "The Compute Explosion" data story
// Data sourced from: Epoch AI, TOP500.org, ORNL, xAI, Wikipedia
// ============================================================

// ── Shared palette ───────────────────────────────────────────
const C = {
  cyan:    "#00d4ff",
  pink:    "#ff4d9d",
  yellow:  "#ffd166",
  green:   "#06d6a0",
  purple:  "#a78bfa",
  orange:  "#ff8c42",
  dim:     "rgba(255,255,255,0.06)",
  border:  "rgba(255,255,255,0.1)",
  muted:   "#8892a4",
  text:    "#e8eaf0",
  bg:      "#0a0c10",
  surface: "#1a1f2e",
};

// ── Shared log-scale Y formatter ─────────────────────────────
function logLabel(v) {
  const exp = Math.round(Math.log10(v));
  const labels = {
    3:"1K", 4:"10K", 5:"100K", 6:"1M", 7:"10M", 8:"100M",
    9:"1G", 10:"10G", 11:"100G", 12:"1T", 13:"10T", 14:"100T",
    15:"1P", 16:"10P", 17:"100P", 18:"1E", 19:"10E", 20:"100E",
    21:"1Z", 22:"10Z", 23:"100Z", 24:"1Y", 25:"10Y", 26:"100Y",
    27:"10²⁷", 28:"10²⁸", 29:"10²⁹", 30:"10³⁰",
  };
  return labels[exp] || `10^${exp}`;
}

// ── Responsive width helper ───────────────────────────────────
function chartWidth(el) {
  return Math.max(300, el.getBoundingClientRect().width || 700);
}

// ═══════════════════════════════════════════════════════════════
// CHART 1 — Maximum Computational Power Over Time, 1945–2026
// ═══════════════════════════════════════════════════════════════
window.buildChart1 = function(containerId) {
  const hpcData = [
    { name:"ENIAC",         year:1945, log10:3.7,  series:"hpc" },
    { name:"IBM 701",       year:1952, log10:5.8,  series:"hpc" },
    { name:"CDC 6600",      year:1964, log10:6.9,  series:"hpc" },
    { name:"Cray-1",        year:1976, log10:8.0,  series:"hpc" },
    { name:"Cray X-MP",     year:1983, log10:9.0,  series:"hpc" },
    { name:"Thinking Machines CM-5", year:1993, log10:11.0, series:"hpc" },
    { name:"ASCI Red\n(1st teraFLOP)", year:1997, log10:12.0, series:"hpc" },
    { name:"ASCI White",    year:2000, log10:12.3, series:"hpc" },
    { name:"Earth Simulator",year:2002,log10:13.0, series:"hpc" },
    { name:"IBM Roadrunner\n(1st petaFLOP)", year:2008, log10:15.0, series:"hpc" },
    { name:"Tianhe-1A",     year:2010, log10:15.4, series:"hpc" },
    { name:"Sequoia",       year:2012, log10:16.3, series:"hpc" },
    { name:"Tianhe-2",      year:2013, log10:16.7, series:"hpc" },
    { name:"Summit",        year:2018, log10:17.3, series:"hpc" },
    { name:"Fugaku",        year:2020, log10:17.6, series:"hpc" },
    { name:"Frontier\n(1st exaFLOP)", year:2022, log10:18.08, series:"hpc" },
    { name:"Frontier AI",   year:2024, log10:18.1, series:"hpc" },
  ];

  const aiData = [
    { name:"AlexNet\nTraining",  year:2012, log10:18.4, series:"ai", projected:false },
    { name:"GPT-3\nTraining",    year:2020, log10:23.5, series:"ai", projected:false },
    { name:"GPT-4\nTraining",    year:2023, log10:24.7, series:"ai", projected:false },
    { name:"Grok-3\nTraining",   year:2025, log10:27.0, series:"ai", projected:false },
    { name:"Grok-3 Next-gen\n(projected ~10²⁸)", year:2026, log10:28.0, series:"ai", projected:true },
  ];

  const allData = [...hpcData, ...aiData];

  const el = document.getElementById(containerId);
  const W = chartWidth(el);
  const H = Math.round(W * 0.58);
  const margin = { top: 40, right: 160, bottom: 50, left: 80 };
  const iw = W - margin.left - margin.right;
  const ih = H - margin.top - margin.bottom;

  d3.select(`#${containerId}`).selectAll("*").remove();

  const svg = d3.select(`#${containerId}`)
    .append("svg")
    .attr("width", W).attr("height", H)
    .style("background", C.bg)
    .style("border-radius", "8px");

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const x = d3.scaleLinear().domain([1945, 2027]).range([0, iw]);
  const y = d3.scaleLog().base(10).domain([1e3, 1e30]).range([ih, 0]).clamp(true);

  // Background era bands
  const eras = [
    { label:"MAINFRAME ERA", x0:1945, x1:1965 },
    { label:"SUPERCOMPUTER ERA", x0:1965, x1:1995 },
    { label:"MODERN HPC ERA",   x0:1995, x1:2015 },
    { label:"AI ERA",           x0:2015, x1:2027 },
  ];
  const eraColors = ["rgba(0,212,255,0.03)","rgba(0,212,255,0.06)","rgba(0,212,255,0.03)","rgba(255,77,157,0.06)"];
  eras.forEach((era, i) => {
    g.append("rect")
      .attr("x", x(era.x0)).attr("y", 0)
      .attr("width", x(era.x1) - x(era.x0)).attr("height", ih)
      .attr("fill", eraColors[i]);
    g.append("text")
      .attr("x", (x(era.x0) + x(era.x1)) / 2).attr("y", ih + 38)
      .attr("text-anchor", "middle")
      .attr("fill", C.muted).attr("font-size", "9px")
      .attr("font-family", "JetBrains Mono, monospace")
      .attr("letter-spacing", "0.1em")
      .text(era.label);
  });

  // Grid lines
  const yTicks = [1e3,1e6,1e9,1e12,1e15,1e18,1e21,1e24,1e27,1e30];
  yTicks.forEach(v => {
    g.append("line")
      .attr("x1", 0).attr("x2", iw)
      .attr("y1", y(v)).attr("y2", y(v))
      .attr("stroke", C.border).attr("stroke-width", 0.5);
  });

  // Axes
  g.append("g").attr("transform", `translate(0,${ih})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(10))
    .call(a => { a.select(".domain").remove(); a.selectAll("line").remove(); })
    .call(a => a.selectAll("text").attr("fill", C.muted).attr("font-size", "11px").attr("font-family","JetBrains Mono, monospace"));

  g.append("g")
    .call(d3.axisLeft(y).tickValues(yTicks).tickFormat(logLabel))
    .call(a => { a.select(".domain").remove(); a.selectAll("line").remove(); })
    .call(a => a.selectAll("text").attr("fill", C.muted).attr("font-size", "10px").attr("font-family","JetBrains Mono, monospace"));

  g.append("text").attr("transform","rotate(-90)").attr("x", -ih/2).attr("y", -62)
    .attr("text-anchor","middle").attr("fill", C.muted).attr("font-size","11px")
    .attr("font-family","JetBrains Mono, monospace")
    .text("Peak FLOPS (log scale)");

  // HPC line
  const hpcLine = d3.line().x(d => x(d.year)).y(d => y(Math.pow(10, d.log10))).curve(d3.curveMonotoneX);
  g.append("path").datum(hpcData).attr("fill","none")
    .attr("stroke", C.cyan).attr("stroke-width", 1.5).attr("d", hpcLine);

  // AI line (solid)
  const aiSolid = aiData.filter(d => !d.projected);
  const aiLineGen = d3.line().x(d => x(d.year)).y(d => y(Math.pow(10, d.log10))).curve(d3.curveMonotoneX);
  g.append("path").datum(aiSolid).attr("fill","none")
    .attr("stroke", C.pink).attr("stroke-width", 2).attr("d", aiLineGen);

  // AI projected dashed
  const lastSolid = aiSolid[aiSolid.length - 1];
  const projPoint = aiData.find(d => d.projected);
  if (projPoint) {
    g.append("line")
      .attr("x1", x(lastSolid.year)).attr("y1", y(Math.pow(10, lastSolid.log10)))
      .attr("x2", x(projPoint.year)).attr("y2", y(Math.pow(10, projPoint.log10)))
      .attr("stroke", C.pink).attr("stroke-width", 1.5).attr("stroke-dasharray","6,4").attr("opacity",0.6);
  }

  // HPC dots
  hpcData.forEach(d => {
    g.append("circle").attr("cx", x(d.year)).attr("cy", y(Math.pow(10, d.log10)))
      .attr("r", 4).attr("fill", C.cyan).attr("stroke", C.bg).attr("stroke-width", 1.5);
  });

  // AI dots + labels
  const labeledAI = ["AlexNet\nTraining","GPT-3\nTraining","GPT-4\nTraining","Grok-3\nTraining"];
  aiData.forEach(d => {
    const cx = x(d.year), cy = y(Math.pow(10, d.log10));
    g.append("circle").attr("cx", cx).attr("cy", cy)
      .attr("r", d.projected ? 5 : 6)
      .attr("fill", d.projected ? "none" : C.pink)
      .attr("stroke", C.pink).attr("stroke-width", d.projected ? 1.5 : 0)
      .attr("stroke-dasharray", d.projected ? "4,2" : "none");

    if (labeledAI.includes(d.name) || d.projected) {
      const lines = d.name.split("\n");
      const labelY = cy - 14;
      lines.forEach((line, i) => {
        g.append("text").attr("x", cx + 10).attr("y", labelY + i * 13)
          .attr("fill", d.projected ? C.muted : C.pink)
          .attr("font-size", "9px").attr("font-family","JetBrains Mono, monospace")
          .text(line);
      });
    }
  });

  // Label key HPC milestones
  const hpcLabeled = ["ENIAC","ASCI Red\n(1st teraFLOP)","IBM Roadrunner\n(1st petaFLOP)","Frontier\n(1st exaFLOP)"];
  hpcData.filter(d => hpcLabeled.includes(d.name)).forEach(d => {
    const lines = d.name.split("\n");
    const cx = x(d.year), cy = y(Math.pow(10, d.log10));
    lines.forEach((line, i) => {
      g.append("text").attr("x", cx + 8).attr("y", cy - 8 + i * 12)
        .attr("fill", C.cyan).attr("font-size","9px").attr("font-family","JetBrains Mono, monospace")
        .text(line);
    });
  });

  // 7 orders of magnitude annotation arrow
  const y1 = y(Math.pow(10, 18.08)), y2 = y(Math.pow(10, 27));
  const ax = x(2024) + 30;
  g.append("line").attr("x1",ax).attr("y1",y1).attr("x2",ax).attr("y2",y2)
    .attr("stroke",C.yellow).attr("stroke-width",1).attr("marker-end","url(#arrowY)");
  g.append("text").attr("x",ax+8).attr("y",(y1+y2)/2)
    .attr("fill",C.yellow).attr("font-size","9px").attr("font-family","JetBrains Mono, monospace")
    .text("9 orders");
  g.append("text").attr("x",ax+8).attr("y",(y1+y2)/2+12)
    .attr("fill",C.yellow).attr("font-size","9px").attr("font-family","JetBrains Mono, monospace")
    .text("of magnitude");

  svg.append("defs").append("marker").attr("id","arrowY")
    .attr("viewBox","0 0 10 10").attr("refX",5).attr("refY",5)
    .attr("markerWidth",6).attr("markerHeight",6).attr("orient","auto-start-reverse")
    .append("path").attr("d","M0,0 L10,5 L0,10 Z").attr("fill",C.yellow);

  // Legend
  const leg = svg.append("g").attr("transform",`translate(${margin.left},${margin.top - 28})`);
  [[C.cyan,"Supercomputers / HPC"],[C.pink,"AI Training Runs"],[C.pink,"Projected / Estimated"]].forEach(([col, label], i) => {
    const lx = i * 190;
    if (i === 2) {
      leg.append("line").attr("x1",lx).attr("y1",6).attr("x2",lx+20).attr("y2",6)
        .attr("stroke",col).attr("stroke-width",1.5).attr("stroke-dasharray","5,3");
    } else {
      leg.append("rect").attr("x",lx).attr("y",0).attr("width",20).attr("height",10)
        .attr("rx",2).attr("fill",col).attr("opacity",0.8);
    }
    leg.append("text").attr("x",lx+26).attr("y",9)
      .attr("fill",C.muted).attr("font-size","10px").attr("font-family","JetBrains Mono, monospace")
      .text(label);
  });
};


// ═══════════════════════════════════════════════════════════════
// CHART 2 — Biological Neurons vs. Silicon FLOPs (dual scale)
// ═══════════════════════════════════════════════════════════════
window.buildChart2 = function(containerId) {
  const bioData = [
    { name:"Single Neuron",       log10:0,  desc:"1 neuron — a biological switch" },
    { name:"C. elegans Worm",     log10:2.5, desc:"302 neurons — first organism fully mapped" },
    { name:"Single Ant",          log10:5.4, desc:"250,000 neurons — follows pheromones only" },
    { name:"Honeybee",            log10:6.0, desc:"1 million neurons" },
    { name:"Crow / Octopus",      log10:9.2, desc:"~1.5B neurons — tool use, problem solving" },
    { name:"Human",               log10:10.9, desc:"~86B neurons — language, art, science" },
    { name:"Chimpanzee",          log10:10.5, desc:"~28B neurons" },
    { name:"Ant Colony (1M ants)",log10:11.4, desc:"250M×1M neurons — wages war, farms" },
    { name:"All Humans Ever Lived",log10:14.9,desc:"est. 100B humans × 86B neurons" },
  ];

  const siliconData = [
    { name:"ENIAC (1946)",        log10:3.7,  color:C.green },
    { name:"Cray-1 (1976)",       log10:8.0,  color:C.green },
    { name:"ASCI Red (1997)",     log10:12.0, color:C.green },
    { name:"IBM Roadrunner (2008)",log10:15.0,color:C.green },
    { name:"IBM Summit (2018)",   log10:17.3, color:C.green },
    { name:"Frontier (2022)",     log10:18.08,color:C.green },
    { name:"Frontier AI (2024)",  log10:18.1, color:C.green },
    { name:"GPT-3 Training (2020)",log10:23.5,color:C.pink },
    { name:"GPT-4 Training (2023)",log10:24.7,color:C.pink },
    { name:"Gemini Ultra (2024)", log10:25.3, color:C.pink },
    { name:"Grok-3 Training (2025)",log10:27.0,color:C.pink },
    { name:"2026 Frontier (proj.)",log10:28.0,color:C.pink, projected:true },
  ];

  const el = document.getElementById(containerId);
  const W = chartWidth(el);
  const H = Math.round(W * 0.62);
  const margin = { top: 30, right: 20, bottom: 20, left: 20 };
  const panelW = (W - margin.left - margin.right - 60) / 2;
  const ih = H - margin.top - margin.bottom;
  const barH = 14, barGap = 4;

  d3.select(`#${containerId}`).selectAll("*").remove();

  const svg = d3.select(`#${containerId}`)
    .append("svg").attr("width", W).attr("height", H)
    .style("background", C.bg).style("border-radius","8px");

  // Panel titles
  svg.append("text").attr("x", margin.left + panelW/2).attr("y", 22)
    .attr("text-anchor","middle").attr("fill", C.cyan).attr("font-size","12px")
    .attr("font-family","JetBrains Mono, monospace").attr("font-weight","500")
    .text("Biological Intelligence Scale");

  svg.append("text").attr("x", W - margin.right - panelW/2).attr("y", 22)
    .attr("text-anchor","middle").attr("fill", C.cyan).attr("font-size","12px")
    .attr("font-family","JetBrains Mono, monospace").attr("font-weight","500")
    .text("Computational Power Scale");

  // Y scale shared
  const y = d3.scaleLog().base(10).domain([1, 1e30]).range([ih - 10, 10]);

  // LEFT — bio bars
  const bioG = svg.append("g").attr("transform",`translate(${margin.left},${margin.top})`);
  const bioX = d3.scaleLinear().domain([0,1]).range([0, panelW - 120]);

  bioData.forEach(d => {
    const cy = y(Math.pow(10, d.log10));
    bioG.append("rect")
      .attr("x", 60).attr("y", cy - barH/2)
      .attr("width", bioX(0.85)).attr("height", barH)
      .attr("fill", d.name.includes("Human") && !d.name.includes("All") ? C.cyan : C.cyan)
      .attr("opacity", d.name.includes("All") ? 0.9 : 0.5)
      .attr("rx", 2);
    bioG.append("text").attr("x", 60 + bioX(0.88)).attr("y", cy + 4)
      .attr("fill", C.muted).attr("font-size","9px").attr("font-family","JetBrains Mono, monospace")
      .text(d.name.length > 20 ? d.name.slice(0,20) : d.name);
  });

  // Bio Y axis ticks
  [1,1e3,1e6,1e9,1e12,1e15].forEach(v => {
    const ty = y(v);
    bioG.append("line").attr("x1",55).attr("x2",60).attr("y1",ty).attr("y2",ty)
      .attr("stroke",C.muted).attr("stroke-width",0.5);
    bioG.append("text").attr("x",52).attr("y",ty+4)
      .attr("text-anchor","end").attr("fill",C.muted).attr("font-size","9px")
      .attr("font-family","JetBrains Mono, monospace").text(logLabel(v));
  });

  // RIGHT — silicon bars
  const silG = svg.append("g").attr("transform",`translate(${W - margin.right - panelW},${margin.top})`);

  siliconData.forEach(d => {
    const cy = y(Math.pow(10, d.log10));
    silG.append("rect")
      .attr("x", 0).attr("y", cy - barH/2)
      .attr("width", panelW - 160).attr("height", barH)
      .attr("fill", d.color)
      .attr("opacity", d.projected ? 0.4 : 0.65)
      .attr("rx", 2)
      .attr("stroke", d.projected ? d.color : "none")
      .attr("stroke-dasharray", d.projected ? "4,2" : "none")
      .attr("stroke-width", d.projected ? 1 : 0);
    silG.append("text").attr("x", panelW - 155).attr("y", cy + 4)
      .attr("fill", C.muted).attr("font-size","9px").attr("font-family","JetBrains Mono, monospace")
      .text(d.name.length > 24 ? d.name.slice(0,24) : d.name);
  });

  // Silicon Y axis
  [1e3,1e6,1e9,1e12,1e15,1e18,1e21,1e24,1e27,1e30].forEach(v => {
    const ty = y(v);
    silG.append("line").attr("x1",-5).attr("x2",0).attr("y1",ty).attr("y2",ty)
      .attr("stroke",C.muted).attr("stroke-width",0.5);
    silG.append("text").attr("x",-8).attr("y",ty+4)
      .attr("text-anchor","end").attr("fill",C.muted).attr("font-size","9px")
      .attr("font-family","JetBrains Mono, monospace").text(logLabel(v));
  });

  // Annotation: gap
  const gapY1 = margin.top + y(1e15), gapY2 = margin.top + y(1e27);
  const gapX = W/2 + 10;
  svg.append("line").attr("x1",gapX).attr("y1",gapY1).attr("x2",gapX).attr("y2",gapY2)
    .attr("stroke",C.yellow).attr("stroke-width",1).attr("stroke-dasharray","3,3");
  svg.append("text").attr("x",gapX+4).attr("y",(gapY1+gapY2)/2 - 10)
    .attr("fill",C.yellow).attr("font-size","9px").attr("font-family","JetBrains Mono, monospace")
    .text("~12 orders");
  svg.append("text").attr("x",gapX+4).attr("y",(gapY1+gapY2)/2+2)
    .attr("fill",C.yellow).attr("font-size","9px").attr("font-family","JetBrains Mono, monospace")
    .text("of magnitude");
  svg.append("text").attr("x",gapX+4).attr("y",(gapY1+gapY2)/2+14)
    .attr("fill",C.yellow).attr("font-size","9px").attr("font-family","JetBrains Mono, monospace")
    .text("Frontier → Grok-3");

  // Footer note
  svg.append("text").attr("x",W/2).attr("y",H-6).attr("text-anchor","middle")
    .attr("fill",C.muted).attr("font-size","9px").attr("font-family","JetBrains Mono, monospace")
    .text("Neurons ≠ FLOPs — this is a scale comparison, not an equivalence");
};


// ═══════════════════════════════════════════════════════════════
// CHART 3 — Biological Intelligence vs. Machine Computation — Same Scale
// ═══════════════════════════════════════════════════════════════
window.buildChart3 = function(containerId) {
  const bioData = [
    { name:"Single Neuron",         log10:0,   desc:"1 neuron" },
    { name:"C. elegans Worm",       log10:2.5, desc:"302 neurons" },
    { name:"Single Ant",            log10:5.4, desc:"250,000 neurons" },
    { name:"Honeybee",              log10:6.0, desc:"1M neurons" },
    { name:"Crow / Octopus",        log10:9.2, desc:"~1.5B neurons" },
    { name:"Chimpanzee",            log10:10.5,desc:"~28B neurons" },
    { name:"Human",                 log10:10.9,desc:"~86B neurons" },
    { name:"Ant Colony (1M ants)",  log10:11.4,desc:"~250M neurons total" },
    { name:"All Humans Ever Lived", log10:14.9,desc:"est. 100B × 86B neurons" },
  ];

  const siliconData = [
    { name:"ENIAC (1946)",          log10:3.7,  color:C.green, projected:false },
    { name:"Cray-1 (1976)",         log10:8.0,  color:C.green, projected:false },
    { name:"ASCI Red (1997)",       log10:12.0, color:C.green, projected:false },
    { name:"IBM Roadrunner (2008)", log10:15.0, color:C.green, projected:false },
    { name:"IBM Summit (2018)",     log10:17.3, color:C.green, projected:false },
    { name:"Frontier (2022)",       log10:18.08,color:C.green, projected:false },
    { name:"Frontier AI (2024)",    log10:18.1, color:C.green, projected:false },
    { name:"GPT-3 Training (2020)", log10:23.5, color:C.pink,  projected:false },
    { name:"GPT-4 Training (2023)", log10:24.7, color:C.pink,  projected:false },
    { name:"Gemini Ultra (2024)",   log10:25.3, color:C.pink,  projected:false },
    { name:"Grok-3 Training (2025)",log10:27.0, color:C.pink,  projected:false },
    { name:"2026 Frontier (proj.)", log10:28.0, color:C.pink,  projected:true  },
  ];

  const el = document.getElementById(containerId);
  const W = chartWidth(el);
  const H = Math.round(W * 0.72);
  const margin = { top: 40, right: 20, bottom: 20, left: 20 };
  const panelW = (W - margin.left - margin.right - 40) / 2;
  const ih = H - margin.top - margin.bottom;
  const barH = 13;

  d3.select(`#${containerId}`).selectAll("*").remove();

  const svg = d3.select(`#${containerId}`)
    .append("svg").attr("width",W).attr("height",H)
    .style("background",C.bg).style("border-radius","8px");

  // Shared Y scale — same range both panels
  const y = d3.scaleLog().base(10).domain([1, 1e30]).range([ih - 5, 5]);

  // Titles
  svg.append("text").attr("x", margin.left + panelW/2).attr("y", 22)
    .attr("text-anchor","middle").attr("fill",C.cyan)
    .attr("font-size","11px").attr("font-family","JetBrains Mono, monospace").attr("font-weight","500")
    .text("Biological Intelligence (Neuron Count)");

  svg.append("text").attr("x", W - margin.right - panelW/2).attr("y", 22)
    .attr("text-anchor","middle").attr("fill",C.cyan)
    .attr("font-size","11px").attr("font-family","JetBrains Mono, monospace").attr("font-weight","500")
    .text("Computational Power (Training FLOPs)");

  // LEFT PANEL
  const bioG = svg.append("g").attr("transform",`translate(${margin.left},${margin.top})`);

  // "nothing biological exists here" zone
  const emptyTop = y(1e30), emptyBot = y(1e15);
  bioG.append("rect").attr("x",60).attr("y",emptyTop)
    .attr("width",panelW-130).attr("height",emptyBot-emptyTop)
    .attr("fill","rgba(255,255,255,0.015)").attr("rx",4);
  bioG.append("text").attr("x", 60 + (panelW-130)/2).attr("y",(emptyTop+emptyBot)/2 - 8)
    .attr("text-anchor","middle").attr("fill","rgba(255,255,255,0.2)")
    .attr("font-size","10px").attr("font-family","JetBrains Mono, monospace").attr("font-style","italic")
    .text("— nothing biological");
  bioG.append("text").attr("x", 60 + (panelW-130)/2).attr("y",(emptyTop+emptyBot)/2 + 6)
    .attr("text-anchor","middle").attr("fill","rgba(255,255,255,0.2)")
    .attr("font-size","10px").attr("font-family","JetBrains Mono, monospace").attr("font-style","italic")
    .text("exists here —");

  // Bio bars
  bioData.forEach(d => {
    const cy = y(Math.pow(10, d.log10));
    bioG.append("rect").attr("x",60).attr("y",cy-barH/2)
      .attr("width",panelW-130).attr("height",barH)
      .attr("fill",C.cyan).attr("opacity",d.name.includes("All") ? 0.9 : 0.5).attr("rx",2);
    bioG.append("text").attr("x",60+(panelW-128)).attr("y",cy+4)
      .attr("fill",C.muted).attr("font-size","8px").attr("font-family","JetBrains Mono, monospace")
      .text(d.name.length > 22 ? d.name.slice(0,21)+"…" : d.name);
  });

  // Y axis LEFT
  [1,1e3,1e6,1e9,1e12,1e15,1e18,1e21,1e24,1e27,1e30].forEach(v => {
    const ty = y(v);
    bioG.append("line").attr("x1",55).attr("x2",60).attr("y1",ty).attr("y2",ty)
      .attr("stroke",C.border).attr("stroke-width",0.5);
    bioG.append("text").attr("x",52).attr("y",ty+4)
      .attr("text-anchor","end").attr("fill",C.muted).attr("font-size","8px")
      .attr("font-family","JetBrains Mono, monospace").text(logLabel(v));
  });

  // RIGHT PANEL
  const silG = svg.append("g").attr("transform",`translate(${W-margin.right-panelW},${margin.top})`);

  siliconData.forEach(d => {
    const cy = y(Math.pow(10, d.log10));
    silG.append("rect").attr("x",0).attr("y",cy-barH/2)
      .attr("width",panelW-150).attr("height",barH)
      .attr("fill",d.color).attr("opacity",d.projected ? 0.35 : 0.65).attr("rx",2);
    silG.append("text").attr("x",panelW-146).attr("y",cy+4)
      .attr("fill",C.muted).attr("font-size","8px").attr("font-family","JetBrains Mono, monospace")
      .text(d.name.length > 24 ? d.name.slice(0,23)+"…" : d.name);
  });

  // Y axis RIGHT
  [1,1e3,1e6,1e9,1e12,1e15,1e18,1e21,1e24,1e27,1e30].forEach(v => {
    const ty = y(v);
    silG.append("line").attr("x1",-5).attr("x2",0).attr("y1",ty).attr("y2",ty)
      .attr("stroke",C.border).attr("stroke-width",0.5);
    silG.append("text").attr("x",-8).attr("y",ty+4)
      .attr("text-anchor","end").attr("fill",C.muted).attr("font-size","8px")
      .attr("font-family","JetBrains Mono, monospace").text(logLabel(v));
  });

  // Gap annotation between biology ceiling (10^15) and Grok-3 (10^27)
  const gY1 = margin.top + y(1e15);
  const gY2 = margin.top + y(1e27);
  const gX = margin.left + panelW + 20;
  svg.append("line").attr("x1",gX).attr("y1",gY1).attr("x2",gX).attr("y2",gY2)
    .attr("stroke",C.yellow).attr("stroke-width",1);
  svg.append("text").attr("x",gX+4).attr("y",(gY1+gY2)/2-8)
    .attr("fill",C.yellow).attr("font-size","9px").attr("font-family","JetBrains Mono, monospace")
    .text("~12 OOM");
  svg.append("text").attr("x",gX+4).attr("y",(gY1+gY2)/2+4)
    .attr("fill",C.yellow).attr("font-size","9px").attr("font-family","JetBrains Mono, monospace")
    .text("bio ceiling");
  svg.append("text").attr("x",gX+4).attr("y",(gY1+gY2)/2+16)
    .attr("fill",C.yellow).attr("font-size","9px").attr("font-family","JetBrains Mono, monospace")
    .text("→ Grok-3");

  // Subtitle
  svg.append("text").attr("x",W/2).attr("y",H-8).attr("text-anchor","middle")
    .attr("fill",C.muted).attr("font-size","9px").attr("font-family","JetBrains Mono, monospace")
    .text("Neurons ≠ FLOPs — scale comparison only · Sources: Epoch AI, xAI, Wikipedia, Azevedo et al. 2009");
};


// ═══════════════════════════════════════════════════════════════
// CHART 4 — The Big Bang vs. The Compute Explosion
// ═══════════════════════════════════════════════════════════════
window.buildChart4 = function(containerId) {
  const cosmosData = [
    { name:"Planck Length",    log10:1,  desc:"~10⁻³⁵ m — smallest meaningful scale" },
    { name:"Quark Era",        log10:5,  desc:"t = 10⁻¹² sec — four forces unified" },
    { name:"End of Inflation", log10:10, desc:"t = 10⁻³² sec — 10²⁶× expansion in a fraction of a second" },
    { name:"First Protons",    log10:18, desc:"t = 10⁻⁶ sec" },
    { name:"Nucleosynthesis",  log10:24, desc:"t = 3 min" },
    { name:"First Atoms",      log10:29, desc:"t = 380,000 yrs — universe becomes transparent" },
    { name:"First Stars",      log10:33, desc:"t = 200M yrs" },
    { name:"Milky Way Forms",  log10:37, desc:"t = 1B yrs" },
    { name:"Solar System",     log10:38, desc:"t = 9B yrs" },
    { name:"First Life",       log10:38.5,desc:"t = 10B yrs" },
    { name:"Today",            log10:41, desc:"13.8 billion years" },
  ];

  const computeData = [
    { name:"ENIAC (1946)",          log10:3.7,  color:C.green },
    { name:"Cray-1 (1976)",         log10:8.0,  color:C.green },
    { name:"ASCI Red (1997)",       log10:12.0, color:C.green },
    { name:"IBM Roadrunner (2008)", log10:15.0, color:C.green },
    { name:"IBM Summit (2018)",     log10:17.3, color:C.green },
    { name:"Frontier (2022)",       log10:18.08,color:C.green },
    { name:"GPT-3 Training (2020)", log10:23.5, color:C.pink },
    { name:"GPT-4 Training (2023)", log10:24.7, color:C.pink },
    { name:"Gemini Ultra (2024)",   log10:25.3, color:C.pink },
    { name:"Grok-3 Training (2025)",log10:27.0, color:C.pink },
    { name:"2026 Frontier (proj.)", log10:28.0, color:C.pink, projected:true },
  ];

  const el = document.getElementById(containerId);
  const W = chartWidth(el);
  const H = Math.round(W * 0.82);
  const margin = { top: 40, right: 20, bottom: 40, left: 20 };
  const panelW = (W - margin.left - margin.right - 40) / 2;
  const ih = H - margin.top - margin.bottom;
  const barH = 12;

  d3.select(`#${containerId}`).selectAll("*").remove();

  const svg = d3.select(`#${containerId}`)
    .append("svg").attr("width",W).attr("height",H)
    .style("background",C.bg).style("border-radius","8px");

  // Shared Y: 1 to 10^65
  const y = d3.scaleLog().base(10).domain([1, 1e65]).range([ih - 5, 5]);

  // Titles
  svg.append("text").attr("x",margin.left + panelW/2).attr("y",22)
    .attr("text-anchor","middle").attr("fill",C.green)
    .attr("font-size","11px").attr("font-family","JetBrains Mono, monospace").attr("font-weight","500")
    .text("The Big Bang (Expansion of the Universe)");
  svg.append("text").attr("x",W-margin.right-panelW/2).attr("y",22)
    .attr("text-anchor","middle").attr("fill",C.pink)
    .attr("font-size","11px").attr("font-family","JetBrains Mono, monospace").attr("font-weight","500")
    .text("Human Computation (Training FLOPs)");

  // LEFT — cosmos bars
  const cosG = svg.append("g").attr("transform",`translate(${margin.left},${margin.top})`);

  // Inflation highlight zone
  const inflBot = y(1e10), inflTop = y(1e36);
  cosG.append("rect").attr("x",60).attr("y",inflTop)
    .attr("width",panelW-130).attr("height",inflBot-inflTop)
    .attr("fill","rgba(6,214,160,0.05)").attr("rx",2);

  cosmosData.forEach(d => {
    const cy = y(Math.pow(10, d.log10));
    cosG.append("rect").attr("x",60).attr("y",cy-barH/2)
      .attr("width",panelW-130).attr("height",barH)
      .attr("fill",C.green).attr("opacity", d.name === "Today" ? 0.9 : 0.5).attr("rx",2);
    cosG.append("text").attr("x",60+(panelW-127)).attr("y",cy+4)
      .attr("fill",C.muted).attr("font-size","8px").attr("font-family","JetBrains Mono, monospace")
      .text(d.name.length > 18 ? d.name.slice(0,17)+"…" : d.name);
  });

  // Cosmos Y axis ticks
  [1,1e5,1e10,1e15,1e20,1e25,1e30,1e35,1e40,1e45,1e50,1e55,1e60,1e65].forEach(v => {
    const ty = y(v);
    const exp = Math.round(Math.log10(v));
    cosG.append("line").attr("x1",55).attr("x2",60).attr("y1",ty).attr("y2",ty)
      .attr("stroke",C.border).attr("stroke-width",0.5);
    cosG.append("text").attr("x",52).attr("y",ty+4)
      .attr("text-anchor","end").attr("fill",C.muted).attr("font-size","8px")
      .attr("font-family","JetBrains Mono, monospace")
      .text(exp === 0 ? "1" : `10^${exp}`);
  });

  // 41 OOM cosmos annotation
  const c41y1 = margin.top + y(1), c41y2 = margin.top + y(1e41);
  const c41x = margin.left + 15;
  svg.append("line").attr("x1",c41x).attr("y1",c41y1).attr("x2",c41x).attr("y2",c41y2)
    .attr("stroke",C.green).attr("stroke-width",1);
  svg.append("text").attr("x",c41x+4).attr("y",(c41y1+c41y2)/2-4)
    .attr("fill",C.green).attr("font-size","9px").attr("font-family","JetBrains Mono, monospace")
    .text("~41 OOM");
  svg.append("text").attr("x",c41x+4).attr("y",(c41y1+c41y2)/2+8)
    .attr("fill",C.green).attr("font-size","9px").attr("font-family","JetBrains Mono, monospace")
    .text("13.8B years");

  // RIGHT — compute bars
  const comG = svg.append("g").attr("transform",`translate(${W-margin.right-panelW},${margin.top})`);

  computeData.forEach(d => {
    const cy = y(Math.pow(10, d.log10));
    comG.append("rect").attr("x",0).attr("y",cy-barH/2)
      .attr("width",panelW-150).attr("height",barH)
      .attr("fill",d.color).attr("opacity",d.projected ? 0.35 : 0.65).attr("rx",2);
    comG.append("text").attr("x",panelW-146).attr("y",cy+4)
      .attr("fill",C.muted).attr("font-size","8px").attr("font-family","JetBrains Mono, monospace")
      .text(d.name.length > 24 ? d.name.slice(0,23)+"…" : d.name);
  });

  // Compute Y axis
  [1,1e5,1e10,1e15,1e20,1e25,1e30,1e35,1e40,1e45,1e50,1e55,1e60,1e65].forEach(v => {
    const ty = y(v);
    const exp = Math.round(Math.log10(v));
    comG.append("line").attr("x1",-5).attr("x2",0).attr("y1",ty).attr("y2",ty)
      .attr("stroke",C.border).attr("stroke-width",0.5);
    comG.append("text").attr("x",-8).attr("y",ty+4)
      .attr("text-anchor","end").attr("fill",C.muted).attr("font-size","8px")
      .attr("font-family","JetBrains Mono, monospace")
      .text(exp === 0 ? "1" : `10^${exp}`);
  });

  // 24 OOM compute annotation
  const c24y1 = margin.top + y(1), c24y2 = margin.top + y(1e24);
  const c24x = W - 14;
  svg.append("line").attr("x1",c24x).attr("y1",c24y1).attr("x2",c24x).attr("y2",c24y2)
    .attr("stroke",C.pink).attr("stroke-width",1);
  svg.append("text").attr("x",c24x-4).attr("y",(c24y1+c24y2)/2-4)
    .attr("text-anchor","end").attr("fill",C.pink).attr("font-size","9px")
    .attr("font-family","JetBrains Mono, monospace").text("~24 OOM");
  svg.append("text").attr("x",c24x-4).attr("y",(c24y1+c24y2)/2+8)
    .attr("text-anchor","end").attr("fill",C.pink).attr("font-size","9px")
    .attr("font-family","JetBrains Mono, monospace").text("80 years");

  // Footer
  svg.append("text").attr("x",W/2).attr("y",H-6).attr("text-anchor","middle")
    .attr("fill",C.muted).attr("font-size","9px").attr("font-family","JetBrains Mono, monospace")
    .text("Big Bang took 13.8 BILLION years to expand 41 orders of magnitude. Human computation did 24 orders in 80 years — and is still accelerating.");
};
