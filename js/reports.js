/**
 * reports.js - 报表渲染引擎（排行榜 + 日志 + CSV 导出）
 * Phase 3: 澳洲储能电站管理平台
 */

/**
 * 渲染报表视图（根据角色自动切换内容）
 */
// Track which report sub-view to show
let reportSubView = 'default'; // 'default' | 'health'

function renderReports(subView) {
  const container = document.getElementById('view-reports');
  if (!container) return;

  if (subView) reportSubView = subView;

  const role = getCurrentUser();
  const isOwner = role === 'owner';

  // Dispose SoH chart first
  if (typeof disposeSohChart === 'function') disposeSohChart();

  if (isOwner && reportSubView === 'health') {
    renderHealthView(container);
  } else if (isOwner) {
    renderLeaderboard(container);
  } else {
    renderDispatchLogs(container, role);
  }
}

// ============ 业主：Health 视图 (SoH趋势 + 排行榜) ============

function renderHealthView(container) {
  container.innerHTML = `
    <div class="max-w-[1600px] mx-auto">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <i data-lucide="heart-pulse" class="w-5 h-5 text-red-400"></i>
            ${getTrans('soh_trend')}
          </h2>
          <p class="text-sm text-slate-400 mt-1">${getTrans('soh_trend_hint')}</p>
        </div>
      </div>
      <div class="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
        <div id="soh-chart" style="width:100%;height:350px;"></div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
  // Init chart after DOM is ready
  setTimeout(() => {
    if (typeof initSohChart === 'function') initSohChart();
  }, 100);
}

// ============ 业主：运维方绩效排行榜 ============

function renderLeaderboard(container) {
  const operators = getOperators();

  // 计算每个运维方的指标
  const rankings = operators.map(op => {
    const opStations = stations.filter(s => s.operator_id === op.id);
    const totalRevenue = opStations.reduce((sum, s) => sum + (s.revenue_today || 0), 0);
    const totalCapMW = opStations.reduce((sum, s) => {
      const cap = parseCapacity(s.capacity);
      return sum + cap.mw;
    }, 0);
    const revPerMW = totalCapMW > 0 ? totalRevenue / totalCapMW : 0;
    const totalSohLoss = opStations.reduce((sum, s) => {
      const defaultSoh = DEFAULT_STATIONS.find(ds => ds.id === s.id)?.soh || 100;
      return sum + (defaultSoh - s.soh);
    }, 0);
    const stationCount = opStations.length;

    return {
      id: op.id,
      name: op.name,
      totalRevenue,
      totalCapMW,
      revPerMW,
      totalSohLoss,
      stationCount
    };
  });

  // 按 Revenue/MW 排序（降序）
  rankings.sort((a, b) => b.revPerMW - a.revPerMW);

  container.innerHTML = `
    <div class="max-w-[1600px] mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <i data-lucide="trophy" class="w-5 h-5 text-amber-400"></i>
            ${getTrans('leaderboard')}
          </h2>
          <p class="text-sm text-slate-400 mt-1">${getTrans('report_owner_hint')}</p>
        </div>
        <button onclick="exportLeaderboardCSV()" class="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2">
          <i data-lucide="download" class="w-4 h-4"></i>
          ${getTrans('export_csv')}
        </button>
      </div>

      <!-- Ranking Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        ${rankings.map((r, i) => renderRankCard(r, i)).join('')}
      </div>

      <!-- Detail Table -->
      <div class="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-white/10">
              <th class="text-left px-4 py-3 text-slate-400 font-medium">${getTrans('rank')}</th>
              <th class="text-left px-4 py-3 text-slate-400 font-medium">${getTrans('table_operator')}</th>
              <th class="text-right px-4 py-3 text-slate-400 font-medium">${getTrans('table_total_rev')}</th>
              <th class="text-right px-4 py-3 text-slate-400 font-medium">${getTrans('table_total_cap')}</th>
              <th class="text-right px-4 py-3 text-slate-400 font-medium">${getTrans('table_rev_per_mw')}</th>
              <th class="text-right px-4 py-3 text-slate-400 font-medium">${getTrans('table_soh_loss')}</th>
            </tr>
          </thead>
          <tbody>
            ${rankings.map((r, i) => `
              <tr class="${i % 2 === 0 ? 'bg-white/[0.02]' : ''} border-b border-white/5">
                <td class="px-4 py-3 text-white font-medium">${i === 0 ? '👑 1' : i + 1}</td>
                <td class="px-4 py-3 text-white">${r.name}</td>
                <td class="px-4 py-3 text-right font-mono ${r.totalRevenue >= 0 ? 'text-emerald-400' : 'text-red-400'}">
                  ${r.totalRevenue >= 0 ? '' : '-'}A$${Math.abs(r.totalRevenue).toFixed(2)}
                </td>
                <td class="px-4 py-3 text-right font-mono text-slate-300">${r.totalCapMW.toFixed(1)} MW</td>
                <td class="px-4 py-3 text-right font-mono font-bold ${r.revPerMW >= 0 ? 'text-amber-400' : 'text-red-400'}">
                  ${r.revPerMW >= 0 ? '' : '-'}A$${Math.abs(r.revPerMW).toFixed(2)}/MW
                </td>
                <td class="px-4 py-3 text-right font-mono text-red-400">-${r.totalSohLoss.toFixed(4)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

function renderRankCard(ranking, index) {
  const isFirst = index === 0;
  const borderClass = isFirst ? 'border-amber-500/50 shadow-lg shadow-amber-500/10' : 'border-white/10';

  return `
    <div class="rounded-xl border ${borderClass} bg-white/5 p-5 card-fade-in">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          ${isFirst ? '<span class="text-2xl">👑</span>' : `<span class="text-lg text-slate-500 font-bold">#${index + 1}</span>`}
          <div>
            <h3 class="text-white font-bold">${ranking.name}</h3>
            <p class="text-xs text-slate-400">${ranking.stationCount} station${ranking.stationCount > 1 ? 's' : ''} · ${ranking.totalCapMW.toFixed(1)} MW</p>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-white/5 rounded-lg p-3 text-center">
          <p class="text-xs text-slate-500">${getTrans('table_total_rev')}</p>
          <p class="text-sm font-bold font-mono ${ranking.totalRevenue >= 0 ? 'text-emerald-400' : 'text-red-400'} mt-1">
            ${ranking.totalRevenue >= 0 ? '' : '-'}A$${Math.abs(ranking.totalRevenue).toFixed(2)}
          </p>
        </div>
        <div class="bg-white/5 rounded-lg p-3 text-center">
          <p class="text-xs text-slate-500">${getTrans('table_rev_per_mw')}</p>
          <p class="text-sm font-bold font-mono text-amber-400 mt-1">
            A$${ranking.revPerMW.toFixed(2)}
          </p>
        </div>
        <div class="bg-white/5 rounded-lg p-3 text-center">
          <p class="text-xs text-slate-500">${getTrans('table_soh_loss')}</p>
          <p class="text-sm font-bold font-mono text-red-400 mt-1">-${ranking.totalSohLoss.toFixed(4)}%</p>
        </div>
      </div>
    </div>
  `;
}

// ============ 运维方：调度日志 ============

function renderDispatchLogs(container, operatorId) {
  const logs = typeof getDispatchLogs === 'function' ? getDispatchLogs(operatorId) : [];

  const actionLabels = {
    'CHARGING': { icon: '⚡', color: 'text-blue-400' },
    'DISCHARGING': { icon: '🔋', color: 'text-emerald-400' },
    'SPIKE_DISCHARGE': { icon: '🔥', color: 'text-red-400' },
    'IDLE': { icon: '⏸', color: 'text-slate-400' }
  };

  container.innerHTML = `
    <div class="max-w-[1600px] mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2">
            <i data-lucide="scroll-text" class="w-5 h-5 text-emerald-400"></i>
            ${getTrans('logs_title')}
          </h2>
          <p class="text-sm text-slate-400 mt-1">${getTrans('report_op_hint')}</p>
        </div>
        <button onclick="exportLogsCSV('${operatorId}')" class="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
          ${logs.length === 0 ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>
          <i data-lucide="download" class="w-4 h-4"></i>
          ${getTrans('export_csv')}
        </button>
      </div>

      ${logs.length === 0 ? `
        <div class="flex flex-col items-center justify-center py-16 text-slate-500">
          <i data-lucide="clock" class="w-12 h-12 mb-3 opacity-40"></i>
          <p class="text-base">${getTrans('no_logs')}</p>
          <p class="text-sm mt-1">${getTrans('no_logs_hint')}</p>
        </div>
      ` : `
        <div class="bg-white/5 rounded-xl border border-white/10 overflow-x-auto">
          <table class="w-full text-sm min-w-[600px]">
            <thead>
              <tr class="border-b border-white/10">
                <th class="text-left px-4 py-3 text-slate-400 font-medium">${getTrans('table_time')}</th>
                <th class="text-left px-4 py-3 text-slate-400 font-medium">${getTrans('table_station')}</th>
                <th class="text-left px-4 py-3 text-slate-400 font-medium">${getTrans('table_action')}</th>
                <th class="text-right px-4 py-3 text-slate-400 font-medium">${getTrans('table_price')}</th>
                <th class="text-right px-4 py-3 text-slate-400 font-medium">${getTrans('table_revenue')}</th>
              </tr>
            </thead>
            <tbody>
              ${logs.slice().reverse().map((log, i) => {
                const style = actionLabels[log.action] || actionLabels['IDLE'];
                return `
                  <tr class="${i % 2 === 0 ? 'bg-white/[0.02]' : ''} border-b border-white/5">
                    <td class="px-4 py-3 font-mono text-slate-300 text-xs">${log.time}</td>
                    <td class="px-4 py-3 text-white">${log.stationName}</td>
                    <td class="px-4 py-3 ${style.color} font-medium">${style.icon} ${log.action}</td>
                    <td class="px-4 py-3 text-right font-mono text-amber-400">$${log.price.toFixed(2)}</td>
                    <td class="px-4 py-3 text-right font-mono ${log.revenue >= 0 ? 'text-emerald-400' : 'text-red-400'}">
                      ${log.revenue >= 0 ? '' : '-'}A$${Math.abs(log.revenue).toFixed(2)}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `}
    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

// ============ CSV 导出 ============

/**
 * 导出排行榜 CSV（业主用）
 */
function exportLeaderboardCSV() {
  const operators = getOperators();
  const rows = [['Rank', 'Operator', 'Total Revenue (AUD)', 'Total Capacity (MW)', 'Revenue/MW (AUD)', 'SoH Loss (%)']];

  const rankings = operators.map(op => {
    const opStations = stations.filter(s => s.operator_id === op.id);
    const totalRevenue = opStations.reduce((sum, s) => sum + (s.revenue_today || 0), 0);
    const totalCapMW = opStations.reduce((sum, s) => sum + parseCapacity(s.capacity).mw, 0);
    const revPerMW = totalCapMW > 0 ? totalRevenue / totalCapMW : 0;
    const totalSohLoss = opStations.reduce((sum, s) => {
      const defaultSoh = DEFAULT_STATIONS.find(ds => ds.id === s.id)?.soh || 100;
      return sum + (defaultSoh - s.soh);
    }, 0);
    return { name: op.name, totalRevenue, totalCapMW, revPerMW, totalSohLoss };
  }).sort((a, b) => b.revPerMW - a.revPerMW);

  rankings.forEach((r, i) => {
    rows.push([i + 1, r.name, r.totalRevenue.toFixed(2), r.totalCapMW.toFixed(1), r.revPerMW.toFixed(2), (-r.totalSohLoss).toFixed(4)]);
  });

  downloadCSV(rows, 'au-bess-leaderboard.csv');
}

/**
 * 导出调度日志 CSV（运维方用）
 */
function exportLogsCSV(operatorId) {
  const logs = typeof getDispatchLogs === 'function' ? getDispatchLogs(operatorId) : [];
  if (logs.length === 0) return;

  const rows = [['Time', 'Station', 'Action', 'Price ($/MWh)', 'Revenue (AUD)']];
  logs.forEach(l => {
    rows.push([l.time, l.stationName, l.action, l.price.toFixed(2), l.revenue.toFixed(2)]);
  });

  downloadCSV(rows, 'au-bess-dispatch-logs.csv');
}

/**
 * 通用 CSV 下载
 */
function downloadCSV(rows, filename) {
  const csvContent = rows.map(row =>
    row.map(cell => {
      const str = String(cell);
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')
  ).join('\n');

  // 添加 BOM 以支持 Excel 中文
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
