import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@tabler/icons-webfont/dist/tabler-icons.css';
import './explorer.css';

const REPO = 'https://github.com/ahmedelmorsyy/GIS-Portfolio/tree/main/';
const $ = (sel, root = document) => root.querySelector(sel);
const fmt = (n, d = 0) => Number(n).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });

const cache = {};
function getJSON(file) {
  if (!cache[file]) {
    cache[file] = fetch(`./data/${file}`).then((r) => {
      if (!r.ok) throw new Error(`${file}: ${r.status}`);
      return r.json();
    });
  }
  return cache[file];
}

/* ------------------------------------------------------------------ theme */
const html = document.documentElement;
const themeIcon = $('#themeIcon');
function applyTheme(t) {
  html.setAttribute('data-theme', t);
  themeIcon.className = t === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
  try { localStorage.setItem('theme', t); } catch (e) { /* storage unavailable */ }
  if (currentBaseKind !== 'imagery') setBase('carto');
}

/* ------------------------------------------------------------------ map */
const map = L.map('map', { zoomControl: false, preferCanvas: true, minZoom: 4 });
L.control.zoom({ position: 'topright' }).addTo(map);
L.control.scale({ position: 'bottomleft', imperial: false }).addTo(map);
map.setView([26.8, 30.8], 6);

const ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/';
const canvasOpts = { maxZoom: 16, attribution: 'Basemap &copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors' };
const baseLayers = {
  light: L.layerGroup([L.tileLayer(`${ESRI}Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`, canvasOpts),
    L.tileLayer(`${ESRI}Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 16, pane: 'shadowPane' })]),
  dark: L.layerGroup([L.tileLayer(`${ESRI}Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`, canvasOpts),
    L.tileLayer(`${ESRI}Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 16, pane: 'shadowPane' })]),
  imagery: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { maxZoom: 18, attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics' }),
};
let currentBase = null;
let currentBaseKind = 'carto';
function setBase(kind) {
  currentBaseKind = kind;
  const layer = kind === 'imagery' ? baseLayers.imagery : baseLayers[html.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'];
  if (currentBase === layer) return;
  if (currentBase) map.removeLayer(currentBase);
  currentBase = layer.addTo(map);
  if (currentBase.bringToBack) currentBase.bringToBack();
}

const layers = L.layerGroup().addTo(map);
let teardown = null;

/* ------------------------------------------------------------------ panel helpers */
const panel = $('#panel');
function renderPanel({ title, sub, text, stats = [], controls = '', legend = '', note = '', folder }) {
  panel.innerHTML = `
    <h1>${title}</h1>
    <div class="sub">${sub}</div>
    <p>${text}</p>
    ${stats.length ? `<div class="ex-stats">${stats.map(([v, l]) => `<div class="ex-stat"><b>${v}</b><span>${l}</span></div>`).join('')}</div>` : ''}
    ${controls ? `<h2>Explore</h2><div class="ex-control">${controls}</div>` : ''}
    ${legend ? `<h2>Legend</h2><div class="ex-legend" id="legend">${legend}</div>` : ''}
    ${note ? `<div class="ex-note">${note}</div>` : ''}
    <div class="ex-links">
      <a href="${REPO}${folder}" target="_blank" rel="noopener"><i class="ti ti-brand-github"></i> Code, data &amp; case study</a>
      <a href="./index.html#projects"><i class="ti ti-layout-grid"></i> All projects</a>
    </div>`;
  panel.scrollTop = 0;
}
const sw = (color, cls = '') => `<span class="ex-sw ${cls}" style="background:${color}"></span>`;
const legendRows = (items, cls = '') => items.map(([c, l]) => `<div>${sw(c, cls)}${l}</div>`).join('');
const popupTable = (title, rows) =>
  `<b class="t">${title}</b><table>${rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>`;

function ramp(stops, value, min, max) {
  const t = Math.max(0, Math.min(1, (value - min) / (max - min || 1)));
  const i = Math.min(stops.length - 2, Math.floor(t * (stops.length - 1)));
  const f = t * (stops.length - 1) - i;
  const a = stops[i].match(/\w\w/g).map((h) => parseInt(h, 16));
  const b = stops[i + 1].match(/\w\w/g).map((h) => parseInt(h, 16));
  return `rgb(${a.map((x, k) => Math.round(x + (b[k] - x) * f)).join(',')})`;
}
const REDS = ['#fee5d9', '#fcae91', '#fb6a4a', '#de2d26', '#a50f15'];
const RDYLGN = ['#d73027', '#fc8d59', '#fee08b', '#91cf60', '#1a9850'];
const ORANGES = ['#fff5eb', '#fdd0a2', '#fd8d3c', '#e6550d', '#8c2d04'];

/* ================================================================== SOLAR */
const SOLAR_CLASSES = [['#e8452c', 'Unsuitable / excluded'], ['#f5a623', 'Low'], ['#f2e94e', 'Moderate'],
  ['#8cc63f', 'High'], ['#1a7f37', 'Very high']];
async function showSolar() {
  setBase('carto');
  renderPanel({
    title: 'Solar farm site suitability, Egypt',
    sub: 'Random Forest · 8 criteria + exclusions · 5 km grid',
    text: 'National suitability for utility-scale solar, combining irradiance, temperature, wind, terrain, population and distance to roads and the high-voltage grid, with protected areas, farmland, cities and water excluded. Click a site for its size and grid access.',
    stats: [['93.5%', 'hold-out accuracy'], ['0.87', 'Kappa'], ['92.3%', 'spatial block CV']],
    controls: `<label><input type="checkbox" id="solGrid" checked> High-voltage grid</label>
               <label><input type="checkbox" id="solSites" checked> Shortlisted sites (10)</label>
               <label>Suitability opacity</label><input type="range" id="solOp" min="0" max="100" value="80">`,
    legend: legendRows(SOLAR_CLASSES) + `<div>${sw('#d7263d', 'line')}High-voltage grid</div><div>${sw('#111', 'dot')}Shortlisted site</div>`,
    note: 'Labels come from an expert multi-criteria score; the Random Forest generalises it nationwide. Spatial block cross-validation holds out whole 1° regions, a stricter test than a random split.',
    folder: '01_Solar_Site_Suitability_Egypt',
  });
  const [meta, egypt, grid, sites] = await Promise.all([getJSON('meta.json'), getJSON('egypt_boundary.geojson'),
    getJSON('solar_grid.geojson'), getJSON('solar_sites.geojson')]);
  const img = L.imageOverlay('./data/solar_suitability.png', meta.solar_bounds, { opacity: 0.8, className: 'pixelated' }).addTo(layers);
  L.geoJSON(egypt, { style: { color: '#2c2620', weight: 1.4, fill: false }, interactive: false }).addTo(layers);
  const gridLayer = L.geoJSON(grid, { style: { color: '#d7263d', weight: 2, opacity: 0.9 }, interactive: false }).addTo(layers);
  const siteLayer = L.geoJSON(sites, {
    pointToLayer: (f, ll) => L.circleMarker(ll, { radius: 7, color: '#fff', weight: 2, fillColor: '#111', fillOpacity: 1 }),
    onEachFeature: (f, l) => l.bindPopup(popupTable(`Candidate site ${f.properties.rank}`, [
      ['Contiguous very-high area', `${fmt(f.properties.area_km2, 1)} km²`],
      ['Distance to grid', `${fmt(f.properties.grid_km, 1)} km`],
      ['Distance to primary road', `${fmt(f.properties.road_km, 1)} km`]])),
  }).addTo(layers);
  map.fitBounds(L.geoJSON(egypt).getBounds(), { padding: [10, 10] });
  $('#solGrid').onchange = (e) => (e.target.checked ? gridLayer.addTo(layers) : layers.removeLayer(gridLayer));
  $('#solSites').onchange = (e) => (e.target.checked ? siteLayer.addTo(layers) : layers.removeLayer(siteLayer));
  $('#solOp').oninput = (e) => img.setOpacity(e.target.value / 100);
}

/* ================================================================== FARAFRA */
async function showFarafra() {
  setBase('imagery');
  const YEARS = [1990, 2000, 2010, 2015, 2020, 2024];
  renderPanel({
    title: 'Farafra Depression: 34 years of farmland',
    sub: 'Landsat 5/7/8/9 · Random Forest · change detection',
    text: 'Groundwater-fed center pivots have turned open desert into farmland. Drag the slider or press play to watch cultivated land grow from 1990 to 2024.',
    stats: [['+4,056%', 'cultivated land since 1990'], ['537.8', 'km² in 2024'], ['91%', 'map accuracy (κ 0.82)']],
    controls: `<div class="ex-row" style="justify-content:space-between"><div class="ex-year" id="farYear">2024</div>
                 <div style="text-align:right"><b id="farArea" style="font-size:20px">–</b> km²<br><span id="farGrowth" style="font-size:12px;color:var(--ink-mute)"></span></div></div>
               <input type="range" id="farSlider" min="0" max="5" step="1" value="5" aria-label="Year">
               <div class="ex-ticks">${YEARS.map((y) => `<span>${y}</span>`).join('')}</div>
               <div class="ex-row"><button class="ex-btn" id="farPlay"><i class="ti ti-player-play"></i> Play</button>
               <label><input type="checkbox" id="farBase" checked> Show 1990 farmland</label></div>`,
    legend: legendRows([['#22c55e', 'Cultivated land, selected year'], ['#facc15', 'Cultivated land, 1990']]) +
      `<div>${sw('transparent;border:2px dashed #fff', '')}Farafra Depression boundary</div>`,
    note: 'Accuracy from 200 stratified random points interpreted blind on high-resolution imagery (91.0% overall, Kappa 0.82).',
    folder: '02_Farafra_Agricultural_Change_1990_2024',
  });
  $('#farArea').textContent = '…';
  const data = await getJSON('farafra.json');
  const renderer = L.canvas({ padding: 0.5 });
  L.geoJSON(data.boundary, { style: { color: '#ffffff', weight: 2, dashArray: '6 4', fill: false }, interactive: false }).addTo(layers);
  const byYear = {};
  YEARS.forEach((y) => {
    byYear[y] = L.geoJSON(data.farmland[y], { renderer, interactive: false,
      style: { color: y === 1990 ? '#facc15' : '#22c55e', weight: 0.6, fillOpacity: 0.75 } });
  });
  map.fitBounds(byYear[2024].getBounds().pad(0.2));
  let current = null;
  const show = (i) => {
    const y = YEARS[i];
    if (current && current !== 1990) layers.removeLayer(byYear[current]);
    if (y !== 1990) byYear[y].addTo(layers);
    const base = $('#farBase').checked || y === 1990;
    if (base) { byYear[1990].addTo(layers); byYear[1990].bringToFront(); } else layers.removeLayer(byYear[1990]);
    current = y;
    $('#farYear').textContent = y;
    $('#farArea').textContent = fmt(data.areas[y], 1);
    $('#farGrowth').textContent = y === 1990 ? 'baseline' : `+${fmt((data.areas[y] / data.areas[1990] - 1) * 100)}% vs 1990`;
  };
  $('#farSlider').oninput = (e) => show(+e.target.value);
  $('#farBase').onchange = () => show(+$('#farSlider').value);
  let timer = null;
  const stop = () => { clearInterval(timer); timer = null; $('#farPlay').innerHTML = '<i class="ti ti-player-play"></i> Play'; };
  $('#farPlay').onclick = () => {
    if (timer) return stop();
    let i = 0; $('#farSlider').value = 0; show(0);
    $('#farPlay').innerHTML = '<i class="ti ti-player-pause"></i> Pause';
    timer = setInterval(() => { i += 1; if (i >= YEARS.length) return stop(); $('#farSlider').value = i; show(i); }, 1300);
  };
  show(5);
  return () => stop();
}

/* ================================================================== QATTARA */
const QMODELS = {
  m4: { name: 'M4 Development suitability', classes: [['#1b5e20', 'Highly suitable'], ['#66bb6a', 'Moderately suitable'],
    ['#ffc107', 'Low suitability'], ['#e65100', 'Unsuitable (incl. sabkha)'], ['#b71c1c', 'Hazardous']] },
  m1: { name: 'M1 Geomorphology', classes: [['#d9d9d9', 'Sabkha (salt flat)'], ['#fdd49e', 'Sand dunes'], ['#8c6d31', 'Rocky plateau'],
    ['#c7e9c0', 'Sedimentary plains'], ['#7f2704', 'Escarpments / slopes'], ['#4292c6', 'Drainage / wadis']] },
  m2: { name: 'M2 Environmental change', classes: [['#1a9850', 'Stable'], ['#fee08b', 'Moderate change'], ['#f46d43', 'High change'], ['#a50026', 'Severe change']] },
  m3: { name: 'M3 Hazard & water flow', classes: [['#08519c', 'Water accumulation'], ['#6baed6', 'Stable flow paths'], ['#fd8d3c', 'Erosion risk'],
    ['#a1d99b', 'Stable ground'], ['#cb181d', 'Salt flat (sabkha)']] },
};
async function showQattara() {
  setBase('carto');
  renderPanel({
    title: 'Qattara Depression development assessment',
    sub: 'Four weakly supervised Random Forest models · GEE',
    text: 'About 20,000 km² below sea level (lowest point −133 m). Expert rules create pseudo-labels, and a Random Forest generalises them using terrain, hydrology, climate and spectral data. Switch between the four models.',
    stats: [['90.7%', 'geomorphology OA (κ 0.883)'], ['30%', 'highly suitable'], ['8%', 'hazardous']],
    controls: `<div class="ex-seg" id="qSeg">${Object.entries(QMODELS).map(([k, m]) =>
      `<button data-m="${k}" aria-pressed="${k === 'm4'}">${m.name.split(' ')[0]}</button>`).join('')}</div>
      <div id="qName" style="font-weight:600;font-size:14px"></div>
      <label>Opacity</label><input type="range" id="qOp" min="0" max="100" value="85">`,
    legend: '<div class="ex-msg">Loading…</div>',
    note: 'Pseudo-label hold-out scores (M1 99.7%, M3 99.2%, M4 88.9%) measure how consistently the model reproduces its rules, not field accuracy. The ~30% highly suitable share follows from the labelling thresholds; the model shows <em>where</em> it is.',
    folder: '03_Qattara_Depression_Development',
  });
  let meta, boundary;
  try {
    [meta, boundary] = await Promise.all([getJSON('meta.json'), getJSON('qattara_boundary.geojson')]);
  } catch (e) {
    $('#legend').innerHTML = '<div class="ex-msg">Model layers are being prepared.</div>';
    map.setView([29.6, 27.4], 7);
    return undefined;
  }
  const b = meta.qattara_bounds;
  const imgs = {};
  Object.keys(QMODELS).forEach((k) => { imgs[k] = L.imageOverlay(`./data/qattara_${k}.png`, b, { opacity: 0.85 }); });
  L.geoJSON(boundary, { style: { color: '#2c2620', weight: 1.5, fill: false }, interactive: false }).addTo(layers);
  map.fitBounds(L.geoJSON(boundary).getBounds(), { padding: [10, 10] });
  let active = null;
  const pick = (k) => {
    if (active) layers.removeLayer(imgs[active]);
    imgs[k].setOpacity($('#qOp').value / 100).addTo(layers);
    active = k;
    $('#qName').textContent = QMODELS[k].name;
    $('#legend').innerHTML = legendRows(QMODELS[k].classes);
    panel.querySelectorAll('#qSeg button').forEach((btn) => btn.setAttribute('aria-pressed', btn.dataset.m === k));
  };
  panel.querySelectorAll('#qSeg button').forEach((btn) => { btn.onclick = () => pick(btn.dataset.m); });
  $('#qOp').oninput = (e) => imgs[active].setOpacity(e.target.value / 100);
  pick('m4');
  return undefined;
}

/* ================================================================== PORT SAID */
const GI = { 3: ['#b2182b', 'Hot spot 99%'], 2: ['#ef8a62', 'Hot spot 95%'], 1: ['#fddbc7', 'Hot spot 90%'], 0: ['#e5e7eb', 'Not significant'],
  '-1': ['#d1e5f0', 'Cold spot 90%'], '-2': ['#67a9cf', 'Cold spot 95%'], '-3': ['#2166ac', 'Cold spot 99%'] };
const PS_METRICS = {
  priority_index: { label: 'Priority index', stops: REDS, min: 0.25, max: 0.8, fmt: (v) => fmt(v, 2), lo: 'lower', hi: 'higher priority' },
  seats_per_1000_pop: { label: 'Seats per 1,000 residents', stops: RDYLGN, min: 0, max: 100, fmt: (v) => fmt(v, 1), lo: '0', hi: '100+' },
  uncovered_pop: { label: 'Residents beyond a 1.5 km walk', stops: ORANGES, min: 0, max: 40000, fmt: (v) => fmt(v), lo: '0', hi: '40,000' },
};
async function showPortSaid() {
  setBase('carto');
  renderPanel({
    title: 'Port Said: where should school capacity go?',
    sub: 'Python · GeoPandas · PySAL · Gi*, Moran’s I, GWR',
    text: '42 secondary schools and 749,371 residents in 11 census districts. Colour the districts by a measure, and click schools for enrolment, crowding and their hot-spot result.',
    stats: [['42', 'schools'], ['749K', 'residents'], ['11', 'districts']],
    controls: `<select id="psMetric">${Object.entries(PS_METRICS).map(([k, m]) => `<option value="${k}">${m.label}</option>`).join('')}</select>
               <label><input type="checkbox" id="psSchools" checked> Schools coloured by crowding hot spots (Gi*)</label>`,
    legend: '',
    note: 'Priority = 40% low seats per resident + 35% residents beyond a 1.5 km walk + 25% illiteracy. Top priorities: Port Fuad, Al-Ganoub 2, Al-Ganoub.',
    folder: '04_PortSaid_Schools_Spatial_Statistics',
  });
  const [districts, schools] = await Promise.all([getJSON('portsaid_districts.geojson'), getJSON('portsaid_schools.geojson')]);
  let metric = 'priority_index';
  const distLayer = L.geoJSON(districts, {
    style: (f) => ({ color: '#fff', weight: 1.2, fillOpacity: 0.78, fillColor: fillFor(f) }),
    onEachFeature: (f, l) => l.on('click', () => l.bindPopup(popupTable(f.properties.district, [
      ['Priority rank', `#${f.properties.priority_rank} of 11`], ['Population', fmt(f.properties.population)],
      ['Secondary schools', fmt(f.properties.schools)], ['Seats per 1,000 residents', fmt(f.properties.seats_per_1000_pop, 1)],
      ['Beyond 1.5 km walk', fmt(f.properties.uncovered_pop)], ['Priority index', fmt(f.properties.priority_index, 2)]])).openPopup()),
  }).addTo(layers);
  function fillFor(f) {
    const m = PS_METRICS[metric]; const v = f.properties[metric];
    return v === null || v === undefined ? '#d1d5db' : ramp(m.stops, v, m.min, m.max);
  }
  const schoolLayer = L.geoJSON(schools, {
    pointToLayer: (f, ll) => L.circleMarker(ll, { radius: 6.5, color: '#2c2620', weight: 1, fillOpacity: 1,
      fillColor: (GI[f.properties.gi_bin] || GI[0])[0] }),
    onEachFeature: (f, l) => l.bindPopup(popupTable(f.properties.School_Name, [
      ['District', f.properties.district], ['Type', `${f.properties.School_Type} · ${f.properties.Gender_Type}`],
      ['Students', fmt(f.properties.Number_of_Students)], ['Capacity', fmt(f.properties.capacity)],
      ['Students per class', fmt(f.properties.Students_per_class)], ['Gi* result', (GI[f.properties.gi_bin] || GI[0])[1]]])),
  }).addTo(layers);
  // open on the city, where most schools cluster (a few outlying schools stay reachable by zooming out)
  const pts = schools.features.map((f) => f.geometry.coordinates);
  const med = (a) => a.slice().sort((x, y) => x - y)[Math.floor(a.length / 2)];
  const [mx, my] = [med(pts.map((p) => p[0])), med(pts.map((p) => p[1]))];
  const core = pts.filter(([x, y]) => Math.abs(x - mx) < 0.06 && Math.abs(y - my) < 0.06).map(([x, y]) => [y, x]);
  map.fitBounds(L.latLngBounds(core).pad(0.25));
  const drawLegend = () => {
    const m = PS_METRICS[metric];
    $('#legend').innerHTML = `<div style="display:block"><div style="font-weight:600;margin-bottom:4px">${m.label}</div>
      <div class="ex-ramp" style="background:linear-gradient(90deg,${m.stops.join(',')})"></div>
      <div class="ex-ramp-lbl"><span>${m.lo}</span><span>${m.hi}</span></div></div>` +
      ($('#psSchools').checked ? `<div style="font-weight:600;margin-top:8px">Schools · Gi* on students per class</div>` +
        legendRows([3, 2, 1, 0, -1, -2, -3].map((k) => GI[k]), 'dot') : '');
  };
  panel.querySelector('.ex-control').insertAdjacentHTML('afterend', '<h2>Legend</h2><div class="ex-legend" id="legend"></div>');
  $('#psMetric').onchange = (e) => { metric = e.target.value; distLayer.setStyle((f) => ({ fillColor: fillFor(f) })); drawLegend(); };
  $('#psSchools').onchange = (e) => { (e.target.checked ? schoolLayer.addTo(layers) : layers.removeLayer(schoolLayer)); drawLegend(); };
  drawLegend();
}

/* ================================================================== BELQAS */
const DISEASES = ['Parasitic infections', 'Bilharzia (schistosomiasis)', 'Hepatitis A', 'Pneumonia', 'Renal failure', 'Anemia',
  'Intestinal diseases', 'Hypertension & diabetes', 'Hepatitis C', 'Heart disease', 'Skin diseases', 'Respiratory allergy'];
async function showBelqas() {
  setBase('carto');
  renderPanel({
    title: 'Belqas: endemic disease mapping',
    sub: 'Health GIS · Gi* hot spots · my part of a team SDSS',
    text: 'Presence of 12 endemic diseases across 31 local units of Belqas Center (Dakahlia). Show the overall disease burden or pick one disease; hot spots are outlined.',
    stats: [['12', 'diseases mapped'], ['31', 'local units'], ['φ 0.92', 'bilharzia + parasites']],
    controls: `<select id="bqSel"><option value="burden">Disease burden (number of diseases)</option>
               ${DISEASES.map((d) => `<option value="${d}">${d}</option>`).join('')}</select>
               <label><input type="checkbox" id="bqHot" checked> Outline Gi* hot / cold spots (90%)</label>`,
    legend: '',
    note: 'Global Moran’s I = 0.04 (p = 0.29): burden is not clustered overall; local hot spots only in Damlash and El-Maasara. Team result built on this: 3 priority hospital-expansion sites.',
    folder: '05_Belqas_Healthcare_Disease_SDSS',
  });
  const villages = await getJSON('belqas_villages.geojson');
  let field = 'burden';
  const fillFor = (p) => (field === 'burden' ? ramp(REDS, p.burden, 3, 7) : (p[field] ? '#b91c1c' : '#e5e7eb'));
  const styleFor = (f) => {
    const hot = $('#bqHot').checked && f.properties.gi_bin !== 0;
    return { fillColor: fillFor(f.properties), fillOpacity: 0.8, color: hot ? (f.properties.gi_bin > 0 ? '#111' : '#2166ac') : '#fff',
      weight: hot ? 3 : 1 };
  };
  const layer = L.geoJSON(villages, {
    style: styleFor,
    onEachFeature: (f, l) => l.on('click', () => {
      const p = f.properties;
      const present = DISEASES.filter((d) => p[d]).join(', ') || 'none';
      l.bindPopup(`${popupTable(p.village, [['Diseases reported', `${p.burden} of 12`], ['Gi* z-score', fmt(p.gi_z, 2)]])}
        <div style="margin-top:6px;max-width:240px;color:var(--ink-soft)">${present}</div>`).openPopup();
    }),
  }).addTo(layers);
  map.fitBounds(layer.getBounds().pad(0.08));
  const drawLegend = () => {
    $('#legend').innerHTML = (field === 'burden'
      ? `<div style="display:block"><div class="ex-ramp" style="background:linear-gradient(90deg,${REDS.join(',')})"></div>
         <div class="ex-ramp-lbl"><span>3 diseases</span><span>7 diseases</span></div></div>`
      : legendRows([['#b91c1c', 'Reported'], ['#e5e7eb', 'Not reported']])) +
      ($('#bqHot').checked ? legendRows([['transparent;border:3px solid #111', 'Hot spot (Gi*, 90%)'], ['transparent;border:3px solid #2166ac', 'Cold spot (Gi*, 90%)']]) : '');
  };
  panel.querySelector('.ex-control').insertAdjacentHTML('afterend', '<h2>Legend</h2><div class="ex-legend" id="legend"></div>');
  $('#bqSel').onchange = (e) => { field = e.target.value; layer.setStyle(styleFor); drawLegend(); };
  $('#bqHot').onchange = () => { layer.setStyle(styleFor); drawLegend(); };
  drawLegend();
}

/* ------------------------------------------------------------------ router */
const TABS = { solar: showSolar, farafra: showFarafra, qattara: showQattara, portsaid: showPortSaid, belqas: showBelqas };
async function open(tab) {
  if (!TABS[tab]) tab = 'solar';
  if (teardown) { teardown(); teardown = null; }
  layers.clearLayers();
  map.closePopup();
  document.querySelectorAll('#tabs button').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === tab));
  try {
    teardown = (await TABS[tab]()) || null;
  } catch (err) {
    panel.insertAdjacentHTML('beforeend', `<div class="ex-note">Could not load this map (${err.message}).</div>`);
  }
}
document.querySelectorAll('#tabs button').forEach((b) => {
  b.onclick = () => { if (location.hash !== `#${b.dataset.tab}`) location.hash = b.dataset.tab; else open(b.dataset.tab); };
});
window.addEventListener('hashchange', () => open(location.hash.slice(1)));
$('#themeBtn').onclick = () => applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
applyTheme(html.getAttribute('data-theme') || 'light');
open(location.hash.slice(1));
