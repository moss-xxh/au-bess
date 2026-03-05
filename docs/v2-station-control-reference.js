        function handleCharge() {
            
            // 确保 currentOperation 是 null 而不是 undefined 或其他值
            if (currentOperation === null || currentOperation === undefined) {
                // 没有当前操作，可以开始充电
                showOperationConfirmation('charge');
            } else if (currentOperation === 'charge') {
                // 当前正在充电，显示停止确认
                showStopConfirmation();
            } else if (currentOperation === 'discharge') {
                // 正在放电时不能充电
                return;
            } else {
                // 未知状态，重置并显示充电确认
                currentOperation = null;
                showOperationConfirmation('charge');
            }
        }
        
        // 将函数暴露到全局作用域
        window.handleCharge = handleCharge;

        function handleDischarge() {
            
            // 确保 currentOperation 是 null 而不是 undefined 或其他值
            if (currentOperation === null || currentOperation === undefined) {
                // 没有当前操作，可以开始放电
                showOperationConfirmation('discharge');
            } else if (currentOperation === 'discharge') {
                // 当前正在放电，显示停止确认
                showStopConfirmation();
            } else if (currentOperation === 'charge') {
                // 正在充电时不能放电
                return;
            } else {
                // 未知状态，重置并显示放电确认
                currentOperation = null;
                showOperationConfirmation('discharge');
            }
        }
        
        // 将函数暴露到全局作用域
        window.handleDischarge = handleDischarge;

        // 大圆 hover 辅助（inline handler 无法访问闭包变量，需要暴露到 window）
        window.onStationCircleEnter = function() {
            if (currentOperation) {
                const overlay = document.getElementById('stationStopOverlay');
                if (overlay) overlay.style.opacity = '1';
            }
        };
        window.onStationCircleLeave = function() {
            const overlay = document.getElementById('stationStopOverlay');
            if (overlay) overlay.style.opacity = '0';
        };
        window.onStationCircleClick = function() {
            if (currentOperation) showStopConfirmation();
        };

        // 新的操作启动函数
        function startOperation(operationType) {

        function toggleAutoMode() {
            // 检查当前是否有正在进行的操作
            const operationStatus = getRegionOperationStatus(selectedMainRegion);
            const isOperationActive = operationStatus === 'charging' || operationStatus === 'discharging';
            
            if (isOperationActive) {
                // 显示提示信息，禁止切换
                showAutoSwitchDisabledTooltip();
                return;
            }
            
            const isCurrentlyAuto = currentOperationMode === 'auto';
            
            if (!isCurrentlyAuto) {
                // 切换到自动模式时，显示确认弹窗
                showAutoModeConfirmDialog();
            } else {
                // 从自动模式切换到手动模式，也显示确认弹窗
                showDisableAutoModeConfirmDialog();
            }
        }
        
        function showAutoModeConfirmDialog() {
            const i18n = window.i18n;

            // 创建确认弹窗
            const modal = document.createElement('div');
            modal.id = 'autoModeConfirmModal';
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 10005;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(15px) saturate(1.5);
                animation: fadeIn 0.3s ease;
            `;

            const modalContent = document.createElement('div');
            modalContent.style.cssText = `
                background: linear-gradient(145deg, #1e1e2e 0%, #252535 100%);
                border-radius: 16px;
                padding: 0;
                width: 520px;
                max-width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 1px rgba(255, 255, 255, 0.1);
                animation: slideUp 0.3s ease;
            `;

            // 读取充放电条件数据
            const isEn = i18n ? i18n.getCurrentLanguage() === 'en' : false;
            let tpData = { charge: [], discharge: [] };
            try { tpData = JSON.parse(localStorage.getItem('timePeriods_v5')) || tpData; } catch(e) {}
            const chargeSOC  = parseInt(localStorage.getItem('chargeStopSOC'))    || 75;
            const dischargeSOC = parseInt(localStorage.getItem('dischargeStopSOC')) || 30;

            const buildSlots = (periods, isCharge) => {
                if (!periods || periods.length === 0)
                    return `<div style="font-size:13px;color:rgba(255,255,255,0.4);font-style:italic;">${isEn ? 'No conditions set' : '未设置条件'}</div>`;
                return periods.map((p, idx) => {
                    const color = isCharge ? '#00ff88' : '#ffc107';
                    return `
                        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-left:3px solid ${color};border-radius:8px;padding:10px 12px;margin-bottom:8px;">
                            <div style="font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:4px;">${isEn ? 'Time slot' : '时间段'} ${idx + 1}</div>
                            <div style="font-size:14px;font-weight:600;color:#fff;">🕐 ${p.start} – ${p.end}</div>
                        </div>`;
                }).join('');
            };

        function updatePriceCircleColor() {
            // Update stop button visibility based on current state
            updateStopButtonVisibility();
            
            // Update action buttons visibility based on current state
            updateActionButtonsVisibility();
            
            // 获取当前选中地区的状态 - 使用regionData而不是regionOperationStatus
            const regionStatus = regionData[selectedMainRegion] ? regionData[selectedMainRegion].status : 'none';
            
            // Update water wave colors based on operation status
            const waterWaveContainer = document.getElementById('waterWaveContainer');
            const mainCircle = document.getElementById('mainPriceCircle');
            
            if (!waterWaveContainer) {
                return;
            }
            
            const waterLevelContainer = document.getElementById('waterLevelContainer');
            
            if (regionStatus === 'autoCharge' || regionStatus === 'manualCharge') {
                // 充电状态 - 柔和的绿色渐变，与橙色明度匹配
                waterWaveContainer.style.background = 'linear-gradient(135deg, var(--color-circle-primary) 0%, #389e0d 100%)';
                if (waterLevelContainer) {
                    waterLevelContainer.style.height = '100%';
                }
            } else if (regionStatus === 'autoDischarge' || regionStatus === 'manualDischarge') {
                // 放电状态 - 优化的橙色渐变，更加温暖
                waterWaveContainer.style.background = 'linear-gradient(135deg, #ff9500 0%, #ff7700 100%)';
                if (waterLevelContainer) {
                    waterLevelContainer.style.height = '100%';
                }
            } else {
                // 无状态 - 优化的蓝色渐变，更加柔和
                waterWaveContainer.style.background = 'linear-gradient(135deg, #007AFF 0%, #0056CC 100%)';
                if (waterLevelContainer) {
                    waterLevelContainer.style.height = '100%';
                }
            }
            
            // 更新大圆的光标样式
            if (mainCircle) {
                if (currentOperationMode === 'auto') {
                    // 自动模式下，大圆不可点击
                    mainCircle.style.cursor = 'default';
                } else {
                    // 手动模式下，只有在有操作进行时才可点击
                    if (currentOperation === 'charge' || currentOperation === 'discharge') {
                        mainCircle.style.cursor = 'pointer';
                    } else {
                        mainCircle.style.cursor = 'default';
                    }
                }
            }
        }

        // 更新停止按钮显示状态
        function updateStopButtonVisibility() {
            const mainPriceCircle = document.getElementById('mainPriceCircle');
            if (!mainPriceCircle) return;
            
            // 获取当前选中地区的状态
            const regionStatus = regionData[selectedMainRegion] ? regionData[selectedMainRegion].status : 'none';
            
            // 在4种状态下都显示停止按钮：autoCharge, manualCharge, autoDischarge, manualDischarge
            const shouldShowStop = regionStatus === 'autoCharge' || regionStatus === 'manualCharge' || 
                                  regionStatus === 'autoDischarge' || regionStatus === 'manualDischarge';
            
            if (shouldShowStop) {
                mainPriceCircle.classList.add('manual-operation');
            } else {
                mainPriceCircle.classList.remove('manual-operation');
            }
        }


        // 初始化SOC滑动条位置
        function initSOCSliders() {
            // 初始化充电停止SOC进度条
            const chargeSOCSlider = document.getElementById('chargeSOCSlider');
            const chargeProgressBar = document.getElementById('chargeSOCProgressBar');
            const chargeProgressDot = document.getElementById('chargeSOCProgressDot');
            const chargeInput = document.getElementById('chargeStopSOCInput');
            if (chargeSOCSlider && chargeProgressBar && chargeProgressDot && chargeInput) {
                // 设置初始进度条宽度
                chargeProgressBar.style.width = chargeSOCSlider.value + '%';
                // 设置初始圆点位置
                chargeProgressDot.style.left = chargeSOCSlider.value + '%';
                // 设置初始输入框值
                chargeInput.value = chargeSOCSlider.value;
            }
            
            // 初始化放电停止SOC进度条
            const dischargeSOCSlider = document.getElementById('dischargeSOCSlider');
            const dischargeProgressBar = document.getElementById('dischargeSOCProgressBar');
            const dischargeProgressDot = document.getElementById('dischargeSOCProgressDot');
            const dischargeInput = document.getElementById('dischargeStopSOCInput');
            if (dischargeSOCSlider && dischargeProgressBar && dischargeProgressDot && dischargeInput) {
                // 设置初始进度条位置 (从滑块位置到100%)
