// ============================================================
// charts.js — The Compute Explosion
// Data: Epoch AI, TOP500, ORNL, xAI, Wikipedia, Azevedo 2009,
//       NIST/NASA cosmology constants
// ============================================================

const C = {
  cyan:   "#00d4ff",
  pink:   "#ff4d9d",
  yellow: "#ffd166",
  green:  "#06d6a0",
  border: "rgba(255,255,255,0.09)",
  muted:  "#8892a4",
  dim:    "#4a5568",
  text:   "#e8eaf0",
  bg:     "#0a0c10",
};

function logLabel(v) {
  const e = Math.round(Math.log10(v));
  const m = {
    0:"1", 1:"10", 2:"100",
    3:"1K", 6:"1M", 9:"1G", 12:"1T", 15:"1P", 18:"1E",
    21:"1Z", 24:"1Y", 27:"10²⁷", 28:"10²⁸", 30:"10³⁰",
  };
  return m[e] !== undefined ? m[e] : `10^${e}`;
}

function cw(id) {
  const el = document.getElementById(id);
  return Math.max(320, el ? el.getBoundingClientRect().width || 700 : 700);
}

function mono(sel, x, y, txt, fill, size, anchor) {
  return sel.append("text")
    .attr("x", x).attr("y", y)
    .attr("fill", fill || C.muted)
    .attr("font-size", size || "9px")
    .attr("font-family", "JetBrains Mono, monospace")
    .attr("text-anchor", anchor || "start")
    .text(txt);
}


// ═══════════════════════════════════════════════════════════════
// CHART 1 — Maximum Computational Power, 1945–2026
// ═══════════════════════════════════════════════════════════════
window.buildChart1 = function(id) {
  const hpc = [
    {year:1945, log10:3.7,  name:"ENIAC"},
    {year:1952, log10:5.8,  name:"IBM 701"},
    {year:1964, log10:6.9,  name:"CDC 6600"},
    {year:1976, log10:8.0,  name:"Cray-1"},
    {year:1983, log10:9.0,  name:"Cray X-MP"},
    {year:1993, log10:11.0, name:"CM-5"},
    {year:1997, log10:12.0, name:"ASCI Red"},
    {year:2000, log10:12.3, name:"ASCI White"},
    {year:2002, log10:13.0, name:"Earth Sim"},
    {year:2008, log10:15.0, name:"IBM Roadrunner"},
    {year:2010, log10:15.4, name:"Tianhe-1A"},
    {year:2012, log10:16.3, name:"Sequoia"},
    {year:2013, log10:16.7, name:"Tianhe-2"},
    {year:2018, log10:17.3, name:"Summit"},
    {year:2020, log10:17.6, name:"Fugaku"},
    {year:2022, log10:18.08,name:"Frontier"},
  ];
  const ai = [
    {year:2012, log10:18.4, label:"AlexNet",  projected:false},
    {year:2020, log10:23.5, label:"GPT-3",    projected:false},
    {year:2023, log10:24.7, label:"GPT-4",    projected:false},
    {year:2025, log10:27.0, label:"Grok-3",   projected:false},
    {year:2026, log10:28.0, label:"~10²⁸",    projected:true },
  ];

  d3.select(`#${id}`).selectAll("*").remove();
  const W = cw(id), H = Math.round(W * 0.58);
  const m = {top:36, right:140, bottom:52, left:70};
  const iw = W - m.left - m.right, ih = H - m.top - m.bottom;

  const svg = d3.select(`#${id}`).append("svg")
    .attr("width", W).attr("height", H)
    .style("background", C.bg).style("border-radius", "8px");
  const g = svg.append("g").attr("transform", `translate(${m.left},${m.top})`);

  const x = d3.scaleLinear().domain([1945, 2027]).range([0, iw]);
  const y = d3.scaleLog().base(10).domain([1e3, 1e30]).range([ih, 0]).clamp(true);

  // Era bands
  [
    [1945, 1965, "MAINFRAME ERA",    "rgba(0,212,255,0.03)"],
    [1965, 1995, "SUPERCOMPUTER ERA","rgba(0,212,255,0.055)"],
    [1995, 2015, "HPC ERA",          "rgba(0,212,255,0.03)"],
    [2015, 2027, "AI ERA",           "rgba(255,77,157,0.055)"],
  ].forEach(([x0, x1, label, fill]) => {
    g.append("rect").attr("x", x(x0)).attr("y", 0)
      .attr("width", x(x1)-x(x0)).attr("height", ih).attr("fill", fill);
    mono(g, (x(x0)+x(x1))/2, ih+42, label, C.dim, "8px", "middle")
      .attr("letter-spacing","0.1em");
  });

  // Grid
  [1e3,1e6,1e9,1e12,1e15,1e18,1e21,1e24,1e27,1e30].forEach(v => {
    g.append("line").attr("x1",0).attr("x2",iw)
      .attr("y1",y(v)).attr("y2",y(v))
      .attr("stroke",C.border).attr("stroke-width",0.5);
  });

  // Axes
  g.append("g").attr("transform",`translate(0,${ih})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(10))
    .call(a => { a.select(".domain").remove(); a.selectAll("line").remove(); })
    .call(a => a.selectAll("text").attr("fill",C.muted).attr("font-size","10px")
      .attr("font-family","JetBrains Mono, monospace"));

  g.append("g")
    .call(d3.axisLeft(y)
      .tickValues([1e3,1e6,1e9,1e12,1e15,1e18,1e21,1e24,1e27,1e30])
      .tickFormat(logLabel))
    .call(a => { a.select(".domain").remove(); a.selectAll("line").remove(); })
    .call(a => a.selectAll("text").attr("fill",C.muted).attr("font-size","10px")
      .attr("font-family","JetBrains Mono, monospace"));

  g.append("text").attr("transform","rotate(-90)").attr("x",-ih/2).attr("y",-58)
    .attr("text-anchor","middle").attr("fill",C.muted)
    .attr("font-size","10px").attr("font-family","JetBrains Mono, monospace")
    .text("Peak FLOPS (log scale)");

  // HPC line + dots
  const hLine = d3.line().x(d=>x(d.year)).y(d=>y(Math.pow(10,d.log10))).curve(d3.curveMonotoneX);
  g.append("path").datum(hpc).attr("fill","none").attr("stroke",C.cyan).attr("stroke-width",1.5).attr("d",hLine);
  hpc.forEach(d => {
    g.append("circle").attr("cx",x(d.year)).attr("cy",y(Math.pow(10,d.log10)))
      .attr("r",3.5).attr("fill",C.cyan).attr("stroke",C.bg).attr("stroke-width",1.5);
  });

  // HPC milestone labels (4 key points only)
  [
    {year:1945, log10:3.7,  lines:["ENIAC"]},
    {year:1997, log10:12.0, lines:["ASCI Red","(1st TFLOP)"]},
    {year:2008, log10:15.0, lines:["Roadrunner","(1st PFLOP)"]},
    {year:2022, log10:18.08,lines:["Frontier","(1st EFLOP)"]},
  ].forEach(d => {
    const cx=x(d.year), cy=y(Math.pow(10,d.log10));
    d.lines.forEach((line,i) => mono(g, cx+7, cy-8+i*11, line, C.cyan, "9px"));
  });

  // AI line (solid)
  const aiSolid = ai.filter(d=>!d.projected);
  const aiLine = d3.line().x(d=>x(d.year)).y(d=>y(Math.pow(10,d.log10))).curve(d3.curveMonotoneX);
  g.append("path").datum(aiSolid).attr("fill","none").attr("stroke",C.pink).attr("stroke-width",2).attr("d",aiLine);

  // Projected dashed
  const last = aiSolid[aiSolid.length-1], proj = ai.find(d=>d.projected);
  if (proj) {
    g.append("line")
      .attr("x1",x(last.year)).attr("y1",y(Math.pow(10,last.log10)))
      .attr("x2",x(proj.year)).attr("y2",y(Math.pow(10,proj.log10)))
      .attr("stroke",C.pink).attr("stroke-width",1.5).attr("stroke-dasharray","6,4").attr("opacity",0.55);
  }

  // AI dots
  ai.forEach(d => {
    const cx=x(d.year), cy=y(Math.pow(10,d.log10));
    g.append("circle").attr("cx",cx).attr("cy",cy)
      .attr("r",d.projected?5:6)
      .attr("fill",d.projected?"none":C.pink)
      .attr("stroke",C.pink).attr("stroke-width",d.projected?1.5:0)
      .attr("stroke-dasharray",d.projected?"4,2":"none");
  });

  // AI labels — 3 key points only to avoid overlap
  [{year:2012,log10:18.4,label:"AlexNet"},
   {year:2020,log10:23.5,label:"GPT-3"},
   {year:2025,log10:27.0,label:"Grok-3"},
  ].forEach(d => {
    mono(g, x(d.year)+9, y(Math.pow(10,d.log10))+4, d.label, C.pink, "9px");
  });

  // 9 OOM gap annotation
  const ay1=y(Math.pow(10,18.08)), ay2=y(Math.pow(10,27)), ax=x(2023.5)+28;
  svg.append("defs").append("marker").attr("id","arr1")
    .attr("viewBox","0 0 10 10").attr("refX",5).attr("refY",5)
    .attr("markerWidth",5).attr("markerHeight",5).attr("orient","auto-start-reverse")
    .append("path").attr("d","M0,0 L10,5 L0,10 Z").attr("fill",C.yellow);
  g.append("line").attr("x1",ax).attr("y1",ay1).attr("x2",ax).attr("y2",ay2)
    .attr("stroke",C.yellow).attr("stroke-width",1).attr("marker-end","url(#arr1)");
  mono(g, ax+5, (ay1+ay2)/2-5, "9 OOM", C.yellow, "9px");
  mono(g, ax+5, (ay1+ay2)/2+7, "gap", C.yellow, "9px");

  // Legend
  const lg = svg.append("g").attr("transform",`translate(${m.left},10)`);
  [[C.cyan,"Supercomputers / HPC"],[C.pink,"AI Training Runs"]].forEach(([col,lbl],i) => {
    lg.append("rect").attr("x",i*190).attr("y",0).attr("width",18).attr("height",9)
      .attr("rx",2).attr("fill",col).attr("opacity",0.85);
    mono(lg, i*190+24, 8, lbl, C.muted, "10px");
  });
};


// ═══════════════════════════════════════════════════════════════
// CHART 2 — Biological Intelligence vs. Machine Computation (same log scale)
// Sources: Epoch AI (training FLOPs), Azevedo et al. 2009 (neuron counts),
//          Herculano-Houzel 2009, TOP500.org, ORNL, xAI
// ═══════════════════════════════════════════════════════════════
window.buildChart2 = function(id) {
  const bio = [
    {log10:0,    label:"Single Neuron",    show:true },
    {log10:2.5,  label:"C. elegans (302)", show:true },
    {log10:5.4,  label:"Single Ant",       show:true },
    {log10:6.0,  label:null,               show:false}, // 0.6 OOM from Ant — skip label
    {log10:9.2,  label:"Crow / Octopus",   show:true },
    {log10:10.5, label:null,               show:false}, // 0.4 OOM from Human — skip label
    {log10:10.9, label:"Human (86B)",      show:true },
    {log10:11.4, label:null,               show:false}, // 0.5 OOM from Human — skip label
    {log10:14.9, label:"All Humans Ever",  show:true },
  ];
  const silicon = [
    {log10:3.7,  color:C.green, label:"ENIAC (1946)"},
    {log10:8.0,  color:C.green, label:null},
    {log10:12.0, color:C.green, label:"ASCI Red (1997)"},
    {log10:15.0, color:C.green, label:"Roadrunner (2008)"},
    {log10:18.08,color:C.green, label:"Frontier (2022)"},
    {log10:23.5, color:C.pink,  label:null},
    {log10:24.7, color:C.pink,  label:"GPT-4 Training"},
    {log10:25.3, color:C.pink,  label:null},
    {log10:27.0, color:C.pink,  label:"Grok-3 Training"},
  ];

  d3.select(`#${id}`).selectAll("*").remove();
  const W = cw(id), H = Math.round(W * 0.78);
  const m = {top:36, right:20, bottom:14, left:16};
  const pW = (W - m.left - m.right - 44) / 2;
  const ih = H - m.top - m.bottom;
  const bH = 12;

  const svg = d3.select(`#${id}`).append("svg").attr("width",W).attr("height",H)
    .style("background",C.bg).style("border-radius","8px");

  const y = d3.scaleLog().base(10).domain([1, 1e30]).range([ih-6, 6]);

  mono(svg, m.left+pW/2, 22, "Biological Intelligence (Neuron Count)", C.cyan, "11px", "middle")
    .attr("font-weight","500");
  mono(svg, W-m.right-pW/2, 22, "Computational Power (Training FLOPs)", C.pink, "11px", "middle")
    .attr("font-weight","500");

  // ── LEFT: bio ──
  const bG = svg.append("g").attr("transform",`translate(${m.left},${m.top})`);
  const barW = pW - 150;

  // "nothing biological here" zone
  const eTop=y(1e30), eBot=y(1e15);
  bG.append("rect").attr("x",54).attr("y",eTop).attr("width",barW).attr("height",eBot-eTop)
    .attr("fill","rgba(255,255,255,0.015)").attr("rx",3);
  ["— nothing biological","  exists above here —"].forEach((t,i) => {
    mono(bG, 54+barW/2, (eTop+eBot)/2-7+i*13, t, "rgba(255,255,255,0.2)", "9px", "middle")
      .attr("font-style","italic");
  });

  bio.forEach(d => {
    const cy = y(Math.pow(10,d.log10));
    bG.append("rect").attr("x",54).attr("y",cy-bH/2).attr("width",barW).attr("height",bH)
      .attr("fill",C.cyan).attr("opacity",d.log10>=14?0.9:0.5).attr("rx",2);
    if (d.label) mono(bG, 54+barW+5, cy+4, d.label, C.muted, "9px");
  });

  [1,1e3,1e6,1e9,1e12,1e15].forEach(v => {
    const ty=y(v);
    bG.append("line").attr("x1",48).attr("x2",54).attr("y1",ty).attr("y2",ty)
      .attr("stroke",C.muted).attr("stroke-width",0.5);
    mono(bG, 46, ty+4, logLabel(v), C.muted, "9px", "end");
  });

  // ── RIGHT: silicon ──
  const sG = svg.append("g").attr("transform",`translate(${W-m.right-pW},${m.top})`);
  const sBarW = pW - 164;

  silicon.forEach(d => {
    const cy = y(Math.pow(10,d.log10));
    sG.append("rect").attr("x",0).attr("y",cy-bH/2).attr("width",sBarW).attr("height",bH)
      .attr("fill",d.color).attr("opacity",0.65).attr("rx",2);
    if (d.label) mono(sG, sBarW+5, cy+4, d.label, C.muted, "9px");
  });

  [1,1e3,1e6,1e9,1e12,1e15,1e18,1e21,1e24,1e27,1e30].forEach(v => {
    const ty=y(v);
    sG.append("line").attr("x1",-5).attr("x2",0).attr("y1",ty).attr("y2",ty)
      .attr("stroke",C.border).attr("stroke-width",0.5);
    mono(sG, -8, ty+4, logLabel(v), C.muted, "9px", "end");
  });

  // Gap annotation
  const gY1=m.top+y(1e15), gY2=m.top+y(1e27), gX=m.left+pW+22;
  svg.append("line").attr("x1",gX).attr("y1",gY1).attr("x2",gX).attr("y2",gY2)
    .attr("stroke",C.yellow).attr("stroke-width",1).attr("stroke-dasharray","3,3");
  ["~12 OOM","bio ceiling","→ Grok-3"].forEach((t,i) => {
    mono(svg, gX+4, (gY1+gY2)/2-10+i*12, t, C.yellow, "9px");
  });

  mono(svg, W/2, H-3,
    "Neurons ≠ FLOPs — scale comparison only · same log₁₀ axis · Sources: Epoch AI, Azevedo et al. 2009",
    C.dim, "9px", "middle");
};


// ═══════════════════════════════════════════════════════════════
// CHART 3 — The Big Bang vs. The Compute Explosion
// Sources: NIST/NASA cosmology constants, Epoch AI, TOP500.org
// ═══════════════════════════════════════════════════════════════
window.buildChart3 = function(id) {
  const cosmos = [
    {log10:1,  name:"Planck Length",   desc:"smallest meaningful scale"},
    {log10:10, name:"End Inflation",   desc:"universe expands 10²⁶× in an instant"},
    {log10:18, name:"First Protons",   desc:"t = 10⁻⁶ sec"},
    {log10:24, name:"Nucleosynthesis", desc:"t = 3 min — H + He form"},
    {log10:29, name:"First Atoms",     desc:"t = 380,000 yrs — universe transparent"},
    {log10:33, name:"First Stars",     desc:"t = 200M yrs"},
    {log10:37, name:"Milky Way",       desc:"t = 1B yrs"},
    {log10:38, name:"Solar System",    desc:"t = 9B yrs"},
    {log10:41, name:"Today",           desc:"13.8 billion years"},
  ];
  const compute = [
    {log10:3.7,  color:C.green, label:"ENIAC (1946)"},
    {log10:8.0,  color:C.green, label:null},
    {log10:12.0, color:C.green, label:null},
    {log10:15.0, color:C.green, label:"Roadrunner (2008)"},
    {log10:18.08,color:C.green, label:"Frontier (2022)"},
    {log10:23.5, color:C.pink,  label:null},
    {log10:24.7, color:C.pink,  label:"GPT-4 (2023)"},
    {log10:27.0, color:C.pink,  label:"Grok-3 (2025)"},
    {log10:28.0, color:C.pink,  label:null, projected:true},
  ];

  d3.select(`#${id}`).selectAll("*").remove();
  const W = cw(id), H = Math.round(W * 0.84);
  const m = {top:36, right:20, bottom:36, left:16};
  const pW = (W - m.left - m.right - 44) / 2;
  const ih = H - m.top - m.bottom;
  const bH = 13;

  const svg = d3.select(`#${id}`).append("svg").attr("width",W).attr("height",H)
    .style("background",C.bg).style("border-radius","8px");

  const y = d3.scaleLog().base(10).domain([1, 1e65]).range([ih-6, 6]);

  mono(svg, m.left+pW/2, 22, "The Big Bang (Observable Universe Scale)", C.green, "11px", "middle")
    .attr("font-weight","500");
  mono(svg, W-m.right-pW/2, 22, "Human Computation (ENIAC → 2026)", C.pink, "11px", "middle")
    .attr("font-weight","500");

  // ── LEFT: cosmos ──
  const cG = svg.append("g").attr("transform",`translate(${m.left},${m.top})`);
  const cBarW = pW - 148;

  // Inflation highlight zone
  const iTop=y(1e10), iBot=y(1e36);
  cG.append("rect").attr("x",52).attr("y",iTop).attr("width",cBarW).attr("height",iBot-iTop)
    .attr("fill","rgba(6,214,160,0.05)").attr("rx",2);

  cosmos.forEach(d => {
    const cy = y(Math.pow(10,d.log10));
    cG.append("rect").attr("x",52).attr("y",cy-bH/2).attr("width",cBarW).attr("height",bH)
      .attr("fill",C.green).attr("opacity",d.name==="Today"?0.9:0.5).attr("rx",2);
    const short = d.name.length>20 ? d.name.slice(0,19)+"…" : d.name;
    mono(cG, 52+cBarW+5, cy+4, short, d.name==="Today"?C.green:C.muted, "9px");
  });

  [1,1e5,1e10,1e15,1e20,1e25,1e30,1e35,1e40,1e45,1e50,1e55,1e60,1e65].forEach(v => {
    const ty=y(v), e=Math.round(Math.log10(v));
    cG.append("line").attr("x1",46).attr("x2",52).attr("y1",ty).attr("y2",ty)
      .attr("stroke",C.border).attr("stroke-width",0.5);
    if (e%10===0 || e===1) mono(cG, 44, ty+4, e===0?"1":`10^${e}`, C.muted, "8px", "end");
  });

  // ~41 OOM annotation
  const a41y1=m.top+y(1), a41y2=m.top+y(1e41);
  svg.append("line").attr("x1",m.left+12).attr("y1",a41y1).attr("x2",m.left+12).attr("y2",a41y2)
    .attr("stroke",C.green).attr("stroke-width",1);
  ["~41 OOM","13.8B yrs"].forEach((t,i) => {
    mono(svg, m.left+16, (a41y1+a41y2)/2-5+i*12, t, C.green, "9px");
  });

  // ── RIGHT: compute ──
  const rG = svg.append("g").attr("transform",`translate(${W-m.right-pW},${m.top})`);
  const rBarW = pW - 162;

  compute.forEach(d => {
    const cy = y(Math.pow(10,d.log10));
    rG.append("rect").attr("x",0).attr("y",cy-bH/2).attr("width",rBarW).attr("height",bH)
      .attr("fill",d.color).attr("opacity",d.projected?0.35:0.65).attr("rx",2);
    if (d.label) mono(rG, rBarW+5, cy+4, d.label, C.muted, "9px");
  });

  [1,1e5,1e10,1e15,1e20,1e25,1e30,1e35,1e40,1e45,1e50,1e55,1e60,1e65].forEach(v => {
    const ty=y(v), e=Math.round(Math.log10(v));
    rG.append("line").attr("x1",-5).attr("x2",0).attr("y1",ty).attr("y2",ty)
      .attr("stroke",C.border).attr("stroke-width",0.5);
    if (e%10===0 || e===1) mono(rG, -8, ty+4, e===0?"1":`10^${e}`, C.muted, "8px", "end");
  });

  // ~24 OOM annotation
  const a24y1=m.top+y(1), a24y2=m.top+y(1e24);
  svg.append("line").attr("x1",W-12).attr("y1",a24y1).attr("x2",W-12).attr("y2",a24y2)
    .attr("stroke",C.pink).attr("stroke-width",1);
  ["~24 OOM","80 years"].forEach((t,i) => {
    mono(svg, W-16, (a24y1+a24y2)/2-5+i*12, t, C.pink, "9px", "end");
  });

  mono(svg, W/2, H-6,
    "Big Bang: ~41 OOM in 13.8B years  ·  Computation: ~24 OOM in 80 years  ·  same log₁₀ scale",
    C.dim, "9px", "middle");
};


// ═══════════════════════════════════════════════════════════════
// CHART 4 — Atoms in the Observable Universe vs. Human Computation
// Sources: Eddington number ~10^78–10^80 (standard cosmology),
//          Epoch AI (training FLOPs), TOP500.org, ORNL, xAI
// ═══════════════════════════════════════════════════════════════
window.buildChart4 = function(id) {
  // Scale values represent "observable universe complexity" anchored to
  // ~10^78 atoms today (Eddington number). Intermediate values are
  // proportional cosmic-epoch proxies, not literal atom counts
  // (most atoms formed during nucleosynthesis at t~3 min).
  const universe = [
    {log10:1,  name:"First Atom",    desc:"380,000 yrs — hydrogen forms"},
    {log10:10, name:"First Stars",   desc:"~200M yrs — fusion ignites"},
    {log10:18, name:"First Galaxies",desc:"~400M yrs — matter clusters"},
    {log10:27, name:"Milky Way",     desc:"~1B yrs — our galaxy forms"},
    {log10:38, name:"Solar System",  desc:"~9B yrs — Earth forms"},
    {log10:50, name:"Life on Earth", desc:"~10B yrs — biology begins"},
    {log10:60, name:"Complex Life",  desc:"~13.3B yrs — Cambrian explosion"},
    {log10:70, name:"Humans",        desc:"~13.8B yrs — 300,000 years ago"},
    {log10:78, name:"Today",         desc:"13.8B yrs — ~10⁷⁸ atoms"},
  ];
  const compute = [
    {log10:3.7,  color:C.green, label:"ENIAC (1946)"},
    {log10:8.0,  color:C.green, label:null},
    {log10:12.0, color:C.green, label:null},
    {log10:15.0, color:C.green, label:"Roadrunner (2008)"},
    {log10:18.08,color:C.green, label:"Frontier (2022)"},
    {log10:23.5, color:C.pink,  label:null},
    {log10:24.7, color:C.pink,  label:"GPT-4 (2023)"},
    {log10:27.0, color:C.pink,  label:"Grok-3 (2025)"},
    {log10:28.0, color:C.pink,  label:null, projected:true},
  ];

  d3.select(`#${id}`).selectAll("*").remove();
  const W = cw(id), H = Math.round(W * 0.98);
  const m = {top:36, right:20, bottom:50, left:16};
  const pW = (W - m.left - m.right - 44) / 2;
  const ih = H - m.top - m.bottom;
  const bH = 12;

  const svg = d3.select(`#${id}`).append("svg").attr("width",W).attr("height",H)
    .style("background",C.bg).style("border-radius","8px");

  const y = d3.scaleLog().base(10).domain([1, 1e82]).range([ih-6, 6]);

  mono(svg, m.left+pW/2, 22, "Atoms in the Observable Universe", C.green, "11px", "middle")
    .attr("font-weight","500");
  mono(svg, W-m.right-pW/2, 22, "Human Computation (ENIAC → 2026)", C.pink, "11px", "middle")
    .attr("font-weight","500");

  // ── LEFT: universe ──
  const uG = svg.append("g").attr("transform",`translate(${m.left},${m.top})`);
  const uBarW = pW - 146;

  universe.forEach(d => {
    const cy = y(Math.pow(10,d.log10));
    uG.append("rect").attr("x",50).attr("y",cy-bH/2).attr("width",uBarW).attr("height",bH)
      .attr("fill",C.green).attr("opacity",d.name==="Today"?0.92:0.5).attr("rx",2);
    mono(uG, 50+uBarW+5, cy+1, d.name, d.name==="Today"?C.green:C.text, "9px");
    mono(uG, 50+uBarW+5, cy+12, d.desc, C.dim, "8px");
  });

  // "humans exist for only 8 orders" bracket
  const hTop=m.top+y(1e70), hBot=m.top+y(1e78);
  svg.append("line").attr("x1",m.left+10).attr("y1",hTop).attr("x2",m.left+10).attr("y2",hBot)
    .attr("stroke",C.yellow).attr("stroke-width",1);
  ["humans","exist","~8 OOM"].forEach((t,i) => {
    mono(svg, m.left+14, hTop+(hBot-hTop)/2-12+i*11, t, C.yellow, "8px");
  });

  // Y axis (universe)
  [1,1e10,1e20,1e30,1e40,1e50,1e60,1e70,1e78].forEach(v => {
    const ty=y(v), e=Math.round(Math.log10(v));
    uG.append("line").attr("x1",44).attr("x2",50).attr("y1",ty).attr("y2",ty)
      .attr("stroke",C.border).attr("stroke-width",0.5);
    mono(uG, 42, ty+4, e===0?"1":`10^${e}`, C.muted, "8px", "end");
  });

  // ~78 OOM annotation
  const u78y1=m.top+y(1), u78y2=m.top+y(1e78);
  svg.append("line").attr("x1",m.left+10).attr("y1",u78y1).attr("x2",m.left+10).attr("y2",u78y2)
    .attr("stroke",C.green).attr("stroke-width",1);
  ["~78 OOM","13.8B yrs"].forEach((t,i) => {
    mono(svg, m.left+14, (u78y1+u78y2)/2+25+i*12, t, C.green, "9px");
  });

  // ── RIGHT: compute ──
  const rG = svg.append("g").attr("transform",`translate(${W-m.right-pW},${m.top})`);
  const rBarW = pW - 162;

  // "computation not here yet" zone
  const nyTop=y(1e28), nyBot=y(1e78);
  rG.append("rect").attr("x",0).attr("y",nyTop).attr("width",rBarW).attr("height",nyBot-nyTop)
    .attr("fill","rgba(255,255,255,0.013)").attr("rx",2);
  ["← computation","not here yet"].forEach((t,i) => {
    mono(rG, rBarW/2, (nyTop+nyBot)/2-6+i*14, t, "rgba(255,255,255,0.18)", "9px", "middle")
      .attr("font-style","italic");
  });

  // Dashed reference line at 10^78 (total atoms)
  const atomY = y(1e78);
  rG.append("line").attr("x1",-8).attr("x2",rBarW)
    .attr("y1",atomY).attr("y2",atomY)
    .attr("stroke",C.green).attr("stroke-width",0.8).attr("stroke-dasharray","5,3").attr("opacity",0.65);
  mono(rG, rBarW+5, atomY+4, "~10⁷⁸", C.green, "8px");
  mono(rG, rBarW+5, atomY+14, "atoms", C.green, "8px");

  // Annotation at Grok-3 level
  const grokY = y(Math.pow(10,27));
  mono(rG, rBarW+5, grokY-8,  "← universe took", C.dim, "8px");
  mono(rG, rBarW+5, grokY+3,  "13.8B yrs to",    C.dim, "8px");
  mono(rG, rBarW+5, grokY+13, "reach ~10²⁸",     C.dim, "8px");

  compute.forEach(d => {
    const cy = y(Math.pow(10,d.log10));
    rG.append("rect").attr("x",0).attr("y",cy-bH/2).attr("width",rBarW).attr("height",bH)
      .attr("fill",d.color).attr("opacity",d.projected?0.35:0.65).attr("rx",2);
    if (d.label) mono(rG, rBarW+5, cy+4, d.label, C.muted, "9px");
  });

  // Y axis (compute)
  [1,1e10,1e20,1e30,1e40,1e50,1e60,1e70,1e78].forEach(v => {
    const ty=y(v), e=Math.round(Math.log10(v));
    rG.append("line").attr("x1",-5).attr("x2",0).attr("y1",ty).attr("y2",ty)
      .attr("stroke",C.border).attr("stroke-width",0.5);
    mono(rG, -8, ty+4, e===0?"1":`10^${e}`, C.muted, "8px", "end");
  });

  // ~24 OOM annotation
  const c24y1=m.top+y(1), c24y2=m.top+y(1e24);
  svg.append("line").attr("x1",W-12).attr("y1",c24y1).attr("x2",W-12).attr("y2",c24y2)
    .attr("stroke",C.pink).attr("stroke-width",1);
  ["~24 OOM","80 years"].forEach((t,i) => {
    mono(svg, W-16, (c24y1+c24y2)/2-5+i*12, t, C.pink, "9px", "end");
  });

  // Footer
  [
    "The universe needed 13.8 BILLION years to build 10⁷⁸ atoms — 78 orders of magnitude.",
    "At current doubling rates (~12 months), computation could arithmetically reach 10⁷⁸ operations in roughly 50 years.",
  ].forEach((line,i) => {
    mono(svg, W/2, H-28+i*16, line, C.muted, "9px", "middle");
  });
};
