
        // Initialize HeaderNav
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof HeaderNav !== 'undefined') {
                new HeaderNav({
                    currentPage: 'station',
                    containerId: 'headerContainer'
                });
            }

            // Initialize data
            initializeData();
            renderTableView();

            // 启动实时数据更新
            startRealtimeUpdates();
        });

        // Mock station data
        let stationData = generateMockData(128);
        
        // 角色过滤：运维方只显示分配的电站
        (function applyRoleFilter() {
            const role = localStorage.getItem('userRole') || 'operator';
            if (role === 'operator') {
                // 运维方只看前 2 个电站（模拟分配）
                stationData = stationData.slice(0, 2);
            }
        })();

        function generateMockData(count) {
            // 澳洲大型储能电站配置
            const brands = ['Tesla', 'Fluence', 'BYD', 'Samsung SDI', 'LG Energy'];
            const models = ['Megapack 2', 'Gridstack', 'Cube Pro', 'E3-R', 'RESU Prime'];
            // NEM 市场区域 (含 WA)
            const regions = [
                { name: 'NSW', code: 'nsw', lat: -33.8688, lng: 151.2093 },
                { name: 'VIC', code: 'vic', lat: -37.8136, lng: 144.9631 },
                { name: 'QLD', code: 'qld', lat: -27.4705, lng: 153.0260 },
                { name: 'SA', code: 'sa', lat: -34.9285, lng: 138.6007 },
                { name: 'WA', code: 'wa', lat: -31.9505, lng: 115.8605 },
                { name: 'TAS', code: 'tas', lat: -42.8821, lng: 147.3272 },
                { name: 'ACT', code: 'act', lat: -35.2809, lng: 149.1300 }
            ];
            // 分离通讯状态和运行状态
            const commStatuses = ['online', 'offline'];
            const commWeights = [0.92, 0.08]; // 92% 在线, 8% 离线
            const runStatuses = ['charging', 'discharging', 'idle'];
            const runWeights = [0.44, 0.39, 0.17]; // 充电44%, 放电39%, 待机17%
            const runModes = ['FCAS响应', '套利模式', 'VPP调度', '备用待命', '维护模式'];

            // 澳洲大型电站名称
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
                // 跳过 AU0002
                if (i === 2) continue;

                const commStatus = weightedRandom(commStatuses, commWeights);
                const runStatus = commStatus === 'online' ? weightedRandom(runStatuses, runWeights) : 'idle';
                const region = regions[Math.floor(Math.random() * regions.length)];
                const soc = Math.floor(Math.random() * 100);
                // 10-50 MW 级功率
                const capacity = 10 + Math.floor(Math.random() * 40); // 10-50 MW
                const power = runStatus === 'charging' ? Math.floor(Math.random() * capacity) :
                              runStatus === 'discharging' ? -Math.floor(Math.random() * capacity) : 0;

                // 澳元收益 (大型电站日收益 $5,000 - $50,000)
                const todayProfit = (Math.random() * 45000 + 5000 - 10000).toFixed(2);
                const totalProfit = (Math.random() * 5000000 + 1000000).toFixed(2);

                data.push({
                    id: `AU${String(i).padStart(4, '0')}`,
                    name: i <= stationNames.length ? stationNames[i-1] : `BESS Site ${String.fromCharCode(65 + Math.floor((i-1) / 26))}${((i-1) % 26) + 1}`,
                    region: region.name,
                    regionCode: region.code,
                    brand: brands[Math.floor(Math.random() * brands.length)],
                    model: models[Math.floor(Math.random() * models.length)],
                    commStatus: commStatus,  // 通讯状态: online/offline
                    runStatus: runStatus,    // 运行状态: charging/discharging/idle
                    // 保留 status 字段用于向后兼容,组合两个状态
                    status: commStatus === 'offline' ? 'offline' : runStatus,
                    runMode: runModes[Math.floor(Math.random() * runModes.length)],
                    autoMode: Math.random() > 0.5,  // 智能托管模式: true=机器人, false=人工
                    soc: soc,
                    power: power,
                    capacity: capacity,
                    todayProfit: todayProfit,
                    totalProfit: totalProfit,
                    // 澳洲坐标 (在各州中心点周围随机偏移)
                    lat: region.lat + (Math.random() - 0.5) * 4,
                    lng: region.lng + (Math.random() - 0.5) * 4,
                    // NEM 市场数据
                    nemPrice: (30 + Math.random() * 120).toFixed(2), // $/MWh
                    fcasEnabled: Math.random() > 0.3
                });
            }
            return data;
        }

        function weightedRandom(items, weights) {
            const totalWeight = weights.reduce((sum, w) => sum + w, 0);
            let random = Math.random() * totalWeight;
            for (let i = 0; i < items.length; i++) {
                random -= weights[i];
                if (random <= 0) return items[i];
            }
            return items[items.length - 1];
        }

        // Sorting state
        let sortField = null;   // 'capacity' | 'soc' | 'power' | 'todayProfit' | 'totalProfit' | null
        let sortOrder = null;   // 'asc' | 'desc' | null

        function toggleSort(field) {
            if (sortField === field) {
                // 同一列：asc -> desc -> 取消
                if (sortOrder === 'asc') {
                    sortOrder = 'desc';
                } else {
                    sortField = null;
                    sortOrder = null;
                }
            } else {
                sortField = field;
                sortOrder = 'asc';
            }

            // 更新表头样式
            document.querySelectorAll('.data-table th.sortable').forEach(th => {
                th.classList.remove('sort-asc', 'sort-desc');
                if (th.dataset.sort === sortField) {
                    th.classList.add(sortOrder === 'asc' ? 'sort-asc' : 'sort-desc');
                }
            });

            tableCurrentPage = 1;
            renderTableView();
        }

        // View switching
        let currentView = 'table';

        function switchView(view) {
            currentView = view;

            // Update buttons
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.view === view);
            });

            // Update views
            document.querySelectorAll('.view-content').forEach(content => {
                content.classList.toggle('active', content.id === view + 'View');
            });

            // Render corresponding view
            if (view === 'table') {
                renderTableView();
            } else if (view === 'card') {
                renderCardView();
            }
        }

        // Table View
        let tableCurrentPage = 1;
        const tablePageSize = 20;

        function renderTableView() {
            const filteredData = getFilteredData();
            const startIdx = (tableCurrentPage - 1) * tablePageSize;
            const endIdx = startIdx + tablePageSize;
            const pageData = filteredData.slice(startIdx, endIdx);

            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = pageData.map(station => `
                <tr>
                    <td><input type="checkbox" class="station-checkbox" data-id="${station.id}"></td>
                    <td><strong>${station.name}</strong></td>
                    <td><strong>${station.capacity}</strong></td>
                    <td>${station.region}</td>
                    <td>${getStatusBadge(station.status, station.autoMode)}</td>
                    <td>${getSocBar(station.soc)}</td>
                    <td>${station.power > 0 ? '+' : ''}${station.power} MW</td>
                    <td class="profit-value ${parseFloat(station.todayProfit) >= 0 ? 'positive' : 'negative'}">
                        ${parseFloat(station.todayProfit) >= 0 ? '+' : ''}$${formatNumber(station.todayProfit)}
                    </td>
                    <td class="profit-value positive">$${formatNumber(station.totalProfit)}</td>
                    <td>
                        <button class="table-action-btn" style="background: rgba(0, 255, 136, 0.1); border-color: rgba(0, 255, 136, 0.3); color: #00ff88;" onclick="viewStation('${station.id}')" data-i18n="station.detail" data-i18n-key="station.detail">${window.i18n ? window.i18n.getText("station.detail") : "Details"}</button>
                        <button class="table-action-btn" style="background: rgba(255, 214, 10, 0.1); border-color: rgba(255, 214, 10, 0.3); color: #FFD60A;" onclick="editStation('${station.id}')" data-i18n="station.edit">编辑</button>
                        <button class="table-action-btn" style="background: rgba(255, 59, 48, 0.1); border-color: rgba(255, 59, 48, 0.3); color: #ff3b30;" onclick="deleteStation('${station.id}')" data-i18n="station.delete">删除</button>
                    </td>
                </tr>
            `).join('');

            renderPagination('tablePagination', filteredData.length, tableCurrentPage, tablePageSize, (page) => {
                tableCurrentPage = page;
                renderTableView();
            });

            // 动态内容 i18n 刷新
            if (typeof i18n !== 'undefined' && i18n.updatePageTexts) {
                i18n.updatePageTexts();
            }
            hideOperatorButtons();
        }

        function getStatusBadge(status, autoMode = false) {
            const statusMap = {
                'online': { i18nKey: 'station.status_online', class: 'online' },
                'offline': { i18nKey: 'station.status_offline', class: 'offline' },
                'charging': { i18nKey: 'station.status_charging', class: 'charging' },
                'discharging': { i18nKey: 'station.status_discharging', class: 'discharging' },
                'idle': { i18nKey: 'station.status_idle', class: 'idle' }
            };
            const s = statusMap[status] || statusMap['idle'];
            const t = (k, f) => window.i18n ? window.i18n.getText(k) : f;
            const modeIcon = autoMode ? '🤖' : '👤';
            const modeText = autoMode ? t('station.mode_auto', 'Auto') : t('station.mode_manual', 'Manual');
            const modeTitle = autoMode ? t('station.mode_auto_title', 'Auto Mode') : t('station.mode_manual_title', 'Manual Mode');
            const modeClass = autoMode ? 'auto' : 'manual';
            return `<span class="status-badge ${s.class}"><span class="mode-icon ${modeClass}" title="${modeTitle}">${modeIcon} ${modeText}</span><span class="status-dot"></span><span data-i18n="${s.i18nKey}"></span></span>`;
        }

        function getSocBar(soc) {
            const color = soc > 60 ? '#00ff88' : soc > 30 ? '#ffd93d' : '#ff6b6b';
            return `
                <div class="soc-bar">
                    <span class="soc-value" style="color: ${color}; font-weight: 600;">${soc}%</span>
                </div>
            `;
        }

        // Card View
        let cardCurrentPage = 1;
        const cardPageSize = 12;

        function renderCardView() {
            const filteredData = getFilteredData();
            const startIdx = (cardCurrentPage - 1) * cardPageSize;
            const endIdx = startIdx + cardPageSize;
            const pageData = filteredData.slice(startIdx, endIdx);

            const grid = document.getElementById('cardsGrid');
            grid.innerHTML = pageData.map(station => `
                <div class="station-card" onclick="viewStation('${station.id}')">
                    <div class="station-card-header">
                        <div>
                            <div class="station-name" title="${station.name}">${station.name}</div>
                            <div class="station-id" title="${station.capacity} MW">${station.capacity} MW</div>
                        </div>
                        ${getStatusBadge(station.status, station.autoMode)}
                    </div>
                    <div class="station-card-body">
                        <div class="station-stat">
                            <div class="station-stat-label">SOC</div>
                            <div class="station-stat-value" title="${station.soc}%">${station.soc}%</div>
                        </div>
                        <div class="station-stat">
                            <div class="station-stat-label" data-i18n-key="station.power">${window.i18n ? window.i18n.getText("station.power") : "Power"}</div>
                            <div class="station-stat-value" title="${station.power > 0 ? '+' : ''}${station.power} MW">${station.power > 0 ? '+' : ''}${station.power} MW</div>
                        </div>
                        <div class="station-stat">
                            <div class="station-stat-label" data-i18n-key="station.todayProfit">${window.i18n ? window.i18n.getText("station.todayProfit") : "Today Profit"}</div>
                            <div class="station-stat-value ${parseFloat(station.todayProfit) >= 0 ? 'positive' : 'negative'}" title="$${formatNumber(station.todayProfit)}">
                                $${formatNumber(station.todayProfit)}
                            </div>
                        </div>
                        <div class="station-stat">
                            <div class="station-stat-label" data-i18n-key="station.totalProfit">${window.i18n ? window.i18n.getText("station.totalProfit") : "Total Profit"}</div>
                            <div class="station-stat-value ${parseFloat(station.totalProfit) >= 0 ? 'positive' : 'negative'}" title="$${formatNumber(station.totalProfit)}">
                                $${formatNumber(station.totalProfit)}
                            </div>
                        </div>
                    </div>
                    <div class="station-card-footer">
                        <div class="station-location" title="${station.region}, Australia">
                            <span class="icon">📍</span>
                            <span>${station.region}, Australia</span>
                        </div>
                        <div class="station-actions">
                            <button class="station-action-btn" onclick="event.stopPropagation(); controlStation('${station.id}')" data-i18n-key="station.detail">${window.i18n ? window.i18n.getText("station.detail") : "Details"}</button>
                        </div>
                    </div>
                </div>
            `).join('');

            renderPagination('cardPagination', filteredData.length, cardCurrentPage, cardPageSize, (page) => {
                cardCurrentPage = page;
                renderCardView();
            });

            // 动态内容 i18n 刷新
            if (typeof i18n !== 'undefined' && i18n.updatePageTexts) {
                i18n.updatePageTexts();
            }
            hideOperatorButtons();
        }


        // Pagination
        function renderPagination(containerId, totalItems, currentPage, pageSize, onPageChange) {
            const totalPages = Math.ceil(totalItems / pageSize);
            const container = document.getElementById(containerId);

            let paginationHTML = `
                <div class="pagination-info">
                    ${window.i18n ? window.i18n.getText('common.total') : '共'} ${totalItems} ${window.i18n ? window.i18n.getText('common.items') : '条'}${window.i18n ? ', ' : '，'}${window.i18n ? window.i18n.getText('common.page') : '第'} ${currentPage}/${totalPages} ${window.i18n ? '' : '页'}
                </div>
                <div class="pagination-buttons">
                    <button class="page-btn" onclick="(${onPageChange.toString()})(1)" ${currentPage === 1 ? 'disabled' : ''}>«</button>
                    <button class="page-btn" onclick="(${onPageChange.toString()})(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>‹</button>
            `;

            // Page numbers
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + 4);
            if (endPage - startPage < 4) {
                startPage = Math.max(1, endPage - 4);
            }

            for (let i = startPage; i <= endPage; i++) {
                paginationHTML += `
                    <button class="page-btn ${i === currentPage ? 'active' : ''}"
                            onclick="(${onPageChange.toString()})(${i})">${i}</button>
                `;
            }

            paginationHTML += `
                    <button class="page-btn" onclick="(${onPageChange.toString()})(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>›</button>
                    <button class="page-btn" onclick="(${onPageChange.toString()})(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>»</button>
                </div>
            `;

            container.innerHTML = paginationHTML;
        }

        // Filter functions
        function getFilteredData() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const statusFilter = document.getElementById('statusFilter').value;
            const regionFilter = document.getElementById('regionFilter').value;

            let result = stationData.filter(station => {
                // 名称搜索
                const matchSearch = !searchTerm ||
                    station.name.toLowerCase().includes(searchTerm);

                // 地区筛选
                const matchRegion = regionFilter === 'all' ||
                    station.region.toLowerCase().includes(regionFilter);

                // 状态筛选（合并了通讯状态和运行状态）
                let matchStatus = true;
                if (statusFilter !== 'all') {
                    if (statusFilter === 'offline') {
                        matchStatus = station.commStatus === 'offline';
                    } else {
                        // online-charging, online-discharging, online-idle
                        const [comm, run] = statusFilter.split('-');
                        matchStatus = station.commStatus === comm && station.runStatus === run;
                    }
                }

                return matchSearch && matchRegion && matchStatus;
            });

            // 排序
            if (sortField && sortOrder) {
                result = result.slice().sort((a, b) => {
                    let valA, valB;
                    switch (sortField) {
                        case 'soc':
                            valA = a.soc;
                            valB = b.soc;
                            break;
                        case 'power':
                            valA = a.power;
                            valB = b.power;
                            break;
                        case 'todayProfit':
                            valA = parseFloat(a.todayProfit);
                            valB = parseFloat(b.todayProfit);
                            break;
                        case 'totalProfit':
                            valA = parseFloat(a.totalProfit);
                            valB = parseFloat(b.totalProfit);
                            break;
                        default:
                            return 0;
                    }
                    return sortOrder === 'asc' ? valA - valB : valB - valA;
                });
            }

            return result;
        }

        function applyFilters() {
            tableCurrentPage = 1;
            cardCurrentPage = 1;
            if (currentView === 'table') renderTableView();
            else if (currentView === 'card') renderCardView();
            updateStats();
        }

        function resetFilters() {
            document.getElementById('searchInput').value = '';
            document.getElementById('regionFilter').value = 'all';
            document.getElementById('statusFilter').value = 'all';
            tableCurrentPage = 1;
            cardCurrentPage = 1;

            if (currentView === 'table') renderTableView();
            else if (currentView === 'card') renderCardView();
            updateStats();
        }

        function initializeData() {
            // 支持回车键触发查询
            document.getElementById('searchInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    applyFilters();
                }
            });

            updateStats();
        }

        function updateStats() {
            // 统计功能已移除
        }

        // 模拟实时数据更新（仿真联动）
        function startRealtimeUpdates() {
            setInterval(() => {
                let dataChanged = false;

                stationData.forEach(station => {
                    // 跳过离线设备
                    if (station.commStatus === 'offline') {
                        // 1% 几率上线
                        if (Math.random() > 0.99) {
                            station.commStatus = 'online';
                            station.runStatus = 'idle';
                            station.power = 0;
                            station.status = 'idle'; // 更新组合状态
                            dataChanged = true;
                        }
                        return;
                    }

                    // 10% 几率更新 SOC（根据当前运行状态联动）
                    if (Math.random() > 0.9) {
                        if (station.runStatus === 'charging') {
                            station.soc = Math.min(100, station.soc + Math.floor(Math.random() * 3 + 1));
                        } else if (station.runStatus === 'discharging') {
                            station.soc = Math.max(0, station.soc - Math.floor(Math.random() * 3 + 1));
                        } else {
                            station.soc = Math.max(0, Math.min(100, station.soc + Math.floor(Math.random() * 3 - 1)));
                        }
                        dataChanged = true;
                    }

                    // 状态联动：根据 SOC 自动切换运行状态（更仿真）
                    if (station.runStatus === 'charging' && station.soc >= 95) {
                        // 充满切换为待机或放电
                        station.runStatus = Math.random() > 0.5 ? 'idle' : 'discharging';
                        station.power = station.runStatus === 'discharging' ? -Math.floor(Math.random() * station.capacity) : 0;
                        station.status = station.runStatus; // 更新组合状态
                        dataChanged = true;
                    } else if (station.runStatus === 'discharging' && station.soc <= 5) {
                        // 放空切换为待机或充电
                        station.runStatus = Math.random() > 0.5 ? 'idle' : 'charging';
                        station.power = station.runStatus === 'charging' ? Math.floor(Math.random() * station.capacity) : 0;
                        station.status = station.runStatus; // 更新组合状态
                        dataChanged = true;
                    }

                    // 3% 几率随机状态切换（模拟调度指令）
                    if (Math.random() > 0.97) {
                        const runStatuses = ['charging', 'discharging', 'idle'];
                        const newRunStatus = runStatuses[Math.floor(Math.random() * runStatuses.length)];
                        if (newRunStatus !== station.runStatus) {
                            station.runStatus = newRunStatus;
                            if (newRunStatus === 'charging') {
                                station.power = Math.floor(Math.random() * station.capacity);
                            } else if (newRunStatus === 'discharging') {
                                station.power = -Math.floor(Math.random() * station.capacity);
                            } else {
                                station.power = 0;
                            }
                            station.status = newRunStatus; // 更新组合状态
                            dataChanged = true;
                        }
                    }

                    // 1% 几率离线
                    if (Math.random() > 0.99) {
                        station.commStatus = 'offline';
                        station.runStatus = 'idle';
                        station.power = 0;
                        station.status = 'offline'; // 更新组合状态
                        dataChanged = true;
                    }

                    // 5% 几率更新功率
                    if (Math.random() > 0.95) {
                        if (station.runStatus === 'charging') {
                            station.power = Math.floor(Math.random() * station.capacity);
                        } else if (station.runStatus === 'discharging') {
                            station.power = -Math.floor(Math.random() * station.capacity);
                        }
                        dataChanged = true;
                    }

                    // 更新 NEM 电价（模拟实时波动）
                    station.nemPrice = (30 + Math.random() * 120).toFixed(2);

                    // 更新今日净利润（小幅波动）
                    if (Math.random() > 0.8) {
                        const delta = (Math.random() * 500 - 100).toFixed(2);
                        station.todayProfit = (parseFloat(station.todayProfit) + parseFloat(delta)).toFixed(2);
                    }
                });

                // 统计面板与视图同步刷新
                updateStats();
                if (dataChanged) {
                    if (currentView === 'table') {
                        renderTableView();
                    } else if (currentView === 'card') {
                        renderCardView();
                    }
                }
            }, 10000); // 每10秒更新一次
        }

        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // 格式化数字（添加千位分隔符）
        function formatNumber(num) {
            return parseFloat(num).toLocaleString('en-AU', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
        }

        // Action functions
        function viewStation(id) {
            const station = stationData.find(s => s.id === id);
            if (station) {
                showStationDetail(station);
            }
        }

        function editStation(id) {
            const station = stationData.find(s => s.id === id);
            if (!station) return;

            // TODO: 实现编辑功能
            alert(`编辑电站: ${station.name}\n此功能待实现`);
        }

        function deleteStation(id) {
            const station = stationData.find(s => s.id === id);
            if (!station) return;

            // 创建自定义确认弹窗
            const modal = document.createElement('div');
            modal.className = 'station-modal';
            modal.style.display = 'flex';
            modal.innerHTML = `
                <div class="station-modal-content" style="max-width: 450px;">
                    <div class="modal-header">
                        <h2>⚠️ 确认删除</h2>
                        <button class="modal-close" onclick="this.closest('.station-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body" style="padding: 30px 25px;">
                        <p style="font-size: 16px; color: #fff; margin-bottom: 15px;">
                            确定要删除以下电站吗？
                        </p>
                        <div style="background: rgba(255, 59, 48, 0.1); border: 1px solid rgba(255, 59, 48, 0.3); border-radius: 10px; padding: 15px; margin: 20px 0;">
                            <div style="font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 5px;">
                                ${station.name}
                            </div>
                            <div style="font-size: 13px; color: #8e8e93;">
                                ${station.id} · ${station.region} · ${station.capacity} MW
                            </div>
                        </div>
                        <p style="font-size: 14px; color: #ff3b30; margin-top: 15px;">
                            ⚠️ 此操作无法撤销，电站数据将被永久删除
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button class="action-btn" onclick="this.closest('.station-modal').remove()">取消</button>
                        <button class="action-btn" style="background: #ff3b30; border-color: #ff3b30;" onclick="confirmDeleteStation('${id}')">确认删除</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        function confirmDeleteStation(id) {
            const station = stationData.find(s => s.id === id);
            const index = stationData.findIndex(s => s.id === id);
            if (index > -1) {
                stationData.splice(index, 1);

                // 关闭弹窗
                document.querySelectorAll('.station-modal').forEach(m => m.remove());

                // 刷新当前视图
                if (currentView === 'table') renderTableView();
                else if (currentView === 'card') renderCardView();
                updateStats();

                // 显示删除成功提示
                showToast(`电站 "${station.name}" 已删除`);
            }
        }

        // i18n 辅助：获取翻译文本（安全调用）
        function t(key) {
            if (typeof i18n !== 'undefined' && i18n.getText) {
                const text = i18n.getText(key);
                return text !== key ? text : '';
            }
            return '';
        }

        // 详情页 Tab 状态
        let currentDetailTab = 'overview';
        let currentDetailStation = null;
        let profitChartInstance = null;
        let detailResizeHandler = null;

        // 加权随机索引
        function weightedRandomIndex(weights) {
            const total = weights.reduce((s, w) => s + w, 0);
            let r = Math.random() * total;
            for (let i = 0; i < weights.length; i++) {
                r -= weights[i];
                if (r <= 0) return i;
            }
            return weights.length - 1;
        }

        // 生成模拟操作日志
        function generateMockLogs(station) {
            const logTemplates = [
                { tag: 'info', tagI18n: 'station.log_info', msgKeys: ['station.log_selfCheck', 'station.log_nemSync', 'station.log_scadaOk', 'station.log_tempOk'] },
                { tag: 'success', tagI18n: 'station.log_success', msgKeys: ['station.log_strategyExec', 'station.log_fcasCmd', 'station.log_settlement', 'station.log_modeSwitch'] },
                { tag: 'warn', tagI18n: 'station.log_warn', msgKeys: ['station.log_tempHigh', 'station.log_lowSoc', 'station.log_priceAnomaly', 'station.log_commDelay'] },
                { tag: 'error', tagI18n: 'station.log_error', msgKeys: ['station.log_bmsDisconnect', 'station.log_pcsOvertemp', 'station.log_inverterStop'] }
            ];
            const logs = [];
            const now = new Date();
            for (let i = 0; i < 8; i++) {
                const tpl = logTemplates[Math.floor(Math.random() * logTemplates.length)];
                const msgKey = tpl.msgKeys[Math.floor(Math.random() * tpl.msgKeys.length)];
                const time = new Date(now.getTime() - i * (5 + Math.random() * 30) * 60000);
                const timeStr = time.toLocaleString('en-AU', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                logs.push(`<div class="detail-log-item">
                    <span class="detail-log-time">${timeStr}</span>
                    <span class="detail-log-content"><span class="detail-log-tag ${tpl.tag}" data-i18n="${tpl.tagI18n}"></span><span data-i18n="${msgKey}"></span></span>
                </div>`);
            }
            return logs.join('');
        }

        // 生成设备卡片
        function generateEquipmentCards(station) {
            const equipmentList = [
                { name: 'BMS-01', typeI18n: 'station.equip_type_bms', status: 'online', details: [
                    { labelI18n: 'station.equip_manufacturer', value: station.brand },
                    { labelI18n: 'station.equip_model', value: 'BMS-3000 Pro' },
                    { labelI18n: 'station.equip_firmware', value: 'v4.2.1' },
                    { labelI18n: 'station.equip_cells', value: `${station.capacity * 120} cells` },
                    { labelI18n: 'station.equip_temp', value: `${(25 + Math.random() * 10).toFixed(1)}°C` }
                ]},
                { name: 'PCS-01', typeI18n: 'station.equip_type_pcs', status: station.commStatus === 'offline' ? 'offline' : 'online', details: [
                    { labelI18n: 'station.equip_manufacturer', value: 'ABB' },
                    { labelI18n: 'station.equip_model', value: 'PCS-5000' },
                    { labelI18n: 'station.equip_ratedPower', value: `${station.capacity} MW` },
                    { labelI18n: 'station.equip_efficiency', value: `${(95 + Math.random() * 3).toFixed(1)}%` },
                    { labelI18n: 'station.equip_runHours', value: `${Math.floor(2000 + Math.random() * 6000)} h` }
                ]},
                { name: 'XFMR-01', typeI18n: 'station.equip_type_transformer', status: 'online', details: [
                    { labelI18n: 'station.equip_manufacturer', value: 'Siemens' },
                    { labelI18n: 'station.equip_model', value: 'GEAFOL Cast Resin' },
                    { labelI18n: 'station.equip_ratedPower', value: `${(station.capacity * 1.2).toFixed(1)} MVA` },
                    { labelI18n: 'station.equip_voltage', value: '33kV / 0.69kV' },
                    { labelI18n: 'station.equip_temp', value: `${(40 + Math.random() * 15).toFixed(1)}°C` }
                ]},
                { name: 'EMS-01', typeI18n: 'station.equip_type_ems', status: 'online', details: [
                    { labelI18n: 'station.equip_manufacturer', value: 'Schneider Electric' },
                    { labelI18n: 'station.equip_model', value: 'EcoStruxure Microgrid' },
                    { labelI18n: 'station.equip_firmware', value: 'v6.1.3' },
                    { labelI18n: 'station.equip_protocol', value: 'IEC 61850 / Modbus TCP' },
                    { labelI18n: 'station.equip_uptime', value: '99.97%' }
                ]},
                { name: 'HVAC-01', typeI18n: 'station.equip_type_hvac', status: 'online', details: [
                    { labelI18n: 'station.equip_manufacturer', value: 'Daikin' },
                    { labelI18n: 'station.equip_model', value: 'VRV-X Series' },
                    { labelI18n: 'station.equip_capacity', value: '120 kW' },
                    { labelI18n: 'station.equip_temp', value: `${(22 + Math.random() * 3).toFixed(1)}°C` },
                    { labelI18n: 'station.equip_mode', value: 'Auto' }
                ]},
                { name: 'METER-01', typeI18n: 'station.equip_type_meter', status: 'online', details: [
                    { labelI18n: 'station.equip_manufacturer', value: 'Landis+Gyr' },
                    { labelI18n: 'station.equip_model', value: 'E650 Series 4' },
                    { labelI18n: 'station.equip_accuracy', value: 'Class 0.2s' },
                    { labelI18n: 'station.equip_protocol', value: 'DLMS/COSEM' },
                    { labelI18n: 'station.equip_lastCalibration', value: '2024-11-15' }
                ]}
            ];
            return equipmentList.map(equip => `
                <div class="equipment-card">
                    <div class="equipment-card-header">
                        <div>
                            <div class="equipment-name">${equip.name}</div>
                            <div class="equipment-type" data-i18n="${equip.typeI18n}"></div>
                        </div>
                        ${getStatusBadge(equip.status)}
                    </div>
                    <div class="equipment-stats">
                        ${equip.details.map(d => `
                            <div class="equipment-stat-row">
                                <span class="equipment-stat-label" data-i18n="${d.labelI18n}"></span>
                                <span class="equipment-stat-value">${d.value}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }

        // 生成调度记录
        function generateDispatchRows(station) {
            const actions = [
                { i18n: 'station.dispatch_charge' },
                { i18n: 'station.dispatch_discharge' },
                { i18n: 'station.dispatch_fcasResponse' },
                { i18n: 'station.dispatch_peakShaving' },
                { i18n: 'station.dispatch_vppDispatch' },
                { i18n: 'station.dispatch_emergencyStop' }
            ];
            const sources = [
                { i18n: 'station.dispatch_src_aemo' },
                { i18n: 'station.dispatch_src_ems' },
                { i18n: 'station.dispatch_src_manual' },
                { i18n: 'station.dispatch_src_vpp' }
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
            const now = new Date();
            for (let i = 0; i < 20; i++) {
                const time = new Date(now.getTime() - i * (15 + Math.random() * 45) * 60000);
                const timeStr = time.toLocaleString('en-AU', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const action = actions[Math.floor(Math.random() * actions.length)];
                const source = sources[Math.floor(Math.random() * sources.length)];
                const operator = operators[Math.floor(Math.random() * operators.length)];
                const power = (Math.random() * station.capacity).toFixed(1);
                const duration = `${Math.floor(5 + Math.random() * 55)} min`;
                const result = results[weightedRandomIndex(resultWeights)];
                rows.push(`<tr>
                    <td style="white-space:nowrap">${timeStr}</td>
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

        // 生成获利 KPI 卡片
        function generateProfitSummaryCards(station) {
            const todayProfit = parseFloat(station.todayProfit);
            const totalProfit = parseFloat(station.totalProfit);
            const weekProfit = todayProfit * (5 + Math.random() * 2);
            const monthProfit = todayProfit * (20 + Math.random() * 10);
            const avgDailyProfit = monthProfit / 30;
            const roi = ((totalProfit / (station.capacity * 1500000)) * 100).toFixed(1);
            const cards = [
                { labelI18n: 'station.profit_today', value: `$${formatNumber(todayProfit)}`, cls: todayProfit >= 0 ? 'positive' : 'negative' },
                { labelI18n: 'station.profit_thisWeek', value: `$${formatNumber(weekProfit.toFixed(0))}`, cls: weekProfit >= 0 ? 'positive' : 'negative' },
                { labelI18n: 'station.profit_thisMonth', value: `$${formatNumber(monthProfit.toFixed(0))}`, cls: monthProfit >= 0 ? 'positive' : 'negative' },
                { labelI18n: 'station.profit_total', value: `$${formatNumber(totalProfit)}`, cls: 'positive' },
                { labelI18n: 'station.profit_avgDaily', value: `$${formatNumber(avgDailyProfit.toFixed(0))}`, cls: avgDailyProfit >= 0 ? 'positive' : 'negative' },
                { labelI18n: 'station.profit_roi', value: `${roi}%`, cls: 'positive' }
            ];
            return cards.map(c => `
                <div class="profit-summary-card">
                    <div class="profit-summary-label" data-i18n="${c.labelI18n}"></div>
                    <div class="profit-summary-value ${c.cls}">${c.value}</div>
                </div>
            `).join('');
        }

        // 获利图表渲染（懒加载）
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

        // 获利周期切换
        function switchProfitPeriod(period) {
            document.querySelectorAll('.profit-period-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.period === period));
            renderProfitChart(period);
        }

        // Tab 切换
        function switchDetailTab(tab) {
            currentDetailTab = tab;
            document.querySelectorAll('.detail-tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.detailTab === tab));
            const tabMap = { overview: 'detailTabOverview', equipment: 'detailTabEquipment', dispatch: 'detailTabDispatch', profit: 'detailTabProfit' };
            Object.values(tabMap).forEach(id => { const el = document.getElementById(id); if (el) el.classList.toggle('active', id === tabMap[tab]); });
            if (typeof i18n !== 'undefined' && i18n.updatePageTexts) i18n.updatePageTexts();
            if (tab === 'profit' && !profitChartInstance) renderProfitChart();
            if (tab === 'overview' || (tab === 'profit' && profitChartInstance)) {
                setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
            }
        }

        function showStationDetail(station) {
            // 重置 tab 状态
            currentDetailStation = station;
            currentDetailTab = 'overview';
            if (profitChartInstance) {
                profitChartInstance.dispose();
                profitChartInstance = null;
            }

            // 隐藏列表页，显示详情页
            document.getElementById('stationListPage').style.display = 'none';
            const detailPage = document.getElementById('stationDetailPage');
            detailPage.classList.add('active');

            const socColor = station.soc > 60 ? '#00ff88' : station.soc > 30 ? '#ffd93d' : '#ff6b6b';
            const powerDisplay = station.power > 0 ? `+${station.power}` : station.power;
            const powerClass = station.power > 0 ? 'charging' : station.power < 0 ? 'discharging' : '';
            const profitClass = parseFloat(station.todayProfit) >= 0 ? 'positive' : 'negative';
            const fcasI18nKey = station.fcasEnabled ? 'station.detail_fcasEnabled' : 'station.detail_fcasDisabled';
            const commI18nKey = station.commStatus === 'offline' ? 'station.offline' : 'station.online';

            detailPage.innerHTML = `
                <!-- Breadcrumb -->
                <div class="detail-breadcrumb">
                    <a onclick="backToList()" data-i18n="station.detail_breadcrumb"></a>
                    <span class="separator">/</span>
                    <span class="current">${station.name}</span>
                </div>

                <!-- Top Bar -->
                <div class="detail-top-bar">
                    <div class="detail-title-section">
                        <button class="detail-back-btn" onclick="backToList()">←</button>
                        <div>
                            <div class="detail-station-name">${station.name} ${getStatusBadge(station.status, station.autoMode)}</div>
                            <div class="detail-station-id">${station.id} · ${station.region}, Australia · ${station.capacity} MW</div>
                        </div>
                    </div>
                    <div class="detail-actions">
                        <button class="action-btn" onclick="controlStation('${station.id}')" data-i18n="station.detail_remoteControl"></button>
                        <button class="action-btn primary" onclick="backToList()" data-i18n="station.detail_backToList"></button>
                    </div>
                </div>

                <!-- Tab Bar -->
                <div class="detail-tab-bar">
                    <button class="detail-tab-btn active" data-detail-tab="overview" onclick="switchDetailTab('overview')">
                        <span data-i18n="station.tab_overview"></span>
                    </button>
                    <button class="detail-tab-btn" data-detail-tab="equipment" onclick="switchDetailTab('equipment')">
                        <span data-i18n="station.tab_equipment"></span>
                    </button>
                    <button class="detail-tab-btn" data-detail-tab="dispatch" onclick="switchDetailTab('dispatch')">
                        <span data-i18n="station.tab_dispatch"></span>
                    </button>
                    <button class="detail-tab-btn" data-detail-tab="profit" onclick="switchDetailTab('profit')">
                        <span data-i18n="station.tab_profit"></span>
                    </button>
                </div>

                <!-- Tab 1: 电站详情 -->
                <div class="detail-tab-content active" id="detailTabOverview">
                <div class="detail-sections">
                    <!-- KPI Row -->
                    <div class="detail-kpi-row">
                        <div class="detail-kpi-card">
                            <div class="detail-kpi-label" data-i18n="station.soc"></div>
                            <div class="detail-kpi-value" style="color: ${socColor}">${station.soc}%</div>
                            <div class="detail-soc-bar">
                                <div class="detail-soc-fill" style="width: ${station.soc}%; background: ${socColor};">${station.soc}%</div>
                            </div>
                        </div>
                        <div class="detail-kpi-card">
                            <div class="detail-kpi-label" data-i18n="station.detail_realtimePower"></div>
                            <div class="detail-kpi-value ${powerClass}">${powerDisplay} MW</div>
                        </div>
                        <div class="detail-kpi-card">
                            <div class="detail-kpi-label" data-i18n="station.todayProfit"></div>
                            <div class="detail-kpi-value ${profitClass}">${parseFloat(station.todayProfit) >= 0 ? '+' : ''}$${formatNumber(station.todayProfit)}</div>
                        </div>
                        <div class="detail-kpi-card">
                            <div class="detail-kpi-label" data-i18n="station.totalProfit"></div>
                            <div class="detail-kpi-value positive">$${formatNumber(station.totalProfit)}</div>
                        </div>
                        <div class="detail-kpi-card">
                            <div class="detail-kpi-label" data-i18n="station.detail_nemPrice"></div>
                            <div class="detail-kpi-value">$${station.nemPrice}<span style="font-size:14px;color:rgba(255,255,255,0.4)">/MWh</span></div>
                        </div>
                    </div>

                    <!-- Basic Info Section -->
                    <div class="detail-section">
                        <div class="detail-section-title" data-i18n="station.detail_basicInfo"></div>
                        <div class="detail-info-grid">
                            <div class="detail-info-item">
                                <span class="detail-info-label" data-i18n="station.detail_stationId"></span>
                                <span class="detail-info-value">${station.id}</span>
                            </div>
                            <div class="detail-info-item">
                                <span class="detail-info-label" data-i18n="station.detail_region"></span>
                                <span class="detail-info-value">${station.region}, Australia</span>
                            </div>
                            <div class="detail-info-item">
                                <span class="detail-info-label" data-i18n="station.detail_brandModel"></span>
                                <span class="detail-info-value">${station.brand} ${station.model}</span>
                            </div>
                            <div class="detail-info-item">
                                <span class="detail-info-label" data-i18n="station.detail_capacity"></span>
                                <span class="detail-info-value">${station.capacity} MW</span>
                            </div>
                            <div class="detail-info-item">
                                <span class="detail-info-label" data-i18n="station.detail_runMode"></span>
                                <span class="detail-info-value">${station.runMode}</span>
                            </div>
                            <div class="detail-info-item">
                                <span class="detail-info-label" data-i18n="station.detail_controlMode"></span>
                                <span class="detail-info-value">${station.autoMode ? '🤖 ' : '👤 '}<span data-i18n="${station.autoMode ? 'station.detail_autoMode' : 'station.detail_manualMode'}"></span></span>
                            </div>
                            <div class="detail-info-item">
                                <span class="detail-info-label" data-i18n="station.detail_fcasStatus"></span>
                                <span class="detail-info-value" data-i18n="${fcasI18nKey}"></span>
                            </div>
                            <div class="detail-info-item">
                                <span class="detail-info-label" data-i18n="station.detail_coordinates"></span>
                                <span class="detail-info-value">${station.lat.toFixed(4)}, ${station.lng.toFixed(4)}</span>
                            </div>
                            <div class="detail-info-item">
                                <span class="detail-info-label" data-i18n="station.detail_commStatus"></span>
                                <span class="detail-info-value" data-i18n="${commI18nKey}"></span>
                            </div>
                        </div>
                    </div>

                    <!-- Charts Section -->
                    <div class="detail-section">
                        <div class="detail-section-title" data-i18n="station.detail_runTrend"></div>
                        <div class="detail-two-charts">
                            <div class="detail-chart-container" id="detailSocChart"></div>
                            <div class="detail-chart-container" id="detailPowerChart"></div>
                        </div>
                    </div>

                    <!-- Revenue Chart -->
                    <div class="detail-section">
                        <div class="detail-section-title" data-i18n="station.detail_revenueTrend"></div>
                        <div class="detail-chart-container" id="detailRevenueChart"></div>
                    </div>

                    <!-- Operation Log -->
                    <div class="detail-section">
                        <div class="detail-section-title" data-i18n="station.detail_operationLog"></div>
                        <div class="detail-log-list">
                            ${generateMockLogs(station)}
                        </div>
                    </div>
                </div>
                </div>

                <!-- Tab 2: 设备 -->
                <div class="detail-tab-content" id="detailTabEquipment">
                    <div class="detail-section">
                        <div class="detail-section-title" data-i18n="station.tab_equipmentList"></div>
                        <div class="equipment-grid">
                            ${generateEquipmentCards(station)}
                        </div>
                    </div>
                </div>

                <!-- Tab 3: 调度记录 -->
                <div class="detail-tab-content" id="detailTabDispatch">
                    <div class="detail-section">
                        <div class="detail-section-title" data-i18n="station.tab_dispatchHistory"></div>
                        <div class="dispatch-table-wrapper">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th data-i18n="station.dispatch_time"></th>
                                        <th data-i18n="station.dispatch_action"></th>
                                        <th data-i18n="station.dispatch_source"></th>
                                        <th data-i18n="station.dispatch_operator"></th>
                                        <th data-i18n="station.dispatch_power"></th>
                                        <th data-i18n="station.dispatch_duration"></th>
                                        <th data-i18n="station.dispatch_result"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${generateDispatchRows(station)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Tab 4: 获利 -->
                <div class="detail-tab-content" id="detailTabProfit">
                    <div class="detail-section">
                        <div class="detail-section-title" data-i18n="station.tab_profitOverview"></div>
                        <div class="profit-summary-row">
                            ${generateProfitSummaryCards(station)}
                        </div>
                    </div>
                    <div class="detail-section profit-chart-section">
                        <div class="profit-chart-header">
                            <div class="detail-section-title" data-i18n="station.profit_chartTitle"></div>
                            <div class="profit-period-toggle">
                                <button class="profit-period-btn active" data-period="daily" onclick="switchProfitPeriod('daily')" data-i18n="station.profit_daily"></button>
                                <button class="profit-period-btn" data-period="monthly" onclick="switchProfitPeriod('monthly')" data-i18n="station.profit_monthly"></button>
                            </div>
                        </div>
                        <div class="profit-chart-container" id="detailProfitChart"></div>
                    </div>
                </div>
            `;

            // 滚动到顶部
            window.scrollTo(0, 0);

            // 触发 i18n 翻译刷新（动态内容需要手动调用）
            if (typeof i18n !== 'undefined' && i18n.updatePageTexts) {
                i18n.updatePageTexts();
            }

            // 渲染概览 tab 的 ECharts 图表
            renderDetailCharts(station);
        }

        // 渲染详情页图表（标题随语言切换）
        function renderDetailCharts(station) {
            const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
            const socTitle = t('station.detail_socChart') || 'SOC (%)';
            const powerTitle = t('station.detail_powerChart') || 'Power (MW)';
            const revenueTitle = t('station.detail_revenueChart') || 'Last 30 Days Revenue ($)';

            // SOC 趋势图
            const socChart = echarts.init(document.getElementById('detailSocChart'));
            const socData = [];
            let soc = 30 + Math.random() * 40;
            for (let i = 0; i < 24; i++) {
                soc += (Math.random() - 0.45) * 12;
                soc = Math.max(5, Math.min(98, soc));
                socData.push(Math.round(soc));
            }
            socChart.setOption({
                title: { text: socTitle, textStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 13 }, left: 16, top: 10 },
                tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#fff' } },
                grid: { left: 50, right: 20, top: 48, bottom: 30 },
                xAxis: { type: 'category', data: hours, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10 } },
                yAxis: { type: 'value', min: 0, max: 100, axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } }, axisLabel: { color: 'rgba(255,255,255,0.4)' } },
                series: [{ data: socData, type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#00ff88', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(0,255,136,0.25)' }, { offset: 1, color: 'rgba(0,255,136,0)' }]) } }]
            });

            // 功率趋势图
            const powerChart = echarts.init(document.getElementById('detailPowerChart'));
            const powerData = [];
            for (let i = 0; i < 24; i++) {
                const p = (Math.random() - 0.5) * station.capacity * 2;
                powerData.push(Math.round(p * 10) / 10);
            }
            powerChart.setOption({
                title: { text: powerTitle, textStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 13 }, left: 16, top: 10 },
                tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#fff' } },
                grid: { left: 50, right: 20, top: 48, bottom: 30 },
                xAxis: { type: 'category', data: hours, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10 } },
                yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } }, axisLabel: { color: 'rgba(255,255,255,0.4)' } },
                series: [{ data: powerData, type: 'bar', itemStyle: { color: function(params) { return params.value >= 0 ? '#3b82f6' : '#f59e0b'; }, borderRadius: [3, 3, 0, 0] } }]
            });

            // 收益趋势图
            const revenueChart = echarts.init(document.getElementById('detailRevenueChart'));
            const days = Array.from({ length: 30 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - 29 + i); return `${d.getMonth()+1}/${d.getDate()}`; });
            const revenueData = days.map(() => Math.round((Math.random() * 45000 + 5000 - 10000)));
            revenueChart.setOption({
                title: { text: revenueTitle, textStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 13 }, left: 16, top: 10 },
                tooltip: { trigger: 'axis', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#fff' }, formatter: function(params) { return params[0].name + '<br/>$' + params[0].value.toLocaleString(); } },
                grid: { left: 60, right: 20, top: 48, bottom: 30 },
                xAxis: { type: 'category', data: days, axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }, axisLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10 } },
                yAxis: { type: 'value', axisLine: { show: false }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } }, axisLabel: { color: 'rgba(255,255,255,0.4)', formatter: function(v) { return (v/1000).toFixed(0) + 'k'; } } },
                series: [{ data: revenueData, type: 'line', smooth: true, symbol: 'none', lineStyle: { color: '#a78bfa', width: 2 }, areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(167,139,250,0.25)' }, { offset: 1, color: 'rgba(167,139,250,0)' }]) } }]
            });

            // 窗口 resize 自适应（使用命名函数以支持清理）
            if (detailResizeHandler) {
                window.removeEventListener('resize', detailResizeHandler);
            }
            detailResizeHandler = () => {
                socChart.resize();
                powerChart.resize();
                revenueChart.resize();
                if (profitChartInstance) profitChartInstance.resize();
            };
            window.addEventListener('resize', detailResizeHandler);
        }

        // 返回列表
        function backToList() {
            // 清理图表实例和 resize 监听
            if (profitChartInstance) {
                profitChartInstance.dispose();
                profitChartInstance = null;
            }
            if (detailResizeHandler) {
                window.removeEventListener('resize', detailResizeHandler);
                detailResizeHandler = null;
            }
            currentDetailStation = null;
            currentDetailTab = 'overview';

            document.getElementById('stationDetailPage').classList.remove('active');
            document.getElementById('stationDetailPage').innerHTML = '';
            document.getElementById('stationListPage').style.display = '';
        }

        function controlStation(id) {
            const station = stationData.find(s => s.id === id);
            if (!station) return;

            const modal = document.createElement('div');
            modal.className = 'station-modal';
            modal.innerHTML = `
                <div class="station-modal-content control-modal">
                    <div class="modal-header">
                        <h2>🎮 远程控制 - ${station.name}</h2>
                        <button class="modal-close" onclick="this.closest('.station-modal').remove()">✕</button>
                    </div>
                    <div class="modal-body">
                        <div class="control-section">
                            <h3>运行模式切换</h3>
                            <div class="control-buttons">
                                <button class="control-btn ${station.runMode === 'FCAS响应' ? 'active' : ''}" onclick="setRunMode('${id}', 'FCAS响应')">FCAS响应</button>
                                <button class="control-btn ${station.runMode === '套利模式' ? 'active' : ''}" onclick="setRunMode('${id}', '套利模式')">套利模式</button>
                                <button class="control-btn ${station.runMode === 'VPP调度' ? 'active' : ''}" onclick="setRunMode('${id}', 'VPP调度')">VPP调度</button>
                                <button class="control-btn ${station.runMode === '备用待命' ? 'active' : ''}" onclick="setRunMode('${id}', '备用待命')">备用待命</button>
                            </div>
                        </div>
                        <div class="control-section">
                            <h3>手动控制</h3>
                            <div class="control-buttons">
                                <button class="control-btn charge" onclick="sendCommand('${id}', 'charge')">⚡ 开始充电</button>
                                <button class="control-btn discharge" onclick="sendCommand('${id}', 'discharge')">🔋 开始放电</button>
                                <button class="control-btn stop" onclick="sendCommand('${id}', 'stop')">⏹️ 停止</button>
                            </div>
                        </div>
                        <div class="control-section">
                            <h3>功率设置 (MW)</h3>
                            <div class="power-slider">
                                <input type="range" id="powerSlider" min="0" max="${station.capacity}" value="${Math.abs(station.power)}"
                                       oninput="document.getElementById('powerValue').textContent = this.value + ' MW'">
                                <span id="powerValue">${Math.abs(station.power)} MW</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="action-btn" onclick="this.closest('.station-modal').remove()">取消</button>
                        <button class="action-btn primary" onclick="applyControl('${id}'); this.closest('.station-modal').remove()">应用设置</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }


        function setRunMode(id, mode) {
            const station = stationData.find(s => s.id === id);
            if (station) {
                station.runMode = mode;
            }
            // 更新按钮状态
            document.querySelectorAll('.control-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.textContent === mode) btn.classList.add('active');
            });
        }

        function sendCommand(id, command) {
            const station = stationData.find(s => s.id === id);
            if (!station) return;


            switch(command) {
                case 'charge':
                    station.runStatus = 'charging';
                    station.status = 'charging'; // 更新组合状态
                    station.power = Math.floor(station.capacity * 0.8);
                    break;
                case 'discharge':
                    station.runStatus = 'discharging';
                    station.status = 'discharging'; // 更新组合状态
                    station.power = -Math.floor(station.capacity * 0.8);
                    break;
                case 'stop':
                    station.runStatus = 'idle';
                    station.status = 'idle'; // 更新组合状态
                    station.power = 0;
                    break;
            }
            updateStats();
        }

        function applyControl(id) {
            const powerValue = document.getElementById('powerSlider')?.value || 0;

            const station = stationData.find(s => s.id === id);
            if (station) {
                station.power = station.runStatus === 'charging' ? parseInt(powerValue) : -parseInt(powerValue);
            }
            updateStats();
        }

        // 新增电站弹窗
        let currentStep = 1;
        let stationFormData = {};

        function hideOperatorButtons() {
            if (localStorage.getItem('userRole') !== 'owner') {
                // Hide add station button
                var addBtn = document.querySelector('.add-station-btn');
                if (addBtn) addBtn.style.display = 'none';
                // Hide edit/delete buttons by data-i18n attribute
                document.querySelectorAll('[data-i18n="station.edit"], [data-i18n="station.delete"]').forEach(function(btn) {
                    btn.style.display = 'none';
                });
                // Also check by text content as fallback
                document.querySelectorAll('.table-action-btn').forEach(function(btn) {
                    var text = btn.textContent.trim().toLowerCase();
                    if (text === '编辑' || text === 'edit' || text === '删除' || text === 'delete') {
                        btn.style.display = 'none';
                    }
                });
            }
        }

        function showAddStationModal() {
            currentStep = 1;
            stationFormData = {};

            const modal = document.createElement('div');
            modal.className = 'station-modal';
            modal.innerHTML = `
                <div class="station-modal-content add-station-modal">
                    <div class="modal-header">
                        <h2><span data-i18n="station.add_title">新增电站</span></h2>
                        <button class="modal-close" onclick="closeAddStationModal()">✕</button>
                    </div>

                    <!-- 步骤指示器 -->
                    <div class="step-indicator">
                        <div class="step-item active" id="stepIndicator1">
                            <div class="step-number">1</div>
                            <div class="step-label"><span data-i18n="station.step1_title">基本信息</span></div>
                        </div>
                        <div class="step-divider"></div>
                        <div class="step-item" id="stepIndicator2">
                            <div class="step-number">2</div>
                            <div class="step-label"><span data-i18n="station.step2_title">添加设备</span></div>
                        </div>
                    </div>

                    <div class="modal-body">
                        <div class="add-station-form">
                            <!-- 第一步：基本信息 -->
                            <div class="form-step active" id="step1">
                                <div class="form-group">
                                    <label class="form-label"><span data-i18n="station.add_name">电站名称</span><span class="required">*</span></label>
                                    <input type="text" class="form-input" id="addStationName" data-i18n-placeholder="station.add_namePlaceholder" placeholder="请输入电站名称">
                                </div>
                                <div class="form-group" style="grid-column: 1 / -1;">
                                    <label class="form-label"><span data-i18n="station.add_stationAddress">站点地址</span><span class="required">*</span></label>

                                    <!-- 隐藏的地址输入框，用于存储地址 -->
                                    <input type="hidden" id="addStationAddress">
                                    <input type="hidden" id="addStationLat">
                                    <input type="hidden" id="addStationLng">

                                    <!-- 添加地址按钮 -->
                                    <button type="button" class="add-address-btn" onclick="showMapPicker()">
                                        <span class="icon">📍</span>
                                        <span data-i18n="station.add_addAddress">添加地址</span>
                                    </button>

                                    <!-- 已选地址显示 -->
                                    <div class="selected-address" id="selectedAddressDisplay" style="display: none;">
                                        <div class="selected-address-text" id="selectedAddressText"></div>
                                        <button type="button" class="change-address-btn" onclick="showMapPicker()">
                                            <span data-i18n="station.add_changeAddress">更改</span>
                                        </button>
                                    </div>
                                </div>

                                <!-- 时区字段（自动回显） -->
                                <div class="form-group">
                                    <label class="form-label"><span data-i18n="station.add_timezone">时区</span></label>
                                    <input type="text" class="form-input" id="addStationTimezone" readonly style="background: rgba(255, 255, 255, 0.03); cursor: not-allowed;" placeholder="根据地址自动识别">
                                </div>
                            </div>

                            <!-- 第二步：添加设备 -->
                            <div class="form-step" id="step2">
                                <div class="form-group">
                                    <label class="form-label"><span data-i18n="station.add_deviceSN">设备SN</span></label>
                                    <input type="text" class="form-input" id="addDeviceSN" data-i18n-placeholder="station.add_deviceSNPlaceholder" placeholder="请输入设备SN">
                                </div>
                                <div class="device-list-hint">
                                    <p style="color: rgba(255,255,255,0.5); font-size: 13px; margin-top: 8px;">
                                        <span data-i18n="station.add_deviceHint">💡 可以跳过此步骤，稍后在电站详情页添加设备</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button class="action-btn" onclick="closeAddStationModal()" data-i18n="station.add_cancel">取消</button>
                        <button class="action-btn" id="prevStepBtn" onclick="prevStep()" style="display: none;" data-i18n="station.add_prevStep">上一步</button>
                        <button class="action-btn primary" id="nextStepBtn" onclick="nextStep()" data-i18n="station.add_nextStep">下一步</button>
                        <button class="action-btn primary" id="submitBtn" onclick="submitAddStation()" style="display: none;" data-i18n="station.add_submit">保存</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            if (typeof i18n !== 'undefined' && i18n.updatePageTexts) i18n.updatePageTexts();
        }

        function closeAddStationModal() {
            document.querySelector('.station-modal')?.remove();
            currentStep = 1;
            stationFormData = {};
        }

        function nextStep() {
            if (currentStep === 1) {
                // 验证第一步
                const name = document.getElementById('addStationName').value.trim();
                const address = document.getElementById('addStationAddress').value.trim();

                if (!name) {
                    showToast('请输入电站名称');
                    return;
                }
                if (!address) {
                    showToast('请输入电站地址');
                    return;
                }

                // 保存第一步数据
                stationFormData.name = name;
                stationFormData.address = address;

                // 切换到第二步
                currentStep = 2;
                updateStepUI();
            }
        }

        function prevStep() {
            if (currentStep === 2) {
                currentStep = 1;
                updateStepUI();
            }
        }

        function updateStepUI() {
            // 更新步骤指示器
            document.querySelectorAll('.step-item').forEach((item, index) => {
                const stepNum = index + 1;
                item.classList.remove('active', 'completed');
                if (stepNum < currentStep) {
                    item.classList.add('completed');
                } else if (stepNum === currentStep) {
                    item.classList.add('active');
                }
            });

            // 显示/隐藏表单步骤
            document.querySelectorAll('.form-step').forEach((step, index) => {
                step.classList.remove('active');
                if (index + 1 === currentStep) {
                    step.classList.add('active');
                }
            });

            // 更新按钮状态
            const prevBtn = document.getElementById('prevStepBtn');
            const nextBtn = document.getElementById('nextStepBtn');
            const submitBtn = document.getElementById('submitBtn');

            if (currentStep === 1) {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'inline-flex';
                submitBtn.style.display = 'none';
            } else if (currentStep === 2) {
                prevBtn.style.display = 'inline-flex';
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'inline-flex';
            }
        }

        // 提交新增电站
        function submitAddStation() {
            // 从第一步获取的基本信息
            const name = stationFormData.name;
            const address = stationFormData.address;

            // 从第二步获取设备SN（可选）
            const deviceSN = document.getElementById('addDeviceSN')?.value.trim();
            if (deviceSN) {
                stationFormData.deviceSN = deviceSN;
            }

            // 生成唯一 ID（取现有最大编号 +1）
            const maxId = stationData.reduce((max, s) => {
                const num = parseInt(s.id.replace('AU', ''));
                return num > max ? num : max;
            }, 0);
            const newId = `AU${String(maxId + 1).padStart(4, '0')}`;

            // 从地址推测地区（简单实现）
            let regionCode = 'nsw'; // 默认
            const addressLower = address.toLowerCase();
            if (addressLower.includes('vic') || addressLower.includes('melbourne')) regionCode = 'vic';
            else if (addressLower.includes('qld') || addressLower.includes('brisbane')) regionCode = 'qld';
            else if (addressLower.includes('sa') || addressLower.includes('adelaide')) regionCode = 'sa';
            else if (addressLower.includes('wa') || addressLower.includes('perth')) regionCode = 'wa';
            else if (addressLower.includes('tas') || addressLower.includes('hobart')) regionCode = 'tas';
            else if (addressLower.includes('act') || addressLower.includes('canberra')) regionCode = 'act';

            // 地区坐标映射
            const regionMap = {
                nsw: { name: 'NSW', lat: -33.8688, lng: 151.2093 },
                vic: { name: 'VIC', lat: -37.8136, lng: 144.9631 },
                qld: { name: 'QLD', lat: -27.4705, lng: 153.0260 },
                sa:  { name: 'SA',  lat: -34.9285, lng: 138.6007 },
                wa:  { name: 'WA',  lat: -31.9505, lng: 115.8605 },
                tas: { name: 'TAS', lat: -42.8821, lng: 147.3272 },
                act: { name: 'ACT', lat: -35.2809, lng: 149.1300 }
            };
            const region = regionMap[regionCode];

            // 构建新电站对象
            const newStation = {
                id: newId,
                name: name,
                address: address,
                deviceSN: stationFormData.deviceSN || '',
                region: region.name,
                regionCode: regionCode,
                brand: 'Tesla',
                model: 'Megapack',
                status: 'idle',
                commStatus: 'online',
                runStatus: 'idle',
                runMode: 'FCAS响应',
                soc: Math.floor(Math.random() * 30 + 50),
                power: 0,
                capacity: 20,
                todayProfit: '0.00',
                totalProfit: '0.00',
                lat: region.lat + (Math.random() - 0.5) * 4,
                lng: region.lng + (Math.random() - 0.5) * 4,
                nemPrice: (30 + Math.random() * 120).toFixed(2),
                fcasEnabled: true
            };

            // 插入到数据头部（最新的排最前）
            stationData.unshift(newStation);

            // 重置分页并刷新当前视图
            tableCurrentPage = 1;
            cardCurrentPage = 1;
            if (currentView === 'table') renderTableView();
            else if (currentView === 'card') renderCardView();
            updateStats();

            // 关闭弹窗
            closeAddStationModal();

            // Toast 提示
            showToast(t('station.add_success') || '电站创建成功');
        }

        // Toast 通知
        function showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'toast-notification';
            toast.textContent = message;
            document.body.appendChild(toast);
            requestAnimationFrame(() => toast.classList.add('show'));
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        }

        function exportData() {
            const filteredData = getFilteredData();

            // 生成 CSV 数据
            const headers = ['ID', 'Name', 'Region', 'Brand', 'Model', 'Status', 'Capacity(MW)', 'Power(MW)', 'SOC(%)', 'NEM Price($/MWh)', 'Today Profit($)', 'Total Profit($)'];
            const csvContent = [
                headers.join(','),
                ...filteredData.map(s => [
                    s.id, s.name, s.region, s.brand, s.model, s.status,
                    s.capacity, s.power, s.soc, s.nemPrice, s.todayProfit, s.totalProfit
                ].join(','))
            ].join('\n');

            // 下载文件
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `station_export_${new Date().toISOString().slice(0,10)}.csv`;
            link.click();

        }

        function toggleSelectAll() {
            const selectAll = document.getElementById('selectAll');
            const checkboxes = document.querySelectorAll('.station-checkbox');
            checkboxes.forEach(cb => cb.checked = selectAll.checked);
        }

        // ========== 地图选择器功能 ==========
        let mapPickerInstance = null;
        let selectedLocation = null;

        function showMapPicker() {
            const modal = document.getElementById('mapPickerModal');
            if (!modal) {
                createMapPickerModal();
            }
            document.getElementById('mapPickerModal').classList.add('show');

            // 初始化地图（这里使用高德地图作为示例，需要先引入高德地图API）
            setTimeout(() => {
                if (!mapPickerInstance) {
                    initMap();
                }
            }, 100);
        }

        function createMapPickerModal() {
            const modalHTML = `
                <div class="map-picker-modal" id="mapPickerModal">
                    <div class="map-picker-header">
                        <h2 class="map-picker-title"><span data-i18n="station.map_selectAddress">选择站点地址</span></h2>
                        <button class="map-picker-close" onclick="closeMapPicker()">✕</button>
                    </div>
                    <div class="map-container">
                        <div id="map-picker"></div>
                        <!-- 地图上的定位按钮 -->
                        <button class="map-location-btn" onclick="getCurrentMapLocation()" title="定位到当前位置">
                            <span class="location-icon">📍</span>
                        </button>
                    </div>
                    <div class="map-picker-footer">
                        <div class="map-search-bar">
                            <input type="text" class="map-search-input" id="mapSearchInput" placeholder="搜索地址或地点" data-i18n-placeholder="station.map_searchPlaceholder">
                            <button class="map-search-btn" onclick="searchAddress()">
                                <span>🔍</span>
                            </button>
                        </div>
                        <div class="map-address-display" id="mapAddressDisplay">
                            <span data-i18n="station.map_clickToSelect">点击地图选择位置</span>
                        </div>
                        <div class="map-picker-actions">
                            <button class="map-picker-btn cancel" onclick="closeMapPicker()">
                                <span data-i18n="station.map_cancel">取消</span>
                            </button>
                            <button class="map-picker-btn confirm" onclick="confirmAddress()">
                                <span data-i18n="station.map_confirm">确定</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // 更新i18n
            if (typeof i18n !== 'undefined' && i18n.updatePageTexts) {
                i18n.updatePageTexts();
            }
        }

        let mapMarker = null;

        function initMap() {
            try {
                // 创建Leaflet地图实例 - 默认悉尼
                const defaultCenter = [-33.8688, 151.2093];

                mapPickerInstance = L.map('map-picker', {
                    zoomControl: true,
                    attributionControl: true
                }).setView(defaultCenter, 13);

                // 添加卫星图层（ESRI World Imagery - 免费卫星图）
                const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri',
                    maxZoom: 18
                }).addTo(mapPickerInstance);

                // 添加街道图层（OpenStreetMap）
                const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    maxZoom: 19
                });

                // 添加图层切换控件
                const baseLayers = {
                    "卫星视图": satelliteLayer,
                    "街道地图": streetLayer
                };
                L.control.layers(baseLayers).addTo(mapPickerInstance);

                // 创建自定义图标
                const customIcon = L.icon({
                    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCAzMiA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNMTYgMEMxMC40NzcgMCA2IDQuNDc3IDYgMTBDNiAxNy41IDE2IDMwIDE2IDMwQzE2IDMwIDI2IDE3LjUgMjYgMTBDMjYgNC40NzcgMjEuNTIzIDAgMTYgMFoiIGZpbGw9IiMwMEZGODgiLz4KICA8Y2lyY2xlIGN4PSIxNiIgY3k9IjEwIiByPSI0IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4=',
                    iconSize: [32, 48],
                    iconAnchor: [16, 48],
                    popupAnchor: [0, -48]
                });

                // 创建标记
                mapMarker = L.marker(defaultCenter, {
                    icon: customIcon,
                    draggable: true
                }).addTo(mapPickerInstance);

                // 地图点击事件
                mapPickerInstance.on('click', function(e) {
                    const lat = e.latlng.lat;
                    const lng = e.latlng.lng;

                    // 移动标记
                    mapMarker.setLatLng([lat, lng]);

                    // 反向地理编码
                    reverseGeocode(lat, lng);
                });

                // 标记拖拽结束事件
                mapMarker.on('dragend', function(e) {
                    const position = mapMarker.getLatLng();
                    reverseGeocode(position.lat, position.lng);
                });


            } catch (error) {
                console.error('❌ 地图初始化失败:', error);
                showToast('地图加载失败');
            }
        }

        // 反向地理编码（使用Nominatim - OpenStreetMap的免费服务）
        async function reverseGeocode(lat, lng) {
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                    {
                        headers: {
                            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
                        }
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

                    selectedLocation = { address, lat, lng };
                    document.getElementById('mapAddressDisplay').textContent = address;
                } else {
                    throw new Error('地理编码失败');
                }
            } catch (error) {
                console.error('反向地理编码错误:', error);
                selectedLocation = {
                    address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                    lat,
                    lng
                };
                document.getElementById('mapAddressDisplay').textContent = selectedLocation.address;
            }
        }

        // 模拟地图点击
        function simulateMapClick() {
            const demoAddresses = [
                { address: '北京市东城区天安门广场', lat: 39.9042, lng: 116.4074 },
                { address: '上海市浦东新区陆家嘴环路1000号', lat: 31.2397, lng: 121.4999 },
                { address: '广东省深圳市南山区科技园', lat: 22.5431, lng: 113.9427 },
                { address: '四川省成都市武侯区天府广场', lat: 30.5728, lng: 104.0668 },
                { address: 'NSW, Sydney, 1 Martin Place', lat: -33.8688, lng: 151.2093 }
            ];
            const selected = demoAddresses[Math.floor(Math.random() * demoAddresses.length)];

            selectedLocation = selected;
            document.getElementById('mapAddressDisplay').textContent = selected.address;
        }

        // 获取当前定位
        function getCurrentMapLocation() {
            if (!navigator.geolocation) {
                showToast('您的浏览器不支持地理定位');
                return;
            }

            showToast('正在获取位置...');

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    if (mapPickerInstance) {
                        // 移动地图到当前位置
                        mapPickerInstance.setView([lat, lng], 17);

                        // 移动标记
                        if (mapMarker) {
                            mapMarker.setLatLng([lat, lng]);
                        }

                        // 反向地理编码获取地址
                        reverseGeocode(lat, lng);
                        showToast('定位成功');
                    }
                },
                (error) => {
                    let errorMsg = '定位失败';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMsg = '用户拒绝了定位请求';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMsg = '位置信息不可用';
                            break;
                        case error.TIMEOUT:
                            errorMsg = '定位请求超时';
                            break;
                    }
                    showToast(errorMsg);
                }
            );
        }

        // 搜索地址（使用Nominatim地理编码）
        async function searchAddress() {
            const searchInput = document.getElementById('mapSearchInput');
            const address = searchInput.value.trim();

            if (!address) {
                showToast('请输入搜索地址');
                return;
            }

            try {
                showToast('搜索中...');

                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
                    {
                        headers: {
                            'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
                        }
                    }
                );

                if (response.ok) {
                    const results = await response.json();

                    if (results && results.length > 0) {
                        const result = results[0];
                        const lat = parseFloat(result.lat);
                        const lng = parseFloat(result.lon);

                        // 移动地图
                        if (mapPickerInstance) {
                            mapPickerInstance.setView([lat, lng], 16);

                            // 移动标记
                            if (mapMarker) {
                                mapMarker.setLatLng([lat, lng]);
                            }
                        }

                        selectedLocation = {
                            address: result.display_name,
                            lat,
                            lng
                        };
                        document.getElementById('mapAddressDisplay').textContent = result.display_name;
                        showToast('搜索成功');
                    } else {
                        showToast('未找到该地址，请重新输入');
                    }
                } else {
                    throw new Error('搜索请求失败');
                }
            } catch (error) {
                console.error('地址搜索错误:', error);
                showToast('搜索失败，请稍后重试');
            }
        }

        // 支持回车键搜索
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const searchInput = document.getElementById('mapSearchInput');
                if (searchInput) {
                    searchInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            searchAddress();
                        }
                    });
                }
            }, 500);
        });

        function closeMapPicker() {
            document.getElementById('mapPickerModal').classList.remove('show');
            selectedLocation = null;
        }

        function confirmAddress() {
            if (!selectedLocation) {
                showToast('请先选择位置');
                return;
            }

            // 填充地址到表单
            document.getElementById('addStationAddress').value = selectedLocation.address;
            document.getElementById('addStationLat').value = selectedLocation.lat;
            document.getElementById('addStationLng').value = selectedLocation.lng;

            // 根据经纬度自动识别时区
            const timezone = detectTimezone(selectedLocation.lat, selectedLocation.lng, selectedLocation.address);
            document.getElementById('addStationTimezone').value = timezone;

            // 显示已选地址
            const displayDiv = document.getElementById('selectedAddressDisplay');
            const textDiv = document.getElementById('selectedAddressText');
            textDiv.textContent = selectedLocation.address;
            displayDiv.style.display = 'flex';

            // 隐藏添加地址按钮
            document.querySelector('.add-address-btn').style.display = 'none';

            closeMapPicker();
            showToast('地址已选择');
        }

        // 根据经纬度和地址自动识别时区
        function detectTimezone(lat, lng, address) {
            const addressLower = address.toLowerCase();

            // 优先根据地址关键词判断
            if (addressLower.includes('western australia') || addressLower.includes('perth') || addressLower.includes('wa')) {
                return 'AWST (UTC+8)';
            } else if (addressLower.includes('south australia') || addressLower.includes('adelaide') || addressLower.includes('sa')) {
                return 'ACST (UTC+9:30)';
            } else if (addressLower.includes('northern territory') || addressLower.includes('darwin') || addressLower.includes('nt')) {
                return 'ACST (UTC+9:30)';
            } else if (addressLower.includes('queensland') || addressLower.includes('brisbane') || addressLower.includes('qld')) {
                return 'AEST (UTC+10)';
            } else if (addressLower.includes('new south wales') || addressLower.includes('sydney') || addressLower.includes('nsw')) {
                return 'AEST (UTC+10)';
            } else if (addressLower.includes('victoria') || addressLower.includes('melbourne') || addressLower.includes('vic')) {
                return 'AEST (UTC+10)';
            } else if (addressLower.includes('tasmania') || addressLower.includes('hobart') || addressLower.includes('tas')) {
                return 'AEST (UTC+10)';
            } else if (addressLower.includes('act') || addressLower.includes('canberra')) {
                return 'AEST (UTC+10)';
            }

            // 根据经度判断（澳大利亚）
            if (lng < 128) {
                return 'AWST (UTC+8)'; // 西澳
            } else if (lng >= 128 && lng < 141) {
                return 'ACST (UTC+9:30)'; // 中澳
            } else {
                return 'AEST (UTC+10)'; // 东澳
            }
        }
    