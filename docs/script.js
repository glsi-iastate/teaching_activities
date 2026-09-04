function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function fix(n) {
  return Number.isFinite(n) ? Number(n.toFixed(2)) : 0;
}

const clayEl = document.getElementById("clay");
const sandEl = document.getElementById("sand");
const siltEl = document.getElementById("silt");
const omEl = document.getElementById("om");
const statusEl = document.getElementById("status");
const chartEl = document.getElementById("chart");
const bulkDenEl = document.getElementById("bd");
const textclassEL = document.getElementById("texClass");
const fieldCapEl = document.getElementById("fieldcap");
const porosityEl = document.getElementById("porosity");
const porosityValueEl = document.getElementById("porosityValue");

const polygons = [
  { class: "Sand", a: [0, 10, 0, 0], b: [100, 90, 85, 100], c: [0, 0, 15, 0], color: "rgba(255,223,128,0.4)" },
  { class: "Loamy Sand", a: [0, 10, 15, 0], b: [85, 90, 85, 70], c: [15, 0, 0, 30], color: "rgba(255,239,170,0.4)" },
  { class: "Sandy Loam", a: [0, 15, 20, 20, 7.5, 7.5, 0], b: [70, 85, 80, 52.5, 52.5, 42.5, 50], c: [30, 0, 0, 27.5, 42.5, 50, 50], color: "rgba(255,255,170,0.4)" },
  { class: "Loam", a: [7.5, 20, 27.5, 27.5, 7.5], b: [52.5, 52.5, 45, 22.5, 42.5], c: [42.5, 27.5, 27.5, 50, 50], color: "rgba(200,255,200,0.4)" },
  { class: "Silt Loam", a: [0, 27.5, 27.5, 12.5, 12.5, 0], b: [50, 22.5, 0, 0, 7.5, 20], c: [50, 50, 72.5, 87.5, 80, 80], color: "rgba(170,220,255,0.4)" },
  { class: "Silt", a: [0, 12.5, 12.5, 0], b: [20, 7.5, 0, 0], c: [80, 80, 87.5, 100], color: "rgba(140,200,255,0.4)" },
  { class: "Sandy Clay Loam", a: [20, 35, 35, 27.5, 20], b: [80, 65, 45, 45, 52.5], c: [0, 0, 20, 27.5, 27.5], color: "rgba(255,200,150,0.4)" },
  { class: "Clay Loam", a: [27.5, 40, 40, 27.5], b: [45, 45, 20, 20], c: [27.5, 15, 40, 52.5], color: "rgba(230,180,150,0.4)" },
  { class: "Silty Clay Loam", a: [27.5, 40, 40, 27.5], b: [20, 20, 0, 0], c: [52.5, 40, 60, 72.5], color: "rgba(200,180,220,0.4)" },
  { class: "Sandy Clay", a: [35, 55, 35], b: [65, 45, 45], c: [0, 0, 20], color: "rgba(255,150,150,0.4)" },
  { class: "Silty Clay", a: [40, 60, 40], b: [20, 0, 0], c: [40, 40, 60], color: "rgba(200,150,200,0.4)" },
  { class: "Clay", a: [40, 55, 100, 60, 40], b: [45, 45, 0, 0, 20], c: [15, 0, 0, 40, 40], color: "rgba(200,100,100,0.4)" }
];

const polygonTraces = polygons.map((poly) => ({
  type: "scatterternary",
  mode: "lines",
  a: [...poly.a, poly.a[0]],
  b: [...poly.b, poly.b[0]],
  c: [...poly.c, poly.c[0]],
  fill: "toself",
  fillcolor: poly.color,
  line: { color: "black", width: 1 },
  hoverinfo: "skip",
  showlegend: false
}));

const pointTrace = {
  type: "scatterternary",
  mode: "markers+text",
  a: [20],
  b: [50],
  c: [30],
  marker: { size: 16, color: "red", line: { color: "black", width: 1 } },
  text: ["Loam"],
  textposition: "top center",
  hovertemplate:
    "Clay: %{a:.1f}%<br>" +
    "Sand: %{b:.1f}%<br>" +
    "Silt: %{c:.1f}%<br>" +
    "Texture Class: %{text}<extra></extra>"
};

const layout = {
  paper_bgcolor: "#fff",
  plot_bgcolor: "#fff",
  dragmode: false,
  ternary: {
    sum: 100,
    aaxis: { title: { text: "Clay" }, min: 0, ticksuffix: "%" },
    baxis: { title: { text: "Sand" }, min: 0, ticksuffix: "%" },
    caxis: { title: { text: "Silt" }, min: 0, ticksuffix: "%" }
  },
  margin: { l: 55, r: 55, t: 55, b: 55 },
  showlegend: false
};

const plotConfig = {
  scrollZoom: false,
  doubleClick: false,
  displayModeBar: false,
  responsive: true
};

function classify(clay, sand, silt) {
  if (clay >= 40 && silt >= 40) return "Silty Clay";
  if (clay >= 35 && sand >= 45) return "Sandy Clay";
  if (clay >= 40) return "Clay";
  if (clay >= 27.5 && clay < 40 && sand >= 20 && sand < 45 && silt >= 15 && silt < 53) return "Clay Loam";
  if (clay >= 27.5 && clay < 40 && silt >= 40 && silt < 72.5 && sand < 20) return "Silty Clay Loam";
  if (clay >= 20 && clay < 35 && sand >= 45 && sand < 65 && silt < 27.5) return "Sandy Clay Loam";
  if (clay >= 7.5 && clay < 27.5 && silt >= 28 && silt < 50 && sand >= 22.5 && sand < 52.5) return "Loam";
  if (silt >= 80 && clay < 12) return "Silt";
  if (silt >= 50 && clay < 27) return "Silt Loam";
  if (sand >= 43 && sand < 85 && clay >= 7 && clay < 20 && silt >= 0 && silt < 50) return "Sandy Loam";
  if (sand >= 90 && clay < 10) return "Sand";
  if (sand >= 85 && clay < 10) return "Loamy Sand";
  return "Unclassified";
}

function update() {
  let clay = parseFloat(clayEl.value);
  let sand = parseFloat(sandEl.value);
  let organicMatter = parseFloat(omEl.value);
  const porosity = parseFloat(porosityEl.value);

  if (!Number.isFinite(clay)) clay = 0;
  if (!Number.isFinite(sand)) sand = 0;
  if (!Number.isFinite(organicMatter)) organicMatter = 0;

  clay = clamp(clay, 0, 100);
  sand = clamp(sand, 0, 100);
  organicMatter = clamp(organicMatter, 0, 100);

  const silt = 100 - clay - sand;

  clayEl.value = fix(clay);
  sandEl.value = fix(sand);
  siltEl.value = fix(silt);
  omEl.value = fix(organicMatter);
  porosityValueEl.textContent = fix(porosity);

  if (silt < 0) {
    fieldCapEl.value = "—";
    bulkDenEl.value = "—";
    textclassEL.value = "—";
    statusEl.textContent = "Invalid input: Clay + Sand cannot exceed 100%.";
    statusEl.className = "help bad";
    return;
  }

  const organicMatterFraction = organicMatter / 100;
  const mineralFraction = 1 - organicMatterFraction;
  const bClay = (clay / 100) * mineralFraction;
  const bSand = (sand / 100) * mineralFraction;
  const bSilt = (silt / 100) * mineralFraction;

  const particleDensity =
    bClay * 2.4 +
    (bSilt + bSand) * 2.65 +
    organicMatterFraction * 1.4;

  const bulkDensity = particleDensity * (1 - porosity / 100);

  const fieldCapacity =
    (sand / 100) * 1.65 +
    (silt / 100) * 1.5 +
    (clay / 100) * 1.35;

  bulkDenEl.value = fix(bulkDensity);
  textclassEL.value = fix(textureClass);
  fieldCapEl.value = fix(fieldCapacity);

  const textureClass = classify(clay, sand, silt);
  statusEl.textContent = `OK ✔ Total = ${fix(clay + sand + silt)}%`;
  statusEl.className = "help good";

  Plotly.restyle(
    chartEl,
    {
      a: [[clay]],
      b: [[sand]],
      c: [[silt]],
      text: [[textureClass]]
    },
    [polygonTraces.length]
  );
}

clayEl.addEventListener("input", update);
sandEl.addEventListener("input", update);
omEl.addEventListener("input", update);
porosityEl.addEventListener("input", update);

document.getElementById("snap").addEventListener("click", () => {
  const clay = parseFloat(clayEl.value);
  const sand = parseFloat(sandEl.value);
  clayEl.value = Math.round(Number.isFinite(clay) ? clay : 0);
  sandEl.value = Math.round(Number.isFinite(sand) ? sand : 0);
  update();
});

document.getElementById("reset").addEventListener("click", () => {
  clayEl.value = 20;
  sandEl.value = 50;
  omEl.value = 0;
  porosityEl.value = 50;
  update();
});

Plotly.newPlot(chartEl, [...polygonTraces, pointTrace], layout, plotConfig).then(update);

window.addEventListener("resize", () => {
  Plotly.Plots.resize(chartEl);
});
