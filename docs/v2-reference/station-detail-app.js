// station-detail-app.js — Standalone Station Detail Page Logic
'use strict';

/* ── 全局状态 ─────────────────────────────────────────────────── */
let currentDetailStation = null;
let currentDetailTab = 'overview';
let profitChartInstance = null;
let profitChartInstance2 = null;
let currentProfitPeriod = 'day';
let detailResizeHandler = null;
let histSocPowerChart = null;
let histEnergyChart   = null;
let currentEnergyPeriod = 'day';
let _histPicker = null;
let _energyPicker = null;
let _energyCustomPickerPopup = null;
let stationData = [];

/* ── URL 参数解析 ─────────────────────────────────────────────── */
function getUrlParam(key) {
    return new URLSearchParams(window.location.search).get(key);
}

/* ── 辅助工具 ─────────────────────────────────────────────────── */
function t(key) {
    if (typeof i18n !== 'undefined' && i18n.getText) {
        const text = i18n.getText(key);
        return text !== key ? text : '';
    }
    return '';
}

function formatNumber(num) {
    return parseFloat(num).toLocaleString('en-AU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

function weightedRandom(items, weights) {
    const total = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
        r -= weights[i];
        if (r <= 0) return items[i];
    }
    return items[items.length - 1];
}

function weightedRandomIndex(weights) {
    const total = weights.reduce((s, w) => s + w, 0);
    let r = Math.random() * total;
    for (let i = 0; i < weights.length; i++) {
        r -= weights[i];
        if (r <= 0) return i;
    }
    return weights.length - 1;
}

function makePrng(seed) {
    let s = seed;
    return (mn, mx) => {
        s = (s * 9301 + 49297) % 233280;
        return +(mn + (s / 233280) * (mx - mn)).toFixed(2);
    };
}

/* ── 数据生成 ─────────────────────────────────────────────────── */
function generateMockData(count) {
    const brands = ['Tesla', 'Fluence', 'BYD', 'Samsung SDI', 'LG Energy'];
    const models = ['Megapack 2', 'Gridstack', 'Cube Pro', 'E3-R', 'RESU Prime'];
    const regions = [
        { name: 'NSW', code: 'nsw', lat: -33.8688, lng: 151.2093 },
        { name: 'VIC', code: 'vic', lat: -37.8136, lng: 144.9631 },
        { name: 'QLD', code: 'qld', lat: -27.4705, lng: 153.0260 },
        { name: 'SA',  code: 'sa',  lat: -34.9285, lng: 138.6007 },
        { name: 'WA',  code: 'wa',  lat: -31.9505, lng: 115.8605 },
        { name: 'TAS', code: 'tas', lat: -42.8821, lng: 147.3272 },
        { name: 'ACT', code: 'act', lat: -35.2809, lng: 149.1300 }
    ];
    const commStatuses = ['online', 'offline'];
    const commWeights  = [0.92, 0.08];
    const runStatuses  = ['charging', 'discharging', 'idle'];
    const runWeights   = [0.44, 0.39, 0.17];
    const runModes     = ['FCAS响应', '套利模式', 'VPP调度', '备用待命', '维护模式'];
    const stationNames = [
        'Hornsdale Power Reserve', 'Victorian Big Battery', 'Wandoan BESS',
        'Torrens Island BESS', 'Broken Hill Solar Farm', 'Darlington Point',
        'Capital Battery', 'Kwinana BESS', 'Ballarat Terminal Station',
        'Lake Bonney', 'Gannawarra Energy Storage', 'Lincoln Gap Wind Farm',
        'Bulgana Green Power Hub', 'Kennedy Energy Park', 'Collie Battery',
        'Waratah Super Battery', 'Snowy 2.0 BESS', 'Yadlamalka Energy'
    ];
    const data = [];
    for (let i = 1; i <= count; i++) {
        if (i === 2) continue;
        const commStatus = weightedRandom(commStatuses, commWeights);
        const runStatus  = commStatus === 'online' ? weightedRandom(runStatuses, runWeights) : 'idle';
        const region     = regions[Math.floor(Math.random() * regions.length)];
        const soc        = Math.floor(Math.random() * 100);
        const capacity   = 10 + Math.floor(Math.random() * 40);
        const power      = runStatus === 'charging' ? Math.floor(Math.random() * capacity) :
                           runStatus === 'discharging' ? -Math.floor(Math.random() * capacity) : 0;
        const todayProfit = (Math.random() * 45000 + 5000 - 10000).toFixed(2);
        const totalProfit = (Math.random() * 5000000 + 1000000).toFixed(2);
        data.push({
            id: `AU${String(i).padStart(4, '0')}`,
            name: i <= stationNames.length ? stationNames[i-1] : `BESS Site ${String.fromCharCode(65 + Math.floor((i-1) / 26))}${((i-1) % 26) + 1}`,
            region: region.name, regionCode: region.code,
            brand: brands[Math.floor(Math.random() * brands.length)],
            model: models[Math.floor(Math.random() * models.length)],
            commStatus, runStatus,
            status: commStatus === 'offline' ? 'offline' : runStatus,
            runMode: runModes[Math.floor(Math.random() * runModes.length)],
            autoMode: Math.random() > 0.5,
            soc, power, capacity,
            todayProfit, totalProfit,
            lat: region.lat + (Math.random() - 0.5) * 4,
            lng: region.lng + (Math.random() - 0.5) * 4,
            nemPrice: (30 + Math.random() * 120).toFixed(2),
            fcasEnabled: Math.random() > 0.3
        });
    }
    return data;
}

/* ── 状态徽章 ─────────────────────────────────────────────────── */
function getStatusBadge(status, autoMode) {
    autoMode = autoMode || false;
    const statusMap = {
        'online':      { i18nKey: 'station.status_online',      class: 'online' },
        'offline':     { i18nKey: 'station.status_offline',     class: 'offline' },
        'charging':    { i18nKey: 'station.status_charging',    class: 'charging' },
        'discharging': { i18nKey: 'station.status_discharging', class: 'discharging' },
        'idle':        { i18nKey: 'station.status_idle',        class: 'idle' }
    };
    const s = statusMap[status] || statusMap['idle'];
    const getText = (k, f) => window.i18n ? window.i18n.getText(k) : f;
    const modeIcon  = autoMode ? '🤖' : '👤';
    const modeText  = autoMode ? getText('station.mode_auto', 'Auto') : getText('station.mode_manual', 'Manual');
    const modeTitle = autoMode ? getText('station.mode_auto_title', 'Auto Mode') : getText('station.mode_manual_title', 'Manual Mode');
    const modeClass = autoMode ? 'auto' : 'manual';
    return `<span class="status-badge ${s.class}"><span class="mode-icon ${modeClass}" title="${modeTitle}">${modeIcon} ${modeText}</span><span class="status-dot"></span><span data-i18n="${s.i18nKey}"></span></span>`;
}

/* ── 返回列表 ─────────────────────────────────────────────────── */
function backToList() {
    window.location.href = 'station.html';
}

/* ── 运行数据（Equipment Tab）────────────────────────────────── */
function generateRunningDataHTML(station) {
    const isOffline = station.commStatus !== 'online';
    const idNum = parseInt(station.id.replace(/\D/g, '')) || 1;
    const pw = station.power || 0;

    const dcV  = 750 + (idNum * 17 % 100);
    const dcI  = pw !== 0 ? (Math.abs(pw) * 1000 / dcV).toFixed(2) : '0.00';
    const battTemp = (28 + (idNum * 3 % 8)).toFixed(1);
    const soh  = (92 + (idNum % 7) + 0.1 * (idNum % 5)).toFixed(1);
    const cycles = 365 + (idNum * 23 % 800);
    const dailyCharge    = pw > 0 ? (pw * (6 + idNum % 4)).toFixed(1) : ((idNum * 7 % 30) + 5).toFixed(1);
    const dailyDischarge = pw < 0 ? (Math.abs(pw) * (6 + idNum % 4)).toFixed(1) : ((idNum * 11 % 40) + 10).toFixed(1);
    const freq = (49.95 + (idNum * 3 % 10) / 100).toFixed(2);
    const acV  = (33.0 + (idNum * 7 % 10) / 10).toFixed(1);
    const pf   = (0.97 + (idNum % 3) * 0.01).toFixed(2);
    const alarmCount = idNum * 3 % 5;

    const pcsEfficiency = (96.5 + (idNum % 5) * 0.3).toFixed(1);
    const pcsTemp = (42 + (idNum * 3 % 15)).toFixed(1);
    const acI = pw !== 0 ? (Math.abs(pw) * 1000 / (Math.sqrt(3) * parseFloat(acV))).toFixed(1) : '0.0';
    const pcsStatusZh = isOffline ? '离线' : pw !== 0 ? '运行中' : '待机';
    const pcsStatusEn = isOffline ? 'Offline' : pw !== 0 ? 'Running' : 'Standby';
    const pcsStatusColor = isOffline ? '#ff6b6b' : pw !== 0 ? '#00ff88' : '#ffd93d';

    const maxCellV = (3.62 + (idNum * 7 % 30) / 1000).toFixed(3);
    const minCellV = (3.58 - (idNum * 3 % 20) / 1000).toFixed(3);
    const maxCellT = (32 + (idNum * 5 % 8)).toFixed(1);
    const minCellT = (26 - (idNum * 3 % 5)).toFixed(1);
    const insulation = (500 + (idNum * 37 % 300));
    const bmsStatusZh = isOffline ? '离线' : '正常';
    const bmsStatusEn = isOffline ? 'Offline' : 'Normal';
    const bmsStatusColor = isOffline ? '#ff6b6b' : '#00ff88';

    const coolantT = (28 + (idNum * 5 % 10)).toFixed(1);
    const fanRpm   = pw !== 0 ? (1200 + (idNum * 47 % 800)) : (300 + (idNum * 13 % 200));
    const envT     = (22 + (idNum * 3 % 12)).toFixed(1);
    const coolingModeZh = pw !== 0 ? '主动冷却' : '自然对流';
    const coolingModeEn = pw !== 0 ? 'Active Cooling' : 'Natural Conv.';

    const bessSign  = pw > 0 ? '+' : '';
    const bessColor = pw > 0 ? '#3b82f6' : pw < 0 ? '#ffd93d' : 'rgba(255,255,255,0.6)';
    const gridColor = pw < 0 ? '#00ff88' : pw > 0 ? '#3b82f6' : 'rgba(255,255,255,0.6)';
    const connColor = station.commStatus === 'online' ? '#00ff88' : '#ff6b6b';
    const alarmColor = alarmCount > 0 ? '#ffd93d' : '#00ff88';
    const connZh = station.commStatus === 'online' ? '● 在线' : '○ 离线';
    const connEn = station.commStatus === 'online' ? '● Online' : '○ Offline';

    const V = (v) => isOffline ? '--' : v;

    const bessStats = [
        { i18n: 'station.rd_realtime_power', value: V(`<span style="color:${bessColor};font-weight:600">${bessSign}${pw} MW</span>`) },
        { i18n: 'station.rd_soc',            value: V(`${station.soc}%`) },
        { i18n: 'station.rd_soh',            value: V(`${soh}%`) },
        { i18n: 'station.rd_dc_voltage',     value: V(`${dcV} V`) },
        { i18n: 'station.rd_dc_current',     value: V(`${dcI} kA`) },
        { i18n: 'station.rd_batt_temp',      value: V(`${battTemp} °C`) },
        { i18n: 'station.rd_cycles',         value: V(cycles) },
        { i18n: 'station.rd_daily_charge',   value: V(`${dailyCharge} MWh`) },
        { i18n: 'station.rd_daily_discharge',value: V(`${dailyDischarge} MWh`) },
    ];
    const pcsStats = [
        { i18n: 'station.rd_pcs_status',    value: `<span style="color:${pcsStatusColor}" data-text-zh="${pcsStatusZh}" data-text-en="${pcsStatusEn}"></span>` },
        { i18n: 'station.rd_pcs_ac_v',      value: V(`${acV} kV`) },
        { i18n: 'station.rd_pcs_ac_i',      value: V(`${acI} A`) },
        { i18n: 'station.rd_frequency',     value: V(`${freq} Hz`) },
        { i18n: 'station.rd_power_factor',  value: V(pf) },
        { i18n: 'station.rd_pcs_efficiency',value: V(`${pcsEfficiency}%`) },
        { i18n: 'station.rd_pcs_temp',      value: V(`${pcsTemp} °C`) },
    ];
    const bmsStats = [
        { i18n: 'station.rd_bms_status',    value: `<span style="color:${bmsStatusColor}" data-text-zh="${bmsStatusZh}" data-text-en="${bmsStatusEn}"></span>` },
        { i18n: 'station.rd_bms_max_cell_v',value: V(`${maxCellV} V`) },
        { i18n: 'station.rd_bms_min_cell_v',value: V(`${minCellV} V`) },
        { i18n: 'station.rd_bms_max_cell_t',value: V(`${maxCellT} °C`) },
        { i18n: 'station.rd_bms_min_cell_t',value: V(`${minCellT} °C`) },
        { i18n: 'station.rd_bms_insulation', value: V(`${insulation} MΩ`) },
    ];
    const thermalStats = [
        { i18n: 'station.rd_thermal_mode',      value: V(`<span data-text-zh="${coolingModeZh}" data-text-en="${coolingModeEn}"></span>`) },
        { i18n: 'station.rd_thermal_coolant_t', value: V(`${coolantT} °C`) },
        { i18n: 'station.rd_thermal_fan',       value: V(`${fanRpm} RPM`) },
        { i18n: 'station.rd_thermal_env_t',     value: V(`${envT} °C`) },
    ];
    const gridStats = [
        { i18n: 'station.rd_grid_power',    value: V(`<span style="color:${gridColor};font-weight:600">${bessSign}${pw} MW</span>`) },
        { i18n: 'station.rd_frequency',     value: V(`${freq} Hz`) },
        { i18n: 'station.rd_ac_voltage',    value: V(`${acV} kV`) },
        { i18n: 'station.rd_power_factor',  value: V(pf) },
        { i18n: 'station.rd_daily_export',  value: V(`${dailyDischarge} MWh`) },
        { i18n: 'station.rd_daily_import',  value: V(`${dailyCharge} MWh`) },
    ];
    const sysStats = [
        { i18n: 'station.rd_run_mode',    value: V(station.runMode) },
        { i18n: 'station.rd_conn_status', value: `<span style="color:${connColor}" data-text-zh="${connZh}" data-text-en="${connEn}"></span>` },
        { i18n: 'station.rd_alarm_count', value: `<span style="color:${alarmColor}">${alarmCount}</span>` },
    ];

    function renderCard(titleI18n, icon, stats) {
        return `
        <div class="equipment-card">
            <div class="equipment-card-header">
                <div class="equipment-name">${icon} <span data-i18n="${titleI18n}"></span></div>
            </div>
            <div class="equipment-stats">
                ${stats.map(s => `
                <div class="equipment-stat-row">
                    <span class="equipment-stat-label" data-i18n="${s.i18n}"></span>
                    <span class="equipment-stat-value">${s.value}</span>
                </div>`).join('')}
            </div>
        </div>`;
    }

    return `
    <div class="equipment-grid">
        ${renderCard('station.rd_bess',       '🔋', bessStats)}
        ${renderCard('station.rd_pcs',        '⚡', pcsStats)}
        ${renderCard('station.rd_bms',        '🧩', bmsStats)}
        ${renderCard('station.rd_thermal',    '🌡️', thermalStats)}
        ${renderCard('station.rd_grid',       '🔌', gridStats)}
        ${renderCard('station.rd_sys_status', '📊', sysStats)}
    </div>`;
}

/* ── 调度记录 Tab ─────────────────────────────────────────────── */
function generateDailyScheduleRows(station) {
    const rows = [];
    const now = new Date();
    for (let i = 0; i < 30; i++) {
        const d = new Date(now.getTime() - i * 86400000);
        const dateStr = d.toLocaleDateString('en-AU', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const hasDispatch = Math.random() > 0.15;
        const chargeAmt    = hasDispatch ? (Math.random() * station.capacity * 3).toFixed(2) : '0.00';
        const dischargeAmt = hasDispatch ? (Math.random() * station.capacity * 3).toFixed(2) : '0.00';
        const dispatchBadge = hasDispatch
            ? `<span class="status-badge online"><span class="status-dot"></span><span data-i18n="station.dispatch_yes"></span></span>`
            : `<span class="status-badge offline"><span class="status-dot"></span><span data-i18n="station.dispatch_no"></span></span>`;
        const detailBtn = hasDispatch
            ? `<button class="table-action-btn" onclick="showScheduleDetail('${dateStr}','${station.id}')" data-i18n="station.dispatch_detailBtn"></button>`
            : `<button class="table-action-btn" disabled style="opacity:0.35;cursor:not-allowed;" data-i18n="station.dispatch_detailBtn"></button>`;
        rows.push(`<tr>
            <td style="white-space:nowrap">${dateStr}</td>
            <td>${dispatchBadge}</td>
            <td style="color:#3b82f6;font-weight:500">${chargeAmt}</td>
            <td style="color:#f59e0b;font-weight:500">${dischargeAmt}</td>
            <td>${detailBtn}</td>
        </tr>`);
    }
    return rows.join('');
}

function generateDayDetailRows(station) {
    const actions = [
        { i18n: 'station.dispatch_charge' }, { i18n: 'station.dispatch_discharge' },
        { i18n: 'station.dispatch_fcasResponse' }, { i18n: 'station.dispatch_peakShaving' },
        { i18n: 'station.dispatch_vppDispatch' }, { i18n: 'station.dispatch_emergencyStop' }
    ];
    const sources = [
        { i18n: 'station.dispatch_src_aemo' }, { i18n: 'station.dispatch_src_ems' },
        { i18n: 'station.dispatch_src_manual' }, { i18n: 'station.dispatch_src_vpp' }
    ];
    const operators = ['System', 'J.Smith', 'M.Chen', 'A.Kumar', 'Auto-FCAS', 'Auto-Arb'];
    const results = [
        { i18n: 'station.dispatch_success', cls: 'online' },
        { i18n: 'station.dispatch_completed', cls: 'online' },
        { i18n: 'station.dispatch_partial', cls: 'charging' },
        { i18n: 'station.dispatch_failed', cls: 'offline' }
    ];
    const resultWeights = [0.5, 0.3, 0.12, 0.08];
    const rows = [];
    const count = Math.floor(4 + Math.random() * 8);
    for (let i = 0; i < count; i++) {
        const hour = Math.floor(Math.random() * 24);
        const min  = Math.floor(Math.random() * 60);
        const timeStr = `${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
        const action   = actions[Math.floor(Math.random() * actions.length)];
        const source   = sources[Math.floor(Math.random() * sources.length)];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        const power    = (Math.random() * station.capacity).toFixed(1);
        const duration = `${Math.floor(5 + Math.random() * 55)} min`;
        const result   = results[weightedRandomIndex(resultWeights)];
        rows.push(`<tr>
            <td>${timeStr}</td>
            <td><span data-i18n="${action.i18n}"></span></td>
            <td><span data-i18n="${source.i18n}"></span></td>
            <td>${operator}</td>
            <td>${power} MW</td>
            <td>${duration}</td>
            <td><span class="status-badge ${result.cls}"><span class="status-dot"></span><span data-i18n="${result.i18n}"></span></span></td>
        </tr>`);
    }
    return rows.join('');
}

function showScheduleDetail(dateStr, stationId) {
    const station = stationData.find(s => s.id === stationId) || currentDetailStation;
    if (!station) return;
    // 跳转到独立调度详情页（与 operation-log-detail.html 同风格）
    const params = new URLSearchParams({
        id:          station.id,
        date:        dateStr,
        stationName: station.name
    });
    window.location.href = 'dispatch-detail.html?' + params.toString();
}

/* ── 获利 Tab ─────────────────────────────────────────────────── */
function generateProfitSummaryCards(station) {
    const todayProfit  = parseFloat(station.todayProfit);
    const totalProfit  = parseFloat(station.totalProfit);
    const weekProfit   = todayProfit * (5 + Math.random() * 2);
    const monthProfit  = todayProfit * (20 + Math.random() * 10);
    const avgDailyProfit = monthProfit / 30;
    const roi = ((totalProfit / (station.capacity * 1500000)) * 100).toFixed(1);
    const cards = [
        { labelI18n: 'station.profit_today',    value: `$${formatNumber(todayProfit)}`,              cls: todayProfit >= 0 ? 'positive' : 'negative' },
        { labelI18n: 'station.profit_thisWeek', value: `$${formatNumber(weekProfit.toFixed(0))}`,    cls: weekProfit >= 0 ? 'positive' : 'negative' },
        { labelI18n: 'station.profit_thisMonth',value: `$${formatNumber(monthProfit.toFixed(0))}`,   cls: monthProfit >= 0 ? 'positive' : 'negative' },
        { labelI18n: 'station.profit_total',    value: `$${formatNumber(totalProfit)}`,              cls: 'positive' },
        { labelI18n: 'station.profit_avgDaily', value: `$${formatNumber(avgDailyProfit.toFixed(0))}`,cls: avgDailyProfit >= 0 ? 'positive' : 'negative' },
        { labelI18n: 'station.profit_roi',      value: `${roi}%`,                                    cls: 'positive' }
    ];
    return cards.map(c => `
        <div class="profit-summary-card">
            <div class="profit-summary-label" data-i18n="${c.labelI18n}"></div>
            <div class="profit-summary-value ${c.cls}">${c.value}</div>
        </div>
    `).join('');
}

function renderProfitChart(period) {
    period = period || 'daily';
    const chartDom = document.getElementById('detailProfitChart');
    if (!chartDom) return;
    if (profitChartInstance) profitChartInstance.dispose();
    profitChartInstance = echarts.init(chartDom);
    let xData, seriesData;
    if (period === 'daily') {
        xData = Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 29 + i); return `${d.getMonth()+1}/${d.getDate()}`; });
        seriesData = xData.map(() => Math.round(Math.random() * 45000 + 5000 - 10000));
    } else {
        xData = Array.from({ length: 12 }, (_, i) => { const d = new Date(); d.setMonth(d.getMonth() - 11 + i); return `${d.getFullYear()}/${d.getMonth()+1}`; });
        seriesData = xData.map(() => Math.round(Math.random() * 800000 + 200000 - 100000));
    }
    profitChartInstance.setOption({
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#fff' }, formatter: function(p) { return p[0].name + '<br/>$' + p[0].value.toLocaleString(); } },
        grid: { left: 70, right: 20, top: 20, bottom: 30 },
        xAxis: { type: 'category', data: xData, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10 } },
        yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } }, axisLabel: { color: 'rgba(255,255,255,0.4)', formatter: function(v) { return v >= 1000 ? (v/1000).toFixed(0) + 'k' : v; } } },
        series: [{ data: seriesData, type: 'bar', itemStyle: { color: function(p) { return p.value >= 0 ? '#00ff88' : '#ff6b6b'; }, borderRadius: [4, 4, 0, 0] } }]
    });
}

function switchProfitPeriod(period) {
    document.querySelectorAll('.profit-period-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.period === period));
    renderProfitChart(period);
}

/* ── 获利报表 Tab（reports.html 风格） ─────────────────────────── */
function generateProfitReportData(period, station) {
    const isEn = window.i18n && window.i18n.getCurrentLanguage && window.i18n.getCurrentLanguage().startsWith('en');
    const idNum = parseInt(station.id.replace(/\D/g,'')) || 1;
    const rnd = makePrng(idNum + period.length * 13);
    const months = isEn
        ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        : ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    let labels = [], charge = [], discharge = [], buyPrice = [], sellPrice = [];
    if (period === 'day') {
        for (let h = 0; h < 24; h++) {
            labels.push(h.toString().padStart(2,'0') + ':00');
            const isCharge = h < 8;
            const isDisch = h >= 13 && h < 20;
            charge.push(isCharge ? +rnd(1.5, 3.5).toFixed(2) : 0);
            discharge.push(isDisch ? +rnd(1.5, 3.2).toFixed(2) : 0);
            buyPrice.push(isCharge ? +rnd(30, 60).toFixed(1) : 0);
            sellPrice.push(isDisch ? +rnd(150, 350).toFixed(1) : 0);
        }
    } else if (period === 'month') {
        for (let d = 1; d <= 30; d++) {
            labels.push(isEn ? String(d) : d + '日');
            charge.push(+rnd(8, 20).toFixed(1));
            discharge.push(+rnd(7, 18).toFixed(1));
            buyPrice.push(+rnd(35, 65).toFixed(1));
            sellPrice.push(+rnd(140, 320).toFixed(1));
        }
    } else if (period === 'year') {
        for (let m = 0; m < 12; m++) {
            labels.push(months[m]);
            charge.push(+rnd(200, 600).toFixed(0));
            discharge.push(+rnd(180, 550).toFixed(0));
            buyPrice.push(+rnd(40, 70).toFixed(1));
            sellPrice.push(+rnd(150, 300).toFixed(1));
        }
    } else {
        const curYear = new Date().getFullYear();
        for (let y = 2020; y <= curYear; y++) {
            labels.push(String(y));
            charge.push(+rnd(2000, 6000).toFixed(0));
            discharge.push(+rnd(1800, 5500).toFixed(0));
            buyPrice.push(+rnd(45, 75).toFixed(1));
            sellPrice.push(+rnd(160, 290).toFixed(1));
        }
    }
    const profit = labels.map((_, i) => +(discharge[i] * sellPrice[i] - charge[i] * buyPrice[i]).toFixed(2));
    return { labels, charge, discharge, buyPrice, sellPrice, profit };
}

function renderProfitReportCards() {
    const grid = document.getElementById('profitStatsGrid');
    if (!grid || !currentDetailStation) return;
    const isEn = window.i18n && window.i18n.getCurrentLanguage && window.i18n.getCurrentLanguage().startsWith('en');
    const d = generateProfitReportData(currentProfitPeriod, currentDetailStation);
    const totalCharge    = d.charge.reduce((a,b) => a+b, 0);
    const totalDischarge = d.discharge.reduce((a,b) => a+b, 0);
    const buyArr  = d.buyPrice.filter(v => v > 0);
    const sellArr = d.sellPrice.filter(v => v > 0);
    const avgBuy  = buyArr.length  ? buyArr.reduce((a,b)  => a+b, 0) / buyArr.length  : 0;
    const avgSell = sellArr.length ? sellArr.reduce((a,b) => a+b, 0) / sellArr.length : 0;
    const totalProfit = d.profit.reduce((a,b) => a+b, 0);
    const cards = [
        { label: isEn ? 'Total Charged'   : '充电量',   value: totalCharge.toFixed(1),                     unit: 'MWh',  color: '#60a5fa', change: '+2.3%' },
        { label: isEn ? 'Total Discharged': '放电量',   value: totalDischarge.toFixed(1),                  unit: 'MWh',  color: '#ffc107', change: '+1.8%' },
        { label: isEn ? 'Avg Buy Price'   : '充电均价', value: '$' + avgBuy.toFixed(1),                    unit: '/MWh', color: '#a78bfa', change: '-5.2%' },
        { label: isEn ? 'Avg Sell Price'  : '放电均价', value: '$' + avgSell.toFixed(1),                   unit: '/MWh', color: '#fb923c', change: '+8.1%' },
        { label: isEn ? 'Net Profit'      : '净利润',   value: '$' + Math.round(totalProfit).toLocaleString(), unit: '',  color: totalProfit >= 0 ? '#00ff88' : '#ff6b6b', change: totalProfit >= 0 ? '+12.4%' : '-3.1%' }
    ];
    grid.innerHTML = cards.map(c => `
        <div class="profit-stat-card">
            <div class="profit-stat-label">${c.label}</div>
            <div class="profit-stat-val" style="color:${c.color}">${c.value}<span class="unit">${c.unit}</span></div>
            <div class="profit-stat-change${c.change.startsWith('-') ? ' negative' : ''}">${c.change}</div>
        </div>`).join('');
}

function renderProfitReportChart() {
    const dom = document.getElementById('detailProfitChart2');
    if (!dom || !currentDetailStation || typeof echarts === 'undefined') return;
    if (profitChartInstance) { profitChartInstance.dispose(); profitChartInstance = null; }
    if (profitChartInstance2) { profitChartInstance2.dispose(); }
    profitChartInstance2 = echarts.init(dom, 'dark');
    const isEn = window.i18n && window.i18n.getCurrentLanguage && window.i18n.getCurrentLanguage().startsWith('en');
    const d = generateProfitReportData(currentProfitPeriod, currentDetailStation);
    profitChartInstance2.setOption({
        backgroundColor: 'transparent',
        grid: { left: 55, right: 20, top: 40, bottom: 32 },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(0,0,0,0.85)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
            textStyle: { color: '#fff', fontSize: 12 },
            formatter: params => params[0].axisValue + '<br>' + params.map(p => `${p.marker} ${p.seriesName}: ${Math.abs(p.value).toFixed(1)} MWh`).join('<br>')
        },
        legend: { top: 8, left: 'center', textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 11 } },
        xAxis: { type: 'category', data: d.labels, axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, splitLine: { show: false } },
        yAxis: { type: 'value', name: 'MWh', splitNumber: 4, axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11, formatter: v => Math.abs(v) }, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)', type: 'dashed' } } },
        series: [
            { name: isEn ? 'Charge' : '充电量',    type: 'bar', barMaxWidth: 32, data: d.charge,             itemStyle: { color: 'rgba(59,130,246,0.85)',  borderRadius: [3,3,0,0] } },
            { name: isEn ? 'Discharge' : '放电量', type: 'bar', barMaxWidth: 32, data: d.discharge.map(v=>-v), itemStyle: { color: 'rgba(255,193,7,0.85)', borderRadius: [0,0,3,3] } }
        ]
    }, true);
    window.addEventListener('resize', () => profitChartInstance2 && profitChartInstance2.resize());
}

function renderProfitReportTable() {
    const head = document.getElementById('profitTableHead');
    const body = document.getElementById('profitTableBody');
    if (!head || !body || !currentDetailStation) return;
    const isEn = window.i18n && window.i18n.getCurrentLanguage && window.i18n.getCurrentLanguage().startsWith('en');
    const d = generateProfitReportData(currentProfitPeriod, currentDetailStation);
    const headers = isEn
        ? ['Period', 'Charge (MWh)', 'Discharge (MWh)', 'Avg Buy ($/MWh)', 'Avg Sell ($/MWh)', 'Charge Cost ($)', 'Discharge Rev ($)', 'Net Profit ($)']
        : ['时段',   '充电量 (MWh)',  '放电量 (MWh)',     '充电均价 ($/MWh)', '放电均价 ($/MWh)', '充电成本 ($)',    '放电收益 ($)',       '净利润 ($)'];
    head.innerHTML = headers.map(h => `<th>${h}</th>`).join('');
    body.innerHTML = d.labels.map((lbl, i) => {
        const cost = d.charge[i] * d.buyPrice[i];
        const rev  = d.discharge[i] * d.sellPrice[i];
        const net  = d.profit[i];
        const netColor = net >= 0 ? '#00ff88' : '#ff6b6b';
        return `<tr>
            <td style="font-weight:500">${lbl}</td>
            <td style="color:#60a5fa">${d.charge[i].toFixed(1)}</td>
            <td style="color:#ffc107">${d.discharge[i].toFixed(1)}</td>
            <td>$${d.buyPrice[i].toFixed(1)}</td>
            <td>$${d.sellPrice[i].toFixed(1)}</td>
            <td>$${cost.toFixed(0)}</td>
            <td>$${rev.toFixed(0)}</td>
            <td style="color:${netColor};font-weight:600">$${Math.round(net).toLocaleString()}</td>
        </tr>`;
    }).join('');
}

function switchProfitPeriod2(period, btn) {
    currentProfitPeriod = period;
    if (btn && btn.parentNode) {
        btn.parentNode.querySelectorAll('.time-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    renderProfitReportCards();
    renderProfitReportChart();
    renderProfitReportTable();
}

function switchProfitViewMode(mode, btn) {
    if (btn && btn.parentNode) {
        btn.parentNode.querySelectorAll('.profit-view-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
    const chartView = document.getElementById('profitChartView');
    const tableView = document.getElementById('profitTableView');
    if (chartView) chartView.style.display = mode === 'chart' ? '' : 'none';
    if (tableView) tableView.style.display = mode === 'table' ? '' : 'none';
    if (mode === 'chart') renderProfitReportChart();
}

/* ── Tab 切换 ─────────────────────────────────────────────────── */
function switchDetailTab(tab) {
    currentDetailTab = tab;
    document.querySelectorAll('.detail-tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.detailTab === tab));
    const tabMap = {
        overview:  'detailTabOverview',
        equipment: 'detailTabEquipment',
        history:   'detailTabHistory',
        dispatch:  'detailTabDispatch',
        profit:    'detailTabProfit'
    };
    Object.values(tabMap).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('active', id === tabMap[tab]);
    });
    if (typeof i18n !== 'undefined' && i18n.updatePageTexts) i18n.updatePageTexts();
    if (tab === 'profit') {
        renderProfitReportCards();
        renderProfitReportChart();
        renderProfitReportTable();
    }
    if (tab === 'history') setTimeout(() => { renderHistoryCharts(); }, 50);
    if (tab === 'overview' || (tab === 'profit' && profitChartInstance)) {
        setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
    }
}

/* ── 历史数据图表 ─────────────────────────────────────────────── */
function getHistDateSeed() {
    return (document.getElementById('histDayPicker')?.value || '').replace(/-/g,'');
}
function getEnergyDateSeed() {
    return (document.getElementById('energyTimeSelector')?.value || '').replace(/-/g,'');
}

function destroyEnergyCustomPicker() {
    if (_energyCustomPickerPopup) { _energyCustomPickerPopup.remove(); _energyCustomPickerPopup = null; }
}

function openEnergyYearPicker(input) {
    destroyEnergyCustomPicker();
    const now = new Date();
    const curYear = now.getFullYear();
    const selYear = parseInt(input.value) || curYear;
    const isEn = window.i18n && window.i18n.getCurrentLanguage && window.i18n.getCurrentLanguage().startsWith('en');
    const popup = document.createElement('div');
    popup.className = 'dp-popup open';
    popup.style.width = '200px';
    let html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:4px;">';
    for (let y = 2020; y <= curYear; y++) {
        html += `<div class="dp-day${y === selYear ? ' selected' : ''}" data-year="${y}" style="padding:8px 4px;border-radius:6px;cursor:pointer;text-align:center;">${y}</div>`;
    }
    html += `</div><div class="dp-footer"><button class="dp-btn-clear">${isEn ? 'Clear' : '清除'}</button></div>`;
    popup.innerHTML = html;
    document.body.appendChild(popup);
    _energyCustomPickerPopup = popup;
    const rect = input.getBoundingClientRect();
    const pw = 200, ph = 180;
    popup.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - pw - 8)) + 'px';
    popup.style.top  = (rect.bottom + ph > window.innerHeight - 8 ? Math.max(8, rect.top - ph - 6) : rect.bottom + 6) + 'px';
    popup.querySelectorAll('[data-year]').forEach(el => {
        el.addEventListener('click', (e) => { e.stopPropagation(); input.value = el.dataset.year; destroyEnergyCustomPicker(); renderEnergyChart(); });
    });
    popup.querySelector('.dp-btn-clear').addEventListener('click', (e) => { e.stopPropagation(); input.value = String(curYear); destroyEnergyCustomPicker(); renderEnergyChart(); });
    popup.addEventListener('click', e => e.stopPropagation());
    setTimeout(() => { document.addEventListener('click', function h() { destroyEnergyCustomPicker(); document.removeEventListener('click', h); }); }, 0);
}

function openEnergyMonthPicker(input) {
    destroyEnergyCustomPicker();
    const now = new Date();
    const parts = (input.value || '').split('-');
    let viewYear = parseInt(parts[0]) || now.getFullYear();
    const isEn = window.i18n && window.i18n.getCurrentLanguage && window.i18n.getCurrentLanguage().startsWith('en');
    const mNames = isEn
        ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
        : ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
    const popup = document.createElement('div');
    popup.className = 'dp-popup open';
    popup.style.width = '220px';
    document.body.appendChild(popup);
    _energyCustomPickerPopup = popup;
    function build() {
        const selVal = input.value;
        popup.innerHTML = `
            <div class="dp-header">
                <button class="dp-nav" id="empPrev">&#9664;</button>
                <span class="dp-month-label">${viewYear}</span>
                <button class="dp-nav" id="empNext">&#9654;</button>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;padding:4px;">
                ${mNames.map((mn, mi) => { const val = `${viewYear}-${String(mi+1).padStart(2,'0')}`; return `<div class="dp-day${val===selVal?' selected':''}" data-val="${val}" style="padding:8px 2px;border-radius:6px;cursor:pointer;text-align:center;">${mn}</div>`; }).join('')}
            </div>
            <div class="dp-footer"><button class="dp-btn-clear">${isEn ? 'Clear' : '清除'}</button></div>`;
        popup.querySelector('#empPrev').addEventListener('click', (e) => { e.stopPropagation(); viewYear--; build(); });
        popup.querySelector('#empNext').addEventListener('click', (e) => { e.stopPropagation(); viewYear++; build(); });
        popup.querySelectorAll('[data-val]').forEach(el => {
            el.addEventListener('click', (e) => { e.stopPropagation(); input.value = el.dataset.val; destroyEnergyCustomPicker(); renderEnergyChart(); });
        });
        popup.querySelector('.dp-btn-clear').addEventListener('click', (e) => { e.stopPropagation(); input.value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`; destroyEnergyCustomPicker(); renderEnergyChart(); });
    }
    build();
    const rect = input.getBoundingClientRect();
    const pw = 220, ph = 220;
    popup.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - pw - 8)) + 'px';
    popup.style.top  = (rect.bottom + ph > window.innerHeight - 8 ? Math.max(8, rect.top - ph - 6) : rect.bottom + 6) + 'px';
    popup.addEventListener('click', e => e.stopPropagation());
    setTimeout(() => { document.addEventListener('click', function h() { destroyEnergyCustomPicker(); document.removeEventListener('click', h); }); }, 0);
}

function updateEnergyPickerVisibility() {
    const wrapper = document.getElementById('energyPickerWrapper');
    if (wrapper) wrapper.style.display = currentEnergyPeriod === 'cumulative' ? 'none' : '';
}

function updateEnergyPickerForPeriod() {
    const input = document.getElementById('energyTimeSelector');
    if (!input) return;
    const now = new Date();
    destroyEnergyCustomPicker();
    if (currentEnergyPeriod === 'day') {
        input.onclick = null;
        if (typeof MiniDatePicker !== 'undefined') {
            if (!_energyPicker || _energyPicker.input !== input) {
                if (_energyPicker) _energyPicker.destroy();
                _energyPicker = new MiniDatePicker(input, () => renderEnergyChart());
            }
            if (!input.value || !/^\d{4}-\d{2}-\d{2}$/.test(input.value)) input.value = now.toISOString().slice(0, 10);
        }
    } else {
        if (_energyPicker) { _energyPicker.destroy(); _energyPicker = null; }
        if (currentEnergyPeriod === 'month') {
            if (!input.value || !/^\d{4}-\d{2}$/.test(input.value)) input.value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
            input.onclick = (e) => { e.stopPropagation(); openEnergyMonthPicker(input); };
        } else if (currentEnergyPeriod === 'year') {
            if (!input.value || !/^\d{4}$/.test(input.value)) input.value = String(now.getFullYear());
            input.onclick = (e) => { e.stopPropagation(); openEnergyYearPicker(input); };
        }
    }
}

function switchEnergyPeriod(period, element) {
    currentEnergyPeriod = period;
    if (element && element.parentNode) {
        element.parentNode.querySelectorAll('.time-pill').forEach(btn => btn.classList.remove('active'));
        element.classList.add('active');
    }
    updateEnergyPickerVisibility();
    updateEnergyPickerForPeriod();
    renderEnergyChart();
}

function initHistDatePickers() {
    const today = new Date().toISOString().slice(0, 10);
    const histInput = document.getElementById('histDayPicker');
    if (histInput && typeof MiniDatePicker !== 'undefined') {
        if (!_histPicker || _histPicker.input !== histInput) {
            if (_histPicker) _histPicker.destroy();
            _histPicker = new MiniDatePicker(histInput, () => renderHistoryCharts());
            if (!histInput.value) histInput.value = today;
        }
    }
    updateEnergyPickerForPeriod();
}

function generateHistoryData(period, capacity) {
    const isEn = window.i18n && window.i18n.getCurrentLanguage && window.i18n.getCurrentLanguage().startsWith('en');
    const station = currentDetailStation;
    const dateSeed = parseInt(getHistDateSeed()) || 0;
    const seed = (station ? parseInt(station.id.replace(/\D/g,'')) || 1 : 1) + period.length * 17 + dateSeed % 1000;
    const rnd = makePrng(seed);
    const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));
    let labels = [], soc = [], power = [];
    if (period === 'day') {
        let s = rnd(25, 60);
        for (let h = 0; h < 24; h++) {
            labels.push(h.toString().padStart(2,'0') + ':00');
            const p = rnd(-capacity * 0.7, capacity * 0.7);
            power.push(+p.toFixed(1));
            s = clamp(s + (p / capacity) * 13, 5, 95);
            soc.push(+s.toFixed(1));
        }
    } else if (period === 'month') {
        let s = rnd(30, 65);
        for (let d = 1; d <= 30; d++) {
            labels.push(isEn ? String(d) : d + '日');
            const p = rnd(-capacity * 0.5, capacity * 0.5);
            power.push(+p.toFixed(1));
            s = clamp(s + (p / capacity) * 8, 10, 90);
            soc.push(+s.toFixed(1));
        }
    } else if (period === 'year') {
        const months = isEn
            ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
            : ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
        let s = rnd(35, 60);
        for (let m = 0; m < 12; m++) {
            labels.push(months[m]);
            const p = rnd(-capacity * 0.4, capacity * 0.4);
            power.push(+p.toFixed(1));
            s = clamp(s + (p / capacity) * 5, 10, 90);
            soc.push(+s.toFixed(1));
        }
    } else {
        const curYear = new Date().getFullYear();
        let s = rnd(40, 60);
        for (let y = 2020; y <= curYear; y++) {
            labels.push(String(y));
            const p = rnd(-capacity * 0.25, capacity * 0.25);
            power.push(+p.toFixed(1));
            s = clamp(s + (p / capacity) * 3, 15, 85);
            soc.push(+s.toFixed(1));
        }
    }
    return { labels, soc, power };
}

function generateEnergyData(period, year, capacity) {
    const isEn = window.i18n && window.i18n.getCurrentLanguage && window.i18n.getCurrentLanguage().startsWith('en');
    const station = currentDetailStation;
    const dateSeed = parseInt(getEnergyDateSeed()) || 0;
    const seed = (station ? parseInt(station.id.replace(/\D/g,'')) || 1 : 1) * 3 + year * 7 + period.length * 11 + dateSeed % 1000;
    const rnd = makePrng(seed);
    let labels = [], charge = [], discharge = [];
    if (period === 'day') {
        for (let h = 0; h < 24; h++) {
            labels.push(h.toString().padStart(2,'0') + ':00');
            const p = rnd(-capacity * 0.7, capacity * 0.7);
            charge.push(p > 0 ? +p.toFixed(2) : 0);
            discharge.push(p < 0 ? +(-p).toFixed(2) : 0);
        }
    } else if (period === 'month') {
        const months = isEn
            ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
            : ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'];
        for (let m = 0; m < 12; m++) {
            labels.push(months[m]);
            charge.push(+rnd(capacity * 40, capacity * 90).toFixed(0));
            discharge.push(+rnd(capacity * 40, capacity * 90).toFixed(0));
        }
    } else {
        const curYear = new Date().getFullYear();
        for (let y = 2020; y <= curYear; y++) {
            labels.push(String(y));
            charge.push(+rnd(capacity * 400, capacity * 900).toFixed(0));
            discharge.push(+rnd(capacity * 400, capacity * 900).toFixed(0));
        }
    }
    return { labels, charge, discharge };
}

function renderEnergyChart() {
    if (!currentDetailStation) return;
    updateEnergyPickerVisibility();
    const isEn = window.i18n && window.i18n.getCurrentLanguage && window.i18n.getCurrentLanguage().startsWith('en');
    const year = parseInt((document.getElementById('energyTimeSelector')?.value || '').slice(0, 4)) || new Date().getFullYear();
    const d = generateEnergyData(currentEnergyPeriod, year, currentDetailStation.capacity || 10);
    const totalCharge    = d.charge.reduce((a, b) => a + b, 0);
    const totalDischarge = d.discharge.reduce((a, b) => a + b, 0);
    const tcEl = document.getElementById('energyTotalCharge');
    const tdEl = document.getElementById('energyTotalDischarge');
    if (tcEl) tcEl.textContent = totalCharge.toFixed(1);
    if (tdEl) tdEl.textContent = totalDischarge.toFixed(1);
    const c2 = document.getElementById('histEnergyChart');
    if (!c2 || typeof echarts === 'undefined') return;
    if (!histEnergyChart) histEnergyChart = echarts.init(c2, 'dark');
    histEnergyChart.setOption({
        backgroundColor: 'transparent',
        grid: { left: 50, right: 16, top: 36, bottom: 32 },
        tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.85)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, textStyle: { color: '#fff', fontSize: 12 },
            formatter: params => params[0].axisValue + '<br>' + params.map(p => `${p.marker} ${p.seriesName}: ${Math.abs(p.value).toFixed(1)} MWh`).join('<br>') },
        legend: { top: 4, left: 'center', textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 11 } },
        xAxis: { type: 'category', data: d.labels, axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, splitLine: { show: false } },
        yAxis: { type: 'value', name: 'MWh', splitNumber: 4, axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11, formatter: v => Math.abs(v) }, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)', type: 'dashed' } } },
        series: [
            { name: isEn ? 'Charge' : '充电量', type: 'bar', barMaxWidth: 32, data: d.charge, itemStyle: { color: 'rgba(59,130,246,0.85)', borderRadius: [3,3,0,0] } },
            { name: isEn ? 'Discharge' : '放电量', type: 'bar', barMaxWidth: 32, data: d.discharge.map(v => -v), itemStyle: { color: 'rgba(255,193,7,0.85)', borderRadius: [0,0,3,3] } }
        ]
    }, true);
}

function renderHistoryCharts() {
    if (!currentDetailStation) return;
    initHistDatePickers();
    renderEnergyChart();
    const isEn = window.i18n && window.i18n.getCurrentLanguage && window.i18n.getCurrentLanguage().startsWith('en');
    const d = generateHistoryData('day', currentDetailStation.capacity || 10);
    const c1 = document.getElementById('histSocPowerChart');
    if (c1 && typeof echarts !== 'undefined') {
        if (!histSocPowerChart) histSocPowerChart = echarts.init(c1, 'dark');
        histSocPowerChart.setOption({
            backgroundColor: 'transparent',
            grid: { left: 50, right: 55, top: 36, bottom: 32 },
            tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.85)', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, textStyle: { color: '#fff', fontSize: 12 } },
            legend: { top: 4, left: 'center', textStyle: { color: 'rgba(255,255,255,0.6)', fontSize: 11 }, data: ['SOC', isEn ? 'Power(MW)' : '功率(MW)'] },
            xAxis: { type: 'category', data: d.labels, boundaryGap: false, axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11 }, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, splitLine: { show: false } },
            yAxis: [
                { type: 'value', name: 'SOC %', min: 0, max: 100, splitNumber: 4, axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11, formatter: '{value}%' }, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)', type: 'dashed' } } },
                { type: 'value', name: isEn ? 'MW' : '功率MW', splitNumber: 4, axisLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11, formatter: '{value}' }, axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false } }
            ],
            series: [
                { name: 'SOC', type: 'line', smooth: true, showSymbol: false, yAxisIndex: 0, data: d.soc, lineStyle: { color: '#00ff88', width: 2 }, areaStyle: { color: { type: 'linear', x:0,y:0,x2:0,y2:1, colorStops: [{ offset:0, color:'rgba(0,255,136,0.25)' },{ offset:1, color:'rgba(0,255,136,0.02)' }] } } },
                { name: isEn ? 'Power(MW)' : '功率(MW)', type: 'line', smooth: true, showSymbol: false, yAxisIndex: 1, data: d.power, lineStyle: { color: '#ffc107', width: 2, type: 'dashed' }, markLine: { silent: true, symbol: 'none', data: [{ yAxis: 0, yAxisIndex: 1, lineStyle: { color: 'rgba(255,255,255,0.15)', type: 'solid' } }] } }
            ]
        }, true);
    }
}

/* ── 业主简化视图 ─────────────────────────────────────────────── */
function initOwnerMap(station) {
    const el = document.getElementById('ownerStationMap');
    if (!el || typeof L === 'undefined') return;
    const map = L.map('ownerStationMap', {
        scrollWheelZoom: false, zoomControl: true, attributionControl: true
    }).setView([-34.9285, 138.6007], 7);
    el.addEventListener('mouseenter', () => map.scrollWheelZoom.enable());
    el.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());
    L.tileLayer(
        'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        { maxZoom: 19, attribution: 'Imagery &copy; Esri' }
    ).addTo(map);
    const icon = L.divIcon({
        html: '<div style="width:14px;height:14px;border-radius:50%;background:#00ff88;border:3px solid #fff;box-shadow:0 0 12px rgba(0,255,136,0.9)"></div>',
        iconSize: [14, 14], iconAnchor: [7, 7], className: ''
    });
    L.marker([station.lat, station.lng], { icon })
        .addTo(map)
        .bindPopup(`<b>${station.name}</b><br>${station.region}, Australia`, { closeButton: false })
        .openPopup();
}

/* ── 页面渲染 ─────────────────────────────────────────────────── */
function renderPage(station) {
    currentDetailStation = station;

    // ── 更新 HTML title ──
    document.title = `${station.name} - AlwaysControl`;

    // ── 渲染顶部标题 ──
    const titleEl = document.getElementById('stationTitle');
    const subtitleEl = document.getElementById('stationSubtitle');
    if (titleEl) titleEl.textContent = station.name;
    if (subtitleEl) subtitleEl.textContent = `${station.id} · ${station.region}, Australia · ${station.capacity} MW`;

    // ── 计算共用数据 ──
    const idNum = parseInt(station.id.replace('AU', '')) || 1;
    const temperature = (25 + (idNum % 9) + 0.4 * (idNum % 5)).toFixed(1);
    const tempHigh = parseFloat(temperature) > 32;
    const isOffline = station.commStatus === 'offline';
    const socColor = station.soc > 60 ? '#00ff88' : station.soc > 30 ? '#ffd93d' : '#ff6b6b';

    const devices = [
        { nameKey: 'owner_dev_bms',     icon: '🔋', health: isOffline ? 'error' : 'ok' },
        { nameKey: 'owner_dev_pcs',     icon: '⚡', health: isOffline ? 'error' : 'ok' },
        { nameKey: 'owner_dev_ems',     icon: '🖥️', health: 'ok' },
        { nameKey: 'owner_dev_xfmr',    icon: '🔌', health: 'ok' },
        { nameKey: 'owner_dev_hvac',    icon: '❄️', health: tempHigh ? 'warn' : 'ok' },
        { nameKey: 'owner_dev_fire',    icon: '🧯', health: 'ok' },
        { nameKey: 'owner_dev_meter',   icon: '📊', health: 'ok' },
        { nameKey: 'owner_dev_acdist',  icon: '🔧', health: 'ok' },
        { nameKey: 'owner_dev_gateway', icon: '📡', health: 'ok' },
    ];
    const hasError = devices.some(d => d.health === 'error');
    const hasWarn  = devices.some(d => d.health === 'warn');
    let heroClass, heroStatusSuffixKey;
    if (hasError) {
        heroClass = 'health-error'; heroStatusSuffixKey = 'owner_system_abnormal';
    } else if (hasWarn) {
        heroClass = 'health-normal'; heroStatusSuffixKey = 'owner_system_warning';
    } else {
        heroClass = 'health-good'; heroStatusSuffixKey = 'owner_system_excellent';
    }

    const healthScore = (97 + (idNum % 3) + 0.1 * (idNum % 5)).toFixed(1);
    const R = 40, circ = +(2 * Math.PI * R).toFixed(2), arcLen = +(circ * 0.75).toFixed(2);
    let gaugeScore, gaugeColor, gaugeCenterHTML;
    if (hasError) {
        gaugeScore = Math.round(devices.filter(d => d.health === 'ok').length / devices.length * 100);
        gaugeColor = '#ff6b6b';
        gaugeCenterHTML = `<text x="50" y="53" text-anchor="middle" fill="#ff6b6b" font-size="13" font-weight="700" font-family="system-ui,sans-serif" data-i18n="station.owner_system_abnormal"></text>`;
    } else if (hasWarn) {
        gaugeScore = 72; gaugeColor = '#ffd93d';
        gaugeCenterHTML = `<text x="50" y="53" text-anchor="middle" fill="#ffd93d" font-size="12" font-weight="700" font-family="system-ui,sans-serif" data-i18n="station.owner_system_warning"></text>`;
    } else {
        gaugeScore = parseFloat(healthScore); gaugeColor = '#00ff88';
        gaugeCenterHTML = `
            <text x="50" y="46" text-anchor="middle" fill="#00ff88" font-size="22" font-weight="700" font-family="system-ui,sans-serif">${Math.round(gaugeScore)}</text>
            <text x="50" y="59" text-anchor="middle" fill="rgba(255,255,255,0.45)" font-size="9" font-family="system-ui,sans-serif" data-i18n="station.owner_health_score_label"></text>`;
    }
    const fillLen = +(arcLen * gaugeScore / 100).toFixed(2);
    const heroScoreHTML = `
        <svg viewBox="0 0 100 100" width="120" height="120" style="display:block;overflow:visible">
            <circle cx="50" cy="50" r="${R}" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${arcLen} ${+(circ-arcLen).toFixed(2)}" transform="rotate(135,50,50)"/>
            <circle cx="50" cy="50" r="${R}" fill="none" stroke="${gaugeColor}" stroke-width="9" stroke-linecap="round" stroke-dasharray="${fillLen} ${+(circ-fillLen).toFixed(2)}" transform="rotate(135,50,50)" style="filter:drop-shadow(0 0 5px ${gaugeColor})"/>
            ${gaugeCenterHTML}
        </svg>`;

    const connKey   = station.commStatus === 'online' ? 'owner_connected' : 'owner_offline';
    const connColor = station.commStatus === 'online' ? '#00ff88' : '#ff6b6b';
    const offlineHours = ((idNum * 7) % 23) + 1;
    const commSubZh = station.commStatus === 'online' ? '实时通讯正常' : `已离线 ${offlineHours} 小时`;
    const commSubEn = station.commStatus === 'online' ? 'Connection stable' : `Offline for ${offlineHours}h`;
    const faultCount = devices.filter(d => d.health === 'error').length;
    const deviceStatusKey   = faultCount > 0 ? 'owner_device_fault' : 'owner_device_normal';
    const deviceStatusColor = faultCount > 0 ? '#ff6b6b' : '#00ff88';
    const deviceSubZh = faultCount > 0 ? `${faultCount} 台设备故障` : '所有设备运行正常';
    const deviceSubEn = faultCount > 0 ? `${faultCount} device(s) fault` : 'All devices normal';
    const soh = (92 + (idNum % 7) + 0.1 * (idNum % 5)).toFixed(1);
    const battHealthKey   = parseFloat(soh) >= 85 ? 'owner_battery_healthy' : 'owner_battery_degraded';
    const battHealthColor = parseFloat(soh) >= 85 ? '#00ff88' : '#ffd93d';
    const tempStatusKey   = tempHigh ? 'owner_temp_high_val' : 'owner_temp_ok';
    const tempStatusColor = tempHigh ? '#ffd93d' : '#00ff88';
    const weathers = [
        { icon: '☀️', zh: '晴朗', en: 'Sunny' },
        { icon: '⛅', zh: '多云间晴', en: 'Partly Cloudy' },
        { icon: '🌤️', zh: '局部晴天', en: 'Mostly Sunny' },
        { icon: '🌥️', zh: '阴天', en: 'Overcast' },
        { icon: '🌦️', zh: '间歇小雨', en: 'Light Showers' },
    ];
    const weather = weathers[idNum % weathers.length];
    const runBadgeKey = station.runStatus === 'charging'   ? 'owner_run_charging' :
                        station.runStatus === 'discharging' ? 'owner_run_discharging' : 'owner_run_idle';
    const deviceHTML = devices.map(d => {
        const isErr = d.health === 'error';
        return `
        <div class="owner-device-card device-${isErr ? 'error' : 'ok'}">
            <div class="owner-device-icon">${d.icon}</div>
            <div class="owner-device-name" data-i18n="station.${d.nameKey}"></div>
            <div class="owner-device-status-wrap">
                <span class="owner-device-dot ${isErr ? 'dot-error' : 'dot-ok'}"></span>
                <span class="owner-device-status" data-i18n="station.${isErr ? 'owner_device_fault' : 'owner_device_normal'}"></span>
            </div>
        </div>`;
    }).join('');

    // ── Tab 1: 概览 ──
    const tabOverview = document.getElementById('detailTabOverview');
    if (tabOverview) {
        tabOverview.innerHTML = `
            <div class="owner-top-row">
                <div class="owner-hero ${heroClass}">
                    <div class="owner-hero-body">
                        <div class="owner-hero-left">
                            ${heroScoreHTML}
                            <div class="owner-hero-status">
                                <span data-i18n="station.owner_status_label"></span><span data-i18n="station.${heroStatusSuffixKey}"></span>
                            </div>
                        </div>
                        <div class="owner-hero-right">
                            <div class="owner-hero-metric">
                                <div class="owner-hero-metric-label" data-i18n="station.owner_hero_run_status"></div>
                                <div class="owner-run-badge owner-run-${station.runStatus}" data-i18n="station.${runBadgeKey}"></div>
                            </div>
                            <div class="owner-hero-row-divider"></div>
                            <div class="owner-hero-metric">
                                <div class="owner-hero-metric-label" data-i18n="station.owner_hero_soc"></div>
                                <div class="owner-hero-metric-value" style="color:${socColor}">${station.soc}%</div>
                                <div class="owner-soc-bar" style="margin-top:8px">
                                    <div class="owner-soc-fill" style="width:${station.soc}%;background:${socColor}"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="ownerStationMap" class="owner-station-map"></div>
            </div>
            <div class="owner-cards-grid">
                <div class="owner-info-card">
                    <div class="owner-info-card-icon">📡</div>
                    <div class="owner-info-card-label" data-i18n="station.owner_card_comm"></div>
                    <div class="owner-status-row">
                        <span class="owner-status-dot ${station.commStatus === 'online' ? 'dot-ok' : 'dot-error'}"></span>
                        <span class="owner-info-card-value" style="color:${connColor}" data-i18n="station.${connKey}"></span>
                    </div>
                    <div class="owner-info-card-sub" data-text-zh="${commSubZh}" data-text-en="${commSubEn}"></div>
                </div>
                <div class="owner-info-card">
                    <div class="owner-info-card-icon">⚙️</div>
                    <div class="owner-info-card-label" data-i18n="station.owner_card_device"></div>
                    <div class="owner-info-card-value" style="color:${deviceStatusColor}" data-i18n="station.${deviceStatusKey}"></div>
                    <div class="owner-info-card-sub" data-text-zh="${deviceSubZh}" data-text-en="${deviceSubEn}"></div>
                </div>
                <div class="owner-info-card">
                    <div class="owner-info-card-icon">🔋</div>
                    <div class="owner-info-card-label" data-i18n="station.owner_card_battery"></div>
                    <div class="owner-info-card-value" style="color:${battHealthColor}" data-i18n="station.${battHealthKey}"></div>
                    <div class="owner-info-card-sub">SOH ${soh}%</div>
                </div>
                <div class="owner-info-card">
                    <div class="owner-info-card-icon">🌡️</div>
                    <div class="owner-info-card-label" data-i18n="station.owner_card_temp"></div>
                    <div class="owner-info-card-value" style="color:${tempStatusColor}" data-i18n="station.${tempStatusKey}"></div>
                    <div class="owner-info-card-sub">${temperature} °C</div>
                </div>
                <div class="owner-info-card">
                    <div class="owner-info-card-icon">${weather.icon}</div>
                    <div class="owner-info-card-label" data-i18n="station.owner_card_weather"></div>
                    <div class="owner-info-card-value" style="color:rgba(255,255,255,0.9)" data-text-zh="${weather.zh}" data-text-en="${weather.en}"></div>
                    <div class="owner-info-card-sub">${temperature} °C</div>
                </div>
            </div>
            <div class="owner-devices-section">
                <div class="owner-devices-title" data-i18n="station.owner_devices_title"></div>
                <div class="owner-devices-grid">${deviceHTML}</div>
            </div>`;
    }

    // ── Tab 2: 运行数据 ──
    const tabEquipment = document.getElementById('detailTabEquipment');
    if (tabEquipment) {
        tabEquipment.innerHTML = `
            <div class="detail-section">
                <div class="detail-section-title" data-i18n="station.tab_equipment"></div>
                ${generateRunningDataHTML(station)}
            </div>`;
    }

    // ── Tab 3: 历史数据 ──
    const tabHistory = document.getElementById('detailTabHistory');
    if (tabHistory) {
        tabHistory.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
                <div style="font-size:16px;font-weight:600;color:#fff;" data-i18n="station.tab_history"></div>
                <div class="dp-wrapper">
                    <input type="text" id="histDayPicker" class="hist-date-input" readonly placeholder="YYYY-MM-DD">
                </div>
            </div>
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px 20px;margin-bottom:16px;">
                <div style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);margin-bottom:12px;" data-i18n="station.history_socPower"></div>
                <div id="histSocPowerChart" style="height:240px;"></div>
            </div>
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px 20px;">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
                    <div style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);" data-i18n="station.history_energy"></div>
                    <div id="energyPeriodBtns" style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">
                        <button onclick="switchEnergyPeriod('day',this)" class="time-pill active" data-i18n="station.history_day">日</button>
                        <button onclick="switchEnergyPeriod('month',this)" class="time-pill" data-i18n="station.history_month">月</button>
                        <button onclick="switchEnergyPeriod('year',this)" class="time-pill" data-i18n="station.history_year">年</button>
                        <button onclick="switchEnergyPeriod('cumulative',this)" class="time-pill" data-i18n="station.history_cumulative">累计</button>
                        <div class="dp-wrapper" id="energyPickerWrapper">
                            <input type="text" id="energyTimeSelector" class="hist-date-input" readonly placeholder="YYYY-MM-DD">
                        </div>
                    </div>
                </div>
                <div style="display:flex;gap:12px;margin-bottom:12px;">
                    <div style="flex:1;background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.2);border-radius:8px;padding:10px 14px;">
                        <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:4px;" data-i18n="station.energy_charge_total">充电量</div>
                        <div style="display:flex;align-items:baseline;gap:4px;">
                            <span id="energyTotalCharge" style="font-size:20px;font-weight:700;color:rgba(99,179,237,0.95);">--</span>
                            <span style="font-size:11px;color:rgba(255,255,255,0.4);">MWh</span>
                        </div>
                    </div>
                    <div style="flex:1;background:rgba(255,193,7,0.08);border:1px solid rgba(255,193,7,0.2);border-radius:8px;padding:10px 14px;">
                        <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:4px;" data-i18n="station.energy_discharge_total">放电量</div>
                        <div style="display:flex;align-items:baseline;gap:4px;">
                            <span id="energyTotalDischarge" style="font-size:20px;font-weight:700;color:rgba(255,193,7,0.95);">--</span>
                            <span style="font-size:11px;color:rgba(255,255,255,0.4);">MWh</span>
                        </div>
                    </div>
                </div>
                <div id="histEnergyChart" style="height:220px;"></div>
            </div>`;
        // Reset chart instances for new DOM elements
        histSocPowerChart = null;
        histEnergyChart   = null;
        currentEnergyPeriod = 'day';
        _histPicker  = null;
        _energyPicker = null;
    }

    // ── Tab 4: 调度记录 ──
    const tabDispatch = document.getElementById('detailTabDispatch');
    if (tabDispatch) {
        tabDispatch.innerHTML = `
            <div class="detail-section">
                <div class="detail-section-title" data-i18n="station.tab_dispatchHistory"></div>
                <div class="dispatch-table-wrapper">
                    <table class="data-table">
                        <thead><tr>
                            <th data-i18n="station.dispatch_date"></th>
                            <th data-i18n="station.dispatch_hasDispatch"></th>
                            <th data-i18n="station.dispatch_chargeAmt"></th>
                            <th data-i18n="station.dispatch_dischargeAmt"></th>
                            <th data-i18n="station.dispatch_detailBtn"></th>
                        </tr></thead>
                        <tbody>${generateDailyScheduleRows(station)}</tbody>
                    </table>
                </div>
            </div>`;
    }

    // ── Tab 5: 获利（reports.html 风格） ──
    const tabProfit = document.getElementById('detailTabProfit');
    if (tabProfit) {
        const isEnLang = window.i18n && window.i18n.getCurrentLanguage && window.i18n.getCurrentLanguage().startsWith('en');
        tabProfit.innerHTML = `
            <div class="detail-section">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;flex-wrap:wrap;">
                    <button onclick="switchProfitPeriod2('day',this)" class="time-pill active" data-i18n="station.history_day">日</button>
                    <button onclick="switchProfitPeriod2('month',this)" class="time-pill" data-i18n="station.history_month">月</button>
                    <button onclick="switchProfitPeriod2('year',this)" class="time-pill" data-i18n="station.history_year">年</button>
                    <button onclick="switchProfitPeriod2('total',this)" class="time-pill" data-i18n="station.history_cumulative">累计</button>
                </div>
                <div class="profit-stats-grid" id="profitStatsGrid"></div>
                <div class="profit-view-tabs">
                    <button class="profit-view-tab active" onclick="switchProfitViewMode('chart',this)">📊 <span data-text-zh="图表视图" data-text-en="Chart View">图表视图</span></button>
                    <button class="profit-view-tab" onclick="switchProfitViewMode('table',this)">📋 <span data-text-zh="表格视图" data-text-en="Table View">表格视图</span></button>
                </div>
                <div id="profitChartView">
                    <div id="detailProfitChart2" style="height:360px;"></div>
                </div>
                <div id="profitTableView" style="display:none;">
                    <div style="overflow-x:auto;border-radius:10px;border:1px solid rgba(255,255,255,0.08);">
                        <table class="profit-report-table">
                            <thead><tr id="profitTableHead"></tr></thead>
                            <tbody id="profitTableBody"></tbody>
                        </table>
                    </div>
                </div>
            </div>`;
        profitChartInstance  = null;
        profitChartInstance2 = null;
        currentProfitPeriod  = 'day';
    }

    // i18n 更新
    if (typeof i18n !== 'undefined' && i18n.updatePageTexts) i18n.updatePageTexts();

    // 初始化地图
    setTimeout(() => initOwnerMap(station), 100);

    // 如果当前在 profit tab 则立即渲染（初次加载）
    setTimeout(() => {
        if (currentDetailTab === 'profit') {
            renderProfitReportCards();
            renderProfitReportChart();
            renderProfitReportTable();
        }
    }, 100);

    // 隐藏 loading overlay
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

/* ── 页面初始化 ─────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
    // 初始化顶部导航栏
    if (typeof HeaderNav !== 'undefined') {
        new HeaderNav({
            currentPage: 'station',
            containerId: 'headerContainer'
        });
    }

    const stationId = getUrlParam('id');
    if (!stationId) {
        showError('No station ID specified. Please go back and select a station.');
        return;
    }

    // 生成模拟数据并查找电站
    stationData = generateMockData(128);
    const station = stationData.find(s => s.id === stationId);

    if (!station) {
        showError(`Station "${stationId}" not found.`);
        return;
    }

    // 安全渲染：catch 任何异常，确保 loading overlay 始终消失
    function doRender() {
        try {
            renderPage(station);
        } catch (err) {
            console.error('[station-detail] renderPage error:', err);
            const overlay = document.getElementById('loadingOverlay');
            if (overlay) overlay.style.display = 'none';
            showError('Page load error: ' + (err && err.message ? err.message : err));
        }
    }

    // 保底：3 秒后无论如何隐藏 loading overlay
    setTimeout(function() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay && overlay.style.display !== 'none') {
            overlay.style.display = 'none';
        }
    }, 3000);

    // i18n.js 在本文件之前加载，通常已就绪；直接用短延迟确保 DOM 完全稳定
    setTimeout(doRender, 50);
});

function showError(msg) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
    const container = document.getElementById('mainContainer');
    if (container) {
        container.innerHTML = `
            <div style="text-align:center;padding:80px 20px;">
                <div style="font-size:48px;margin-bottom:16px;">⚠️</div>
                <div style="font-size:20px;color:#fff;margin-bottom:8px;">Station Not Found</div>
                <div style="font-size:14px;color:rgba(255,255,255,0.5);margin-bottom:32px;">${msg}</div>
                <button onclick="backToList()" style="padding:12px 24px;background:var(--color-primary);color:#000;border:none;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;">← Back to Stations</button>
            </div>`;
    }
}

// ── 角色权限：业主只看Overview，运维看全部 ──
(function() {
    const role = localStorage.getItem('userRole') || 'operator';
    if (role === 'owner') {
        document.querySelectorAll('.detail-tab-btn').forEach(btn => {
            if (btn.dataset.detailTab !== 'overview') {
                btn.style.display = 'none';
            }
        });
    }
    // 运维：显示所有tab（包括profit）
    if (role === 'operator') {
        document.querySelectorAll('.detail-tab-btn').forEach(btn => {
            btn.style.display = '';
        });
    }
})();
