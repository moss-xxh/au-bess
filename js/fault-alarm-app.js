        // ==================== Data ====================
        let allAlarms = [];
        let filteredAlarms = [];
        let currentTab = 'unprocessed';
        let currentPage = 1;
        let pageSize = 100;
        let sortField = 'time';
        let sortOrder = 'desc';

        // ==================== i18n Helper ====================
        function t(key, fallback) {
            return (window.i18n && window.i18n.getText(key) !== key) ? window.i18n.getText(key) : fallback;
        }

        function getCurrentLang() {
            return (window.i18n && window.i18n.currentLanguage) || 'en';
        }

        // ==================== Role Helper ====================
        function getCurrentUserRole() {
            return localStorage.getItem('userRole') || 'operator';
        }

        function isOwner() {
            return getCurrentUserRole() === 'owner';
        }

        function isOperator() {
            return getCurrentUserRole() === 'operator';
        }

        // ==================== Description Keys & Translations ====================
        const DESCRIPTION_KEYS = ['highVoltage', 'lowInsulation', 'cellVoltageDiff', 'cellVoltageHigh', 'overTemperature', 'lowSOC', 'commInterrupt', 'overCurrent'];
        const DESCRIPTION_FALLBACKS = {
            highVoltage: 'High Voltage',
            lowInsulation: 'Low Insulation',
            cellVoltageDiff: 'Cell Voltage Diff',
            cellVoltageHigh: 'Cell Voltage High',
            overTemperature: 'Over Temperature',
            lowSOC: 'Low SOC',
            commInterrupt: 'Comm Interrupt',
            overCurrent: 'Over Current'
        };

        function getDescriptionText(descKey) {
            return t(`faultAlarm.descriptions.${descKey}`, DESCRIPTION_FALLBACKS[descKey] || descKey);
        }

        function getLevelText(level) {
            const defaults = { alarm: 'Alarm', fault: 'Fault' };
            return t(`faultAlarm.levels.${level}`, defaults[level] || level);
        }

        function getStatusText(status) {
            const defaults = { unprocessed: 'Unprocessed', processed: 'Processed' };
            return t(`faultAlarm.statuses.${status}`, defaults[status] || status);
        }

        // Mock alarm data — dynamically generated relative to current date
        // Stores keys instead of translated strings for proper i18n support
        function generateMockAlarms() {
            const levels = ['alarm', 'fault'];
            const devices = ['BMS', 'PCS', 'EMS', 'METER'];
            const stations = ['Hornsdale Power Reserve', 'Wandoan BESS', 'Torrens Island BESS', 'Broken Hill Solar Farm'];

            const alarms = [];
            const now = new Date();
            let idCounter = 1;

            // Generate 5 unprocessed alarms (recent, within last 2 days)
            for (let i = 0; i < 5; i++) {
                const hoursAgo = Math.floor(Math.random() * 48); // 0-48 hours ago
                const alarmTime = new Date(now.getTime() - hoursAgo * 3600000 - Math.floor(Math.random() * 3600000));
                alarms.push({
                    id: idCounter++,
                    time: alarmTime,
                    timezone: 'AEST',
                    descriptionKey: DESCRIPTION_KEYS[i % DESCRIPTION_KEYS.length],
                    level: levels[i % 2],
                    device: devices[i % devices.length],
                    station: stations[i % stations.length],
                    status: 'unprocessed',
                    recoveryTime: null,
                    selected: false
                });
            }

            // Generate 2 processed alarms
            for (let i = 0; i < 2; i++) {
                const daysAgo = Math.floor(i / 5); // 0-5 days ago
                const hoursOffset = (i % 5) * 3 + Math.floor(Math.random() * 3);
                const alarmTime = new Date(now.getTime() - daysAgo * 86400000 - hoursOffset * 3600000);
                const recoveryTime = new Date(alarmTime.getTime() + (30 + Math.random() * 90) * 60000);
                const descIndex = i % DESCRIPTION_KEYS.length;
                const levelIndex = i % 2;
                const deviceIndex = i % devices.length;
                const stationIndex = i % stations.length;

                alarms.push({
                    id: idCounter++,
                    time: alarmTime,
                    timezone: 'AEST',
                    descriptionKey: DESCRIPTION_KEYS[descIndex],
                    level: levels[levelIndex],
                    device: devices[deviceIndex],
                    station: stations[stationIndex],
                    status: 'processed',
                    recoveryTime: recoveryTime,
                    selected: false
                });
            }

            return alarms;
        }

        // ==================== Filter Functions ====================
        function clearFilters() {
            document.getElementById('stationFilter').selectedIndex = 0;
            document.getElementById('levelFilter').selectedIndex = 0;
            document.getElementById('startDate').value = '';
            document.getElementById('endDate').value = '';
        }

        function searchAlarms() {
            applyFilters();
            renderTable();
            updateCounts();
        }

        function applyFilters() {
            const station = document.getElementById('stationFilter').value;
            const level = document.getElementById('levelFilter').value;
            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;

            filteredAlarms = allAlarms.filter(alarm => {
                // 角色过滤：运维方只看自己电站的故障
                if (window._operatorStationFilter && !window._operatorStationFilter.includes(alarm.station)) return false;
                
                // Status filter by current tab
                if (currentTab !== 'all' && alarm.status !== currentTab) return false;

                // Level filter
                if (level && alarm.level !== level) return false;

                // Station filter
                if (station && alarm.station !== station) return false;

                // Date range filter
                if (startDate) {
                    const start = new Date(startDate);
                    if (alarm.time < start) return false;
                }
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    if (alarm.time > end) return false;
                }

                return true;
            });

            // Sort
            sortAlarms();
        }

        function sortAlarms() {
            filteredAlarms.sort((a, b) => {
                let valA, valB;
                if (sortField === 'time') {
                    valA = a.time.getTime();
                    valB = b.time.getTime();
                } else if (sortField === 'recoveryTime') {
                    valA = a.recoveryTime ? a.recoveryTime.getTime() : 0;
                    valB = b.recoveryTime ? b.recoveryTime.getTime() : 0;
                }
                return sortOrder === 'asc' ? valA - valB : valB - valA;
            });
        }

        function sortTable(field) {
            if (sortField === field) {
                sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                sortField = field;
                sortOrder = 'desc';
            }

            // Update sort icons
            document.querySelectorAll('.sort-icon').forEach(icon => {
                icon.textContent = '⇅';
                icon.classList.remove('active');
            });
            const activeIcon = document.getElementById(`sort-${field}`);
            if (activeIcon) {
                activeIcon.textContent = sortOrder === 'asc' ? '▲' : '▼';
                activeIcon.classList.add('active');
            }

            sortAlarms();
            renderTable();
        }

        // ==================== Tab Functions ====================
        function updateActionButtons() {
            const selectAllWrapper = document.getElementById('selectAllWrapper');
            const btnBatchProcess = document.getElementById('btnBatchProcess');
            const btnExport = document.getElementById('btnExport');
            const btnMarkProcessed = document.getElementById('btnMarkProcessed');
            const btnMarkUnprocessed = document.getElementById('btnMarkUnprocessed');

            // Owner can only view - hide all action buttons
            if (isOwner()) {
                selectAllWrapper.style.display = 'none';
                btnBatchProcess.style.display = 'none';
                btnExport.style.display = 'none';
                btnMarkProcessed.style.display = 'none';
                btnMarkUnprocessed.style.display = 'none';
                return;
            }

            // Operator has full access
            if (currentTab === 'unprocessed') {
                selectAllWrapper.style.display = 'flex';
                btnBatchProcess.style.display = 'block';
                btnExport.style.display = 'block';
                btnMarkProcessed.style.display = 'none';
                btnMarkUnprocessed.style.display = 'none';
            } else if (currentTab === 'processed') {
                selectAllWrapper.style.display = 'flex';
                btnBatchProcess.style.display = 'none';
                btnExport.style.display = 'block';
                btnMarkProcessed.style.display = 'none';
                btnMarkUnprocessed.style.display = 'none';
            }
        }

        function switchStatusTab(btn, status) {
            document.querySelectorAll('.status-tab').forEach(tab => tab.classList.remove('active'));
            btn.classList.add('active');
            currentTab = status;
            currentPage = 1;

            // 重置全选复选框
            const selectAllBtn = document.getElementById('selectAllBtn');
            if (selectAllBtn) selectAllBtn.checked = false;

            updateActionButtons();
            applyFilters();
            renderTable();
        }

        // ==================== Table Rendering ====================
        function formatAlarmTime(date, timezone) {
            if (!date) return '--';
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            const tz = timezone || 'UTC+10:00';
            const lang = getCurrentLang();
            if (lang === 'zh') {
                return `${year}年${parseInt(month)}月${parseInt(day)}日 ${hours}:${minutes}:${seconds}(${tz})`;
            }
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} (${tz})`;
        }

        function getLevelHTML(level) {
            const dotClass = level === 'alarm' ? 'warning' : 'danger';
            const name = getLevelText(level);
            return `<span class="alarm-level"><span class="alarm-level-dot ${dotClass}"></span>${name}</span>`;
        }

        function getStatusHTML(status) {
            const dotClass = status === 'unprocessed' ? 'unprocessed' : 'processed';
            const name = getStatusText(status);
            return `<span class="alarm-status"><span class="alarm-status-dot ${dotClass}"></span>${name}</span>`;
        }

        function renderTable() {
            const tbody = document.getElementById('alarmTableBody');
            if (!tbody) return;

            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize, filteredAlarms.length);
            const pageData = filteredAlarms.slice(startIndex, endIndex);

            // Check role for action column rendering
            const userIsOperator = isOperator();

            if (pageData.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="10" style="text-align: center; padding: 60px 20px; color: var(--color-text-secondary);">
                            <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.4;">📭</div>
                            <div data-i18n="faultAlarm.noData">${t('faultAlarm.noData', 'No Data')}</div>
                        </td>
                    </tr>
                `;
            } else {
                tbody.innerHTML = pageData.map(alarm => {
                    // Build action buttons based on role
                    let actionButtons = '';
                    if (userIsOperator && alarm.status === 'unprocessed') {
                        actionButtons += `<button class="btn-resolve-inline" onclick="resolveAlarmFromDetail(${alarm.id})" data-i18n="faultAlarm.buttons.resolve">${t('faultAlarm.buttons.resolve', 'Resolve')}</button>`;
                    }
                    actionButtons += `<button class="btn-detail" onclick="showAlarmDetail(${alarm.id})" data-i18n="faultAlarm.buttons.detail">${t('faultAlarm.buttons.detail', 'Detail')}</button>`;

                    // Checkbox column: only show for operator
                    const checkboxCol = userIsOperator
                        ? `<td class="checkbox-col"><input type="checkbox" ${alarm.selected ? 'checked' : ''} onchange="toggleSelect(${alarm.id}, this.checked)"></td>`
                        : `<td class="checkbox-col"></td>`;

                    return `
                    <tr>
                        ${checkboxCol}
                        <td>${formatAlarmTime(alarm.time, alarm.timezone)}</td>
                        <td>${alarm.station}</td>
                        <td>${alarm.device}</td>
                        <td>${getDescriptionText(alarm.descriptionKey)}</td>
                        <td>${getLevelHTML(alarm.level)}</td>
                        <td>${getStatusHTML(alarm.status)}</td>
                        <td>${alarm.recoveryTime ? formatAlarmTime(alarm.recoveryTime) : '--'}</td>
                        <td>
                            <div class="action-btns-container">
                                ${actionButtons}
                            </div>
                        </td>
                    </tr>
                `;
                }).join('');
            }

            updatePagination();
            updateSelectAllCheckbox();
        }

        // ==================== Selection ====================
        function selectAllCurrentPage(checked) {
            filteredAlarms.forEach(alarm => {
                alarm.selected = checked;
            });
            renderTable();
            updateSelectAllCheckbox();
        }

        function toggleSelectAll(checkbox) {
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize, filteredAlarms.length);
            for (let i = startIndex; i < endIndex; i++) {
                filteredAlarms[i].selected = checkbox.checked;
            }
            renderTable();
        }

        function toggleSelect(id, checked) {
            const alarm = allAlarms.find(a => a.id === id);
            if (alarm) alarm.selected = checked;
            updateSelectAllCheckbox();
        }

        function updateSelectAllCheckbox() {
            const startIndex = (currentPage - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize, filteredAlarms.length);
            const pageData = filteredAlarms.slice(startIndex, endIndex);
            const allPageSelected = pageData.length > 0 && pageData.every(a => a.selected);
            const selectAllCheckbox = document.getElementById('selectAll');
            if (selectAllCheckbox) {
                selectAllCheckbox.checked = allPageSelected;
            }

            const allAlarmsSelected = filteredAlarms.length > 0 && filteredAlarms.every(a => a.selected);
            const selectAllBtn = document.getElementById('selectAllBtn');
            if (selectAllBtn) {
                selectAllBtn.checked = allAlarmsSelected;
            }
        }

        // ==================== Alarm Detail ====================
        function showAlarmDetail(alarmId) {
            const alarm = allAlarms.find(a => a.id === alarmId);
            if (!alarm) return;

            // Build detail HTML - translate at render time
            const detailHTML = `
                <div class="detail-item">
                    <div class="detail-item-label">${t('faultAlarm.detail.alarmTime', 'Alarm Time')}</div>
                    <div class="detail-item-value">${formatAlarmTime(alarm.time, alarm.timezone)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">${t('faultAlarm.detail.alarmStation', 'Alarm Station')}</div>
                    <div class="detail-item-value">${alarm.station}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">${t('faultAlarm.detail.alarmDevice', 'Alarm Device')}</div>
                    <div class="detail-item-value">${alarm.device}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">${t('faultAlarm.detail.description', 'Description')}</div>
                    <div class="detail-item-value description">${getDescriptionText(alarm.descriptionKey)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">${t('faultAlarm.detail.alarmLevel', 'Alarm Level')}</div>
                    <div class="detail-item-value">${getLevelHTML(alarm.level)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">${t('faultAlarm.detail.alarmStatus', 'Alarm Status')}</div>
                    <div class="detail-item-value">${getStatusHTML(alarm.status)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-item-label">${t('faultAlarm.detail.recoveryTime', 'Recovery Time')}</div>
                    <div class="detail-item-value">${alarm.recoveryTime ? formatAlarmTime(alarm.recoveryTime) : '--'}</div>
                </div>
            `;

            document.getElementById('detailDrawerBody').innerHTML = detailHTML;

            // Footer: only operator can resolve unprocessed alarms
            const footer = document.getElementById('detailDrawerFooter');
            if (alarm.status === 'unprocessed' && isOperator()) {
                footer.innerHTML = `<button class="btn-resolve" onclick="resolveAlarmFromDetail(${alarm.id})" data-i18n="faultAlarm.buttons.resolve">${t('faultAlarm.buttons.resolve', 'Resolve')}</button>`;
                footer.style.display = 'flex';
            } else {
                footer.style.display = 'none';
            }

            // Show drawer
            document.getElementById('detailDrawerOverlay').classList.add('active');
            document.getElementById('detailDrawer').classList.add('active');
        }

        async function resolveAlarmFromDetail(alarmId) {
            const confirmMessage = t('faultAlarm.confirm.resolve', 'Confirm marking this alarm as processed?');
            const confirmTitle = t('faultAlarm.confirm.title', 'Confirm');
            const confirmed = await showConfirmDialog(confirmMessage, confirmTitle);

            if (!confirmed) {
                return;
            }

            const alarm = allAlarms.find(a => a.id === alarmId);
            if (alarm) {
                alarm.status = 'processed';
                alarm.recoveryTime = new Date();

                // Close drawer
                closeAlarmDetail();

                // Refresh table and counts
                applyFilters();
                renderTable();
                updateCounts();
            }
        }

        function closeAlarmDetail() {
            document.getElementById('detailDrawerOverlay').classList.remove('active');
            document.getElementById('detailDrawer').classList.remove('active');
        }

        // ==================== Confirm Dialog ====================
        function showConfirmDialog(message, title = 'Confirm') {
            return new Promise((resolve) => {
                const overlay = document.getElementById('confirmOverlay');
                const titleEl = document.getElementById('confirmTitle');
                const messageEl = document.getElementById('confirmMessage');
                const cancelBtn = document.getElementById('confirmCancelBtn');
                const confirmBtn = document.getElementById('confirmConfirmBtn');

                // Set content
                titleEl.textContent = title;
                messageEl.textContent = message;

                // Update button texts with i18n
                cancelBtn.textContent = t('faultAlarm.confirm.cancel', 'Cancel');
                confirmBtn.textContent = t('faultAlarm.confirm.confirm', 'Confirm');

                // Show overlay
                overlay.classList.add('active');

                // Handle cancel
                const handleCancel = () => {
                    overlay.classList.remove('active');
                    resolve(false);
                    cleanup();
                };

                // Handle confirm
                const handleConfirm = () => {
                    overlay.classList.remove('active');
                    resolve(true);
                    cleanup();
                };

                // Handle overlay click
                const handleOverlayClick = (e) => {
                    if (e.target === overlay) {
                        handleCancel();
                    }
                };

                // Cleanup function
                const cleanup = () => {
                    cancelBtn.removeEventListener('click', handleCancel);
                    confirmBtn.removeEventListener('click', handleConfirm);
                    overlay.removeEventListener('click', handleOverlayClick);
                };

                // Add event listeners
                cancelBtn.addEventListener('click', handleCancel);
                confirmBtn.addEventListener('click', handleConfirm);
                overlay.addEventListener('click', handleOverlayClick);
            });
        }

        // ==================== Batch Actions ====================
        function getSelectedAlarms() {
            return allAlarms.filter(a => a.selected);
        }

        async function batchProcess() {
            const selected = getSelectedAlarms();

            let confirmMessage;
            if (selected.length === 0) {
                const unprocessedCount = filteredAlarms.filter(a => a.status === 'unprocessed').length;
                confirmMessage = t('faultAlarm.confirm.batchProcessAll', `Confirm batch processing all ${unprocessedCount} unprocessed alarms?`).replace('${count}', unprocessedCount);
            } else {
                confirmMessage = t('faultAlarm.confirm.batchProcessSelected', `Confirm batch processing ${selected.length} selected alarms?`).replace('${count}', selected.length);
            }

            const confirmTitle = t('faultAlarm.confirm.title', 'Confirm');
            const confirmed = await showConfirmDialog(confirmMessage, confirmTitle);

            if (!confirmed) {
                return;
            }

            if (selected.length === 0) {
                // Process all visible unprocessed alarms
                filteredAlarms.forEach(a => {
                    if (a.status === 'unprocessed') {
                        a.status = 'processed';
                        a.recoveryTime = new Date();
                    }
                });
            } else {
                selected.forEach(a => {
                    a.status = 'processed';
                    a.recoveryTime = new Date();
                    a.selected = false;
                });
            }
            applyFilters();
            renderTable();
            updateCounts();
        }

        function markAsProcessed() {
            const selected = getSelectedAlarms();
            selected.forEach(a => {
                a.status = 'processed';
                a.selected = false;
            });
            applyFilters();
            renderTable();
            updateCounts();
        }

        function markAsUnprocessed() {
            const selected = getSelectedAlarms();
            selected.forEach(a => {
                a.status = 'unprocessed';
                a.selected = false;
            });
            applyFilters();
            renderTable();
            updateCounts();
        }

        function exportAlarms() {
            const headers = [
                t('faultAlarm.table.alarmTime', 'Alarm Time'),
                t('faultAlarm.table.description', 'Description'),
                t('faultAlarm.table.alarmLevel', 'Alarm Level'),
                t('faultAlarm.table.alarmDevice', 'Alarm Device'),
                t('faultAlarm.table.alarmStation', 'Alarm Station'),
                t('faultAlarm.table.alarmStatus', 'Alarm Status'),
                t('faultAlarm.table.recoveryTime', 'Recovery Time')
            ];
            const rows = filteredAlarms.map(a => [
                formatAlarmTime(a.time, a.timezone),
                getDescriptionText(a.descriptionKey),
                getLevelText(a.level),
                a.device,
                a.station,
                getStatusText(a.status),
                a.recoveryTime ? formatAlarmTime(a.recoveryTime) : '--'
            ]);

            let csv = '\uFEFF' + headers.join(',') + '\n';
            rows.forEach(row => {
                csv += row.map(cell => `"${cell}"`).join(',') + '\n';
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `fault_alarms_${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();
        }

        // ==================== Count Updates ====================
        function updateCounts() {
            const counts = {
                unprocessed: allAlarms.filter(a => a.status === 'unprocessed').length
            };

            document.getElementById('countUnprocessed').textContent = counts.unprocessed;
        }

        // ==================== Pagination ====================
        function updatePagination() {
            const totalPages = Math.max(1, Math.ceil(filteredAlarms.length / pageSize));
            document.getElementById('totalCount').textContent = filteredAlarms.length;
            document.getElementById('currentPageInput').value = currentPage;
            document.getElementById('prevPage').disabled = currentPage <= 1;
            document.getElementById('nextPage').disabled = currentPage >= totalPages;
        }

        function changePage(delta) {
            const totalPages = Math.max(1, Math.ceil(filteredAlarms.length / pageSize));
            const newPage = currentPage + delta;
            if (newPage >= 1 && newPage <= totalPages) {
                currentPage = newPage;
                renderTable();
            }
        }

        function goToPage(value) {
            const totalPages = Math.max(1, Math.ceil(filteredAlarms.length / pageSize));
            const page = parseInt(value);
            if (page >= 1 && page <= totalPages) {
                currentPage = page;
                renderTable();
            }
        }

        function changePageSize(value) {
            pageSize = parseInt(value);
            currentPage = 1;
            renderTable();
        }

        // ==================== Init ====================
        function initPage() {
            // Set default date range (last 7 days)
            const now = new Date();
            const weekAgo = new Date(now);
            weekAgo.setDate(weekAgo.getDate() - 7);

            document.getElementById('startDate').value = weekAgo.toISOString().slice(0, 10);
            document.getElementById('endDate').value = now.toISOString().slice(0, 10);

            // Load data
            allAlarms = generateMockAlarms();
            updateActionButtons();
            applyFilters();
            renderTable();
            updateCounts();

            // Hide table header checkbox for owner
            if (isOwner()) {
                const selectAllCheckbox = document.getElementById('selectAll');
                if (selectAllCheckbox) {
                    selectAllCheckbox.style.display = 'none';
                }
            }
        }

        // ==================== DOMContentLoaded ====================
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize HeaderNav component
            const headerNav = new HeaderNav({
                currentPage: 'faultAlarm',
                containerId: 'headerContainer'
            });

            // 角色权限：运维方数据过滤（必须在 initPage 前）
            const _role = getCurrentUserRole();
            if (_role === 'operator') {
                const operatorStations = ['Hornsdale Power Reserve', 'Wandoan BESS'];
                window._operatorStationFilter = operatorStations;
            }

            // Initialize page
            initPage();

            // Update i18n texts
            setTimeout(() => {
                if (window.i18n && window.i18n.updatePageTexts) {
                    window.i18n.updatePageTexts();
                }
                // Re-render table to pick up i18n translations
                renderTable();
            }, 500);
        });
