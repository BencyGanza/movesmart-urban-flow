/* MoveSmart journey planner engine, ported from the NEXORA prototype.
   Mounts into one container element and returns a cleanup function.
   All traffic, weather and hazard data is sample data on a schematic map of Kigali. */

const MARKUP = `
<div class="nx-head">
  <div class="nx-title"><b>Journey planner</b><span>See the journey before you take it</span></div>
  <form class="trip" id="nx-trip">
    <label>From<select id="nx-o"></select></label>
    <button type="button" class="btn g swap" id="nx-swap" aria-label="Swap start and destination">⇅</button>
    <label>To<select id="nx-d"></select></label>
    <label class="t">Leave at<input type="time" id="nx-dep"></label>
    <button type="button" class="btn g" id="nx-now">Now</button>
    <button class="btn" type="submit">Plan journey</button>
  </form>
  <div class="proto">Traffic, weather and hazard data here is sample data on a schematic map with approximate positions. The tags show which kind of source each item would come from.</div>
</div>
<div class="app">
  <div class="mapw" id="nx-mapw">
    <svg class="map" id="nx-map" role="img" aria-label="Schematic journey map of Kigali"></svg>
    <div class="v3" id="nx-v3"><div class="v3map" id="nx-v3map"></div>
      <div class="v3msg" id="nx-v3msg"></div>
      <div class="v3ctl">
        <button data-v="fo" aria-label="Fly to start">A</button><button data-v="ov" aria-label="Show the whole route">Route</button><button data-v="fd" aria-label="Fly to destination">B</button>
      </div>
    </div>
    <div class="mtool">
      <div class="seg"><button id="nx-m2" aria-pressed="true">2D map</button><button id="nx-m3" aria-pressed="false">3D map</button></div>
      <button class="chip" data-l="traffic" aria-pressed="true">Traffic</button>
      <button class="chip" data-l="weather" aria-pressed="true">Weather</button>
      <button class="chip" data-l="hazards" aria-pressed="true">Hazards</button>
      <button class="chip" data-l="services" aria-pressed="true">Services</button>
      <button class="chip" data-l="community" aria-pressed="true">Reports</button>
      <button class="chip pvb" id="nx-pvb">▶ Preview journey</button>
    </div>
    <div class="banner" id="nx-banner">Hypothetical scenario: not a forecast</div>
    <div class="info" id="nx-info" role="dialog" aria-live="polite"></div>
    <div class="pickmsg" id="nx-pickmsg"></div>
    <div class="play" id="nx-play"><button id="nx-pp" aria-label="Play or pause">▶</button><input type="range" id="nx-ps" min="0" max="1000" value="0" aria-label="Journey progress"><button class="px" id="nx-px" aria-label="Close preview">×</button><div class="pr" id="nx-pr" aria-live="polite"></div></div>
    <div class="legend" id="nx-legend">
      <div class="row"><span><i style="background:var(--fast)"></i>Fastest</span><span><i style="background:var(--safe)"></i>Safest est.</span><span><i style="background:var(--bal)"></i>Balanced</span></div>
      <div class="row" style="margin-top:4px"><span><i style="background:var(--free)"></i>Free</span><span><i style="background:var(--mod)"></i>Moderate</span><span><i style="background:var(--heavy)"></i>Heavy</span><span><i style="background:var(--sev)"></i>Severe</span></div>
    </div>
    <div class="zoom" id="nx-zoom"><button data-z="in" aria-label="Zoom in">+</button><button data-z="out" aria-label="Zoom out">−</button><button data-z="fit" aria-label="Fit route" style="font-size:13px">Fit</button></div>
  </div>
  <div class="side">
    <div class="tabs" role="tablist" id="nx-tabs">
      <button role="tab" data-t="routes" aria-selected="true">Routes</button>
      <button role="tab" data-t="cond" aria-selected="false">Conditions</button>
      <button role="tab" data-t="svc" aria-selected="false">Services</button>
      <button role="tab" data-t="sim" aria-selected="false">What-If</button>
      <button role="tab" data-t="eyes" aria-selected="false">Community</button>
    </div>
    <div class="panel" id="nx-panel"></div>
  </div>
</div>`;

/* Approximate real coordinates for each schematic place, used to hand a trip over to booking. */
const NODE_LL = {
  GIS: [-1.9306, 30.0606], KAG: [-1.9135, 30.09], NYB: [-1.9395, 30.0445], MUH: [-1.9425, 30.056], KMS: [-1.952, 30.048],
  CBD: [-1.9441, 30.0619], NYM: [-1.978, 30.042], KIY: [-1.953, 30.066], KAC: [-1.9437, 30.0866], KMH: [-1.953, 30.089],
  KIB: [-1.9306, 30.1166], KMR: [-1.9496, 30.126], REM: [-1.9585, 30.112], GIK: [-1.9729, 30.0717], SON: [-1.964, 30.104],
  KIC: [-1.974, 30.103], NYZ: [-1.99, 30.108], KAN: [-1.9744, 30.1358], AIR: [-1.9686, 30.1395], REB: [-1.987, 30.07],
};

/**
 * @param {HTMLElement} root container element
 * @param {{
 *   reports?: { list: () => Promise<any[]>, add: (r: any) => Promise<any>, vote: (id: string, kind: 'confirm'|'cleared') => Promise<void> },
 *   onBook?: (from: {name:string,lat:number,lng:number}, to: {name:string,lat:number,lng:number}) => void,
 *   onNeedSignIn?: () => void,
 * }} opts
 */
export function mountPlanner(root, opts = {}) {
  root.innerHTML = MARKUP;
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('movesmart.planner.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('movesmart.planner.' + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  };
  const observers = [];
  let disposed = false;
  const KM = 0.024; // km per map unit

  /* ---------- Places & roads (schematic, approximate positions) ---------- */
  const N = { GIS: ['Gisozi', 380, 150], KAG: ['Kagugu', 520, 95], NYB: ['Nyabugogo bus park', 250, 240], MUH: ['Muhima', 320, 285], KMS: ['Kimisagara', 265, 330],
    CBD: ['City Centre', 395, 330], NYM: ['Nyamirambo', 250, 445], KIY: ['Kiyovu', 445, 365], KAC: ['Kacyiru', 505, 215], KMH: ['Kimihurura', 540, 300],
    KIB: ['Kibagabaga', 670, 140], KMR: ['Kimironko', 735, 215], REM: ['Remera', 690, 310], GIK: ['Gikondo', 480, 455], SON: ['Sonatubes', 600, 395],
    KIC: ['Kicukiro Centre', 600, 515], NYZ: ['Nyanza (Kicukiro)', 650, 625], KAN: ['Kanombe', 840, 430], AIR: ['Kigali International Airport', 900, 370], REB: ['Rebero', 420, 580] };
  for (const k in N) { const [n, x, y] = N[k]; N[k] = { id: k, n, x, y }; }
  const E = [['NYB', 'GIS', 'Gisozi road', 2, .5], ['NYB', 'MUH', 'Nyabugogo–Muhima road', 1, .8], ['NYB', 'KMS', 'Kimisagara valley road', 2, .6], ['MUH', 'CBD', 'Muhima–Centre road', 1, .7],
    ['KMS', 'CBD', 'Kimisagara–Centre road', 2, .55], ['KMS', 'NYM', 'Nyamirambo hill road', 2, .45], ['NYM', 'CBD', 'Nyamirambo–Centre road', 2, .6], ['GIS', 'KAC', 'Gisozi–Kacyiru road', 2, .45],
    ['GIS', 'KAG', 'Kagugu road', 2, .3], ['KAG', 'KIB', 'Kagugu–Kibagabaga road', 2, .35], ['CBD', 'KIY', 'Kiyovu road', 1, .5], ['CBD', 'KAC', 'Centre–Kacyiru boulevard', 1, .75],
    ['KIY', 'KMH', 'Kiyovu–Kimihurura road', 1, .55], ['KAC', 'KMH', 'Kacyiru–Kimihurura road', 1, .6], ['KAC', 'KIB', 'Kacyiru–Kibagabaga road', 2, .5], ['KIB', 'KMR', 'Kibagabaga–Kimironko road', 2, .45],
    ['KMH', 'REM', 'Kimihurura–Remera road', 1, .8], ['KMR', 'REM', 'Kimironko–Remera road', 1, .65], ['REM', 'AIR', 'Airport Road', 1, .7], ['REM', 'SON', 'Remera–Sonatubes road', 1, .75],
    ['KIY', 'GIK', 'Kiyovu–Gikondo road', 2, .55], ['GIK', 'SON', 'Gikondo–Sonatubes road', 2, .6], ['SON', 'KIC', 'Sonatubes–Kicukiro road', 1, .7], ['GIK', 'KIC', 'Gikondo valley road', 2, .4],
    ['KIC', 'NYZ', 'Kicukiro–Nyanza road', 1, .55], ['KIC', 'KAN', 'Kicukiro–Kanombe road', 2, .45], ['KAN', 'AIR', 'Kanombe–Airport link', 1, .4], ['SON', 'KAN', 'Sonatubes–Kanombe road', 1, .6],
    ['GIK', 'REB', 'Rebero road', 2, .3], ['REB', 'KIC', 'Rebero–Kicukiro road', 2, .3], ['NYM', 'REB', 'Nyamirambo–Rebero road', 2, .25], ['KMR', 'AIR', 'Kimironko–Airport road', 2, .4]]
    .map(([a, b, name, cls, c], i) => { const A = N[a], B = N[b]; return { i, a, b, name, cls, c, km: Math.hypot(A.x - B.x, A.y - B.y) * KM * (cls == 2 ? 1.2 : 1.08), v: cls == 1 ? 46 : 30, mx: (A.x + B.x) / 2, my: (A.y + B.y) / 2 }; });
  const EK = (a, b) => E.find((e) => (e.a == a && e.b == b) || (e.a == b && e.b == a)).i;
  const ADJ = {}; for (const k in N) ADJ[k] = []; for (const e of E) { ADJ[e.a].push({ e, to: e.b }); ADJ[e.b].push({ e, to: e.a }); }

  /* ---------- Hazards (sample) ---------- */
  const HZ = [
    { id: 'H1', kind: 'Flood-prone road', n: 'Nyabugogo valley flood-prone section', src: 'historical', sev: 3, rain: 1, flood: 1, e: [EK('NYB', 'MUH'), EK('NYB', 'KMS')], x: 262, y: 268, zr: 46, d: 'Low-lying valley roads that have flooded in past heavy rain. Historical pattern only.' },
    { id: 'H2', kind: 'Landslide-prone area', n: 'Kimisagara steep slopes', src: 'historical', sev: 2, rain: 1, e: [EK('KMS', 'NYM'), EK('KMS', 'CBD')], x: 262, y: 388, zr: 34, d: 'Steep, built-up slopes with past landslide events after prolonged rain.' },
    { id: 'H3', kind: 'Flood-prone road', n: 'Gikondo wetland flood zone', src: 'historical', sev: 2, rain: 1, flood: 1, e: [EK('GIK', 'KIC'), EK('GIK', 'SON')], x: 530, y: 478, zr: 44, d: 'Roads skirting a wetland; standing water is common in long downpours.' },
    { id: 'H4', kind: 'Road works', n: 'Lane closure, Centre–Kacyiru boulevard', src: 'official', sev: 1, delay: 6, e: [EK('CBD', 'KAC')], d: 'Sample official notice: one lane closed for works, expect slow traffic.' },
    { id: 'H5', kind: 'Accident', n: 'Collision near Sonatubes junction', src: 'verified', sev: 2, delay: 8, e: [EK('REM', 'SON')], d: 'Sample verified incident reported 25 minutes ago; one lane blocked.' },
    { id: 'H6', kind: 'Blocked drainage', n: 'Blocked drainage history, Kimihurura–Remera', src: 'historical', sev: 1, rain: 1, e: [EK('KMH', 'REM')], d: 'Drains on this stretch have overflowed in past storms.' },
    { id: 'H7', kind: 'Dangerous road section', n: 'Steep descent, Nyamirambo–Rebero', src: 'historical', sev: 2, e: [EK('NYM', 'REB')], d: 'Long steep descent with a history of crashes in the wet.' }];
  for (const h of HZ) { if (h.x == null) { const e = E[h.e[0]]; h.x = e.mx; h.y = e.my; } }
  const SRCW = { verified: 1, official: .8, historical: .45, unverified: .25, confirmed: .6, cleared: 0 };
  const TAG = { live: 'Live feed', forecast: 'Forecast', historical: 'Historical pattern', official: 'Official notice', verified: 'Verified incident', unverified: 'Unverified report', confirmed: 'Community-confirmed', cleared: 'Reported cleared', sim: 'Simulation', model: 'Illustrative model' };
  const tag = (k) => `<span class="tag k-${k}">${TAG[k]}</span>`;

  /* ---------- Services (hospital names real, positions approximate; others are samples) ---------- */
  const SV = [['King Faisal Hospital', 'Hospital', 520, 195], ['University Teaching Hospital of Kigali (CHUK)', 'Hospital', 378, 312], ['Rwanda Military Hospital', 'Hospital', 825, 452],
    ['Kibagabaga Hospital', 'Hospital', 665, 128], ['Muhima Hospital', 'Hospital', 318, 268], ['Health centre, Kicukiro (sample)', 'Clinic', 612, 535], ['Health centre, Nyamirambo (sample)', 'Clinic', 262, 462],
    ['Police station, Remera (sample)', 'Police', 702, 332], ['Police station, Nyamirambo (sample)', 'Police', 238, 425], ['Police station, Kicukiro (sample)', 'Police', 585, 498], ['Fire and rescue station (sample)', 'Fire & rescue', 470, 345],
    ['Fuel station, Nyabugogo (sample)', 'Fuel', 268, 222], ['Fuel station, Remera (sample)', 'Fuel', 668, 296], ['Fuel station, Sonatubes (sample)', 'Fuel', 588, 378], ['Fuel station, Airport Road (sample)', 'Fuel', 800, 346],
    ['Pharmacy, City Centre (sample)', 'Pharmacy', 408, 346], ['Pharmacy, Kimironko (sample)', 'Pharmacy', 748, 232], ['Parking, City Centre (sample)', 'Parking', 382, 352], ['Parking, Airport (sample)', 'Parking', 905, 388],
    ['Hotel, Kiyovu (sample)', 'Hotel', 458, 378], ['Hotel, Remera (sample)', 'Hotel', 712, 298], ['Restaurant, Kimihurura (sample)', 'Restaurant', 552, 288], ['Restaurant, Nyamirambo (sample)', 'Restaurant', 244, 458]]
    .map(([n, c, x, y], i) => ({ i, n, c, x, y }));
  const SVI = { Hospital: 'H', Clinic: 'C', Police: 'Po', 'Fire & rescue': 'Fi', Fuel: 'Fu', Pharmacy: 'Rx', Parking: 'P', Hotel: 'Ho', Restaurant: 'Re' };
  const SVC = { Hospital: '#d62828', Clinic: '#e05a5a', Police: '#1d4ed8', 'Fire & rescue': '#b4410f', Fuel: '#4b5563', Pharmacy: '#0e9f6e', Parking: '#2563eb', Hotel: '#7a5c3a', Restaurant: '#9a5b13' };

  /* ---------- Weather (sample hourly pattern for the short rainy season) ---------- */
  const RAIN = [0, 0, 0, 0, 0, 0, .1, .1, 0, 0, .1, .2, .5, 1.2, 2.6, 4.2, 6.5, 9.5, 7.5, 3.2, 1.2, .4, .1, 0];
  const zoneMul = (x) => x < 370 ? 1.15 : x > 640 ? .85 : 1;
  const zoneName = (x) => x < 370 ? 'West (Nyabugogo, Nyamirambo)' : x > 640 ? 'East (Remera, Kanombe)' : 'Central (Centre, Kacyiru, Gikondo)';
  function wxAt(x, y, ms, ctx) {
    const h = new Date(ms).getHours(); let r = RAIN[h] * zoneMul(x), src = 'forecast';
    const s = ctx && ctx.scn; if (s && s.rainIn != null && ms >= ctx.now + s.rainIn * 60000 && s.rainMm > r) { r = s.rainMm; src = 'sim'; }
    const t = Math.round(21 + 5 * Math.sin((h - 8) * Math.PI / 12) - r * .35);
    return { r: +r.toFixed(1), t, p: Math.min(95, Math.round(8 + r * 10)), w: Math.round(9 + r * 1.4), vis: Math.max(1, +(10 - r * .9).toFixed(1)), src };
  }
  const rainWord = (r) => r >= 8 ? 'heavy rain' : r >= 4 ? 'moderate rain' : r >= 1 ? 'light rain' : r > 0 ? 'drizzle possible' : 'dry';

  /* ---------- Traffic model ---------- */
  const PEAK = [.15, .1, .1, .1, .2, .5, 1.1, 1.6, 1.5, 1, .8, .8, 1, 1, .85, .9, 1.2, 1.7, 1.8, 1.2, .8, .5, .35, .2];
  const ratioOf = (e, ms, ctx) => 1 + e.c * PEAK[new Date(ms).getHours()] * .9 * (1 + ((ctx && ctx.scn && ctx.scn.traffic) || 0) * 1.4);
  const clsOf = (r) => r < 1.25 ? 'free' : r < 1.6 ? 'moderate' : r < 2.05 ? 'heavy' : 'severe';
  const CLSN = { free: 'Free-flowing', moderate: 'Moderate congestion', heavy: 'Heavy congestion', severe: 'Severe congestion' };
  const CLSR = { free: 0, moderate: 1, heavy: 2, severe: 3 };

  /* ---------- Community reports (shared through MoveSmart's database when available) ---------- */
  const now0 = Date.now();
  const SEED = [{ id: 's1', type: 'Flooding', desc: 'Water across one lane after the last storm, passable slowly.', x: 300, y: 262, sev: 2, time: now0 - 40 * 6e4, c: 2, dn: 0, seed: 1 },
    { id: 's2', type: 'Road damage', desc: 'Deep pothole cluster in the right lane.', x: 626, y: 572, sev: 1, time: now0 - 180 * 6e4, c: 4, dn: 0, seed: 1 },
    { id: 's3', type: 'Blocked road', desc: 'Truck broken down at the junction, traffic squeezing past.', x: 712, y: 262, sev: 2, time: now0 - 15 * 6e4, c: 0, dn: 0, seed: 1 }];
  const shared = !!opts.reports;
  let REPS = shared ? SEED.map((r) => ({ ...r })) : (store.get('reports', null) || SEED);
  let repMsg = '';
  const repStatus = (r) => (r.dn >= 3 && r.dn > r.c) ? 'cleared' : r.c >= 3 ? 'confirmed' : 'unverified';
  function segDist(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy; let t = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - ax - t * dx, py - ay - t * dy); }
  function nearestEdge(x, y) { let b = null, bd = 1e9; for (const e of E) { const A = N[e.a], B = N[e.b], d = segDist(x, y, A.x, A.y, B.x, B.y); if (d < bd) { bd = d; b = e; } } return { e: b, d: bd }; }
  function nearestNode(x, y) { let b = null, bd = 1e9; for (const k in N) { const d = Math.hypot(N[k].x - x, N[k].y - y); if (d < bd) { bd = d; b = N[k]; } } return b; }
  function repEdges() { const m = {}; for (const r of REPS) { const ne = nearestEdge(r.x, r.y); if (ne.d < 24) (m[ne.e.i] = m[ne.e.i] || []).push(r); } return m; }
  let REPE = repEdges();
  const saveReps = () => { REPE = repEdges(); if (shared) return; if (!store.set('reports', REPS)) { REPS.forEach((r) => { if (!r.seed) delete r.photo; }); store.set('reports', REPS); } };

  /* ---------- Routing ---------- */
  const S = { o: 'NYB', d: 'AIR', dep: null, sel: 'bal', tab: 'routes', layers: { traffic: 1, weather: 1, hazards: 1, services: 1, community: 1 }, mode: '2d', svcF: 'All', pick: null, blockPick: false, scn: null, sim: null };
  Object.assign(S, store.get('trip', {}));
  if (!N[S.o]) S.o = 'NYB'; if (!N[S.d]) S.d = 'AIR';
  function blocked(e, ctx) {
    const s = ctx.scn; if (!s) return false; if (s.blocked && s.blocked.includes(e.i)) return true; if (s.accident && ctx.accE === e.i) return true;
    if (s.flood && HZ.some((h) => h.flood && h.e.includes(e.i))) return true; return false;
  }
  function step(e, t, ctx) {
    const ms = ctx.dep + t * 6e4, ratio = ratioOf(e, ms, ctx), w = wxAt(e.mx, e.my, ms, ctx), rf = w.r >= 8 ? 1.3 : w.r >= 4 ? 1.18 : w.r >= 1 ? 1.06 : 1, ff = e.km / e.v * 60;
    let delay = 0, risk = 0; for (const h of HZ) if (h.e.includes(e.i)) { if (h.delay) delay += h.delay; risk += SRCW[h.src] * h.sev * (h.rain && w.r >= 4 ? 2.2 : 1); }
    for (const r of REPE[e.i] || []) risk += SRCW[repStatus(r)] * r.sev;
    return { tm: ff * ratio * rf + delay, ff, ratio, risk, w, ms };
  }
  function solve(o, d, mode, ctx) {
    const W = mode == 'fast' ? 0 : mode == 'safe' ? 14 : 5, best = { [o]: { c: 0, t: 0, prev: null, e: null } }, done = new Set();
    for (;;) {
      let u = null, bc = Infinity; for (const k in best) if (!done.has(k) && best[k].c < bc) { bc = best[k].c; u = k; }
      if (u === null) return null; if (u === d) break; done.add(u);
      for (const { e, to } of ADJ[u]) {
        if (done.has(to) || blocked(e, ctx)) continue; const s = step(e, best[u].t, ctx), c = best[u].c + s.tm + W * s.risk;
        if (!best[to] || c < best[to].c) best[to] = { c, t: best[u].t + s.tm, prev: u, e: e.i };
      }
    }
    const nodes = [], edges = []; let k = d; while (k) { nodes.unshift(k); if (best[k].e != null) edges.unshift(best[k].e); k = best[k].prev; }
    let t = 0, km = 0, ff = 0, risk = 0; const segs = [];
    for (const i of edges) { const e = E[i], s = step(e, t, ctx); segs.push({ e, ...s, cls: clsOf(s.ratio), at: t }); t += s.tm; km += e.km; ff += s.ff; risk += s.risk; }
    const hz = []; for (const s of segs) {
      for (const h of HZ) if (h.e.includes(s.e.i) && !hz.some((x) => x.h === h)) hz.push({ h, w: s.w, src: h.src, at: s.at });
      for (const r of REPE[s.e.i] || []) if (!hz.some((x) => x.h === r) && repStatus(r) != 'cleared') hz.push({ h: r, rep: 1, w: s.w, src: repStatus(r), at: s.at });
    }
    const maxR = Math.max(...segs.map((s) => s.w.r), 0), worst = segs.reduce((a, s) => CLSR[s.cls] > CLSR[a] ? s.cls : a, 'free');
    return { mode, nodes, edges, segs, t, km, ff, risk, hz, maxR, worst, arr: ctx.dep + t * 6e4 };
  }
  function depMs() { const v = $('#nx-dep').value; if (!v) return Date.now(); const [h, m] = v.split(':').map(Number); const d = new Date(); d.setHours(h, m, 0, 0); if (d.getTime() < Date.now() - 12 * 36e5) d.setDate(d.getDate() + 1); return d.getTime(); }
  function plan(scn, dep) {
    const ctx = { dep: dep ?? depMs(), now: Date.now(), scn: scn || null };
    if (scn && scn.accident) { const b = solve(S.o, S.d, 'fast', { ...ctx, scn: null }); if (b) ctx.accE = b.segs.reduce((a, s) => s.e.c * s.e.km > a.e.c * a.e.km ? s : a).e.i; }
    const R = { fast: solve(S.o, S.d, 'fast', ctx), safe: solve(S.o, S.d, 'safe', ctx), bal: solve(S.o, S.d, 'bal', ctx) }; R.ctx = ctx; return R;
  }
  let BASE = null;
  const cur = () => S.sim ? S.sim.R : BASE;
  const MN = { fast: 'Fastest route', safe: 'Safest estimated route', bal: 'Balanced route' };
  const MC = { fast: 'var(--fast)', safe: 'var(--safe)', bal: 'var(--bal)' };
  const fmtT = (ms) => new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const fmtD = (m) => m < 60 ? Math.round(m) + ' min' : Math.floor(m / 60) + ' h ' + Math.round(m % 60) + ' min';
  const same = (a, b) => a && b && a.edges.join() == b.edges.join();
  const roadsOf = (r) => [...new Set(r.segs.map((s) => s.e.name))];
  const ago = (t) => { const m = Math.round((Date.now() - t) / 6e4); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : m < 2880 ? Math.round(m / 60) + ' h ago' : Math.round(m / 1440) + ' days ago'; };
  function hzStatus(x) {
    const h = x.h; if (x.rep) return `${esc(h.type)}: “${esc(h.desc)}” · ${ago(h.time)}`;
    if (h.src == 'historical' && h.rain && x.w.r >= 4) return `${esc(h.n)}. Rain of about ${x.w.r} mm/h is forecast as you pass, so risk is elevated. This is a historical risk zone, not a confirmed hazard right now.`;
    if (h.src == 'historical') return `${esc(h.n)}. Historical risk zone, not evidence of a current hazard.`;
    return `${esc(h.n)}${h.delay ? ` · about +${h.delay} min` : ''}`;
  }
  function explain(r, R) {
    const f = R.fast, names = (x) => x.map((y) => esc(y.h.n || y.h.type)).join(', ');
    const hasH = r.hz.filter((x) => !x.rep), nRep = r.hz.length - hasH.length, repT = nRep ? ` Also ${nRep} unverified or community report${nRep > 1 ? 's' : ''} nearby.` : '', fH = f ? f.hz.filter((x) => !x.rep) : [];
    const avoided = fH.filter((x) => !hasH.some((y) => y.h === x.h)), dt = f ? Math.round(r.t - f.t) : 0;
    const via = 'Via ' + roadsOf(r).slice(0, 3).join(', ') + (roadsOf(r).length > 3 ? ' and others' : '') + '.';
    if (r.mode == 'fast') return `Lowest estimated travel time for your departure time. ${via} ${hasH.length ? `Passes ${hasH.length} known hazard${hasH.length > 1 ? 's' : ''}: ${names(hasH)}.` : 'No known hazards on this path.'}${repT}`;
    if (same(r, f)) return `Same path as the fastest route: no lower-exposure alternative was found. ${hasH.length ? 'Remaining exposure: ' + names(hasH) + '.' : ''}`;
    return `${dt > 0 ? `Adds about ${dt} min` : 'Similar time'} compared with the fastest route${avoided.length ? ' to avoid ' + names(avoided) : ''}. ${via} ${hasH.length ? 'Still passes ' + names(hasH) + '.' : 'No known hazards on this path.'}${repT}`;
  }

  /* ---------- 2D map ---------- */
  const svg = $('#nx-map'); let vb = { x: 0, y: 0, w: 1000, h: 700 };
  const HILLS = [[215, 505, 9, 105], [300, 105, 8, 95], [420, 605, 6, 85], [520, 235, 4, 80], [745, 170, 3.2, 110], [870, 470, 3, 105], [420, 330, 4, 60], [640, 560, 2.5, 80]];
  const WET = [[255, 262, 70, 30, -20], [515, 478, 70, 26, 10], [330, 640, 120, 30, -8]];
  function upp() { const W = svg.clientWidth || 800, H = svg.clientHeight || 500; return Math.max(vb.w / W, vb.h / H); }
  function renderMap(anim) {
    if (disposed) return;
    const u = upp(), R = cur(), L = S.layers, ctx = R.ctx; svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    let h = `<defs><pattern id="nx-rp" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(20)"><line x1="0" y1="0" x2="0" y2="9" stroke="#2563eb" stroke-width="1.6"/></pattern>
    <pattern id="nx-hp" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" stroke="#ff6a2b" stroke-width="2.4"/></pattern></defs>
    <rect x="-600" y="-600" width="2200" height="1900" style="fill:var(--land)"/>`;
    for (const [x, y, , r] of HILLS) for (let k = 5; k > 0; k--) h += `<ellipse cx="${x}" cy="${y}" rx="${r * k / 5 * 1.25}" ry="${r * k / 5}" style="fill:${k == 5 ? 'var(--hill)' : 'none'};stroke:var(--contour)" stroke-width="${u * 1}"/>`;
    for (const [x, y, rx, ry, rot] of WET) h += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" style="fill:var(--wet)"/>`;
    if (L.weather) {
      const lab = svg.clientWidth >= 600; [[-600, 370, 'w', 250], [370, 640, 'c', 505], [640, 1600, 'e', 780]].forEach(([a, b, , cx]) => {
        const w = wxAt(cx, 350, ctx.dep, ctx);
        if (w.r > 0.3) h += `<rect x="${a}" y="-600" width="${b - a}" height="1900" fill="url(#nx-rp)" opacity="${Math.min(.5, w.r / 16)}"/>`;
        if (lab) h += `<text x="${cx}" y="${vb.y + u * 112}" text-anchor="middle" font-size="${u * 12}" stroke-width="${u * 3}" class="lblm">${w.r > 0.3 ? w.r + ' mm/h rain' : 'Dry'} · ${w.t}°C at departure</text>`;
      });
    }
    if (L.hazards) for (const z of HZ) if (z.zr) h += `<circle cx="${z.x}" cy="${z.y}" r="${z.zr}" fill="url(#nx-hp)" opacity=".35" stroke="#ff6a2b" stroke-dasharray="${u * 5} ${u * 4}" stroke-width="${u * 1.5}"/>`;
    const sim = S.sim;
    if (sim) for (const i of sim.aff) h += `<line x1="${N[E[i].a].x}" y1="${N[E[i].a].y}" x2="${N[E[i].b].x}" y2="${N[E[i].b].y}" stroke="var(--sim)" stroke-opacity=".35" stroke-width="${Math.max(u * 16, 10)}" stroke-linecap="round"/>`;
    for (const e of E) {
      const A = N[e.a], B = N[e.b], w = Math.max(e.cls == 1 ? 7 : 4.5, u * (e.cls == 1 ? 4 : 3));
      h += `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" style="stroke:var(--roadc)" stroke-width="${w + u * 2}" stroke-linecap="round"/>`;
      const col = L.traffic ? `var(--${({ free: 'free', moderate: 'mod', heavy: 'heavy', severe: 'sev' })[clsOf(ratioOf(e, ctx.dep, ctx))]})` : 'var(--road)';
      h += `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" style="stroke:${col}" stroke-width="${w}" stroke-linecap="round"/>`;
    }
    const order = ['fast', 'safe', 'bal'].filter((m) => m != S.sel).concat(S.sel);
    for (const m of order) {
      const r = R[m]; if (!r) continue; if (m != S.sel && (same(r, R[S.sel]))) continue;
      const pts = r.nodes.map((k) => N[k].x + ',' + N[k].y).join(' '), sel = m == S.sel; let len = 0; for (const s of r.segs) len += Math.hypot(N[s.e.a].x - N[s.e.b].x, N[s.e.a].y - N[s.e.b].y);
      h += `<polyline points="${pts}" fill="none" stroke="var(--land)" stroke-width="${sel ? Math.max(16, u * 11) : Math.max(11, u * 7.5)}" stroke-linejoin="round" stroke-linecap="round"/>`;
      h += `<polyline points="${pts}" fill="none" stroke="${MC[m]}" stroke-width="${sel ? Math.max(9, u * 6) : Math.max(5, u * 3.5)}" stroke-opacity="${sel ? 1 : .85}" ${sel ? `stroke-dasharray="${len}" class="${anim ? 'drawn' : ''}" style="--len:${len}"` : `stroke-dasharray="${u * 12} ${u * 5}"`} stroke-linejoin="round" stroke-linecap="round" data-k="r:${m}"/>`;
    }
    if (sim) for (const i of sim.blk) { const e = E[i], s = u * 9; h += `<g transform="translate(${e.mx} ${e.my})"><circle r="${s * 1.3}" fill="var(--sim)"/><path d="M${-s / 2} ${-s / 2}L${s / 2} ${s / 2}M${s / 2} ${-s / 2}L${-s / 2} ${s / 2}" stroke="#fff" stroke-width="${u * 2.6}"/></g>`; }
    for (const e of E) { const A = N[e.a], B = N[e.b]; h += `<line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" stroke="transparent" stroke-width="${u * 18}" data-k="e:${e.i}"/>`; }
    for (const k in N) { const n = N[k], od = k == S.o || k == S.d; h += `<circle cx="${n.x}" cy="${n.y}" r="${u * (od ? 0 : 4.5)}" style="fill:var(--ink)" data-k="n:${k}"/>`; }
    if (L.services) for (const s of SV) { const z = u * 15; h += `<g data-k="s:${s.i}" transform="translate(${s.x} ${s.y})"><rect x="${-z / 2}" y="${-z / 2}" width="${z}" height="${z}" rx="${u * 3}" fill="${SVC[s.c]}" stroke="var(--land)" stroke-width="${u * 1.5}"/><text text-anchor="middle" y="${u * 3.6}" font-size="${u * (SVI[s.c].length > 1 ? 8 : 10)}" fill="#fff" stroke="none" font-weight="700">${SVI[s.c]}</text></g>`; }
    if (L.hazards) for (const z of HZ) {
      const s = u * 11, c = { historical: '#b8860b', official: '#0b6b8a', verified: '#d62828' }[z.src];
      h += `<g data-k="h:${z.id}" transform="translate(${z.x} ${z.y})"><path d="M0 ${-s}L${s * 1.05} ${s * .75}L${-s * 1.05} ${s * .75}Z" fill="${c}" stroke="var(--land)" stroke-width="${u * 1.6}"/><text text-anchor="middle" y="${s * .6}" font-size="${u * 10}" fill="#fff" stroke="none" font-weight="700">!</text></g>`;
    }
    if (L.community) for (const r of REPS) {
      const st = repStatus(r), c = st == 'confirmed' ? '#a34fbf' : st == 'cleared' ? '#8a958f' : '#8a5a9e';
      h += `<g data-k="c:${esc(r.id)}" transform="translate(${r.x} ${r.y})" opacity="${st == 'cleared' ? .5 : 1}"><circle r="${u * 9}" fill="${c}" stroke="var(--land)" stroke-width="${u * 1.6}"/><circle r="${u * 3}" fill="#fff"/></g>`;
    }
    for (const k of [S.o, S.d]) { const n = N[k], s = u * 13, lab = k == S.o ? 'A' : 'B'; h += `<g data-k="n:${k}" transform="translate(${n.x} ${n.y})"><path d="M0 0C${-s} ${-s * 1.2} ${-s * .9} ${-s * 2.6} 0 ${-s * 2.6}C${s * .9} ${-s * 2.6} ${s} ${-s * 1.2} 0 0Z" style="fill:var(--ink)"/><text text-anchor="middle" y="${-s * 1.45}" font-size="${u * 12}" style="fill:var(--land)" stroke="none" font-weight="700">${lab}</text></g>`; }
    for (const k in N) { const n = N[k], od = k == S.o || k == S.d; h += `<text x="${n.x + u * 8}" y="${n.y - u * (od ? 10 : 7)}" font-size="${u * (od ? 14 : 12)}" stroke-width="${u * 3.5}" class="${od ? 'lbl' : 'lblm'}" data-k="n:${k}">${esc(n.n)}</text>`; }
    if (S.pick) h += `<circle cx="${S.pick.x}" cy="${S.pick.y}" r="${u * 10}" fill="none" stroke="var(--focus)" stroke-width="${u * 3}"/>`;
    h += `<g id="nx-pm" style="display:none"></g>`; svg.innerHTML = h; updateMarker();
    $('#nx-banner').classList.toggle('on', !!S.sim);
  }
  function fit() {
    const R = cur(), r = R[S.sel] || R.fast; const pts = r ? r.nodes.map((k) => N[k]) : [N[S.o], N[S.d]];
    const x0 = Math.min(...pts.map((p) => p.x)), x1 = Math.max(...pts.map((p) => p.x)), y0 = Math.min(...pts.map((p) => p.y)), y1 = Math.max(...pts.map((p) => p.y));
    const pad = 110, w = Math.max(380, x1 - x0 + pad * 2), h = Math.max(280, y1 - y0 + pad * 2); const W = svg.clientWidth || 800, H = svg.clientHeight || 500, asp = W / H;
    let vw = w, vh = h; if (vw / vh < asp) vw = vh * asp; else vh = vw / asp; vb = { x: (x0 + x1) / 2 - vw / 2, y: (y0 + y1) / 2 - vh / 2 + 20, w: vw, h: vh };
  }
  function svgPt(ev) { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); }
  let drag = null;
  svg.addEventListener('pointerdown', (ev) => { drag = { x: ev.clientX, y: ev.clientY, vb: { ...vb }, m: 0 }; svg.setPointerCapture(ev.pointerId); });
  svg.addEventListener('pointermove', (ev) => {
    if (!drag) return; const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 5) drag.m = 1;
    if (drag.m) { const u = upp(); vb.x = drag.vb.x - dx * u; vb.y = drag.vb.y - dy * u; svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`); }
  });
  svg.addEventListener('pointerup', (ev) => {
    const d = drag; drag = null; if (!d) return; if (d.m) { renderMap(); return; }
    const t = document.elementFromPoint(ev.clientX, ev.clientY), k = t && t.closest && t.closest('[data-k]'), p = svgPt(ev);
    if (S.pickMode) { S.pick = { x: Math.round(p.x), y: Math.round(p.y) }; S.pickMode = false; svg.classList.remove('pick'); $('#nx-pickmsg').classList.remove('on'); renderMap(); S.tab = 'eyes'; renderPanel(); return; }
    if (S.blockPick) { const ne = nearestEdge(p.x, p.y); if (ne.d < 30) { const b = draft.blocked; const j = b.indexOf(ne.e.i); j < 0 ? b.push(ne.e.i) : b.splice(j, 1); } S.blockPick = false; svg.classList.remove('pick'); $('#nx-pickmsg').classList.remove('on'); S.tab = 'sim'; renderPanel(); return; }
    if (!k) { hideInfo(); return; }
    const [ty, id] = k.dataset.k.split(':');
    if (ty == 'n') infoNode(id); else if (ty == 'h') infoHz(HZ.find((z) => z.id == id)); else if (ty == 's') infoSvc(SV[+id]); else if (ty == 'c') infoRep(REPS.find((r) => String(r.id) == id)); else if (ty == 'r') { S.sel = id; renderAll(true); } else if (ty == 'e') infoEdge(E[+id]);
  });
  svg.addEventListener('wheel', (ev) => { ev.preventDefault(); const p = svgPt(ev), f = ev.deltaY > 0 ? 1.15 : 1 / 1.15; zoomAt(p.x, p.y, f); }, { passive: false });
  function zoomAt(cx, cy, f) { const nw = Math.min(1600, Math.max(220, vb.w * f)), k = nw / vb.w; vb = { x: cx - (cx - vb.x) * k, y: cy - (cy - vb.y) * k, w: nw, h: vb.h * k }; renderMap(); }
  $('#nx-zoom').addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (!b) return; const z = b.dataset.z; if (z == 'fit') { fit(); renderMap(); } else zoomAt(vb.x + vb.w / 2, vb.y + vb.h / 2, z == 'in' ? 1 / 1.3 : 1.3); });
  const ro = new ResizeObserver(() => { if (S.mode == '2d' && BASE) renderMap(); }); ro.observe(svg); observers.push(ro);

  /* ---------- Info card ---------- */
  const info = $('#nx-info');
  function showInfo(h) { info.innerHTML = `<button class="x" aria-label="Close">×</button>` + h; info.classList.add('on'); }
  function hideInfo() { info.classList.remove('on'); }
  info.addEventListener('click', (ev) => {
    const b = ev.target.closest('button'); if (!b) return; if (b.classList.contains('x')) return hideInfo();
    const a = b.dataset.a, id = b.dataset.id; if (a == 'o') { S.o = id; sync(); go(); } if (a == 'd') { S.d = id; sync(); go(); } if (a == '3d') { setMode('3d'); if (T) focus3(N[id]); }
  });
  function infoNode(id) {
    const n = N[id], w = wxAt(n.x, n.y, BASE.ctx.dep, BASE.ctx);
    showInfo(`<h4>${esc(n.n)}</h4><div class="note">${esc(zoneName(n.x))}</div><p style="margin:6px 0">${tag('forecast')} ${w.t}°C, ${rainWord(w.r)}${w.r ? ` (${w.r} mm/h)` : ''}, visibility about ${w.vis} km.</p>
    <div class="acts"><button class="btn g" data-a="o" data-id="${id}">Start here</button><button class="btn g" data-a="d" data-id="${id}">Go here</button><button class="btn g" data-a="3d" data-id="${id}">Explore in 3D</button></div>`);
  }
  function infoHz(z) { showInfo(`<h4>${esc(z.n)}</h4>${tag(z.src)} <span class="note">${esc(z.kind)}</span><p style="margin:6px 0 0">${esc(z.d)}</p>${z.src == 'historical' ? '<p class="note" style="margin:6px 0 0">A historical risk zone is not proof that this hazard is happening now.</p>' : ''}`); }
  function infoSvc(s) {
    const n = N[S.d], km = (Math.hypot(s.x - n.x, s.y - n.y) * KM).toFixed(1);
    showInfo(`<h4>${esc(s.n)}</h4><div class="note">${esc(s.c)} · about ${km} km from your destination (straight line)</div><p style="margin:6px 0 0">Opening hours and operational status are not verified. ${/Hospital|Clinic/.test(s.c) ? 'For an ambulance call <b>912</b>; for any emergency call <b>112</b>.' : ''}</p>`);
  }
  function infoRep(r) { if (!r) return; const st = repStatus(r); showInfo(`<h4>${esc(r.type)}</h4>${tag(st)} <span class="note">${ago(r.time)} · ${r.c} confirm · ${r.dn} say cleared</span><p style="margin:6px 0 0">${esc(r.desc)}</p>${r.photo ? `<img class="thumb" src="${esc(r.photo)}" alt="Photo attached to the report">` : ''}<p class="note" style="margin:6px 0 0">Community reports are shown separately and are not official confirmation.</p>`); }
  function infoEdge(e) {
    const R = BASE, ctx = R.ctx, r = ratioOf(e, ctx.dep, ctx), c = clsOf(r), ff = e.km / e.v * 60;
    showInfo(`<h4>${esc(e.name)}</h4><p style="margin:4px 0">${tag('live')} <span class="cls c-${c}">${CLSN[c]}</span></p><div class="note">${e.km.toFixed(1)} km · about ${fmtD(ff * r)} now (free flow ${fmtD(ff)})</div>`);
  }

  /* ---------- Panel ---------- */
  const panel = $('#nx-panel');
  function renderPanel() {
    if (disposed) return;
    $$('#nx-tabs button').forEach((b) => b.setAttribute('aria-selected', b.dataset.t == S.tab));
    panel.innerHTML = ({ routes: pRoutes, cond: pCond, svc: pSvc, sim: pSim, eyes: pEyes })[S.tab]();
  }
  function pRoutes() {
    const R = cur(), ctx = R.ctx;
    let h = S.sim ? `<div class="card simc"><b>Showing a hypothetical scenario.</b> <span class="note">These routes reflect your What-If settings, not a forecast.</span> <button class="btn g" data-act="clear" style="height:36px;margin-top:6px">Back to current conditions</button></div>` : '';
    h += `<h2>${esc(N[S.o].n)} to ${esc(N[S.d].n)}</h2><p class="sub">Leaving ${fmtT(ctx.dep)} · three route options</p>` + (S.sim ? '' : brief(R));
    for (const m of ['fast', 'safe', 'bal']) {
      const r = R[m];
      if (!r) { h += `<div class="card rc" style="--rc:${MC[m]}"><div class="nm">${MN[m]}</div><p>No route found under these conditions.</p></div>`; continue; }
      const delay = Math.max(0, Math.round(r.t - r.ff));
      h += `<button class="card rc" style="--rc:${MC[m]}" data-sel="${m}" aria-pressed="${S.sel == m}"><div class="top"><span class="nm">${MN[m]}</span><span class="big">${fmtD(r.t)}</span></div>
      <div class="meta"><span>Arrive ${fmtT(r.arr)}</span><span>${r.km.toFixed(1)} km</span><span class="cls c-${r.worst}">${CLSN[r.worst]}</span><span>+${delay} min delay</span><span>${r.maxR > 0.3 ? r.maxR + ' mm/h rain' : 'Dry'} on the way</span></div>
      <div>${r.hz.length ? r.hz.map((x) => tag(x.src)).join('') : '<span class="note">No known hazards on path</span>'}</div><p>${explain(r, R)}</p></button>`;
    }
    const rs = ['fast', 'safe', 'bal'].map((m) => R[m]);
    const row = (l, f) => `<tr><td>${l}</td>${rs.map((r) => `<td>${r ? f(r) : '—'}</td>`).join('')}</tr>`;
    h += `<h3>Compare</h3><div class="card" style="padding:6px 10px"><table><thead><tr><th></th><th style="color:var(--fast)">Fastest</th><th style="color:var(--safe)">Safest</th><th style="color:var(--bal)">Balanced</th></tr></thead><tbody>
    ${row('Duration', (r) => fmtD(r.t))}${row('Arrival', (r) => fmtT(r.arr))}${row('Distance', (r) => r.km.toFixed(1) + ' km')}${row('Traffic delay', (r) => '+' + Math.round(r.t - r.ff) + ' min')}
    ${row('Worst traffic', (r) => `<span class="cls c-${r.worst}">${r.worst}</span>`)}${row('Max rain', (r) => r.maxR + ' mm/h')}${row('Known hazards', (r) => r.hz.length)}${row('Exposure score', (r) => r.risk.toFixed(1))}</tbody></table></div>
    <p class="note">Exposure score weighs each known hazard by severity and how reliable its source is (verified incidents count most, unverified reports least), and raises rain-sensitive zones when rain is forecast. These are estimates; no route is guaranteed safe. Follow road signs, police directions and official alerts.</p>
    <details class="card"><summary>How to read the source tags</summary><div class="taglist">${Object.keys(TAGINFO).map((k) => `<div>${tag(k)} ${TAGINFO[k]}</div>`).join('')}</div></details>`;
    return h;
  }
  function pCond() {
    const R = cur(), ctx = R.ctx, r = R[S.sel] || R.fast, n = N[S.d], arr = r ? r.arr : ctx.dep, w = wxAt(n.x, n.y, arr, ctx);
    let h = `<h2>Conditions for your journey</h2><p class="sub">${esc(MN[S.sel])} · weather, traffic and hazards</p>`;
    h += `<div class="card"><div class="note">At ${esc(n.n)} when you arrive (${fmtT(arr)}) ${tag(w.src)}</div><div class="wx"><span class="t">${w.t}°C</span><span>${rainWord(w.r)}${w.r ? ' · ' + w.r + ' mm/h' : ''}</span><span>${w.p}% chance of rain</span><span>Wind ${w.w} km/h</span><span>Visibility ~${w.vis} km</span></div>
    <div class="hours">${[0, 1, 2, 3, 4, 5].map((i) => { const ms = ctx.dep + i * 36e5, x = wxAt(n.x, n.y, ms, ctx); return `<div><small>${x.r}</small><span class="bar" style="height:${Math.min(100, x.r * 9) + 2}%"></span><small>${fmtT(ms).slice(0, 2)}:00</small></div>`; }).join('')}</div><div class="note">Rain in mm/h at the destination over the next six hours</div></div>`;
    const mx = Math.max(...[0, 1, 2, 3, 4, 5].map((i) => wxAt(n.x, n.y, ctx.dep + i * 36e5, ctx).r));
    if (mx >= 8) h += `<div class="card warn">${tag('forecast')} <b>Heavy rain likely in the next few hours.</b> Expect slower traffic (up to 30% added to segment times in heavy rain), standing water in low-lying valleys, and reduced visibility on hill roads. Leaving earlier or taking the safest estimated route lowers exposure.</div>`;
    else if (mx >= 4) h += `<div class="card warn">${tag('forecast')} <b>Moderate rain possible.</b> Flood-prone and drainage-history sections are marked as elevated while rain is forecast.</div>`;
    if (r) {
      h += `<h3>Along the route</h3><div class="card"><table><thead><tr><th>Point</th><th>Time</th><th>Rain</th><th>Temp</th></tr></thead><tbody>`;
      const mid = r.segs[Math.floor(r.segs.length / 2)];
      const pts = [[N[S.o], 0], [N[r.nodes[Math.floor(r.nodes.length / 2)]], mid ? mid.at : 0], [N[S.d], r.t]];
      for (const [p, t] of pts) { const x = wxAt(p.x, p.y, ctx.dep + t * 6e4, ctx); h += `<tr><td>${esc(p.n)}</td><td>${fmtT(ctx.dep + t * 6e4)}</td><td>${x.r} mm/h</td><td>${x.t}°C</td></tr>`; }
      h += `</tbody></table></div><h3>Traffic hotspots on this route ${tag('live')}</h3><div class="card list">`;
      const hot = [...r.segs].sort((a, b) => (b.tm - b.ff) - (a.tm - a.ff)).slice(0, 4);
      h += hot.map((s) => `<div class="li"><div class="b"><b>${esc(s.e.name)}</b><small><span class="cls c-${s.cls}">${CLSN[s.cls]}</span> · +${Math.round(s.tm - s.ff)} min vs free flow</small></div></div>`).join('') + '</div>';
      h += `<h3>Hazards on this route</h3>`;
      h += r.hz.length ? `<div class="card list">${r.hz.map((x) => `<div class="li"><div class="b">${tag(x.src)}<small style="display:block;color:var(--ink);font-size:14px;margin-top:2px">${hzStatus(x)}</small></div></div>`).join('')}</div>` : '<p class="note">No known hazards recorded on this path. That does not mean none exist.</p>';
    }
    return h;
  }
  const CATS = ['All', 'Hospital', 'Clinic', 'Police', 'Fire & rescue', 'Fuel', 'Pharmacy', 'Parking', 'Hotel', 'Restaurant'];
  function pSvc() {
    const R = cur(), r = R[S.sel] || R.fast, n = N[S.d];
    const near = (s) => r ? Math.min(...r.segs.map((g) => segDist(s.x, s.y, N[g.e.a].x, N[g.e.a].y, N[g.e.b].x, N[g.e.b].y))) : 1e9;
    const list = SV.filter((s) => S.svcF == 'All' || s.c == S.svcF).map((s) => ({ s, km: Math.hypot(s.x - n.x, s.y - n.y) * KM, on: near(s) < 30 })).sort((a, b) => a.km - b.km);
    return `<h2>Essential services</h2><p class="sub">Near ${esc(N[S.d].n)} and along your route</p>
    <div class="emerg"><a href="tel:112"><b>112</b><span>Emergency</span></a><a href="tel:912"><b>912</b><span>Ambulance</span></a><a href="tel:113"><b>113</b><span>Traffic accidents</span></a><a href="tel:111"><b>111</b><span>Fire brigade</span></a></div>
    <p class="note">Numbers as published by the Government of Rwanda and Rwanda Biomedical Centre.</p>
    <div class="filters">${CATS.map((c) => `<button data-f="${esc(c)}" aria-pressed="${S.svcF == c}">${esc(c)}</button>`).join('')}</div>
    <div class="card list">${list.map(({ s, km, on }) => `<div class="li"><span class="ic" style="background:${SVC[s.c]}">${SVI[s.c]}</span><div class="b"><b>${esc(s.n)}</b><small>${esc(s.c)} · ${km.toFixed(1)} km from destination${on ? ' · near your route' : ''} · status not verified</small></div><button class="go" data-svc="${s.i}">Show</button></div>`).join('') || '<p class="note">None in this category.</p>'}</div>
    <p class="note">Hospital names are real; positions on this schematic are approximate. Other facilities are samples. Opening hours and status are not verified.</p>`;
  }
  let draft = { rainIn: null, rainMm: 14, traffic: 0, flood: false, blocked: [], accident: false };
  function pSim() {
    const d = draft; let h = `<h2>What-If journey simulator</h2><p class="sub">Test how changing conditions could affect this trip. Results are hypothetical, not predictions.</p>
    <div class="presets">${[['rain', 'Heavy rain starts in 30 min'], ['block', 'A major road is blocked'], ['traffic', 'Traffic increases by 40%'], ['flood', 'Flooding in vulnerable areas'], ['acc', 'An accident blocks the main route']].map(([k, l]) => `<button data-pre="${k}">${l}</button>`).join('')}</div>
    <div class="card" style="margin-top:12px"><form id="nx-simf">
    <div class="row2"><label class="f">Rain starts<select id="sRain"><option value="">No change (forecast)</option>${[0, 15, 30, 60, 90].map((m) => `<option value="${m}" ${d.rainIn === m ? 'selected' : ''}>${m ? 'In ' + m + ' min' : 'Now'}</option>`).join('')}</select></label>
    <label class="f">Intensity<select id="sMm">${[[5, 'Moderate · 5 mm/h'], [10, 'Heavy · 10 mm/h'], [14, 'Very heavy · 14 mm/h'], [25, 'Extreme · 25 mm/h']].map(([v, l]) => `<option value="${v}" ${d.rainMm == v ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>
    <label class="f">Traffic change: <span id="sTv">+${Math.round(d.traffic * 100)}%</span><input type="range" id="sT" min="0" max="100" step="10" value="${Math.round(d.traffic * 100)}"></label>
    <label class="tog"><input type="checkbox" id="sF" ${d.flood ? 'checked' : ''}> Flooding closes flood-prone roads</label>
    <label class="tog"><input type="checkbox" id="sA" ${d.accident ? 'checked' : ''}> Accident blocks the busiest road on the fastest route</label>
    <div class="f">Blocked roads<div>${d.blocked.length ? d.blocked.map((i) => `<span class="tag k-sim">${esc(E[i].name)}</span>`).join(' ') : '<span class="note">None</span>'}</div>
    <div class="row2"><select id="sB" aria-label="Add a blocked road"><option value="">Add a road…</option>${E.map((e) => `<option value="${e.i}">${esc(e.name)}</option>`).join('')}</select><button type="button" class="btn g" data-act="pickblock">Pick on map</button>${d.blocked.length ? '<button type="button" class="btn g" data-act="unblock">Clear roads</button>' : ''}</div></div>
    <div class="row2"><button class="btn" type="submit" style="background:var(--sim);color:#fff">Run simulation</button>${S.sim ? '<button type="button" class="btn g" data-act="clear">Clear scenario</button>' : ''}</div></form></div>`;
    if (S.sim) h += simResults();
    return h;
  }
  function simResults() {
    const B = BASE, R = S.sim.R; let h = `<h3>Results ${tag('sim')}</h3><div class="card simc"><table><thead><tr><th>Route</th><th>Now</th><th>Scenario</th><th>Change</th></tr></thead><tbody>`;
    for (const m of ['fast', 'safe', 'bal']) { const a = B[m], b = R[m]; h += `<tr><td style="color:${MC[m]};font-weight:600">${MN[m].replace(' route', '')}</td><td>${a ? fmtD(a.t) : '—'}</td><td>${b ? fmtD(b.t) : 'No route'}</td><td>${a && b ? `<span class="delta ${b.t > a.t + .5 ? 'up' : b.t < a.t - .5 ? 'dn' : ''}">${b.t >= a.t ? '+' : ''}${Math.round(b.t - a.t)} min</span>` : '—'}</td></tr>`; }
    h += '</tbody></table></div>';
    const ok = ['fast', 'safe', 'bal'].map((m) => R[m]).filter(Boolean);
    if (ok.length) {
      const f = R.fast || ok[0], best = (R.safe && R.safe.t <= f.t * 1.15) ? R.safe : (R.bal || f);
      h += `<div class="card"><b>Which route might be preferable:</b> under this scenario the <b style="color:${MC[best.mode]}">${MN[best.mode].toLowerCase()}</b> (${fmtD(best.t)}, arriving ${fmtT(best.arr)}) gives the best balance of time and exposure. <button class="btn g" data-act="selbest" data-m="${best.mode}" style="height:36px;margin-top:6px">Show it on the map</button></div>`;
    } else h += `<div class="card warn"><b>No route connects these places under this scenario.</b> Consider delaying the trip or choosing another destination.</div>`;
    h += `<h3>Roads that could be affected</h3><div class="card list">${S.sim.affList.length ? S.sim.affList.map((a) => `<div class="li"><div class="b"><b>${esc(a.e.name)}</b><small>${esc(a.why)}</small></div></div>`).join('') : '<p class="note">No significant changes on the road network.</p>'}</div>`;
    h += `<h3>Places needing extra caution</h3><div class="card list">${S.sim.caution.length ? S.sim.caution.map((z) => `<div class="li"><div class="b">${tag(z.src)}<b>${esc(z.n)}</b><small>${esc(z.why)}</small></div></div>`).join('') : '<p class="note">No known hazard zones on the scenario routes.</p>'}</div>
    <p class="note">The simulator combines the sample traffic pattern, the forecast and your scenario settings. It shows what could happen, not what will happen.</p>`; return h;
  }
  function runSim() {
    const scn = JSON.parse(JSON.stringify(draft)), R = plan(scn), bctx = BASE.ctx, ctx = R.ctx;
    const blk = new Set(scn.blocked); if (scn.accident && ctx.accE != null) blk.add(ctx.accE); if (scn.flood) HZ.filter((h) => h.flood).forEach((h) => h.e.forEach((i) => blk.add(i)));
    const affList = []; for (const e of E) {
      if (blk.has(e.i)) { affList.push({ e, why: scn.accident && ctx.accE === e.i ? 'Blocked by the simulated accident' : scn.blocked.includes(e.i) ? 'Blocked in this scenario' : 'Closed by simulated flooding' }); continue; }
      const t1 = 60, a = step(e, t1, bctx), b = step(e, t1, ctx), pc = (b.tm - a.tm) / a.tm; if (pc > .2) affList.push({ e, why: `About ${Math.round(pc * 100)}% slower${b.w.r > a.w.r ? ` with ${b.w.r} mm/h rain` : ''}`, pc });
    }
    affList.sort((a, b) => (b.pc || 9) - (a.pc || 9));
    const caution = []; for (const m of ['fast', 'safe', 'bal']) {
      const r = R[m]; if (!r) continue; for (const x of r.hz) {
        if (x.rep) continue; const z = x.h; if (caution.some((c) => c.n == z.n)) continue;
        caution.push({ n: z.n, src: x.w.src == 'sim' && z.rain ? 'sim' : z.src, why: z.rain && x.w.r >= 4 ? `Rain-sensitive zone with ${x.w.r} mm/h rain in this scenario` : z.d });
      }
    }
    S.sim = { R, aff: affList.map((a) => a.e.i), affList: affList.slice(0, 8), blk: [...blk], caution }; renderAll(true);
  }
  function pEyes() {
    const p = S.pick, nn = p ? nearestNode(p.x, p.y) : null;
    const list = [...REPS].sort((a, b) => b.time - a.time);
    return `<h2>Community Eyes</h2><p class="sub">Report what you see on the road. Reports stay labelled unverified until others confirm them.</p>
    <div class="card"><form id="nx-repf">
    <div class="row2"><label class="f">What did you see?<select id="rT">${['Road damage', 'Accident', 'Flooding', 'Landslide', 'Blocked road', 'Dangerous weather', 'Other hazard'].map((t) => `<option>${t}</option>`).join('')}</select></label>
    <label class="f">How serious?<select id="rS"><option value="1">Minor: slows traffic</option><option value="2" selected>Significant: one lane affected</option><option value="3">Severe: road unsafe or closed</option></select></label></div>
    <label class="f">Details<textarea id="rD" rows="3" maxlength="280" placeholder="What's happening, which lane, is it passable?" required></textarea></label>
    <div class="f">Location<div class="row2"><button type="button" class="btn g" data-act="pick">${p ? 'Change spot on map' : 'Pick spot on map'}</button><button type="button" class="btn g" data-act="pickdest">Use destination</button></div>
    <span class="note">${p ? `Near ${esc(nn.n)}` : 'No location chosen yet'}</span></div>
    <label class="f">Photo (optional)<input type="file" id="rP" accept="image/*"></label><img id="rPv" class="thumb" alt="" style="display:none">
    <button class="btn" type="submit" ${p ? '' : 'disabled style="opacity:.5"'}>Submit report</button></form>
    ${repMsg ? `<p class="note" style="margin:8px 0 0;color:var(--ink)">${esc(repMsg)}</p>` : ''}
    <p class="note" style="margin:8px 0 0">${shared ? 'Reports are shared with every MoveSmart user. Sign in to post or vote. Reports are not official confirmation.' : 'Reports are saved in this browser only.'}</p></div>
    <h3>Recent reports</h3>${list.map((r) => {
      const st = repStatus(r); return `<div class="card rep">${tag(st)} <b>${esc(r.type)}</b> <span class="note">· ${ago(r.time)} · near ${esc(nearestNode(r.x, r.y).n)} · severity ${r.sev}/3</span><p style="margin:4px 0 0">${esc(r.desc)}</p>${r.photo ? `<img class="thumb" src="${esc(r.photo)}" alt="Photo attached to the report">` : ''}
    <div class="acts"><button data-rc="${esc(r.id)}">Still there (${r.c})</button><button data-rd="${esc(r.id)}">Cleared (${r.dn})</button><button data-rs="${esc(r.id)}">Show on map</button></div></div>`;
    }).join('')}
    ${!shared && store.get('reports', null) ? '<button class="btn g" data-act="resetreps">Reset to sample reports</button>' : ''}`;
  }

  /* ---------- Panel events ---------- */
  let photo = null;
  async function vote(r, kind, b) {
    const vk = 'voted.' + r.id; if (store.get(vk, 0)) { b.textContent = 'Already voted'; return; }
    if (shared) {
      try { await opts.reports.vote(r.id, kind); } catch (e) {
        const msg = String(e && e.message || e);
        if (/sign in/i.test(msg)) { opts.onNeedSignIn && opts.onNeedSignIn(); b.textContent = 'Sign in to vote'; return; }
        if (/duplicate|already/i.test(msg)) { store.set(vk, 1); b.textContent = 'Already voted'; return; }
        b.textContent = 'Could not save'; return;
      }
    }
    kind == 'confirm' ? r.c++ : r.dn++; store.set(vk, 1); saveReps(); go(true);
  }
  panel.addEventListener('click', (ev) => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.sel) { S.sel = b.dataset.sel; renderAll(true); return; }
    if (b.dataset.f) { S.svcF = b.dataset.f; renderPanel(); return; }
    if (b.dataset.svc) { const s = SV[+b.dataset.svc]; S.layers.services = 1; syncChips(); centreOn(s.x, s.y); infoSvc(s); return; }
    if (b.dataset.pre) {
      const k = b.dataset.pre; draft = { rainIn: null, rainMm: 14, traffic: 0, flood: false, blocked: [], accident: false };
      if (k == 'rain') draft.rainIn = 30; if (k == 'traffic') draft.traffic = .4; if (k == 'flood') { draft.flood = true; draft.rainIn = 0; draft.rainMm = 14; } if (k == 'acc') draft.accident = true;
      if (k == 'block') { const r = BASE[S.sel] || BASE.fast; if (r) draft.blocked = [r.segs.reduce((a, s) => s.e.cls < a.e.cls || (s.e.cls == a.e.cls && s.e.c > a.e.c) ? s : a).e.i]; }
      runSim(); return;
    }
    if (b.dataset.rc || b.dataset.rd) { const r = REPS.find((x) => String(x.id) == (b.dataset.rc || b.dataset.rd)); if (r) vote(r, b.dataset.rc ? 'confirm' : 'cleared', b); return; }
    if (b.dataset.rs) { const r = REPS.find((x) => String(x.id) == b.dataset.rs); S.layers.community = 1; syncChips(); centreOn(r.x, r.y); infoRep(r); return; }
    const a = b.dataset.act;
    if (a == 'clear') { S.sim = null; renderAll(true); }
    if (a == 'preview') startPreview();
    if (a == 'whatif') setTab('sim');
    if (a == 'book' && opts.onBook) { const ll = (k) => ({ name: N[k].n, lat: NODE_LL[k][0], lng: NODE_LL[k][1] }); opts.onBook(ll(S.o), ll(S.d)); }
    if (a == 'copy') {
      const t = summary(), c = $('#nx-copied');
      const fallback = () => { c.innerHTML = `<textarea rows="7" style="width:100%;margin-top:6px" readonly>${esc(t)}</textarea>`; };
      try { navigator.clipboard.writeText(t).then(() => { c.textContent = 'Copied. Paste it into a message or note.'; }, fallback); } catch (e) { fallback(); }
    }
    if (a == 'selbest') { S.sel = b.dataset.m; S.tab = 'routes'; renderAll(true); }
    if (a == 'pick') { S.pickMode = true; setMode('2d'); svg.classList.add('pick'); const m = $('#nx-pickmsg'); m.textContent = 'Tap the map where you saw it'; m.classList.add('on'); }
    if (a == 'pickdest') { S.pick = { x: N[S.d].x + 6, y: N[S.d].y + 6 }; renderMap(); renderPanel(); }
    if (a == 'pickblock') { readDraft(); S.blockPick = true; setMode('2d'); svg.classList.add('pick'); const m = $('#nx-pickmsg'); m.textContent = 'Tap a road to block or unblock it'; m.classList.add('on'); }
    if (a == 'unblock') { readDraft(); draft.blocked = []; renderPanel(); }
    if (a == 'resetreps') { try { localStorage.removeItem('movesmart.planner.reports'); } catch (e) { /* ignore */ } REPS = SEED.map((r) => ({ ...r })); REPE = repEdges(); go(true); }
  });
  function readDraft() {
    const g = (id) => root.querySelector('#' + id); if (!g('sRain')) return;
    draft.rainIn = g('sRain').value === '' ? null : +g('sRain').value; draft.rainMm = +g('sMm').value; draft.traffic = +g('sT').value / 100; draft.flood = g('sF').checked; draft.accident = g('sA').checked;
  }
  panel.addEventListener('input', (ev) => { if (ev.target.id == 'sT') $('#sTv').textContent = '+' + ev.target.value + '%'; });
  panel.addEventListener('change', (ev) => {
    const t = ev.target;
    if (t.id == 'sB' && t.value !== '') { readDraft(); const i = +t.value; if (!draft.blocked.includes(i)) draft.blocked.push(i); renderPanel(); }
    if (t.id == 'rP' && t.files[0]) {
      const fr = new FileReader(); fr.onload = () => {
        const im = new Image(); im.onload = () => {
          const k = Math.min(1, 480 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = im.width * k; c.height = im.height * k;
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); photo = c.toDataURL('image/jpeg', .7); const v = $('#rPv'); v.src = photo; v.style.display = 'block'; v.alt = 'Selected photo preview';
        }; im.src = fr.result;
      }; fr.readAsDataURL(t.files[0]);
    }
  });
  panel.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (ev.target.id == 'nx-simf') { readDraft(); runSim(); }
    if (ev.target.id == 'nx-repf') {
      if (!S.pick) return; const desc = $('#rD').value.trim(); if (!desc) { $('#rD').focus(); return; }
      const rep = { type: $('#rT').value, desc, x: S.pick.x, y: S.pick.y, sev: +$('#rS').value, time: Date.now(), c: 0, dn: 0, photo };
      if (shared) {
        const btn = ev.target.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Submitting…';
        try { const saved = await opts.reports.add(rep); REPS.push(saved); repMsg = 'Report submitted. Thank you for keeping Kigali moving.'; }
        catch (e) {
          const msg = String(e && e.message || e); repMsg = /sign in/i.test(msg) ? 'Please sign in to post a report.' : 'Could not save the report. Please try again.';
          if (/sign in/i.test(msg) && opts.onNeedSignIn) opts.onNeedSignIn();
          renderPanel(); return;
        }
      } else { REPS.push({ id: 'u' + Date.now(), ...rep }); repMsg = 'Report saved.'; }
      photo = null; S.pick = null; saveReps(); go(true);
    }
  });
  function centreOn(x, y) { if (S.mode != '2d') setMode('2d'); vb.x = x - vb.w / 2; vb.y = y - vb.h / 2; renderMap(); }

  /* ---------- Trip bar & chrome ---------- */
  const optsHtml = Object.values(N).sort((a, b) => a.n.localeCompare(b.n)).map((n) => `<option value="${n.id}">${esc(n.n)}</option>`).join('');
  $('#nx-o').innerHTML = optsHtml; $('#nx-d').innerHTML = optsHtml;
  const setNow = () => { $('#nx-dep').value = fmtT(Date.now()); };
  function sync() { $('#nx-o').value = S.o; $('#nx-d').value = S.d; }
  $('#nx-trip').addEventListener('submit', (ev) => { ev.preventDefault(); S.o = $('#nx-o').value; S.d = $('#nx-d').value; go(); });
  $('#nx-swap').addEventListener('click', () => { [S.o, S.d] = [S.d, S.o]; sync(); go(); });
  $('#nx-now').addEventListener('click', () => { setNow(); go(); });
  function setTab(t) { S.tab = t; renderPanel(); panel.scrollTop = 0; }
  $('#nx-tabs').addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (!b) return; setTab(b.dataset.t); });
  function syncChips() { $$('.chip[data-l]').forEach((c) => c.setAttribute('aria-pressed', !!S.layers[c.dataset.l])); }
  $$('.chip[data-l]').forEach((c) => c.addEventListener('click', () => { S.layers[c.dataset.l] = S.layers[c.dataset.l] ? 0 : 1; syncChips(); renderMap(); build3Routes(); }));
  $('#nx-m2').addEventListener('click', () => setMode('2d')); $('#nx-m3').addEventListener('click', () => setMode('3d'));
  function setMode(m) {
    S.mode = m; $('#nx-m2').setAttribute('aria-pressed', m == '2d'); $('#nx-m3').setAttribute('aria-pressed', m == '3d');
    $('#nx-v3').classList.toggle('on', m == '3d'); $('#nx-zoom').style.display = m == '2d' ? '' : 'none'; $('#nx-legend').style.display = m == '2d' ? '' : 'none';
    if (m == '3d') { hideInfo(); T ? (build3Routes(), resize3()) : load3D(); } else renderMap();
  }
  function renderAll(anim) { renderMap(anim); renderPanel(); if (T) build3Routes(); }
  function go(keep) {
    if (disposed) return;
    if (S.o == S.d) { S.d = S.o == 'AIR' ? 'CBD' : 'AIR'; sync(); }
    store.set('trip', { o: S.o, d: S.d, sel: S.sel });
    BASE = plan(null); BASE.adv = advise(); if (P.on) { P.t = 0; P.play = 0; }
    if (S.sim && !keep) S.sim = null; else if (S.sim) { runSim(); return; }
    if (!keep) { fit(); hideInfo(); } renderAll(!keep); if (T && !keep) fitRoute3();
  }

  /* ---------- 3D view: real terrain map of Rwanda (MapLibre) ---------- */
  let T = null;
  const V3MSG = `<span class="tag k-live">Real terrain</span> Real 3D map of Kigali. The route is drawn as straight lines between places; traffic, weather and hazards are sample data. Right-drag to tilt and rotate.`;
  // Least-squares affine fit from schematic map units to real longitude/latitude, using the 20 places.
  const AFF = (() => {
    const ks = Object.keys(N), rows = ks.map((k) => [N[k].x, N[k].y, 1]);
    const solve3 = (A, b) => { // Gaussian elimination for a 3x3 system
      const M = A.map((r, i) => [...r, b[i]]);
      for (let c = 0; c < 3; c++) {
        let p = c; for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
        [M[c], M[p]] = [M[p], M[c]];
        for (let r = 0; r < 3; r++) if (r != c) { const f = M[r][c] / M[c][c]; for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k]; }
      }
      return [M[0][3] / M[0][0], M[1][3] / M[1][1], M[2][3] / M[2][2]];
    };
    const fit = (vals) => {
      const AtA = [0, 1, 2].map((i) => [0, 1, 2].map((j) => rows.reduce((s, r) => s + r[i] * r[j], 0)));
      const Atb = [0, 1, 2].map((i) => rows.reduce((s, r, n) => s + r[i] * vals[n], 0));
      return solve3(AtA, Atb);
    };
    return { lng: fit(ks.map((k) => NODE_LL[k][1])), lat: fit(ks.map((k) => NODE_LL[k][0])) };
  })();
  const toLL = (x, y) => [AFF.lng[0] * x + AFF.lng[1] * y + AFF.lng[2], AFF.lat[0] * x + AFF.lat[1] * y + AFF.lat[2]];
  const nodeLL = (k) => [NODE_LL[k][1], NODE_LL[k][0]];

  function load3D() {
    $('#nx-v3msg').textContent = 'Loading the 3D map…';
    import('../map/rwandaMap').then((M) => { if (disposed) return; try { init3D(M); } catch (e) { $('#nx-v3msg').textContent = 'The 3D map is not available on this device. The 2D map still works.'; } },
      () => { $('#nx-v3msg').textContent = 'The 3D map could not load. Check your internet connection; the 2D map still works.'; });
  }
  function init3D(M) {
    const box = $('#nx-v3map');
    const d = N[S.d];
    const map = M.createRwandaMap(box, {
      center: toLL(d.x, d.y), zoom: 12.3, pitch: 62, bearing: -25,
      onReady: (m) => {
        if (disposed) return;
        m.addSource('nx-routes', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        m.addLayer({ id: 'nx-routes-casing', type: 'line', source: 'nx-routes', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': ['case', ['get', 'sel'], 11, 7], 'line-opacity': 0.9 } });
        m.addLayer({ id: 'nx-routes', type: 'line', source: 'nx-routes', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['get', 'color'], 'line-width': ['case', ['get', 'sel'], 6, 3.5], 'line-opacity': ['case', ['get', 'sel'], 1, 0.7] } });
        m.addSource('nx-points', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        m.addLayer({ id: 'nx-points', type: 'circle', source: 'nx-points', paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 5, 15, 9], 'circle-color': ['get', 'color'], 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2 } });
        m.on('click', 'nx-points', (e) => {
          const f = e.features && e.features[0]; if (!f) return; const { kind, id } = f.properties;
          if (kind == 'h') infoHz(HZ.find((z) => z.id == id)); else if (kind == 's') infoSvc(SV[+id]); else if (kind == 'c') infoRep(REPS.find((r) => String(r.id) == String(id)));
        });
        m.on('mouseenter', 'nx-points', () => { m.getCanvas().style.cursor = 'pointer'; });
        m.on('mouseleave', 'nx-points', () => { m.getCanvas().style.cursor = ''; });
        T.ready = true; build3Routes(); fitRoute3(0);
      },
      onError: () => { $('#nx-v3msg').textContent = 'The 3D map could not load. Check your internet connection; the 2D map still works.'; },
    });
    T = { M, map, ready: false, marks: [] };
    $('#nx-v3msg').innerHTML = V3MSG;
    const ro3 = new ResizeObserver(() => map.resize()); ro3.observe(box); observers.push(ro3);
  }
  function resize3() { if (T) T.map.resize(); }
  function build3Routes() {
    if (!T || !T.ready) return; const { map, M } = T, R = cur(), L = S.layers;
    const colors = { fast: '#2563eb', safe: '#0e9f8e', bal: '#c2417a' };
    const feats = [];
    for (const m of ['fast', 'safe', 'bal']) {
      const r = R[m]; if (!r || (m != S.sel && same(r, R[S.sel]))) continue;
      feats.push({ type: 'Feature', properties: { mode: m, sel: m == S.sel, color: colors[m] }, geometry: { type: 'LineString', coordinates: r.nodes.map(nodeLL) } });
    }
    feats.sort((a, b) => (a.properties.sel ? 1 : 0) - (b.properties.sel ? 1 : 0));
    map.getSource('nx-routes').setData({ type: 'FeatureCollection', features: feats });
    const pts = [];
    if (L.hazards) for (const z of HZ) pts.push({ type: 'Feature', properties: { kind: 'h', id: z.id, color: { historical: '#b8860b', official: '#0b6b8a', verified: '#d62828' }[z.src] }, geometry: { type: 'Point', coordinates: toLL(z.x, z.y) } });
    if (L.services) for (const s of SV) pts.push({ type: 'Feature', properties: { kind: 's', id: s.i, color: SVC[s.c] }, geometry: { type: 'Point', coordinates: toLL(s.x, s.y) } });
    if (L.community) for (const r of REPS) { const st = repStatus(r); pts.push({ type: 'Feature', properties: { kind: 'c', id: String(r.id), color: st == 'confirmed' ? '#a34fbf' : st == 'cleared' ? '#8a958f' : '#8a5a9e' }, geometry: { type: 'Point', coordinates: toLL(r.x, r.y) } }); }
    map.getSource('nx-points').setData({ type: 'FeatureCollection', features: pts });
    for (const mk of T.marks) mk.remove(); T.marks = [];
    for (const k of [S.o, S.d]) {
      const el = M.makeMarkerEl({ badge: k == S.o ? 'A' : 'B', color: k == S.o ? '#102A43' : '#0078A8', size: 24, label: N[k].n, title: N[k].n });
      T.marks.push(new M.maplibregl.Marker({ element: el, anchor: 'bottom', opacityWhenCovered: '1' }).setLngLat(nodeLL(k)).addTo(map));
    }
  }
  function fitRoute3(duration = 1600) {
    if (!T || !T.ready) return; const R = cur(), r = R[S.sel] || R.fast; const pts = (r ? r.nodes : [S.o, S.d]).map(nodeLL);
    const lngs = pts.map((p) => p[0]), lats = pts.map((p) => p[1]);
    T.map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: 90, pitch: 60, bearing: -25, duration });
  }
  function focus3(n) { if (!T || !T.ready) return; T.map.flyTo({ center: nodeLL(n.id), zoom: 14.5, pitch: 65, essential: true }); }
  $('#nx-v3').addEventListener('click', (ev) => {
    const b = ev.target.closest('.v3ctl button'); if (!b || !T) return; const k = b.dataset.v;
    if (k == 'fo') focus3(N[S.o]); if (k == 'fd') focus3(N[S.d]); if (k == 'ov') fitRoute3();
  });

  /* ---------- Briefing, advisor, preparation ---------- */
  function advise() {
    const d0 = depMs(), out = []; for (let m = 0; m <= 180; m += 15) { const r = solve(S.o, S.d, 'bal', { dep: d0 + m * 6e4, now: Date.now(), scn: null }); if (r) out.push({ m, dep: d0 + m * 6e4, t: r.t, risk: r.risk, maxR: r.maxR, arr: r.arr, sc: r.t + r.risk * 5 }); }
    if (!out.length) return null; const best = out.reduce((a, b) => b.sc < a.sc - 1 ? b : a); return { now: out[0], best, out };
  }
  const rec = (R) => { const f = R.fast; if (!f) return R.bal || R.safe; return (R.safe && R.safe.t <= f.t * 1.15) ? R.safe : (R.bal || f); };
  function svcNear(r, cat) { let b = null, bd = 1e9; for (const s of SV) { if (s.c != cat) continue; const d = Math.min(...r.segs.map((g) => segDist(s.x, s.y, N[g.e.a].x, N[g.e.a].y, N[g.e.b].x, N[g.e.b].y))); if (d < bd) { bd = d; b = s; } } return b; }
  function prep(r) {
    const L = [], hz = r.hz.filter((x) => !x.rep), delay = Math.round(r.t - r.ff), ah = new Date(r.arr).getHours();
    if (r.maxR >= 4) L.push(`Rain of up to ${r.maxR} mm/h is forecast on the way: slow down on hill descents and keep a longer gap. On a moto, carry a rain cover.`);
    if (hz.some((x) => x.h.flood) && r.maxR >= 2) L.push('Never drive into water covering the road in flood-prone valleys. Turn back and choose another route.');
    if (hz.some((x) => x.h.kind == 'Landslide-prone area') && r.maxR >= 2) L.push('Watch for fallen soil or rocks on the steep Kimisagara slopes.');
    if (delay >= 10) L.push(`Allow about ${Math.ceil(delay / 5) * 5} extra minutes for traffic.`);
    if (r.t >= 40) { const f = svcNear(r, 'Fuel'); L.push(`Long trip in slow traffic: check fuel if you drive${f ? ` (nearest on the way: ${esc(f.n.replace(' (sample)', ''))})` : ''}.`); }
    if (ah >= 19 || ah < 6) L.push('You arrive after dark: wear something visible and watch for pedestrians and motorbikes on unlit roads.');
    if (S.d == 'AIR') L.push('Flying? Add the check-in buffer your airline asks for on top of this estimate.');
    L.push('Keep 112 (emergency) and 912 (ambulance) handy.'); return L;
  }
  function brief(R) {
    const r = R[S.sel] || R.fast; if (!r) return ''; const n = N[S.d], w = wxAt(n.x, n.y, r.arr, R.ctx), best = rec(R), A = BASE.adv, hz = r.hz;
    const avoided = [...new Set(['fast', 'safe', 'bal'].flatMap((m) => R[m] ? R[m].hz : []).filter((x) => !x.rep && !hz.some((y) => y.h === x.h)).map((x) => x.h.n))];
    let advT = ''; if (A) {
      const gain = Math.round(A.now.t - A.best.t);
      advT = A.best.m && gain >= 3 ? `Leaving at <b>${fmtT(A.best.dep)}</b> instead would take about ${fmtD(A.best.t)} (${gain} min less)${A.best.maxR < A.now.maxR - 1 ? ' and miss the heaviest rain' : ''}.` : A.best.m ? `Leaving at ${fmtT(A.best.dep)} would lower exposure slightly, for a similar time.` : 'Leaving now is about as good as it gets in the next three hours.';
      const mx = Math.max(...A.out.map((o) => o.t));
      advT += `<div class="adv" role="img" aria-label="Balanced route travel time for departures over the next three hours">${A.out.map((o) => `<span class="${o === A.best ? 'best' : o === A.now ? 'now' : ''}" style="height:${Math.round(o.t / mx * 100)}%" title="${fmtT(o.dep)} · ${fmtD(o.t)}"></span>`).join('')}</div><div class="note">Trip time if you leave every 15 min from ${fmtT(A.now.dep)} to ${fmtT(A.out[A.out.length - 1].dep)}. Dark is your time, blue is the best.</div>`;
    }
    return `<div class="card brief"><dl>
    <dt>Where am I going?</dt><dd><b>${esc(n.n)}</b>, ${r.km.toFixed(1)} km away. You arrive around <b>${fmtT(r.arr)}</b>, with ${rainWord(w.r)} and about ${w.t}°C ${tag(w.src)}</dd>
    <dt>What will I meet on the way?</dt><dd><span class="cls c-${r.worst}">${CLSN[r.worst]}</span> at worst, adding about ${Math.round(r.t - r.ff)} min. ${r.maxR > 0.3 ? `Rain up to ${r.maxR} mm/h, visibility down to about ${Math.max(1, (10 - r.maxR * .9)).toFixed(1)} km.` : 'Dry roads expected.'}</dd>
    <dt>What dangers or disruptions?</dt><dd>${hz.length ? hz.map((x) => `${tag(x.src)} ${esc(x.h.n || x.h.type)}`).join('<br>') : 'No known hazards on this route.'}${avoided.length ? `<div class="note" style="margin-top:4px">This route avoids: ${avoided.map(esc).join(', ')}.</div>` : ''}</dd>
    <dt>Which route is the best balance?</dt><dd>The <b style="color:${MC[best.mode]}">${MN[best.mode].toLowerCase()}</b>, ${fmtD(best.t)}.${best.mode != S.sel ? ` <button class="btn g" data-sel="${best.mode}" style="height:34px;font-size:13px;padding:0 10px">Use it</button>` : ' You have it selected.'}</dd>
    <dt>What could happen, and how should I prepare?</dt><dd>${advT}<ul>${prep(r).map((t) => `<li>${t}</li>`).join('')}</ul></dd></dl>
    <div class="bact">${opts.onBook ? '<button class="btn" data-act="book">Book this trip</button>' : ''}<button class="btn g" data-act="preview">▶ Preview journey</button><button class="btn g" data-act="copy">Copy trip summary</button><button class="btn g" data-act="whatif">Try a What-If</button></div><div id="nx-copied" class="note"></div></div>`;
  }
  function summary() {
    const R = BASE, r = R[S.sel] || R.fast; if (!r) return ''; const best = rec(R);
    return [`MoveSmart trip: ${N[S.o].n} to ${N[S.d].n}`, `Leave ${fmtT(R.ctx.dep)}, arrive about ${fmtT(r.arr)} (${fmtD(r.t)}, ${r.km.toFixed(1)} km) via ${MN[S.sel].toLowerCase()}`,
      `Route: ${roadsOf(r).join(' > ')}`, `Traffic: ${CLSN[r.worst].toLowerCase()} at worst, about +${Math.round(r.t - r.ff)} min`, `Weather: ${r.maxR > 0.3 ? 'rain up to ' + r.maxR + ' mm/h' : 'dry'} (forecast)`,
      r.hz.length ? 'Watch for: ' + r.hz.map((x) => (x.h.n || x.h.type) + ' [' + TAG[x.src] + ']').join('; ') : 'No known hazards on route',
      `Best balance: ${MN[best.mode].toLowerCase()}, ${fmtD(best.t)}`, 'Emergency 112 · Ambulance 912 · Traffic accidents 113', 'Estimates only; no route is guaranteed safe. (Sample data.)'].join('\n');
  }
  const TAGINFO = { live: 'Current readings from traffic feeds or sensors.', forecast: 'Weather predicted for the time you pass.', historical: 'Past patterns. A risk zone, not proof the hazard is happening now.', official: 'Notices from authorities, such as road works or closures.', verified: 'Incidents confirmed by a trusted source.', unverified: 'One or two community reports, not yet confirmed.', confirmed: 'Confirmed by three or more people, still not official.', sim: 'Hypothetical What-If results, not a forecast.', model: 'Generated visuals, not a capture of the real place.' };

  /* ---------- Journey preview ---------- */
  const P = { on: 0, t: 0, play: 0, last: 0 };
  function posAt(r, t) { for (let i = 0; i < r.segs.length; i++) { const s = r.segs[i]; if (t <= s.at + s.tm || i == r.segs.length - 1) { const f = Math.max(0, Math.min(1, (t - s.at) / s.tm)), A = N[r.nodes[i]], B = N[r.nodes[i + 1]]; return { x: A.x + (B.x - A.x) * f, y: A.y + (B.y - A.y) * f, s }; } } return null; }
  function updateMarker() {
    const g = root.querySelector('#nx-pm'), R = cur(), r = R[S.sel]; if (!g) return; if (!P.on || !r) { g.style.display = 'none'; return; }
    const p = posAt(r, Math.min(P.t, r.t)); if (!p) return; const u = upp(); g.style.display = '';
    g.innerHTML = `<circle r="${u * 16}" fill="var(--focus)" opacity=".25"/><circle r="${u * 8}" fill="var(--focus)" stroke="#fff" stroke-width="${u * 2.5}"/>`; g.setAttribute('transform', `translate(${p.x} ${p.y})`);
    $('#nx-ps').value = Math.round(P.t / r.t * 1000); $('#nx-pp').textContent = P.play ? '❚❚' : '▶';
    const ms = R.ctx.dep + P.t * 6e4, w = wxAt(p.x, p.y, ms, R.ctx), nx = r.hz.find((x) => x.at >= p.s.at);
    $('#nx-pr').innerHTML = `<b>${fmtT(ms)}</b> · ${esc(p.s.e.name)} · <span class="cls c-${p.s.cls}">${CLSN[p.s.cls]}</span> · ${w.r > 0.3 ? w.r + ' mm/h rain' : 'dry'} ${tag(w.src)}<br>${P.t >= r.t - .01 ? `Arrived at ${esc(N[S.d].n)} after ${fmtD(r.t)}.` : nx ? `${nx.at <= P.t ? 'Now passing' : 'In about ' + Math.max(1, Math.round(nx.at - P.t)) + ' min'}: ${esc(nx.h.n || nx.h.type)} ${tag(nx.src)}` : `${fmtD(r.t - P.t)} to go, no known hazards ahead.`}`;
  }
  function tick(ts) { if (!P.play || disposed) return; const r = cur()[S.sel]; if (!r) { P.play = 0; return; } const dt = Math.min(.1, (ts - (P.last || ts)) / 1000); P.last = ts; P.t += dt * r.t / 20; if (P.t >= r.t) { P.t = r.t; P.play = 0; } updateMarker(); if (P.play) requestAnimationFrame(tick); }
  function startPreview() { if (!cur()[S.sel]) return; setMode('2d'); hideInfo(); P.on = 1; P.t = 0; P.play = 1; P.last = 0; $('#nx-play').classList.add('on'); $('#nx-legend').style.visibility = 'hidden'; fit(); renderMap(); requestAnimationFrame(tick); }
  function stopPreview() { P.on = 0; P.play = 0; $('#nx-play').classList.remove('on'); $('#nx-legend').style.visibility = ''; updateMarker(); }
  $('#nx-pvb').addEventListener('click', startPreview);
  $('#nx-pp').addEventListener('click', () => { const r = cur()[S.sel]; if (!r) return; if (P.t >= r.t) P.t = 0; P.play = !P.play; P.last = 0; updateMarker(); if (P.play) requestAnimationFrame(tick); });
  $('#nx-ps').addEventListener('input', (e) => { const r = cur()[S.sel]; if (!r) return; P.play = 0; P.t = e.target.value / 1000 * r.t; updateMarker(); });
  $('#nx-px').addEventListener('click', stopPreview);

  /* ---------- Start ---------- */
  setNow(); sync(); BASE = plan(null); BASE.adv = advise();
  requestAnimationFrame(() => { if (!disposed) { fit(); renderAll(true); } });
  if (shared) {
    opts.reports.list().then((rows) => { if (disposed || !rows) return; REPS = rows; REPE = repEdges(); go(true); }, () => { /* keep sample reports */ });
  }

  return () => {
    disposed = true; P.play = 0;
    observers.forEach((o) => o.disconnect());
    if (T) { try { T.map.remove(); } catch (e) { /* ignore */ } T = null; }
    root.innerHTML = '';
  };
}
