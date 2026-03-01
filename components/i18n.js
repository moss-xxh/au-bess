/**
 * 国际化(i18n)组件
 * 支持多语言切换、动态文本更新、本地存储等功能
 */
class I18n {
    constructor(options = {}) {
        this.defaultLanguage = options.defaultLanguage || 'zh';
        this.supportedLanguages = options.supportedLanguages || {
            'zh': { name: '中文', flag: '🇨🇳', nativeName: '中文' },
            'en': { name: 'English', flag: '🇺🇸', nativeName: 'English' }
        };
        this.containerId = options.containerId || 'languageSelector';
        this.storageKey = options.storageKey || 'app_language';
        
        this.currentLanguage = this.loadLanguageFromStorage() || this.defaultLanguage;
        this.translations = {};
        this.observers = new Set();
        this.isReady = false;
        
        this.init();
    }
    
    init() {
        this.loadTranslations();
        
        // Set initial HTML lang attribute
        document.documentElement.lang = this.currentLanguage === 'zh' ? 'zh-CN' : this.currentLanguage;
        
        this.createLanguageSelectorHTML();
        this.bindEvents();
        this.updatePageTexts();
        
        // 延迟再次更新页面文本，确保页面内容完全加载
        setTimeout(() => {
            this.updatePageTexts();
        }, 500);
        
        // 更长的延迟，确保动态内容也加载完成
        setTimeout(() => {
            this.updatePageTexts();
        }, 1500);
        
        // 监听页面加载完成事件
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.updatePageTexts();
            });
        }
        
        // 监听页面完全加载
        window.addEventListener('load', () => {
            this.updatePageTexts();
        });
        
        // 检查是否需要恢复页面状态（语言切换后）
        // 临时禁用页面状态恢复，用于调试
        // if (sessionStorage.getItem('pageStateBeforeLanguageSwitch')) {
        //     this.restorePageState();
        // }
        
        // Mark as ready after all initialization is complete
        this.isReady = true;
    }
    
    loadTranslations() {
        // 定义多语言文本
        this.translations = {
            zh: {
                // 运维方管理 mgmt keys
                mgmt_op_name: "运维方名称",
                mgmt_account: "登录账号",
                mgmt_contact: "联系人",
                mgmt_password: "密码",
                mgmt_assign_stations: "分配电站",
                mgmt_assigned_count: "已分配电站数",
                mgmt_lease_end: "租赁到期日",
                mgmt_btn_add: "新建运维方",
                mgmt_status_active: "正常",
                mgmt_status_expired: "已到期",
                // 通用翻译
                brand: "品牌",
                model: "型号",
                version: "版本号",
                nav: {
                    home: "首页",
                    profit: "获利",
                    family: "家庭",
                    analysis: "分析",
                    organization: "组织",
                    pushStrategy: "推送策略",
                    operationLog: "操作记录",
                    station: "电站",
                    report: "报表",
                    faultAlarm: "故障",
                    messageCenter: "消息中心",
                    settings: "设置",
                    switchRole: "切换角色",
                    dispatchCenter: "调度中心",
                    clients: "客户",
                    logs: "记录",
                    roleOwner: "业主",
                    roleOperator: "运维方"
                },
                roleSelect: {
                    pageTitle: "角色选择 - U Energy",
                    title: "选择您的角色",
                    subtitle: "请选择登录角色以进入系统",
                    ownerTitle: "业主",
                    ownerSubtitle: "Property Owner",
                    ownerDesc: "创建并管理电站，处理设备故障，分配运维方账号，全面掌控电站资产。",
                    ownerF1: "创建电站与查看运行数据",
                    ownerF2: "故障查看与处理",
                    ownerF3: "创建运维方并分配电站",
                    ownerBtn: "进入业主面板",
                    operatorTitle: "运维方",
                    operatorSubtitle: "O&M Provider",
                    operatorDesc: "智能调度归属电站，查看电量收益报表，记录历史调度操作，高效运维管理。",
                    operatorF1: "AI 智能调度",
                    operatorF2: "查看归属站点运行数据",
                    operatorF3: "电量收益报表",
                    operatorF4: "历史调度记录",
                    operatorBtn: "进入运维面板",
                    logoutLink: "退出登录"
                },
                operatorMgmt: {
                    title: "运维管理",
                    buttons: {
                        add: "新建运维方",
                        search: "查询",
                        reset: "重置",
                        export: "导出",
                        refresh: "刷新"
                    },
                    table: {
                        name: "运维方名称",
                        contact: "联系人",
                        stations: "分配电站",
                        stationCount: "电站数",
                        rentalEnd: "租赁到期",
                        status: "状态",
                        action: "操作"
                    },
                    status: {
                        active: "运营中",
                        inactive: "已停用",
                        allStatus: "所有状态"
                    },
                    actions: {
                        edit: "编辑",
                        delete: "删除"
                    },
                    modal: {
                        addOperator: "新建运维方",
                        editOperator: "编辑运维方"
                    },
                    placeholder: {
                        userName: "搜索运维方名称",
                        userEmail: "搜索联系邮箱"
                    }
                },
                analysis: {
                    realtime: "实时分析",
                    historical: "历史分析",
                    waitToSell: "等待卖出",
                    waitingMessage: "预计3小时后电价上涨至峰值，建议继续持有",
                    decisionConfidence: "决策信心度",
                    expectedWaitTime: "预计等待时间",
                    estimatedPrice: "预计价格",
                    estimatedExtraProfit: "预计多获利",
                    riskAlert: "风险提示",
                    opportunityHint: "机会提示",
                    dischargingCapacityDecline: "可放电量下降，峰值时刻仅剩52MWh",
                    priceVolatility: "价格波动大，容易错失放电时机",
                    eveningPeak: "晚高峰将至，需求将会增加",
                    demandGrowth: "需求快速增长，发电量持续下降，缺口将继续扩大",
                    pricePrediction: "今日价格预测偏差小，峰值$450",
                    priceDimension: "价格维度",
                    priceLow: "价格偏低",
                    currentPrice: "当前价格",
                    predictedTodayPeak: "预测今日峰值",
                    recent7daysAvgPrice: "近7日平均卖电价",
                    sellPriceHigh: "卖电高点",
                    todayPricePredictionError: "今日价格预测偏差",
                    highPrecision: "高精度",
                    priceConclusion: "结论：近7日均价$385处于高点，当前$285低于均值26%，预测峰值$450，存在较大套利空间",
                    marketDimension: "市场维度",
                    veryLikelyToRise: "极可能上涨",
                    supplyDemandRatio: "供需比",
                    supplyTight: "供应紧张",
                    supplyDemandGap: "供需缺口",
                    gapLarge: "缺口较大",
                    demandChangeRate: "需求变动率",
                    rapidGrowth: "快速增长",
                    generationChangeRate: "发电变动率",
                    continuousDecline: "持续下降",
                    marketConclusion: "结论：需求增长8.5%/h而发电下降2.3%/h，供需缺口持续扩大至650MW，电价必然大幅上涨",
                    userDimension: "用户维度",
                    dischargingCapacityDrop: "放电量下降",
                    participationRate: "可参与率",
                    comprehensiveCoverage: "覆盖全面",
                    availableDischargeCapacity: "可放电量",
                    todayExpectedDischarge: "今日预计放电",
                    belowHistorical: "低于历史",
                    recent7daysAvgDischarge: "近7日平均放电量",
                    dailyAvgPerformance: "日均表现",
                    userConclusion: "结论：可参与率98.5%覆盖全面，可放电量45.8kWh(37%)，今日预计放电45.3kWh低于历史",
                    hours: "小时",
                    title: "历史数据深度分析 - U Energy",
                    priceAnalysis: "价格分析",
                    operationAnalysis: "操作分析",
                    userAnalysis: "用户分析",
                    yesterday: "昨天",
                    recent7days: "近7天",
                    recent30days: "近30天",
                    analysisConclusion: "分析结论",
                    dischargeAnalysis: "放电分析",
                    sellingTimingAnalysis: "售电时机分析图表",
                    detailedAnalysisChart: "详细分析图表",
                    supplyDemandGapAnalysis: "供需缺口分析",
                    accuratePrediction: "准确预测",
                    pricePrediction: "价格预测",
                    analysisConclusion: "分析结论",
                    moderatelyAccuratePrediction: "较准预测",
                    deviation1to5: "偏差1-5%",
                    largeDeviation: "偏差较大",
                    deviationGreaterThan5: "偏差>5%",
                    priceError: "价格误差",
                    accuracyTrendChart: "预测准确率趋势"
                },
                home: "首页",
                station: "电站管理",
                highestPriceRegion: "最高价格区域：",
                highestPrice: "价格最高",
                todayLow: "今日最低",
                todayHigh: "今日最高",
                charge: "充电",
                discharge: "放电",
                stop: "停止",
                priceHeight: "电站状态",
                manualMode: "手动",
                autoMode: "自动",
                autoConditions: "自动化条件",
                settings: "设置",
                settingsTitle: "设置",
                edit: "编辑",
                multiPeriodStrategyTip: "💡 为不同时间段设置不同价格阈值，系统将同时监测所有时间段，任意条件满足即触发相应操作。勾选价格条件可启用/禁用该时段的价格限制。",
                toggle: {
                    enabled: "启用",
                    disabled: "禁用"
                },
                operationType: "操作类型",
                timeRange: "时间范围",
                priceCondition: "价格条件",
                batteryLevel: "电池电量",
                autoCharge: "自动充电中",
                manualCharge: "手动充电中",
                autoDischarge: "自动放电中",
                manualDischarge: "手动放电中",
                autoSettings: "自动化设置",
                
                // Status translations for region badges
                status: {
                    none: "",
                    autoCharge: "自动充电中",
                    manualCharge: "手动充电中",
                    autoDischarge: "自动放电中",
                    manualDischarge: "手动放电中"
                },
                
                // Charge/Discharge condition labels
                chargeCondition: "充电条件",
                dischargeCondition: "放电条件",
                chargeConditionSingle: "充电条件",
                dischargeConditionSingle: "放电条件",
                timeCondition: "时间条件",
                timeConditionSettings: "时间条件设置",
                priceCondition: "价格条件",
                chargeStopSOC: "充电停止SOC",
                dischargeStopSOC: "放电停止SOC",
                lessThanPrice: "低于",
                greaterThanPrice: "高于",
                autoConditions: "自动条件",
                timeSchedule: "时间安排",
                chargeTime: "充电时间",
                dischargeTime: "放电时间",
                clickToSelectTime: "点击时间轴选择充电或放电时间段",
                
                autoModeType: "自动模式类型",
                autoChargeConditions: "自动充电条件",
                autoDischargeConditions: "自动放电条件",
                autoChargeCondition: "自动充电条件",
                autoDischargeCondition: "自动放电条件",
                condition1Time: "条件1：时间",
                condition2Price: "条件2：价格",
                endConditionSoc: "结束条件：SOC",
                timeSetting: "时间设置",
                priceSetting: "价格设置",
                batterySetting: "电池设置",
                lessThan: "低于",
                greaterThan: "高于",
                between: "介于",
                cancel: "取消",
                saveSettings: "保存设置",
                family: "家庭",
                availableHomes: "可放电家庭",
                availablePower: "可放电量",
                estimatedProfit: "获利",
                estimatedRevenue: "预计获利（不考虑成本）",
                estimatedRevenueMain: "预计获利",
                estimatedRevenueSub: "（不考虑成本）",
                todayDischargeHomes: "今日放电家庭",
                discharged: "已放电量",
                actualDischarge: "实际放电量",
                input: "用电量",
                output: "馈网量",
                profit: "获利($)",
                actualProfit: "已获利",
                todayData: "今日数据",
                realtime: "实时",
                market: "行情",
                map: "地图",
                autoSwitch: "自动切换",
                dischargedFamilies: "已放电家庭",
                dischargedEnergy: "已放电",
                totalEarnings: "已获利($)",
                comparedToYesterday: "比昨日",
                installedCapacity: "装机量",
                currentSpotPrice: "现货电价",
                currentDemand: "当前需求",
                forecastPrice: "预测价格",
                forecastDemand: "预测需求",
                demand: "需求",
                generation: "发电",
                averagePrice: "平均价格",
                maxPrice: "最高价格",
                minPrice: "最低价格",
                priceFluctuation: "价格波动",
                historicalPrice: "历史价格",
                predictedPrice: "预测价格",
                predictedDemand: "预测需求",
                comparedYesterday: "较昨日",
                within24h: "24小时内",
                powerRevenueTrend: "放电与获利趋势",
                dischargeAndProfit: "电量与获利",
                timeFilter: "时间筛选",
                today: "今日",
                week: "本周",
                month: "本月",
                custom: "自定义",
                day: "日",
                year: "年",
                cumulative: "累计",
                refresh: "刷新",
                charging: "充电中",
                chargeIndicator: "充",
                dischargeIndicator: "放",
                selectRegion: "选择地区",
                regionSelectionHint: "选择地区后，页面将只显示该地区的数据",
                allRegions: "全部地区",
                currentRegion: "当前：",
                discharging: "放电中",
                standby: "待机",
                offline: "离线",
                systemOverview: "系统概览",
                totalCapacity: "总容量",
                onlineDevices: "在线设备",
                networkStatus: "网络状态",
                normal: "正常",
                totalDischarge: "累计放电",
                totalGridDischarge: "累计放电上网量",
                totalRevenue: "累计获利",
                totalHomes: "家庭",
                totalInstall: "装机量",
                totalActualDischarge: "累计实际放电",
                totalProfit: "累计获利",
                cumulativePrice: "累计价格",
                currentCumulativePrice: "当前累计价格",
                forecastCumulativePrice: "预测累计价格(5min)",
                thresholdStatus: "阈值状态",
                threshold: "阈值",
                currentTime: "当前时间",
                belowThreshold: "未超阈",
                exceededThreshold: "已超阈",
                executionEfficiency: "执行效率",
                systemAvailability: "系统可用性",
                actualDischargeRate: "实际放电率",
                
                // 测试卡片翻译
                testTitle: "测试专用",
                chargeAlert: "充电提醒",
                dischargeAlert: "放电提醒", 
                optimalChargeTiming: "最佳充电时机",
                lowPriceChargeAlert: "低价充电提醒",
                
                // SOC confirmation dialog
                confirmSOCChange: "SOC设置确认",
                socChangeConfirmMessage: "当前地区正在运行中，是否立即应用SOC更改？",
                applyNow: "立即应用",
                applyNext: "下次应用",
                waitingExecution: "等待执行中",
                charging: "充电中",
                discharging: "放电中",
                
                // Progress dialog status
                waiting: "等待中",
                completed: "已完成",
                reading: "读取中",
                setting: "设置中",
                
                // Progress dialog content
                chargingProgress: "充电进度",
                dischargingProgress: "放电进度",
                operationInProgress: "正在执行操作...",
                sentDevices: "下发设备",
                charge: "充电",
                discharge: "放电",
                readDeviceSettings: "1. 读取设备设置信息",
                modifyDeviceSettings: "2. 修改设备设置信息",
                dragToMoveClickToToggle: "拖拽移动，点击切换",
                chargeStopSOC: "充电停止SOC",
                dischargeStopSOC: "放电停止SOC",
                pleaseStopCurrentMode: "请先停止当前模式",
                autoChargingCannotEdit: "自动充电进行中，无法编辑设置",
                autoDischargingCannotEdit: "自动放电进行中，无法编辑设置",
                stationStatus: "电站状态",
                
                // Region overview card
                regionConditionsOverview: "地区条件总览",
                automationConditions: "自动化条件",
                autoConditions: "自动条件",
                autoConditionsDesc: "配置系统自动执行充放电操作的触发条件",
                conditionsView: "条件视图",
                chargeCondition: "充电条件",
                dischargeCondition: "放电条件",
                timeCondition: "时间条件",
                timeConditionSettings: "时间条件设置",
                priceCondition: "价格条件",
                idle: "待机",
                region: "地区",
                stopSOC: "停止SOC",
                today: "今日",
                week: "本周",
                month: "本月",
                custom: "自定义",
                refresh: "刷新",
                timeFilter: "时间筛选",
                refreshData: "手动刷新数据",
                dataRefreshed: "数据已刷新",
                chartsLoadFailed: "个图表加载失败，请检查控制台",
                allChartsLoaded: "所有图表加载成功",
                filterError: "筛选出现错误，请刷新页面重试",
                dataLoading: "数据加载中...",
                currentTime: "当前时间",
                userName1: "张明",
                userName2: "李华",
                userName3: "王伟",
                adminUser: "管理员",
                switchedTo: "已切换到",
                tabSwitched: "标签页已切换",
                saving: "保存中...",
                deleting: "删除中...",
                exporting: "导出中...",
                selectDateRange: "请选择开始和结束日期",
                invalidDateRange: "开始日期不能晚于结束日期",
                dateRangeTooLong: "选择的时间范围不能超过1年",
                customRangeApplied: "已应用自定义时间范围",
                filterApplied: "已筛选显示",
                noDataTable: "未找到数据表格",
                exportSuccess: "成功导出",
                exportFailed: "导出失败，请重试",
                sortCancelled: "已取消排序",
                sortApplied: "已按",
                filterReset: "筛选已重置",
                socRangeError: "SOC最小值不能大于最大值",
                profitRangeError: "获利最小值不能大于最大值",
                daysRangeError: "使用天数最小值不能大于最大值",
                advancedFilterApplied: "高级筛选已应用",
                exportedRecords: "已导出",
                searchComplete: "搜索完成",
                foundMatches: "找到",
                matchingMessages: "条匹配消息",
                resetComplete: "重置完成",
                searchCleared: "已清空搜索条件",
                noData: "暂无数据",
                    charge: "充电",
                    discharge: "放电",
                common: {
                    back: "返回",
                    cancel: "取消",
                    confirm: "确认",
                    confirmAction: "确认操作",
                    confirmMessage: "确认要执行此操作吗？",
                    backToList: "返回列表",
                    previous: "上一页",
                    next: "下一页",
                    times: "次",
                    total: "共",
                    items: "条",
                    page: "第",
                    save: "保存",
                    close: "关闭",
                    delete: "删除",
                    edit: "编辑",
                    add: "添加",
                    search: "搜索",
                    reset: "重置",
                    loading: "加载中...",
                    noData: "暂无数据",
                    settings: "设置",
                    logout: "退出",
                    confirmLogout: "确认退出",
                    confirmLogoutMsg: "确认要退出登录吗？"
                },
                userName1: "张明",
                userName2: "李华",
                userName3: "王伟",
                userName5: "张三",
                adminUser: "管理员",
                remark: {
                    none: "-",
                    testAccount: "测试账号",
                    systemAdmin: "系统管理员",
                    tempUser: "临时用户"
                },
                control: "控制",
                monitor: "监控",
                detail: "详情",
                manage: "管理",
                config: "配置",
                searchComplete: "查询完成",
                foundRecords: "找到 {count} 条匹配记录",
                resetComplete: "重置完成",
                clearedSearch: "已清空搜索条件",
                exporting: "导出中",
                exportSuccess: "数据已导出",
                validationFailed: "验证失败",
                fillRequired: "请填写所有必填字段",
                saveSuccess: "保存成功",
                userSaved: "用户信息已保存",
                deleteSuccess: "删除成功",
                userDeleted: "用户已被删除",
                
                // Device command modal translations
                deviceCommand: "设备指令",
                confirmOperation: "确认操作",
                operationType: "操作类型",
                targetDevices: "目标设备",
                executionTime: "预计执行时间",
                immediately: "立即",
                minutes: "分钟",
                operationWarning: "此操作将影响所有选中的设备，请确认后继续。",
                confirmExecute: "确认执行",
                cancel: "取消",
                stop: "停止",
                charging: "充电中",
                discharging: "放电中",
                idle: "空闲",
                stopOperation: "停止操作",
                operationSuccess: "操作成功",
                operationFailed: "操作失败",
                confirmCharge: "确认充电",
                confirmDischarge: "确认放电",
                confirmStop: "确认停止",
                estimatedRevenue: "预计获利",
                estimatedPower: "预计功率",
                currentPrice: "当前电价",
                confirmExecute: "确认执行",
                confirmCharge: "确认充电",
                confirmDischarge: "确认放电",
                confirmStop: "确认停止",
                stopWarning: "停止操作将立即终止所有设备的充电/放电状态，设备将恢复到待机模式。",
                stopChargeWarning: "停止操作将立即终止所有设备的充电状态，设备将恢复到待机模式。",
                stopDischargeWarning: "停止操作将立即终止所有设备的放电状态，设备将恢复到待机模式。",
                chargingCompleteMessage: "充电指令下发完成，以下是设备响应统计报告：",
                dischargingCompleteMessage: "放电指令下发完成，以下是设备响应统计报告：",
                stopWarning: "停止操作将立即终止所有设备的充电/放电状态，设备将恢复到待机模式。",
                deviceResponseStatisticsTitle: "设备响应统计",
                operationCompleteMessage: "指令下发完成，以下是设备响应统计报告：",
                chargingCompleteMessage: "充电指令下发完成，以下是设备响应统计报告：",
                dischargingCompleteMessage: "放电指令下发完成，以下是设备响应统计报告：",
                
                // Chart common translations
                charts: {
                    dischargeAmount: "放电量",
                    profit: "获利",
                    timeHour: "时间：时",
                    socTrend: "SOC趋势",
                    charge: "充电",
                    stopCharge: "停止充电",
                    discharge: "放电",
                    stopDischarge: "停止放电",
                    familyDistribution: "家庭分布",
                    totalFamilies: "总家庭数",
                    energyUsage: "能源使用",
                    dailyRevenue: "日收益",
                    cumulativeRevenue: "累计收益",
                    deviceStatus: "设备状态",
                    standby: "待机",
                    offline: "离线",
                    pvGeneration: "光伏发电",
                    storageDischarge: "储能放电",
                    powerLoad: "用电负荷",
                    user: "用户",
                    notParticipating: "未参与用户",
                    maxValue: "最大值",
                    minValue: "最小值",
                    avgValue: "平均值",
                    efficiency: "执行效率",
                    availability: "系统可用性",
                    device: "设备"
                },
                
                months: {
                    jan: "1月", feb: "2月", mar: "3月", apr: "4月",
                    may: "5月", jun: "6月", jul: "7月", aug: "8月",
                    sep: "9月", oct: "10月", nov: "11月", dec: "12月"
                },
                
                weekdays: {
                    mon: "周一", tue: "周二", wed: "周三", thu: "周四",
                    fri: "周五", sat: "周六", sun: "周日"
                },
                charging: "充电中",
                discharging: "放电中",
                standby: "待机",
                offline: "离线",
                active: "激活",
                device: "设备",
                status: "状态", 
                region: "区域",
                state: "州",
                deviceCount: "设备数量",
                normalOperation: "正常运行",
                price: "价格",
                historicalPrice: "历史价格",
                predictedPrice: "预测价格",
                predictedDemand: "预测需求",
                operationConfirm: "操作确认",
                confirmMessage: "您确定要执行此操作吗？",
                operationType: "操作类型",
                targetDevices: "影响设备",
                estimatedPower: "预计功率",
                currentPrice: "当前电价",
                estimatedDuration: "预计时长",
                estimatedCost: "预计成本/收益",
                cancel: "取消",
                save: "保存",
                socSettings: "SOC 设置",
                stop: "停止",
                units: "个",
                comparedToYesterday: "比昨日",
                compareYesterday: "比昨日",
                dischargedAmount: "已放电量",
                earnedProfit: "已获利",
                dischargeFamilies: "放电家庭",
                dischargeAmount: "放电量",
                dischargeProfit: "获利",
                chargeFamilies: "充电家庭",
                chargeAmount: "充电量",
                chargeCost: "成本",
                netProfit: "净获利",
                cumulativeMetrics: "累计指标",
                confirmAutoMode: "确认启用自动模式",
                autoModeDescription: "启用自动模式后，系统将根据以下条件自动执行充放电操作：",
                editConditionHint: "如需修改条件，请点击\"编辑设置\"按钮",
                editSettings: "编辑设置",
                confirmEnable: "确认启用",
                confirmDisableAutoMode: "确认关闭自动模式",
                disableAutoModeDescription: "关闭自动模式后，系统将停止自动充放电操作，您需要手动控制充放电。",
                autoModeWarning: "注意",
                disableAutoModeWarning: "关闭自动模式后，您可能会错过最佳的充放电时机，影响收益。",
                currentAutoModeStatus: "当前自动模式状态：",
                autoModeActive: "运行中",
                confirmDisable: "确认关闭",
                conditionEnabled: "已启用",
                conditionDisabled: "未启用",
                timeSegment: "时间段",
                priceThreshold: "价格阈值",
                chargeToSOC: "充电至 SOC",
                dischargeToSOC: "放电至 SOC",
                currentCumulativePrice: "当前累计价格",
                forecastCumulativePrice5min: "预测累计价格(5min)",
                thresholdStatus: "阈值状态",
                notExceeded: "未超阈",
                confirmExecute: "确认执行",
                operationSuccess: "指令下发成功",
                systemExecuting: "系统正在执行您的操作指令...",
                devicesDispatched: "指令下发",
                devicesReceived: "指令接收",
                devicesActivated: "成功",
                successRate: "成功率",
                close: "关闭",
                viewDetails: "查看详情",
                totalDevices: "总设备数",
                offlineDevices: "离线设备",
                dispatchedDevices: "下发设备",
                successfullyDispatched: "成功下发",
                executing: "执行中",
                successStatus: "成功",
                failedStatus: "失败",
                failed: "下发失败",
                failedDevices: "下发失败设备",
                successDevices: "下发成功设备",
                executingDevices: "执行中设备",
                nmi: "NMI",
                failureCount: "失败次数",
                status: "状态",
                success: "下发成功",
                totalCount: "总数",
                estimatedProfit: "预计获利",
                estimatedProfitValue: "+$340",
                devices: "设备",
                operationDetails: "操作详情",
                basicInfo: "基本信息",
                executionStatus: "执行状态",
                operationTime: "操作时间",
                deviceResponseStatistics: "设备响应统计",
                commandsSent: "指令下发",
                commandsReceived: "指令接收",
                commandSentSuccess: "指令下发成功",
                commandsIssued: "指令下发",
                devicesExecuted: "已下发",
                systemAdmin: "系统管理员",
                operatorA: "操作员A",
                operatorB: "操作员B",
                dischargeStatistics: "放电统计",
                priceStatistics: "价格统计",
                actualDischargeAmount: "实际放电量",
                actualDischargeEfficiency: "实际放电率",
                outputAmount: "馈网量",
                inputAmount: "用电量",
                usersExceedingTarget: "超过目标用户",
                usersNotExceedingTarget: "未达目标用户",
                todaysPrice: "今日价格",
                avgDischargePrice: "平均放电价格",
                sellPrice: "卖电价",
                todaysLowest: "今日最低",
                todaysHighest: "今日最高",
                refreshData: "手动刷新数据",
                startDate: "开始日期",
                endDate: "结束日期",
                reset: "重置",
                query: "查询",
                quickSelect: "快速选择",
                last7Days: "最近7天",
                last30Days: "最近30天",
                last90Days: "最近90天",
                last6Months: "最近6个月",
                last1Year: "最近1年",
                dayReport: "日报",
                monthReport: "月报",
                yearReport: "年报",
                totalReport: "累计",
                selectTime: "选择时间",
                energyManagementCenter: "能源管理中心",
                unit: "个",
                comparedToYesterdayPlus: "↑ 比昨日+",
                设置: "设置",
                退出: "退出",
                确认退出: "确认退出",
                确认退出消息: "您确定要退出系统吗？",
                导出: "导出",
                刷新: "刷新",
                estimatedDuration: "15-30分钟",
                thisOperationWillAffectAll: "此操作将影响所有已连接设备，请确认后再继续。",
                viewDetails: "查看详情",
                successfullyActivated: "成功激活",
                devicePrefix: "设备",
                statusLabel: "状态",
                regionLabel: "区域",
                stateLabel: "州",
                deviceCountLabel: "设备数量",
                statusNormalOperation: "状态: 正常运行",
                inactive: "待机",
                minutes: "分钟",
                confirmChargeOperation: "确认充电操作",
                confirmDischargeOperation: "确认放电操作",
                confirmChargeMessage: "您确定要执行充电操作吗？",
                confirmDischargeMessage: "您确定要执行放电操作吗？",
                chargeWarningMessage: "将开始对所有连接设备进行充电操作，此过程将消耗电网电力。",
                dischargeWarningMessage: "将开始对所有连接设备进行放电操作，向电网输送电力以获取收益。",
                confirmStopCharge: "确认停止充电",
                confirmStopDischarge: "确认停止放电",
                confirmStopChargeMessage: "您确定要停止充电操作吗？",
                confirmStopDischargeMessage: "您确定要停止放电操作吗？",
                confirmStopChargeTitle: "确认停止充电",
                confirmStopDischargeTitle: "确认停止放电",
                stopCharge: "停止充电",
                stopDischarge: "停止放电",
                allDevices: "所有设备",
                deviceResponseStatisticsTitle: "设备响应统计",
                operationCommandCompleted: "指令下发完成，以下是设备响应统计报告：",
                
                // Operation Log translations
                operationLog: {
                    title: "操作记录",
                    tabs: {
                        task: "任务记录",
                        operation: "操作记录",
                        basic: "基本信息",
                        stations: "电站详情",
                        timeline: "执行时间线"
                    },
                    table: {
                        time: "时间",
                        region: "地区",
                        dischargeType: "放电类型",
                        taskIssuer: "下发任务",
                        taskCount: "下发任务数",
                        participants: "参与人数",
                        participationRate: "参与率",
                        dischargeAmount: "放电量(kWh)",
                        netProfit: "净利润($)",
                        profitPerKwh: "每度电净利润($/kWh)",
                        command: "命令",
                        operator: "操作人",
                        stations: "下发电站",
                        success: "成功",
                        failed: "失败",
                        action: "操作"
                    },
                    filter: {
                        allRegions: "全部地区",
                        allStations: "全部电站",
                        operatorPlaceholder: "请输入操作人员...",
                        allCommands: "全部命令",
                        charge: "充电",
                        discharge: "放电",
                        stopCharge: "停止充电",
                        stopDischarge: "停止放电",
                        timePlaceholder: "请选择时间..."
                    },
                    buttons: {
                        search: "🔍 查询",
                        reset: "🔄 重置",
                        export: "📥 导出",
                        refresh: "🔄 刷新",
                        viewDetails: "查看详情"
                    },
                    noData: "暂无数据",
                    total: "共",
                    perPage: "/页",
                    goToPage: "前往",
                    notFound: "找不到操作记录",
                    
                    // Detail drawer translations
                    detailTitle: "操作记录详情",
                    tabs: {
                        basic: "基本信息",
                        stations: "电站详情",
                        timeline: "执行时间线"
                    },
                    overview: {
                        title: "操作概览",
                        totalStations: "总电站数",
                        successCount: "成功数",
                        failedCount: "失败数",
                        successRate: "成功率"
                    },
                    basicInfo: {
                        title: "基本信息",
                        operationTime: "操作时间",
                        operationCommand: "操作命令",
                        operator: "操作人员",
                        operationId: "操作编号",
                        executionStatus: "执行状态",
                        allSuccess: "全部成功",
                        partialSuccess: "部分成功",
                        mostlyFailed: "多数失败"
                    },
                    stationDetails: {
                        title: "电站执行详情",
                        success: "成功",
                        failed: "失败",
                        station: "电站",
                        area: "区域"
                    },
                    timeline: {
                        title: "执行时间线",
                        commandCreated: "操作命令创建",
                        validationPassed: "命令验证通过",
                        executionStarted: "开始执行命令",
                        stationsSuccess: "个电站执行成功",
                        stationsFailed: "个电站执行失败",
                        executionCompleted: "操作执行完成",
                        normal: "正常",
                        warning: "警告",
                        error: "错误"
                    },
                    dailyStats: {
                        title: "每日电站统计",
                        date: "日期",
                        station: "电站",
                        chargeCount: "充电次数",
                        dischargeCount: "放电次数",
                        operationMode: "操作方式",
                        modes: {
                            manual: "人工",
                            automated: "智能托管"
                        }
                    }
                },
                
                // Message Center translations
                messageCenter: {
                    title: "消息中心",
                    tabs: {
                        all: "全部",
                        alert: "告警",
                        system: "系统",
                        operation: "操作"
                    },
                    placeholder: {
                        searchKeyword: "请输入消息关键词..."
                    },
                    types: {
                        chargeReminder: "充电提醒",
                        dischargeReminder: "放电提醒"
                    },
                    status: {
                        unread: "未读",
                        read: "已读"
                    },
                    buttons: {
                        search: "🔍 查询",
                        reset: "🔄 重置",
                        export: "📥 导出",
                        delete: "删除"
                    },
                    markAsRead: "标记为已读",
                    delete: "删除",
                    noMessages: "暂无消息",
                    loading: "加载中...",
                    messages: {
                        chargeAlert: "当前价格 {price} 元，低于预设阀值 {threshold} 元，请立即充电",
                        dischargeAlert: "当前价格 {price} 元，超过预设阀值 {threshold} 元，请立即放电"
                    },
                    timeAgo: {
                        justNow: "刚刚",
                        minutesAgo: "{minutes}分钟前",
                        hoursAgo: "{hours}小时前",
                        daysAgo: "{days}天前"
                    }
                },
                
                // Sorting translations
                sortAsc: "升序",
                sortDesc: "降序",
                
                // Common translations
                page: "页",
                items: "条",
                messageContent: "消息内容",
                description: "描述",
                type: "预警",
                time: "时间",
                units: "条",
                allTypes: "全部类型",
                alertMessage: "告警消息",
                systemMessage: "系统消息",
                operationMessage: "操作消息",
                warning: "预警",
                noMessagesFound: "当前筛选条件下没有找到相关消息",
                firstPage: "首页",
                prevPage: "上一页",
                nextPage: "下一页",
                lastPage: "末页",
                showingItems: "显示第",
                error: "错误",
                dateSelection: "日期选择",
                dateSelected: "已选择日期",
                go: "前往",
                
                // Profit page translations
                profitAnalysis: "获利分析",
                profitSubtitle: "实时监控和分析您的能源交易收益",
                todayProfit: "今日获利",
                weekProfit: "本周获利",
                monthProfit: "本月获利",
                comparedToLastWeek: "比上周",
                comparedToLastMonth: "比上月",
                yearToDate: "年初至今",
                profitTrend: "获利趋势",
                deviceProfitRanking: "设备获利排行",
                energyRevenueComparison: "能耗收益对比",
                profitDistribution: "获利分布",
                hourlyProfitAnalysis: "时段获利分析",
                dailyProfitComparison: "日获利对比",
                energyConsumption: "能耗",
                revenue: "收益",
                profit: "获利",
                chargingProfit: "充电获利",
                dischargingProfit: "放电获利",
                tradingProfit: "交易获利",
                profitSource: "获利来源",
                hourlyProfit: "时段获利",
                thisWeek: "本周",
                lastWeek: "上周",
                thisMonth: "本月",
                lastMonth: "上月",
                monday: "周一",
                tuesday: "周二",
                wednesday: "周三",
                thursday: "周四",
                friday: "周五",
                saturday: "周六",
                sunday: "周日",
                top10: "TOP 10",
                bottom10: "BOTTOM 10",
                searchDevice: "搜索设备",
                search: "搜索",
                deviceId: "设备ID",
                location: "位置",
                efficiency: "效率",
                online: "在线",
                offline: "离线",
                overview: "总览",
                dailyProfit: "日获利",
                deviceProfit: "设备获利",
                chartView: "图表视图",
                tableView: "表格视图",
                
                // Analysis page translations
                analysis: {
                    title: "分析 - 日报",
                    profit: "获利 (万元)",
                    avgProfitPerPerson: "人均获利 (元)",
                    dischargeStats: "放电统计",
                    priceStats: "价格统计", 
                    userStats: "用户统计",
                    dischargeAnalysis: "放电分析",
                    profitRatio: "获利占比",
                    profitLabel: "获利",
                    doubleRing: {
                        userPerspective: "内环：活跃",
                        profitPerspective: "外环：获利"
                    },
                    timeFilter: {
                        label: "时间筛选",
                        today: "今日",
                        thisMonth: "本月", 
                        thisYear: "本年"
                    },
                    metrics: {
                        userCount: "用户数",
                        activeUserRatio: "活跃用户占比",
                        dischargeAmount: "放电量 (kWh)",
                        actualDischargeEfficiency: "实际放电效率",
                        exceedingUsers: "超过实际放电用户数",
                        notExceedingUsers: "未超过实际放电用户数",
                        todayPrice: "今日价格",
                        avgDischargePrice: "放电平均价",
                        actualDischargeAmount: "实际放电量",
                        actualDischargeRate: "实际放电率",
                        todayAvgDischargeRate: "今日平均放电率",
                        todayAvgPrice: "今日平均价"
                    },
                    units: {
                        yuan: "元",
                        kwh: "kWh",
                        percent: "%"
                    },
                    comparison: {
                        increase: "▲",
                        decrease: "▼",
                        compared: "环比"
                    },
                    priceRange: {
                        lowest: "最低",
                        highest: "最高",
                        sellPrice: "卖电价",
                        todayLowest: "今日最低",
                        todayHighest: "今日最高",
                        currentPrice: "当前价格"
                    },
                    currency: {
                        yuan: "元",
                        dollar: "$"
                    },
                    userTypes: {
                        active: "活跃",
                        inactive: "非活跃", 
                        notParticipating: "未参与"
                    },
                    chartLabels: {
                        actualDischarge: "实际放电量",
                        price: "价格",
                        dischargeRate: "实际放电率"
                    },
                    userRatio: "用户数占比",
                    userLabel: "用户",
                    modal: {
                        exceedingUsersDetail: "超过实际放电用户明细",
                        notExceedingUsersDetail: "未超过实际放电用户明细",
                        exceedingUsersTitle: "超过实际放电用户详情",
                        notExceedingUsersTitle: "未超过实际放电用户详情"
                    },
                    table: {
                        userName: "用户名称",
                        dischargeAmount: "放电量(kWh)",
                        efficiency: "效率(%)",
                        profit: "获利($)"
                    },
                    profitTypes: {
                        highProfit: "高获利",
                        mediumProfit: "中获利",
                        lowProfit: "低获利"
                    }
                },
                
                // Family page translations
                family: {
                    title: "家庭",
                    subtitle: "管理和监控所有家庭的能源使用情况",
                    deviceId: "设备ID",
                    address: "地址",
                    status: "状态",
                    cumulativeDischarge: "累计放电",
                    cumulativeRevenue: "累计收益",
                    action: "操作",
                    enabled: "启用",
                    disabled: "禁用",
                    totalFamilies: "家庭总数",
                    totalRevenue: "累计获利",
                    familyDistribution: "家庭分布统计",
                    deviceStatus: "设备状态",
                    deviceStatusDistribution: "设备状态分布",
                    allDeviceStatus: "所有设备状态",
                    activeFamilies: "活跃家庭",
                    inactiveFamilies: "非活跃家庭",
                    notParticipatingFamilies: "未参与家庭",
                    foundFamilies: "共找到 {count} 个家庭",
                    views: {
                        grid: "🏠 网格视图",
                        chart: "📊 图表视图",
                        table: "📋 表格视图"
                    },
                    buttons: {
                        search: "查询",
                        reset: "重置", 
                        export: "导出",
                        refresh: "刷新",
                        expand: "展开",
                        collapse: "收起",
                        advancedFilter: "⚙️ 高级筛选",
                        applyFilter: "应用高级筛选",
                        cancel: "取消",
                        clearAll: "清除所有筛选",
                        viewDetails: "查看详情",
                        details: "详情",
                        all: "全部"
                    },
                    placeholder: {
                        allStatus: "所有状态",
                        allActivity: "所有活跃度",
                        deviceStatus: "所有设备状态",
                        allBrands: "所有品牌",
                        userName: "请输入用户名称...",
                        deviceCode: "请输入设备编码...",
                        meterNumber: "请输入电表编号...",
                        minValue: "最小值",
                        maxValue: "最大值",
                        allLocations: "所有地区",
                        allRegions: "所有地区",
                        allDevices: "所有设备"
                    },
                    table: {
                        user: "用户",
                        userName: "用户名称",
                        location: "地址",
                        address: "地址",
                        activity: "活跃度",
                        meterNumber: "表号",
                        brand: "品牌",
                        version: "版本号",
                        yesterdayProfit: "昨日盈利 ($)",
                        todayProfit: "今日盈利 ($)",
                        totalProfit: "累计盈利 ($)",
                        cumulativeProfit: "累计盈利 ($)",
                        avgProfit: "日均盈利 ($)",
                        deviceCode: "设备编码",
                        deviceStatus: "设备状态",
                        operationMode: "运行模式",
                        flowDirection: "流向/来源",
                        soc: "SOC",
                        todayDischarge: "今日放电 (kWh)",
                        usageDays: "使用天数 (天)",
                        activityStatus: "活跃度",
                        action: "操作",
                        actions: "操作"
                    },
                    activityStatus: {
                        active: "活跃",
                        inactive: "非活跃"
                    },
                    deviceStates: {
                        charging: "充电中",
                        discharging: "放电中",
                        standby: "待机",
                        offline: "离线",
                        lightOn: "有亮灯",
                        lightOff: "没有亮灯",
                        missingBattery: "缺少电池"
                    },
                    operationMode: {
                        0: "自用模式",
                        1: "并网优先模式", 
                        2: "预留模式",
                        3: "备用模式"
                    },
                    filters: {
                        socRange: "SOC范围",
                        profitRange: "今日获利范围",
                        usageDaysRange: "使用天数范围",
                        days: "天"
                    },
                    stats: {
                        activeRate: "活跃率",
                        avgDischarge: "平均放电量 (kWh)",
                        monthlyNew: "本月新增",
                        comparedLastMonth: "较上月",
                        comparedYesterday: "较昨日",
                        thisWeek: "本周"
                    },
                    charts: {
                        activityTrend: "活跃度趋势",
                        energyHeatmap: "能源使用热力图",
                        revenueAnalysis: "收益分析",
                        powerUsage: "用电量",
                        dischargeAmount: "放电量",
                        temperature: "温度",
                        revenueTrend: "获利趋势",
                        socTrend: "soc趋势",
                        operatingDays: "运行天数",
                        chargeCycles: "充放电次数",
                        operatingData: "运行数据",
                        dailyRevenue: "日收益",
                        cumulativeRevenue: "累计收益"
                    },
                    metrics: {
                        soc: "SOC",
                        todayDischarge: "今日放电",
                        todayProfit: "今日获利"
                    },
                    details: {
                        device: "设备"
                    },
                    drawer: {
                        title: "详情",
                        tabs: {
                            basicInfo: "基本信息",
                            revenueInfo: "获利信息",
                            operatingData: "运行数据",
                            dispatchRecords: "调度记录"
                        },
                        basicInfo: "基本信息",
                        userName: "用户名称",
                        location: "地址",
                        address: "地址",
                        meterNumber: "电表",
                        deviceCode: "设备编码",
                        batteryCapacity: "电池容量",
                        soc: "SOC",
                        status: "状态",
                        operatingDays: "运行天数",
                        owner: "所属用户",
                        todayProfit: "今日获利",
                        avgProfit: "日均获利",
                        totalRevenue: "累计获利",
                        todayDischarge: "今日放电量",
                        avgDischarge: "日均放电量",
                        totalDischarge: "累计放电量",
                        revenue: "收益",
                        discharge: "放电",
                        profitTrend: "获利趋势",
                        operatingDataTitle: "运行数据",
                        socTrend: "soc趋势",
                        chargeCycles: "充放电次数",
                        day: "日",
                        month: "月",
                        year: "年",
                        stopCharging: "停止充电",
                        charging: "充电",
                        discharging: "放电",
                        stopDischarging: "停止放电",
                        actions: {
                            cancel: "取消",
                            save: "保存",
                            delete: "删除",
                            confirm: "确定"
                        },
                        messages: {
                            saveSuccess: "保存成功",
                            deleteConfirm: "确定要删除这条记录吗？",
                            deleteSuccess: "删除成功"
                        },
                        dispatchRecords: {
                            time: "时间",
                            type: "类型",
                            status: "状态",
                            startTime: "开始时间",
                            endTime: "结束时间",
                            charge: "充电",
                            discharge: "放电",
                            dischargeCount: "放电调度成功次数",
                            dischargeAmount: "放电量",
                            profit: "获利",
                            chargeCount: "充电调度成功次数",
                            chargeAmount: "充电量",
                            failedCount: "调度失败次数",
                            success: "成功",
                            failed: "失败",
                            executing: "执行中",
                            successCount: "成功次数",
                            failedCountLabel: "失败次数",
                            executingCount: "执行中次数",
                            timesCharge: "次充电",
                            timesDischarge: "次放电"
                        }
                    },
                    userName1: "张明",
                    userName2: "李华",
                    userName3: "王芳",
                    userName4: "赵强",
                    userName5: "陈晓",
                    modal: {
                        details: "详情",
                        basicInfo: "基本信息",
                        revenueInfo: "获利信息",
                        operatingData: "运行数据",
                        deviceCode: "设备编码",
                        batteryCapacity: "电池容量",
                        operatingDays: "运行天数",
                        owner: "所属用户",
                        todayProfit: "今日获利",
                        avgDailyProfit: "日均获利",
                        todayDischarge: "今日放电量",
                        avgDailyDischarge: "日均放电量",
                        cumulativeDischarge: "累计放电量"
                    },
                    timeFilters: {
                        day: "日",
                        month: "月",
                        year: "年"
                    },
                    pagination: {
                        total: "共 {total} 条",
                        perPage10: "10条/页",
                        perPage20: "20条/页",
                        perPage50: "50条/页",
                        perPage100: "100条/页"
                    },
                    discharge: {
                        yesterday: "昨日",
                        today: "今日",
                        title: "放电数据",
                        time: "时间",
                        discharge: "放电量",
                        price: "价格",
                        profit: "收益",
                        totalDischarge: "总放电量",
                        avgPrice: "平均价格",
                        totalProfit: "总收益"
                    }
                },
                
                // Profit page translations
                profit: {
                    title: "获利",
                    pageTitle: "获利",
                    subtitle: "实时监控和分析您的能源交易收益",
                    views: {
                        chart: "图表视图",
                        table: "表格视图"
                    },
                    stats: {
                        userCount: "用户数量",
                        totalRevenue: "累计获利",
                        avgProfit: "人均获利",
                        maxStationProfit: "最大获利（家庭）",
                        minStationProfit: "最小获利（家庭）",
                        comparedYesterday: "比昨日",
                        comparedLastMonth: "比上月",
                        comparedLastYear: "比去年"
                    },
                    charts: {
                        userManagement: "用户管理",
                        revenueDistribution: "收益分布",
                        dischargeAndProfit: "电量与获利",
                        profitFormula: "（获利=馈网量*价格）",
                        profitRanking: "获利排名"
                    },
                    ranking: {
                        top5: "前五",
                        bottom5: "后五"
                    },
                    table: {
                        userParticipation: "用户参与情况",
                        date: "日期",
                        user: "用户",
                        status: "性质",
                        dischargeAmount: "实际放电量 (kwh)",
                        sellPrice: "卖电价 ($/kWh)",
                        costPrice: "成本价 ($/kWh)",
                        profit: "获利 ($)",
                        profitPerKwh: "每kWh获利 ($)",
                        dailyAvg: "日均",
                        monthlyAvg: "月均",
                        yearlyAvg: "年均",
                        historicalAvg: "历史均值",
                        compareDaily: "对比日均 ($)",
                        compareMonthly: "对比月均 ($)",
                        compareYearly: "对比年均 ($)",
                        compareHistorical: "对比历史均值 ($)"
                    },
                    filters: {
                        all: "全部",
                        active: "活跃",
                        inactive: "非活跃",
                        notParticipating: "未参与"
                    },
                    status: {
                        active: "活跃",
                        inactive: "非活跃",
                        notParticipating: "未参与"
                    },
                    buttons: {
                        exportData: "导出数据"
                    }
                },
                

                organization: {
                    title: "组织",
                    subtitle: "管理组织成员和权限设置",
                    placeholder: {
                        userName: "请输入用户名称...",
                        userEmail: "请输入用户邮箱..."
                    },
                    buttons: {
                        search: "🔍 查询",
                        reset: "🔄 重置",
                        export: "📥 导出",
                        refresh: "🔄 刷新",
                        add: "新建"
                    },
                    table: {
                        userName: "用户名称",
                        userEmail: "用户邮箱",
                        status: "状态",
                        remarks: "备注",
                        createdTime: "创建时间",
                        action: "操作"
                    },
                    status: {
                        active: "启用",
                        inactive: "禁用",
                        allStatus: "所有状态"
                    },
                    actions: {
                        edit: "编辑",
                        delete: "删除"
                    },
                    modal: {
                        addMember: "添加成员",
                        editMember: "编辑成员",
                        addOrganization: "新建组织",
                        userName: "用户名称",
                        email: "邮箱", 
                        password: "密码",
                        status: "状态",
                        remark: "备注",
                        permissions: "权限",
                        expandCollapse: "展开/折叠",
                        selectAll: "全选/全不选",
                        cancel: "取消",
                        confirm: "确定",
                        placeholders: {
                            userName: "请输入用户名称",
                            email: "请输入用户邮箱",
                            password: "请输入密码",
                            remark: "请输入备注"
                        },
                        permissionModules: {
                            home: "首页",
                            user: "用户",
                            station: "电站"
                        }
                    },
                    deleteConfirm: {
                        title: "确认删除",
                        message: "此操作不可撤销，请确认是否删除该用户",
                        warning: "删除后该用户将无法访问系统，所有相关数据将被永久移除",
                        cancel: "取消",
                        confirm: "确认删除"
                    },
                    messages: {
                        validationFailed: "验证失败",
                        fillRequired: "请填写所有必填字段"
                    },
                    pagination: {
                        total: "共 {total} 条",
                        perPage10: "10条/页",
                        perPage20: "20条/页",
                        perPage50: "50条/页",
                        perPage100: "100条/页",
                        goTo: "前往"
                    }
                },
                
                // Push Strategy page translations
                pushStrategy: {
                    title: "推送策略",
                    buttons: {
                        add: "新建",
                        edit: "编辑",
                        delete: "删除",
                        save: "保存",
                        cancel: "取消",
                        confirm: "确定",
                        refresh: "刷新",
                        export: "导出",
                        back: "返回"
                    },
                    formTitle: {
                        add: "新建推送策略",
                        edit: "编辑推送策略"
                    },
                    regionPriceSettings: "地区价格设置",
                    dischargePriceStrategy: "放电通知策略价格",
                    chargePriceStrategy: "充电通知策略价格",
                    descriptions: {
                        regionPriceDescription: "为每个地区设置充电和放电通知策略价格",
                        dischargeDescription: "价格超过设定值，则进行提醒",
                        chargeDescription: "价格低于设定值，则进行提醒"
                    },
                    reminderFrequency: "提醒频率",
                    reminderDescription: "满足条件，无人响应，多久发送一次提醒",
                    sendingMethod: "发送方式",
                    selectUsers: "选择用户",
                    methods: {
                        inSiteMessage: "站内信",
                        email: "邮件",
                        sms: "短信"
                    },
                    placeholder: {
                        price: "价格",
                        enterPrice: "输入价格"
                    },
                    table: {
                        region: "地区",
                        dischargePrice: "放电价格",
                        chargePrice: "充电价格",
                        actions: "操作",
                        status: "状态",
                        userName: "用户名称",
                        userEmail: "用户邮箱"
                    },
                    status: {
                        configured: "已配置",
                        notConfigured: "未配置",
                        enabled: "启用",
                        disabled: "禁用"
                    },
                    tabs: {
                        normal: "普通策略",
                        advanced: "高级策略"
                    },
                    settings: "设置",
                    charge: "充电",
                    discharge: "放电",
                    points: {
                        lowest: "最低点",
                        low: "低点",
                        optimal: "最佳点",
                        high: "高点"
                    },
                    priceDescriptions: {
                        valleyPlus10: "价格：超过谷值10%之内",
                        valleyPlus20: "价格：超过谷值20%之内",
                        peakAbove95: "价格：峰值95%以上",
                        peak90to95: "价格：峰值90-95%"
                    },
                    reminderSettings: {
                        advanceReminder: "提前多久提醒",
                        frequency: "提醒频率：满足条件，无人响应，多久发送一次提醒"
                    },
                    pushNotification: {
                        normal: {
                            title: "充电提醒",
                            content: "NSW地区充电价格$300，超过阈值$250，请充电",
                            currentPrice: "当前价格",
                            belowThreshold: "，低于阈值",
                            forceRefreshing: "正在强制刷新页面...",
                aboveThreshold: "，超过阈值",
                            pleaseCharge: "，请充电",
                            pleaseDischarge: "，请放电"
                        },
                        advanced: {
                            title: "最佳充电提醒",
                            content: "NSW地区充电价格预测将在15分钟后到达最低点$180，建议立即准备充电",
                            regionPrice: "地区充电价格",
                            timeRemaining: "，还有",
                            minutesToBest: "分钟到达最佳放电时机，请做好准备"
                        }
                    },
                    chargeReminder: "充电提醒",
                    dischargeReminder: "放电提醒",
                    optimalReminder: "最佳充电提醒",
                    optimalChargeReminder: "最佳充电提醒",
                    optimalDischargeReminder: "最佳放电提醒",
                    highPriceChargeReminder: "高价充电提醒",
                    priceAlert: "提醒",
                    currentPrice: "当前价格",
                    
                    // 新增推送通知翻译
                    chargeReminderTitle: "充电提醒——NSW",
                    dischargeReminderTitle: "放电提醒——NSW",
                    optimalChargeTitle: "最佳充电时机提醒——NSW",
                    lowPriceChargeTitle: "低价充电提醒——NSW",
                    belowThreshold: "，低于阈值",
                    forceRefreshing: "Force refreshing page...",
                aboveThreshold: "，高于阈值",
                    pleaseCharge: "，请充电",
                    pleaseDischarge: "，请放电",
                    regionChargePrice: "地区充电价格",
                    timeRemaining: "，还有",
                    minutesToOptimal: "分钟到达最佳放电时机，请做好准备",
                    minutesToLowPrice: "分钟到达低价充电时机，请做好准备",
                    
                    // 充电提醒弹窗翻译
                    chargeNotificationTitle: "充电提醒——NSW",
                    currentElectricityPrice: "当前电价",
                    belowThresholdText: "，低于阈值",
                    pleaseChargeText: "，请充电",
                    simulateCharge: "充电提醒",
                    simulateDischarge: "放电提醒",
                    simulateOptimal: "最佳放电时机提醒",
                    simulateLowPrice: "低价充电提醒",
                    pushNotificationTest: "推送通知测试",
                    regionPrice: "地区充电价格",
                    timeRemaining: "，还有",
                    minutesToOptimal: "分钟到达最佳放电时机，请做好准备",
                    minutesToPrice: "分钟到达",
                    timeOpportunity: "时机，请做好准备",
                    simulateCharge: "模拟充电提醒",
                    simulateDischarge: "模拟放电提醒",
                    simulateOptimal: "模拟最佳提醒",
                    simulatePriceAlert: "模拟价格提醒",
                    automationConditionsSettings: "自动化条件设置",
                    selectChargeTime: "选择充电时间",
                    selectDischargeTime: "选择放电时间",
                    chargeTimeSlot: "充电时间段",
                    dischargeTimeSlot: "放电时间段",
                    dragToAddTimeSlot: "在时间轴上拖拽即可添加时间段",
                    modal: {
                        chargeReminderTitle: "充电提醒设置",
                        dischargePeakPrediction: "放电最佳点预测",
                        todayPeak: "今日峰值",
                        todaySellHigh: "今日卖点高点",
                        todayPeakPercentage: "今日峰值百分比",
                        bestSellSettings: "最佳卖点设置",
                        bestSellAdvanceTime: "最佳卖点提前时间",
                        reminderFrequency: "提醒频率",
                        userGroup: "用户分组",
                        activityLevel: "活跃度",
                        region: "地区",
                        allRegions: "全部地区",
                        admin: "管理员",
                        operator: "操作员",
                        viewer: "观察者",
                        vipUser: "VIP用户",
                        all: "全部",
                        highActivity: "高活跃",
                        mediumActivity: "中活跃",
                        lowActivity: "低活跃"
                    },
                    messages: {
                        saveSuccess: "保存成功",
                        strategyUpdated: "推送策略已成功更新",
                        cancelled: "已取消",
                        editCancelled: "编辑已取消",
                        formReset: "表单已重置为原始状态",
                        validationFailed: "验证失败",
                        missingRegionPrices: "请为以下地区设置价格: ",
                        enterDischargePrice: "请输入放电通知策略价格",
                        enterChargePrice: "请输入充电通知策略价格",
                        invalidDischargePrice: "放电价格必须是有效的正数",
                        invalidChargePrice: "充电价格必须是有效的正数",
                        invalidFrequency: "提醒频率必须在1-60分钟之间",
                        selectUser: "请选择至少一个用户",
                        exporting: "导出中",
                        exportingData: "正在导出推送策略数据...",
                        exportSuccess: "导出成功",
                        dataExported: "推送策略数据已导出",
                        refreshSuccess: "刷新成功",
                        dataRefreshed: "推送策略数据已更新",
                        allConfigured: "所有地区已配置",
                        editExisting: "请编辑现有配置",
                        confirmDelete: "确定要删除该地区的推送策略吗？",
                        deleteSuccess: "删除成功",
                        strategyDeleted: "推送策略已删除"
                    }
                },
                
                // Settings translations
                settings: {
                    title: "设置",
                    buttons: {
                        edit: "编辑",
                        exitEdit: "退出编辑",
                        save: "保存",
                        cancel: "取消"
                    },
                    pricePredict: {
                        title: "价格预测",
                        accurate: "准确预测",
                        accurateDesc: "价格偏差上下",
                        moderate: "较准预测",
                        moderateDesc: "价格偏差（自动计算）",
                        large: "偏差较大",
                        largeDesc: "价格偏差大于",
                        deviationRange: "±偏差范围",
                        greaterThan: "大于此值"
                    },
                    operationAnalysis: {
                        title: "操作分析",
                        sellTitle: "卖电分析",
                        sellOptimal: "卖在最佳点",
                        sellOptimalDesc: "峰值95%以上区间",
                        sellHigh: "卖在高点",
                        sellHighDesc: "峰值区间",
                        sellNormal: "卖在一般",
                        sellNormalDesc: "峰值区间",
                        sellLow: "低价",
                        sellLowDesc: "峰值以下",
                        buyTitle: "充电分析",
                        buyOptimal: "充电最佳点",
                        buyOptimalDesc: "超过谷值95%以内",
                        buyLow: "充电低价",
                        buyLowDesc: "超过谷值区间",
                        buyNormal: "充电一般",
                        buyNormalDesc: "超过谷值区间",
                        buyHigh: "充电高价",
                        buyHighDesc: "超过谷值以上",
                        belowPeak: "峰值以下",
                        peakRange: "峰值区间",
                        abovePeak: "峰值以上",
                        valley: "谷值",
                        aboveValley: "超过谷值",
                        normal: "一般",
                        highPoint: "高点",
                        optimalPoint: "最佳点",
                        lowPrice: "低价",
                        buyLowestPoint: "充电最低点"
                    },
                    validation: {
                        moderateRangeError: "较准预测范围设置错误",
                        sellHighRangeError: "卖在高点范围设置错误",
                        sellNormalRangeError: "卖在一般范围设置错误",
                        buyLowRangeError: "充电低价范围设置错误",
                        buyNormalRangeError: "充电一般范围设置错误",
                        pricePredictError: "准确预测阈值必须小于偏差较大阈值"
                    },
                    messages: {
                        saveSuccess: "设置保存成功"
                    },
                    profile: {
                        title: "个人信息",
                        basic: "基本信息",
                        avatar: "头像",
                        changeAvatar: "更换头像",
                        removeAvatar: "移除",
                        avatarHint: "支持 JPG、PNG 格式，大小不超过 2MB",
                        username: "昵称"
                    },
                    email: {
                        title: "邮箱设置",
                        currentEmail: "当前邮箱",
                        newEmail: "新邮箱地址",
                        bindEmail: "绑定邮箱",
                        emailAddress: "邮箱地址",
                        emailPlaceholder: "请输入邮箱地址",
                        emailCode: "邮箱验证码",
                        emailCodePlaceholder: "请输入验证码",
                        sendCode: "发送验证码",
                        codeWillBeSent: "验证码将发送到您的邮箱地址",
                        selectVerificationMethod: "选择验证方式",
                        useCurrentPassword: "使用原密码",
                        emailVerification: "邮箱验证",
                        verifyCurrentEmail: "验证当前邮箱",
                        verifyNewEmail: "验证新邮箱",
                        verifyCurrentEmailHint: "请先验证当前邮箱，验证通过后才能设置新邮箱",
                        newEmailCodeHint: "验证码将发送到您的新邮箱地址",
                        verificationCode: "验证码",
                        profileSaved: "个人信息已保存",
                        codeSent: "验证码已发送到您的邮箱",
                        currentEmailCodeSent: "验证码已发送到您的当前邮箱",
                        newEmailCodeSent: "验证码已发送到您的新邮箱",
                        codeError: "验证码错误",
                        currentEmailVerified: "当前邮箱验证成功",
                        enterCode: "请输入验证码"
                    },
                    password: {
                        title: "密码设置",
                        changePassword: "更改密码",
                        oldPassword: "当前密码",
                        newPassword: "新密码",
                        confirmPassword: "确认新密码",
                        updatePassword: "更新密码"
                    }
                },
                
                // Pagination translations
                pagination: {
                    info: "共 {total} 条",
                    itemsPerPage: "/页",
                    showing: "显示第",
                    to: "至",
                    of: "条，共",
                    total: "条",
                    perPage: {
                        "10": "10/页",
                        "20": "20/页", 
                        "50": "50/页",
                        "100": "100/页"
                    },
                    goTo: "前往",
                    page: "页"
                },
                
                // Merged Family page translations
                family: {
                    title: "家庭",
                    subtitle: "管理和监控所有家庭的能源使用情况",
                    views: {
                        grid: "🏠 网格视图"
                    },
                    placeholder: {
                        userName: "请输入用户名称...",
                        allActivity: "所有活跃度",
                        deviceCode: "请输入设备编码...",
                        deviceStatus: "所有设备状态",
                        allBrands: "所有品牌",
                        allRegions: "所有地区",
                        meterNumber: "请输入电表编号..."
                    },
                    activityStatus: {
                        active: "活跃",
                        inactive: "非活跃"
                    },
                    deviceStates: {
                        charging: "充电中",
                        discharging: "放电中",
                        standby: "待机",
                        offline: "离线",
                        lightOn: "有亮灯",
                        lightOff: "没有亮灯",
                        missingBattery: "缺少电池"
                    },
                    operationMode: {
                        0: "自用模式",
                        1: "并网优先模式", 
                        2: "预留模式",
                        3: "备用模式"
                    },
                    buttons: {
                        search: "查询",
                        reset: "重置",
                        export: "导出家庭数据",
                        exportDetail: "导出运行数据",
                        refresh: "刷新",
                        viewDetails: "查看详情",
                        runningData: "运行数据"
                    },
                    export: {
                        noSelection: "请至少选择一条数据进行导出"
                    },
                    exportDetail: {
                        title: "导出运行数据",
                        startDate: "开始日期",
                        endDate: "结束日期",
                        selectDate: "选择日期",
                        rangeHint: "日期范围最大不超过31天",
                        endBeforeStart: "结束日期不能早于开始日期",
                        rangeExceeded: "日期范围超过31天",
                        hint: "只能选择单个日期的数据进行导出",
                        granularity: "数据颗粒度",
                        granularity5min: "5分钟",
                        granularity15min: "15分钟",
                        granularity30min: "30分钟",
                        granularity1hour: "1小时",
                        discharge: "放电量(kWh)",
                        price: "电价(¥/MWh)",
                        profit: "盈利(¥)",
                        confirmExport: "确认导出",
                        selectDateError: "请选择日期范围",
                        exportSuccess: "运行数据导出成功",
                        noSelection: "请至少选择一条数据进行导出"
                    },
                    exportScope: {
                        label: "用户：",
                        all: "全部",
                        page: "第",
                        pageUsers: "页用户",
                        selected: "已选",
                        items: "个"
                    },
                    table: {
                        user: "用户",
                        meterNumber: "表号",
                        address: "地址",
                        activity: "活跃度",
                        yesterdayProfit: "昨日获利 ($)",
                        todayProfit: "今日获利 ($)",
                        totalProfit: "累计获利 ($)",
                        avgProfit: "日均获利 ($)",
                        deviceCode: "设备编码",
                        deviceStatus: "设备状态",
                        operationMode: "运行模式",
                        flowDirection: "流向/来源",
                        soc: "SOC",
                        socValue: "电池价值",
                        batteryCost: "每kWh成本",
                        location: "地址",
                        usageDays: "使用天数 (天)",
                        action: "操作"
                    },
                    drawer: {
                        title: "详情",
                        tabs: {
                            basicInfo: "基本信息",
                            revenueInfo: "获利信息",
                            operatingData: "运行数据",
                            dispatchRecords: "调度记录"
                        },
                        basicInfo: "基本信息",
                        userName: "用户名称",
                        location: "地址",
                        address: "地址",
                        meterNumber: "电表",
                        deviceCode: "设备编码",
                        manufacturer: "厂商",
                        version: "版本号",
                        batteryCapacity: "电池容量",
                        soc: "SOC",
                        status: "状态",
                        operatingDays: "运行天数",
                        owner: "所属用户",
                        day: "天",
                        realtimePower: "实时功率",
                        todayProfit: "今日获利",
                        avgProfit: "日均获利",
                        totalRevenue: "累计获利",
                        todayCharge: "今日用电量",
                        todayDischarge: "今日馈网量",
                        totalCharge: "累计用电量",
                        totalDischarge: "累计馈网量",
                        pvPower: "PV发电功率",
                        outputPower: "输出功率", 
                        todayPvDirectLoad: "今日PV直供负载量",
                        totalLoadConsumption: "所有负载消耗量",
                        userInfo: "用户",
                        gridInfo: "电网",
                        todayGridPurchase: "今日用电量",
                        todayGridFeedIn: "今日馈网量",
                        inverterInfo: "逆变器",
                        inverterManufacturer: "厂商",
                        inverterDeviceCode: "设备编码",
                        inverterVersion: "版本号",
                        inverterCapacity: "逆变器容量",
                        batteryInfo: "电池",
                        todayCharge: "今日充电量",
                        todayDischarge: "今日放电量",
                        loadInfo: "负载",
                        pvInfo: "光伏",
                        todayPvGeneration: "今日发电量",
                        pvGenerationPower: "发电功率",
                        forReferenceOnly: "（仅供参考）",
                        batteryMissing: "缺少电池",
                        authExpired: "授权失效",
                        revenue: "收益",
                        discharge: "放电",
                        profitTrend: "获利趋势",
                        month: "月",
                        year: "年",
                        socTrend: "soc趋势",
                        chargeCycles: "充放电次数",
                        operatingDataTitle: "运行数据",
                        operations: "操作记录",
                        charging: "开始充电",
                        stopCharging: "停止充电",
                        discharging: "开始放电",
                        stopDischarging: "停止放电",
                        actions: {
                            cancel: "取消",
                            save: "保存",
                            delete: "删除",
                            confirm: "确定"
                        },
                        messages: {
                            saveSuccess: "保存成功",
                            deleteConfirm: "确定要删除这条记录吗？",
                            deleteSuccess: "删除成功"
                        },
                        dispatchRecords: {
                            time: "时间",
                            type: "类型",
                            status: "状态",
                            startTime: "开始时间",
                            endTime: "结束时间",
                            charge: "充电",
                            discharge: "放电",
                            dischargeCount: "放电调度成功次数",
                            dischargeAmount: "放电量",
                            profit: "获利",
                            chargeCount: "充电调度成功次数",
                            chargeAmount: "充电量",
                            failedCount: "调度失败次数",
                            success: "成功",
                            failed: "失败",
                            executing: "执行中",
                            successCount: "成功次数",
                            failedCountLabel: "失败次数",
                            executingCount: "执行中次数",
                            timesCharge: "次充电",
                            timesDischarge: "次放电"
                        }
                    },
                    userName1: "张明",
                    userName2: "李华",
                    userName3: "王芳",
                    userName4: "赵强",
                    userName5: "陈晓",
                    userName6: "刘静",
                    userName7: "周涛",
                    userName8: "吴敏",
                    userName9: "郑伟",
                    userName10: "林丽"
                },
                
                // Running Data page translations (Chinese)
                runningData: {
                    title: "运行数据",
                    tableTitle: "运行数据记录",
                    startDate: "开始日期",
                    endDate: "结束日期",
                    dateRangeNote: "* 最多可选择3个月范围",
                    query: "查询",
                    reset: "重置",
                    export: "导出",
                    selectDateRange: "请选择日期范围",
                    dateRangeError: "日期范围不能超过3个月",
                    exportSuccess: "导出成功",
                    exportDetailSuccess: "明细导出成功",
                    table: {
                        meterNumber: "电表",
                        time: "时间",
                        interval: "Interval",
                        gridUsage: "电网用电量 (kWh)",
                        feedIn: "馈网量 (kWh)",
                        price: "价格 ($/kWh)",
                        soc: "SOC (%)"
                    },
                    granularity: "数据颗粒度",
                    granularity5min: "5分钟",
                    granularity15min: "15分钟",
                    granularity30min: "30分钟",
                    granularity1hour: "1小时",
                    exportModal: {
                        title: "导出运行数据",
                        startDate: "开始日期",
                        endDate: "结束日期",
                        warning: "* 最多可导出3个月的数据，每5分钟一条记录"
                    },
                    cancel: "取消",
                    confirmExport: "确认导出"
                },
                
                // Task Detail Page
                taskDetail: {
                    tabs: {
                        overview: "概览",
                        details: "明细"
                    },
                    summary: {
                        timeRange: "开始时间 —— 结束时间",
                        region: "地区",
                        dischargeType: "放电类型",
                        taskCount: "下发任务数",
                        participants: "参与人数",
                        participationRate: "参与率",
                        totalDischarge: "总放电量",
                        netProfit: "总净利润",
                        profitPerKwh: "每度电净利润"
                    },
                    chart: {
                        trendTitle: "价格与放电量趋势变化"
                    },
                    filter: {
                        username: "用户名:",
                        usernamePlaceholder: "搜索用户名",
                        status: "状态:",
                        all: "全部",
                        completed: "已完成",
                        discharging: "放电中",
                        notParticipated: "未参与"
                    },
                    table: {
                        no: "序号",
                        username: "用户名",
                        discharge: "放电量 (kWh)",
                        profit: "获利 ($)",
                        profitPerKwh: "每度电获利 ($/kWh)",
                        status: "状态"
                    },
                    button: {
                        export: "导出"
                    }
                },
                aboveThreshold: "，高于阈值",
                account: "账号",
                add: "添加",
                addTimeSlot: "添加时间段",
                aemoTabAnalysis: "分析",
                aemoTabMarket: "行情",
                aiAnalyzing: "AI 分析中",
                aiEstProfit: "预估利润",
                automationConditionsSettings: "自动化条件设置",
                backToLogin: "返回登录",
                batteryCondition: "电量条件",
                batteryCost: "电池成本",
                captcha: "验证码",
                chargeCompleteMessage: "充电命令执行完成",
                chargeReminder: "充电提醒",
                chargeStrategyTip: "为不同时间段设置不同的价格门槛",
                chargeTimeSlot: "充电时间段",
                companyInfo: "系统版权所有者：旭衡电子（深圳）有限公司",
                confirmLogout: "确认退出",
                confirmLogoutMessage: "确定要退出登录吗？",
                confirmPassword: "确认密码",
                contactPhone: "网站备案信息：粤ICP备2021169764号",
                createAccount: "注册账号",
                currentSOC: "当前SOC",
                dischargeCompleteMessage: "放电命令执行完成",
                dischargeReminder: "放电提醒",
                dischargeStrategyTip: "为不同时间段设置不同的价格门槛",
                dischargeTimeSlot: "放电时间段",
                dragToAddTimeSlot: "拖动添加时间段",
                email: "邮箱",
                executionTimeline: "执行时间线",
                export: "导出",
                failureReason: "失败原因",
                forgotPassword: "忘记密码?",
                logout: "退出",
                logoutLink: "退出登录",
                minutesToOptimal: "分钟到达最佳放电时机",
                minutesToPrice: "分钟到达",
                notUsed: "未使用",
                operatorBtn: "进入运维面板",
                operatorDesc: "智能调度归属电站，查看电量收益报表，记录历史调度操作，高效运维管理。",
                operatorF1: "AI 智能调度",
                operatorF2: "查看归属站点运行数据",
                operatorF3: "电量收益报表",
                operatorF4: "历史调度记录",
                operatorSubtitle: "O&M Provider",
                operatorTitle: "运维方",
                optimalReminder: "最佳充电提醒",
                ownerBtn: "进入业主面板",
                ownerDesc: "创建并管理电站，处理设备故障，分配运维方账号，全面掌控电站资产。",
                ownerF1: "创建电站与查看运行数据",
                ownerF2: "故障查看与处理",
                ownerF3: "创建运维方并分配电站",
                ownerSubtitle: "Property Owner",
                ownerTitle: "业主",
                pageSubtitle: "选择角色进入系统",
                pageTitle: "选择您的角色",
                password: "密码",
                pleaseCharge: "，请充电",
                pleaseDischarge: "，请放电",
                priceAlert: "提醒",
                recordNumber: "联系方式：xuheng@alwayscontrol.com.cn",
                regionPrice: "地区充电价格",
                selectChargeTime: "选择充电时间",
                selectDischargeTime: "选择放电时间",
                sendResetLink: "发送重置链接",
                signIn: "登录",
                stationDetails: "电站详情",
                stopChargeDischarge: "停止充放电",
                stopCompleteMessage: "停止命令执行完成",
                submitLogin: "提交",
                submitRegister: "提交注册",
                timeOpportunity: "时机，请做好准备",
                timeRemaining: "，还有",
                todayCharge: "今日充电",
                todayDischarge: "今日放电",
                totalChargeCost: "充电成本",
                totalChargeCount: "累计充电",
                totalDischargeCount: "累计放电",
                totalDischargeRevenue: "放电收益",
                userRegister: "用户注册",
                username: "用户名/邮箱",
                vppSubtitle: "分布式能源的未来",
                vppTitle: "虚拟电厂",
                faultAlarm: {
                    buttons: {
                        batchProcess: "一键处理",
                        clear: "重置",
                        detail: "详情",
                    power: "功率",
                    todayProfit: "今日净利润",
                    totalProfit: "累计净利润",
                        export: "导出",
                        markProcessed: "标为已处理",
                        markUnprocessed: "标为未处理",
                        resolve: "处理",
                        search: "搜索",
                        selectAll: "全选",
                    },
                    detail: {
                        title: "告警详情",
                    },
                    filter: {
                        allLevels: "全部告警等级",
                        allStations: "全部站点",
                    },
                    levels: {
                        alarm: "告警",
                        fault: "故障",
                    },
                    noData: "暂无数据",
                    table: {
                        actions: "操作",
                        alarmDevice: "告警设备",
                        alarmLevel: "告警等级",
                        alarmStation: "告警站点",
                        alarmStatus: "告警状态",
                        alarmTime: "告警时间",
                        description: "告警描述",
                        recoveryTime: "解决时间",
                    },
                    tabs: {
                        processed: "已处理",
                        unprocessed: "未处理",
                    },
                    title: "故障告警",
                },
                messageCenter: {
                    buttons: {
                        refresh: "刷新",
                    },
                },
                pushNotification: {
                    advanced: {
                        content: "NSW地区充电价格$300，还有15分钟到达最佳放电时机",
                        title: "最佳充电提醒——高级",
                    },
                    normal: {
                        content: "NSW地区充电价格$300，超过阈值$250，请充电",
                        title: "充电提醒——普通",
                    },
                },
                report: {
                    buttons: {
                        exportData: "导出数据",
                        refresh: "刷新",
                    },
                    compare: {
                        day: "比昨日",
                    },
                    pageTitle: "报表",
                    period: {
                        day: "日",
                        month: "月",
                        total: "累计",
                        year: "年",
                    },
                    stats: {
                        avgBuyPrice: "充电均价",
                        avgSellPrice: "放电均价",
                        charge: "充电量",
                        discharge: "放电量",
                        netProfit: "净利润",
                    },
                    table: {
                        avgBuyPrice: "充电均价 ($/MWh)",
                        avgSellPrice: "放电均价 ($/MWh)",
                        charge: "充电量 (MWh)",
                        chargeCost: "充电成本 ($)",
                        discharge: "放电量 (MWh)",
                        dischargeRevenue: "放电收益 ($)",
                        netProfit: "净利润 ($)",
                        period: "时段",
                    },
                    title: "报表 - AlwaysControl",
                    views: {
                        chart: "图表视图",
                        table: "表格视图",
                    },
                },
                settings: {
                    cancel: "取消",
                    password: {
                        confirmPasswordPlaceholder: "再次输入新密码",
                        currentPasswordPlaceholder: "输入当前密码",
                        newPasswordPlaceholder: "输入新密码",
                    },
                    save: "保存更改",
                },
                station: {
                    actions: "操作",
                    addStation: "新建",
                    add_addAddress: "添加地址",
                    add_cancel: "取消",
                    add_changeAddress: "更改",
                    add_deviceHint: "可以跳过此步骤，稍后在电站详情页添加设备",
                    add_deviceSN: "设备SN",
                    add_name: "电站名称",
                    add_nextStep: "下一步",
                    add_prevStep: "上一步",
                    add_stationAddress: "站点地址",
                    add_submit: "保存",
                    add_timezone: "时区",
                    add_title: "新增电站",
                    allRegions: "全部地区",
                    allStatus: "全部状态",
                    capacity: "装机容量(MW)",
                    cardView: "卡片",
                    delete: "删除",
                    detail: "详情",
                    detail_backToList: "返回列表",
                    detail_basicInfo: "基本信息",
                    detail_brandModel: "品牌型号",
                    detail_breadcrumb: "电站管理",
                    detail_capacity: "装机容量",
                    detail_commStatus: "通讯状态",
                    detail_controlMode: "控制模式",
                    detail_coordinates: "坐标",
                    detail_fcasStatus: "FCAS状态",
                    detail_nemPrice: "NEM电价",
                    detail_operationLog: "操作日志",
                    detail_realtimePower: "实时功率",
                    detail_region: "地区",
                    detail_remoteControl: "远程控制",
                    detail_revenueTrend: "收益趋势",
                    detail_runMode: "运行模式",
                    detail_runTrend: "运行趋势",
                    detail_stationId: "电站ID",
                    dispatch_action: "调度动作",
                    dispatch_duration: "持续时间",
                    dispatch_operator: "操作人",
                    dispatch_power: "调度功率",
                    dispatch_result: "结果",
                    dispatch_source: "来源",
                    dispatch_time: "调度时间",
                    edit: "编辑",
                    map_cancel: "取消",
                    map_clickToSelect: "点击地图选择位置",
                    map_confirm: "确定",
                    map_selectAddress: "选择站点地址",
                    offline: "离线",
                    onlineCharging: "在线 - 充电",
                    onlineDischarging: "在线 - 放电",
                    onlineIdle: "在线 - 待机",
                    pageTitle: "电站",
                    power: "功率(MW)",
                    profit_chartTitle: "利润图表",
                    profit_daily: "日利润",
                    profit_monthly: "月利润",
                    region: "地区",
                    reset: "重置",
                    search: "查询",
                    soc: "SOC",
                    stationName: "电站名称",
                    status: "状态",
                    step1_title: "基本信息",
                    step2_title: "添加设备",
                    tab_dispatch: "调度",
                    tab_dispatchHistory: "调度历史",
                    tab_equipment: "设备",
                    tab_equipmentList: "设备列表",
                    tab_overview: "概览",
                    tab_profit: "利润",
                    tab_profitOverview: "利润概览",
                    tableView: "表格",
                    todayProfit: "今日净利润",
                    totalProfit: "累计净利润",
                    status_online: "在线",
                    status_offline: "离线",
                    status_charging: "充电中",
                    status_discharging: "放电中",
                    status_idle: "待机",
                    searchPlaceholder: "搜索电站名称...",
                    mode_auto: "智能",
                    mode_manual: "手动",
                    mode_auto_title: "智能托管模式",
                    mode_manual_title: "人工控制模式",
                },
                
                // Operation Log Detail translations
                operationLogDetail: {
                    filter: {
                        all: "全部操作",
                        auto: "智能操作",
                        manual: "人工操作"
                    },
                    dispatchRecord: "调度记录",
                    autoManagement: "智能托管",
                    dataLoaded: "数据加载完成",
                    autoStatus: "智能托管状态",
                    autoOn: "智能托管开启",
                    autoOff: "智能托管关闭",
                    chart: {
                        actualPrice: "实际价格",
                        forecastPrice: "预测价格",
                        autoCharge: "智能充电",
                        autoDischarge: "智能放电",
                        manualCharge: "人工充电",
                        manualDischarge: "人工放电",
                        dispatchType: "调度类型",
                        custodyBaseline: "托管基准"
                    }
                },

                // Dashboard specific translations
                dashboard: {
                    totalChargeLabel: "累计充电",
                    totalDischargeLabel: "累计放电",
                    chargeCost: "充电成本",
                    dischargeRevenue: "放电收益",
                    netProfit: "净获利",
                    aiCustody: "智能托管",
                    hour: "时",
                    minute: "分",
                    second: "秒",
                    currentSOC: "当前SOC",
                    batteryCost: "电池成本",
                    todayProfit: "今日获利",
                    todayCharge: "今日充电",
                    todayDischarge: "今日放电",
                    market: "行情",
                    analysis: "分析",
                    aiAnalyzing: "AI 分析中",
                    aiReanalyzing: "AI 重新分析中...",
                    aiActive: "AI 分析中",
                    aiEstProfit: "预估利润",
                    day: "日",
                    monthShort: "月",
                    year: "年",
                    cumulative: "累计",
                    dataCutoff: "* 统计截止 ",
                    timesUnit: "次",
                    dailyAvg: "日均",
                    dispatchableDevices: "可调度设备",
                    estimatedTime: "预计时间",
                    duration15to30: "15-30分钟",
                    type: "类型",
                    add: "添加",
                    multiPeriodStrategy: "分时段价格策略",
                    aiCustodySettings: "智能托管设置",
                    autoModeType: "自动模式类型",
                    aiCharge: "智能充电",
                    aiDischarge: "智能放电",
                    chargeStrategyTip: "为不同时间段设置不同的价格门槛，系统将同时监测所有时间段",
                    dischargeStrategyTip: "为不同时间段设置不同的价格门槛，系统将同时监测所有时间段",
                    addTimeSlot: "添加时间段",
                    batteryCondition: "电池条件",
                    chargeReminder: "充电提醒",
                    dischargeReminder: "放电提醒",
                    optimalReminder: "最佳充电提醒",
                    regionPrice: "地区充电价格",
                    highPrice: "高价",
                    currentPriceLabel: "当前价格",
                    pleaseCharge: "请充电",
                    pleaseDischarge: "请放电",
                    aboveThreshold: "高于阈值",
                    belowThreshold: "低于阈值",
                    to: "至",
                    estCost: "预计成本",
                    estRevenue: "预计收入",
                    time: "时间",
                    avgPrice: "均价",
                    noChargeWindow: "无充电窗口",
                    noDischargeWindow: "无放电窗口",
                    price: "价格",
                    forecast: "预测",
                    batteryCostLine: "电池成本",
                    costPrefix: "成本 $",
                    analyzing: "分析中...",
                    monitoringMarket: "🤖 监控行情中...",
                    aiAnalyzingEmoji: "🤖 AI 分析中...",
                    expectedExecution: "🤖 预计",
                    executionInProgress: "⚡",
                    executingCharge: "充电中",
                    executingDischarge: "放电中",
                    chargeLabel: "充",
                    dischargeLabel: "放",
                    stopLabel: "停",
                    autoOperation: "自动操作",
                    aiChargeStarted: "智能充电已启动",
                    aiDischargeStarted: "智能放电已启动",
                    settingsSaved: "智能托管设置已保存",
                    chargeAction: "充电",
                    dischargeAction: "放电",
                    chargeConditionLabel: "充电条件",
                    dischargeConditionLabel: "放电条件",
                    noTimeSlots: "未设置时间段",
                    timeSlotCount: "个时间段",
                    newTimeSlotAdded: "✓ 新时间段已添加",
                    timeSlotDeleted: "✓ 时间段已删除",
                    allTimeSlotsCleared: "✓ 所有时间段已清除",
                    dragToAddTimeSlot: "点击空白区域添加时间段",
                    noChargeTimeSlots: "暂无充电时间段",
                    noDischargeTimeSlots: "暂无放电时间段",
                    chargeTime: "充电时间",
                    dischargeTime: "放电时间",
                    addTimeSegment: "+ 添加时间段",
                    edit: "编辑",
                    delete: "删除",
                    addChargeTimeSlot: "添加充电时间段",
                    addDischargeTimeSlot: "添加放电时间段",
                    editChargeTimeSlot: "编辑充电时间段",
                    editDischargeTimeSlot: "编辑放电时间段",
                    startTime: "开始时间",
                    endTime: "结束时间",
                    confirm: "确认",
                    selectStartEndTime: "请选择开始和结束时间",
                    timeSlotOverlap: "时间段重叠，请重新选择时间",
                    confirmDeleteTimeSlot: "确认删除此时间段？",
                    settingsSavedSuccess: "设置已保存成功！",
                    saveSettingsFailed: "保存设置失败：",
                    openSettingsError: "打开设置弹窗时出错：",
                    settingsCancelled: "设置已取消",
                    settingsSavedShort: "设置已保存",
                    selectTimeOnTimeline: "请先在时间轴上选择时间段",
                    savedRegionsCount: "已保存{count}个地区的自动化条件设置",
                    device: "设备",
                    priceUnit: "价格 ($/MWh)",
                    demandUnit: "需求 (MW)",
                    baseOnDataAnalysis: "基于 {time} 的数据分析",
                    exportTime: "导出时间",
                    exportSuccess: "导出成功！",
                    noDataToExport: "没有数据可以导出",
                    unknownError: "未知错误",
                    failureReason: "失败原因",
                    networkTimeout: "网络连接超时",
                    deviceOffline: "设备离线",
                    commandFormatError: "指令格式错误",
                    deviceBusy: "设备忙碌",
                    insufficientPower: "电量不足",
                    protocolError: "通信协议错误",
                    noResponse: "设备未响应",
                    paramValidationFailed: "参数校验失败",
                    crcError: "CRC校验错误",
                    deviceFault: "设备故障",
                    commandIssued: "指令下发",
                    devicesResponded: "设备确认收到指令",
                    executionStarted: "开始执行",
                    devicesStartedExecution: "个设备开始执行操作",
                    partialCompletion: "部分完成",
                    devicesCompleted: "个设备已完成操作",
                    devicesConfirmed: "个设备确认收到指令",
                    systemSentCommand: "系统向所有设备发送操作指令",
                    monthLabels: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
                    daySuffix: "日",
                    reminderTitle: "{action}提醒——{region}",
                    optimalTimingTitle: "最佳{action}时机——{region}",
                    minutesUnit: "分钟",
                    optimalTimeLabel: "最佳{action}时间",
                    priceAboveThreshold: "超过",
                    priceBelowThreshold: "低于",
                    confirmAutoMode: "确认启用智能托管",
                    autoModeDesc: "启用后，AI将实时分析市场数据，自动寻找最优充放电时机，最大化您的收益。",
                    aiPriceAnalysis: "实时价格分析",
                    aiPriceAnalysisDesc: "持续监测AEMO现货价格与需求走势",
                    aiSmartCharge: "智能充电决策",
                    aiSmartChargeDesc: "自动识别低价窗口，以最低成本完成充电",
                    aiSmartDischarge: "最优放电时机",
                    aiSmartDischargeDesc: "精准捕捉高价时段放电，最大化馈网收益",
                    aiBatteryManage: "电池健康管理",
                    aiBatteryManageDesc: "智能管理SOC区间，兼顾收益与电池寿命",
                    aiCustodyHint: "AI将7×24小时持续运行，您可随时手动干预或关闭托管",
                    confirmDisableAutoMode: "确认关闭智能托管",
                    disableAutoModeDesc: "关闭智能托管后，AI将停止智能分析，您需要手动控制充放电。",
                    disableAutoModeWarningText: "关闭智能托管后，您可能会错过AI推荐的最佳充放电时机，影响收益。",
                    socChangeMessage: "当前地区正在{status}，是否立即应用{socType}更改为{value}%？",
                    enablePriceCondition: "启用价格条件",
                    mustKeepOneTimeSlot: "至少需要保留一个时间段",
                    timeSlotLabel: "时间段",
                    pageTitle: "能源管理中心",
                    stationManagement: "调度中心",
                    todayChargeLabel: "今日充电量",
                    chargeEnergy: "充电量 (MWh)",
                    dischargeEnergy: "放电量 (MWh)",
                    chargeCostLegend: "充电成本 ($)",
                    dischargeRevenueLegend: "放电收益 ($)",
                    netProfitLegend: "净利润 ($)",
                    todayDischargeLabel: "今日放电量",
                    costLabel: "成本",
                    revenueLabel: "收入",
                    netProfitLabel: "净利润",
                    vsYesterday: "较昨日",
                    modal: {
                        operationType: "操作类型",
                        currentSOC: "当前 SOC",
                        currentPrice: "当前电价",
                        avgBatteryCost: "电池平均成本",
                        estFullTime: "预计充满时长",
                        estCost: "预计成本"
                    },
                    chargeWarning: "将开始对所有连接设备进行充电操作，此过程将消耗电网电力。",
                    spotPrice: "现货电价",
                    currentDemand: "当前需求",
                    forecastPrice: "预测价格",
                    forecastDemand: "预测需求",
                    demand: "需求",
                    generation: "发电",
                    powerAndProfit: "电量与获利",
                    profitFormula: "（获利=馈网量*价格）",
                    systemOverview: "系统概览",
                    totalCapacity: "总容量",
                    onlineDevices: "在线设备",
                    networkStatus: "网络状态",
                    normal: "正常",
                    totalFeedIn: "累计放电上网量",
                    totalRevenue: "累计收益",
                    totalProfitLabel: "累计获利",
                    family: "家庭",
                    installedCapacity: "装机量",
                    dischargeStats: "放电统计",
                    feedInAmount: "馈网量",
                    consumption: "用电量",
                    aboveTarget: "超过目标用户",
                    belowTarget: "未达目标用户",
                    priceStats: "价格统计",
                    todayPrice: "今日价格",
                    avgDischargePrice: "平均放电价格",
                    sellPrice: "卖电价",
                    todayLow: "今日最低",
                    todayHigh: "今日最高",
                    confirmChargeTitle: "确认充电操作",
                    confirmChargeMsg: "您确定要执行充电操作吗？",
                    confirmChargeBtn: "确认充电",
                    operationType: "操作类型",
                    estimatedPower: "预计功率",
                    estimatedProfit: "预计获利",
                    chargeProgress: "充电进度",
                    executingOperation: "正在执行操作...",
                    targetDevice: "下发设备",
                    warning: "预警",
                    reading: "读取中",
                    waiting: "等待中",
                    commandSuccess: "指令下发成功",
                    executingCommand: "系统正在执行您的操作指令...",
                    deviceResponseStats: "设备响应统计",
                    successRate: "成功率",
                    viewDetails: "查看详情",
                    operationDetails: "操作详情",
                    basicInfo: "基本信息",
                    affectedDevices: "影响设备",
                    operationTime: "操作时间",
                    executionStatus: "执行状态",
                    export: "导出",
                    commandSent: "下发成功",
                    executing: "执行中",
                    commandFailed: "下发失败",
                    failCount: "失败次数",
                    status: "状态",
                    below: "低于",
                    above: "高于",
                    between: "介于",
                    saveSettings: "保存设置",
                    deviceCommand: "设备指令",
                    immediately: "立即",
                    confirmExecute: "确认执行",
                    operationCompleteReport: "操作完成，以下是设备响应统计报告：",
                    clickToViewDetails: "💡 点击下方数字查看设备详情",
                    socSettings: "SOC 设置",
                    chargeStopSOC: "充电停止SOC",
                    dischargeStopSOC: "放电停止SOC",
                    autoConditions: "自动条件",
                    timeConditionSettings: "时间条件设置",
                    automationConditions: "自动化条件",
                    region: "区域",
                    chargeCondition: "充电条件",
                    dischargeCondition: "放电条件",
                    timeCondition: "时间条件",
                    priceCondition: "价格条件",
                    stopSOC: "停止SOC",
                },
            },
            
            en: {
                // Operator mgmt keys
                mgmt_op_name: "Operator Name",
                mgmt_account: "Account",
                mgmt_contact: "Contact",
                mgmt_password: "Password",
                mgmt_assign_stations: "Assign Stations",
                mgmt_assigned_count: "Stations",
                mgmt_lease_end: "Lease Expiry",
                mgmt_btn_add: "Add Operator",
                mgmt_status_active: "Active",
                mgmt_status_expired: "Expired",
                // Common translations
                brand: "Brand",
                model: "Model",
                version: "Version",
                nav: {
                    home: "Home",
                    profit: "Profit",
                    family: "Family",
                    analysis: "Analysis",
                    organization: "Organization",
                    pushStrategy: "Push Strategy",
                    operationLog: "Operation Log",
                    station: "Station",
                    report: "Report",
                    faultAlarm: "Fault Alarm",
                    messageCenter: "Message Center",
                    settings: "Settings",
                    switchRole: "Switch Role",

                    dispatchCenter: "Dispatch Center",
                    clients: "Clients",
                    logs: "Logs",
                    roleOwner: "Owner",
                    roleOperator: "Operator",
                },
                
                roleSelect: {
                    pageTitle: "Role Selection - U Energy",
                    title: "Select Your Role",
                    subtitle: "Choose your role to enter the system",
                    ownerTitle: "Owner",
                    ownerSubtitle: "Property Owner",
                    ownerDesc: "Create and manage stations, handle faults, assign O&M accounts, and fully control your assets.",
                    ownerF1: "Create stations & view data",
                    ownerF2: "Fault detection & resolution",
                    ownerF3: "Create operators & assign stations",
                    ownerBtn: "Enter Owner Panel",
                    operatorTitle: "Operator",
                    operatorSubtitle: "O&M Provider",
                    operatorDesc: "AI-powered dispatch for assigned stations, energy reports, and historical scheduling records.",
                    operatorF1: "AI smart dispatch",
                    operatorF2: "View assigned station data",
                    operatorF3: "Energy & revenue reports",
                    operatorF4: "Dispatch history records",
                    operatorBtn: "Enter Operator Panel",
                    logoutLink: "Sign Out"
                },
                // Running Data page translations
                runningData: {
                    title: "Running Data",
                    tableTitle: "Running Data Records",
                    startDate: "Start Date",
                    endDate: "End Date",
                    dateRangeNote: "* Maximum 3 months range",
                    query: "Query",
                    reset: "Reset",
                    export: "Export",
                    selectDateRange: "Please select date range",
                    dateRangeError: "Date range cannot exceed 3 months",
                    exportSuccess: "Export successful",
                    exportDetailSuccess: "Details exported successfully",
                    table: {
                        meterNumber: "NMI",
                        time: "Time",
                        interval: "Interval",
                        gridUsage: "Grid Usage (kWh)",
                        feedIn: "To Grid (kWh)",
                        price: "Price ($/kWh)",
                        soc: "SOC (%)"
                    },
                    granularity: "Data Granularity",
                    granularity5min: "5 Minutes",
                    granularity15min: "15 Minutes",
                    granularity30min: "30 Minutes",
                    granularity1hour: "1 Hour",
                    exportModal: {
                        title: "Export Running Data",
                        startDate: "Start Date",
                        endDate: "End Date",
                        warning: "* Can export up to 3 months of data, one record every 5 minutes"
                    },
                    cancel: "Cancel",
                    confirmExport: "Confirm Export"
                },
                
                // Task Detail Page
                taskDetail: {
                    tabs: {
                        overview: "Overview",
                        details: "Details"
                    },
                    summary: {
                        timeRange: "Start Time —— End Time",
                        region: "Region",
                        dischargeType: "Discharge Type",
                        taskCount: "Tasks Issued",
                        participants: "Participants",
                        participationRate: "Participation Rate",
                        totalDischarge: "Total Discharge",
                        netProfit: "Total Net Profit",
                        profitPerKwh: "Profit per kWh"
                    },
                    chart: {
                        trendTitle: "Price & Discharge Trend"
                    },
                    filter: {
                        username: "Username:",
                        usernamePlaceholder: "Search username",
                        status: "Status:",
                        all: "All",
                        completed: "Completed",
                        discharging: "Discharging",
                        notParticipated: "Not Participated"
                    },
                    table: {
                        no: "No.",
                        username: "Username",
                        discharge: "Discharge (kWh)",
                        profit: "Profit ($)",
                        profitPerKwh: "Profit per kWh ($/kWh)",
                        status: "Status"
                    },
                    button: {
                        export: "Export"
                    }
                },
                
                analysis: {
                    realtime: "Real-time Analysis",
                    historical: "Historical Analysis",
                    waitToSell: "Wait to Sell",
                    waitingMessage: "Expected price peak in 3 hours, recommend continuing to hold",
                    decisionConfidence: "Decision Confidence",
                    expectedWaitTime: "Expected Wait Time",
                    estimatedPrice: "Estimated Price",
                    estimatedExtraProfit: "Estimated Extra Profit",
                    riskAlert: "Risk Alert",
                    opportunityHint: "Opportunity Hint",
                    dischargingCapacityDecline: "Discharging capacity declining, only 52MWh left at peak",
                    priceVolatility: "High price volatility, easy to miss discharge opportunities",
                    eveningPeak: "Evening peak approaching, demand will increase",
                    demandGrowth: "Rapid demand growth, generation continues to decline, gap will keep expanding",
                    pricePrediction: "Today's price prediction error is small, peak $450",
                    priceDimension: "Price Dimension",
                    priceLow: "Price Low",
                    currentPrice: "Current Price",
                    predictedTodayPeak: "Predicted Today's Peak",
                    recent7daysAvgPrice: "Recent 7-day Avg Sell Price",
                    sellPriceHigh: "Sell Price High",
                    todayPricePredictionError: "Today's Price Prediction Error",
                    highPrecision: "High Precision",
                    priceConclusion: "Conclusion: 7-day average price $385 is at high point, current $285 is 26% below average, predicted peak $450, significant arbitrage opportunity exists",
                    marketDimension: "Market Dimension",
                    veryLikelyToRise: "Very Likely to Rise",
                    supplyDemandRatio: "Supply/Demand Ratio",
                    supplyTight: "Supply Tight",
                    supplyDemandGap: "Supply-Demand Gap",
                    gapLarge: "Gap Large",
                    demandChangeRate: "Demand Change Rate",
                    rapidGrowth: "Rapid Growth",
                    generationChangeRate: "Generation Change Rate",
                    continuousDecline: "Continuous Decline",
                    marketConclusion: "Conclusion: Demand growing at 8.5%/h while generation declining at 2.3%/h, supply-demand gap continues to expand to 650MW, electricity price will inevitably rise significantly",
                    userDimension: "User Dimension",
                    dischargingCapacityDrop: "Discharging Capacity Drop",
                    participationRate: "Participation Rate",
                    comprehensiveCoverage: "Comprehensive Coverage",
                    availableDischargeCapacity: "Available Discharge Capacity",
                    todayExpectedDischarge: "Today's Expected Discharge",
                    belowHistorical: "Below Historical",
                    recent7daysAvgDischarge: "Recent 7-day Avg Discharge",
                    dailyAvgPerformance: "Daily Avg Performance",
                    userConclusion: "Conclusion: Participation rate 98.5% comprehensive coverage, available discharge capacity 45.8kWh(37%), today's expected discharge 45.3kWh below historical",
                    hours: "hours",
                    title: "Historical Data Deep Analysis - U Energy",
                    priceAnalysis: "Price Analysis",
                    operationAnalysis: "Operation Analysis",
                    userAnalysis: "User Analysis",
                    yesterday: "Yesterday",
                    recent7days: "Recent 7 days",
                    recent30days: "Recent 30 days",
                    analysisConclusion: "Analysis Conclusion",
                    dischargeAnalysis: "Discharge Analysis",
                    sellingTimingAnalysis: "Selling Timing Analysis Chart",
                    detailedAnalysisChart: "Detailed Analysis Chart",
                    supplyDemandGapAnalysis: "Supply-Demand Gap Analysis",
                    accuratePrediction: "Accurate Prediction",
                    pricePrediction: "Price Prediction",
                    analysisConclusion: "Analysis Conclusion",
                    moderatelyAccuratePrediction: "Moderate Prediction",
                    deviation1to5: "Deviation 1-5%",
                    largeDeviation: "Large Deviation",
                    deviationGreaterThan5: "Deviation >5%",
                    priceError: "Price Error",
                    accuracyTrendChart: "Accuracy Trend"
                },
                home: "Home",
                station: "Station Management",
                highestPriceRegion: "Highest Price Region:",
                highestPrice: "Highest Price",
                todayLow: "Today's Low",
                todayHigh: "Today's High",
                charge: "Charge",
                discharge: "Discharge",
                stop: "Stop",
                priceHeight: "Station Status",
                stopChargeDischarge: "Stop Charge/Discharge",
                manualMode: "Manual",
                autoMode: "Auto",
                autoConditions: "Auto Conditions",
                settings: "Settings",
                settingsTitle: "Settings",
                edit: "Edit",
                multiPeriodStrategyTip: "💡 Set different price thresholds for different time periods. The system will monitor all periods simultaneously and trigger actions when any condition is met. Check the price condition to enable/disable price limits for that period.",
                toggle: {
                    enabled: "Enable",
                    disabled: "Disable"
                },
                operationType: "Operation Type",
                timeRange: "Time Range",
                priceCondition: "Price Condition",
                batteryLevel: "Battery Level",
                autoCharge: "Auto Charging",
                manualCharge: "Manual Charging",
                autoDischarge: "Auto Discharging",
                manualDischarge: "Manual Discharging",
                autoSettings: "Auto Settings",
                
                // Status translations for region badges
                status: {
                    none: "",
                    autoCharge: "Auto Charging",
                    manualCharge: "Manual Charging",
                    autoDischarge: "Auto Discharging",
                    manualDischarge: "Manual Discharging"
                },
                
                // Charge/Discharge condition labels
                chargeCondition: "Charge\nCondition",
                dischargeCondition: "Discharge\nCondition",
                chargeConditionSingle: "Charge Condition",
                dischargeConditionSingle: "Discharge Condition",
                timeCondition: "Time Condition",
                timeConditionSettings: "Time Condition Settings",
                priceCondition: "Price Condition",
                chargeStopSOC: "Charge Stop SOC",
                dischargeStopSOC: "Discharge Stop SOC",
                lessThanPrice: "Less than",
                greaterThanPrice: "Greater than",
                autoConditions: "Auto Conditions",
                timeSchedule: "Time Schedule",
                chargeTime: "Charge Time",
                dischargeTime: "Discharge Time",
                clickToSelectTime: "Click timeline to select charge or discharge time period",
                
                autoModeType: "Auto Mode Type",
                autoChargeConditions: "Auto Charge Conditions",
                autoDischargeConditions: "Auto Discharge Conditions",
                autoChargeCondition: "Auto Charge Condition",
                autoDischargeCondition: "Auto Discharge Condition",
                condition1Time: "Condition 1: Time",
                condition2Price: "Condition 2: Price",
                endConditionSoc: "End Condition: SOC",
                timeSetting: "Time Setting",
                priceSetting: "Price Setting",
                batterySetting: "Battery Setting",
                lessThan: "Less than",
                greaterThan: "Greater than",
                between: "Between",
                cancel: "Cancel",
                saveSettings: "Save Settings",
                family: "Families",
                availableHomes: "Available Families",
                availablePower: "Available Discharge",
                estimatedProfit: "Profit",
                estimatedRevenue: "Estimated Profit (Excluding Costs)",
                estimatedRevenueMain: "Estimated Profit",
                estimatedRevenueSub: "(Excluding Costs)",
                todayDischargeHomes: "Discharge Homes Today",
                discharged: "Discharged",
                actualDischarge: "Actual Discharge",
                input: "Power Consumption",
                output: "Feed-in Power",
                profit: "Profit($)",
                actualProfit: "Total Earnings",
                todayData: "Today's Data",
                realtime: "Realtime",
                market: "Market",
                map: "Map",
                autoSwitch: "Auto Switch",
                dischargedFamilies: "Discharged Families",
                dischargedEnergy: "Discharged",
                totalEarnings: "Total Earnings($)",
                comparedToYesterday: "vs Yesterday",
                installedCapacity: "Installed Capacity",
                currentSpotPrice: "Current Spot Price",
                currentDemand: "Current Demand",
                forecastPrice: "Forecast Price",
                forecastDemand: "Forecast Demand",
                demand: "Demand",
                generation: "Generation",
                averagePrice: "Average Price",
                maxPrice: "Highest Price",
                minPrice: "Lowest Price",
                priceFluctuation: "Price Fluctuation",
                comparedYesterday: "Compared to yesterday",
                within24h: "Within 24h",
                powerRevenueTrend: "Discharge & Profit Trend",
                dischargeAndProfit: "Power & Profit",
                timeFilter: "Time Filter",
                today: "Today",
                week: "This Week",
                month: "This Month",
                custom: "Custom",
                day: "Day",
                year: "Year",
                cumulative: "Cumulative",
                refresh: "Refresh",
                last7Days: "Last 7 Days",
                last30Days: "Last 30 Days",
                last90Days: "Last 90 Days",
                last6Months: "Last 6 Months",
                last1Year: "Last 1 Year",
                dayReport: "Daily",
                monthReport: "Monthly",
                yearReport: "Yearly",
                totalReport: "Total",
                selectTime: "Select Time",
                startDate: "Start Date",
                endDate: "End Date",
                reset: "Reset",
                query: "Query",
                quickSelect: "Quick Select",
                family: "Family",
                systemOverview: "System Overview",
                totalCapacity: "Total Capacity",
                onlineDevices: "Online Devices",
                networkStatus: "Network Status",
                normal: "Normal",
                totalDischarge: "Total Discharge",
                totalGridDischarge: "Total Grid Feed-in",
                totalRevenue: "Total Revenue",
                totalHomes: "Families",
                totalInstall: "Installed Capacity",
                totalActualDischarge: "Total Actual Discharge",
                totalProfit: "Total Profit",
                cumulativePrice: "Cumulative Price",
                currentCumulativePrice: "Current Cumulative Price",
                forecastCumulativePrice: "Forecast Cumulative Price (5min)",
                thresholdStatus: "Threshold Status",
                threshold: "Threshold",
                currentTime: "Current Time",
                belowThreshold: "Below Threshold",
                exceededThreshold: "Exceeded",
                executionEfficiency: "Execution Efficiency",
                systemAvailability: "System Availability",
                actualDischargeRate: "Actual Discharge Rate",
                
                // Test card translations
                testTitle: "Test Only",
                chargeAlert: "Charge Alert",
                dischargeAlert: "Discharge Alert",
                optimalChargeTiming: "Optimal Charge Timing", 
                lowPriceChargeAlert: "Low Price Charge Alert",
                
                // SOC confirmation dialog
                confirmSOCChange: "SOC Setting Confirmation",
                socChangeConfirmMessage: "Current region is running, apply SOC changes now?",
                applyNow: "Apply Now",
                applyNext: "Apply Next",
                waitingExecution: "Waiting for Execution",
                charging: "Charging",
                discharging: "Discharging",
                
                // Progress dialog status
                waiting: "Waiting",
                completed: "Completed",
                reading: "Reading",
                setting: "Setting",
                
                // Progress dialog content
                chargingProgress: "Charging Progress",
                dischargingProgress: "Discharging Progress",
                operationInProgress: "Operation in progress...",
                sentDevices: "Sent Devices",
                charge: "Charge",
                discharge: "Discharge",
                readDeviceSettings: "1. Read Device Settings",
                modifyDeviceSettings: "2. Modify Device Settings",
                dragToMoveClickToToggle: "Drag to move, click to toggle",
                chargeStopSOC: "Charge Stop SOC",
                dischargeStopSOC: "Discharge Stop SOC",
                pleaseStopCurrentMode: "Please stop current mode first",
                autoChargingCannotEdit: "Auto charging in progress, unable to edit settings",
                autoDischargingCannotEdit: "Auto discharging in progress, unable to edit settings",
                stationStatus: "Station Status",
                
                // Region overview card
                regionConditionsOverview: "Region Conditions Overview",
                automationConditions: "Automation Conditions",
                autoConditions: "Auto Conditions",
                autoConditionsDesc: "Configure trigger conditions for automatic charge/discharge operations",
                conditionsView: "Conditions View",
                chargeCondition: "Charge Condition",
                dischargeCondition: "Discharge Condition",
                timeCondition: "Time Condition",
                timeConditionSettings: "Time Condition Settings",
                priceCondition: "Price Condition",
                idle: "Idle",
                region: "Region",
                stopSOC: "Stop SOC",
                today: "Today",
                week: "This Week",
                month: "This Month",
                custom: "Custom",
                refresh: "Refresh",
                timeFilter: "Time Filter",
                charging: "Charging",
                chargeIndicator: "Charging",
                dischargeIndicator: "Discharging",
                discharging: "Discharging",
                standby: "Standby",
                selectRegion: "Select Region",
                regionSelectionHint: "After selecting a region, the page will only display data for that region",
                allRegions: "All Regions",
                currentRegion: "Current: ",
                offline: "Offline",
                active: "Active",
                device: "Device",
                status: "Status",
                region: "Region", 
                state: "State",
                deviceCount: "Device Count",
                normalOperation: "Normal Operation",
                price: "Price",
                historicalPrice: "Historical Price",
                predictedPrice: "Predicted Price",
                predictedDemand: "Predicted Demand",
                operationConfirm: "Operation Confirmation",
                confirmMessage: "Are you sure to perform this operation?",
                operationType: "Operation Type",
                targetDevices: "Target Devices",
                estimatedPower: "Estimated Power",
                currentPrice: "Current Price",
                estimatedDuration: "Estimated Duration",
                estimatedCost: "Estimated Cost/Benefit",
                estimatedPower: "Estimated Power",
                currentPrice: "Current Price",
                confirmExecute: "Confirm Execute",
                confirmCharge: "Confirm Charge",
                confirmDischarge: "Confirm Discharge",
                confirmStop: "Confirm Stop",
                stopWarning: "Stop operation will immediately terminate the charging/discharging status of all devices, devices will return to standby mode.",
                stopChargeWarning: "Stop operation will immediately terminate the charging status of all devices, devices will return to standby mode.",
                stopDischargeWarning: "Stop operation will immediately terminate the discharging status of all devices, devices will return to standby mode.",
                chargeCompleteMessage: "Charging command completed. Here is the device response statistics report:",
                dischargeCompleteMessage: "Discharging command completed. Here is the device response statistics report:",
                chargingCompleteMessage: "Charging command completed. Here is the device response statistics report:",
                dischargingCompleteMessage: "Discharging command completed. Here is the device response statistics report:",
                stopCompleteMessage: "Stop command completed. Here is the device response statistics report:",
                estimatedRevenue: "Estimated Profit",
                cancel: "Cancel",
                save: "Save",
                socSettings: "SOC Settings",
                stop: "Stop",
                units: " items",
                comparedToYesterday: "vs Yesterday",
                compareYesterday: "vs Yesterday",
                dischargedAmount: "Discharged Energy",
                earnedProfit: "Earned Profit",
                dischargeFamilies: "Discharge Families",
                dischargeAmount: "Discharge",
                dischargeProfit: "Profit",
                chargeFamilies: "Charge Families",
                chargeAmount: "Charge",
                chargeCost: "Cost",
                netProfit: "Net Profit",
                cumulativeMetrics: "Cumulative Metrics",
                confirmAutoMode: "Confirm Auto Mode",
                autoModeDescription: "After enabling auto mode, the system will automatically perform charge/discharge operations based on the following conditions:",
                editConditionHint: "To modify conditions, please click the 'Edit Settings' button",
                editSettings: "Edit Settings",
                confirmEnable: "Confirm Enable",
                confirmDisableAutoMode: "Confirm Disable Auto Mode",
                disableAutoModeDescription: "After disabling auto mode, the system will stop automatic charge/discharge operations. You will need to control charging and discharging manually.",
                autoModeWarning: "Warning",
                disableAutoModeWarning: "After disabling auto mode, you may miss optimal charge/discharge opportunities, affecting your revenue.",
                currentAutoModeStatus: "Current auto mode status:",
                autoModeActive: "Active",
                confirmDisable: "Confirm Disable",
                conditionEnabled: "Enabled",
                conditionDisabled: "Disabled",
                timeSegment: "Time Period",
                priceThreshold: "Price Threshold",
                chargeToSOC: "Charge to SOC",
                dischargeToSOC: "Discharge to SOC",
                currentCumulativePrice: "Current Cumulative Price",
                forecastCumulativePrice5min: "Forecast Cumulative Price (5min)",
                thresholdStatus: "Threshold Status",
                notExceeded: "Below Threshold",
                confirmExecute: "Confirm",
                operationSuccess: "Operation Successful",
                systemExecuting: "System is executing your command...",
                devicesDispatched: "Dispatched",
                devicesReceived: "Received",
                devicesActivated: "Activated",
                successRate: "Success Rate",
                close: "Close",
                viewDetails: "View Details",
                operationDetails: "Operation Details",
                stationDetails: "Station Details",
                executionTimeline: "Execution Timeline",
                basicInfo: "Basic Information",
                executionStatus: "Execution Status",
                operationTime: "Operation Time",
                deviceResponseStatistics: "Device Response Statistics", 
                commandsSent: "Commands Sent",
                commandsReceived: "Commands Received",
                commandSentSuccess: "Command Sent Successfully",
                commandsIssued: "Commands Issued",
                devicesExecuted: "Executed",
                totalDevices: "Total Devices",
                offlineDevices: "Offline Devices",
                dispatchedDevices: "Dispatched Devices",
                deviceResponseStatistics: "Device Response Statistics",
                successfullyDispatched: "Successfully Dispatched",
                executing: "Executing",
                successStatus: "Success",
                failedStatus: "Failed",
                failed: "Dispatch Failed",
                failedDevices: "Dispatch Failed Devices",
                successDevices: "Dispatch Successful Devices",
                executingDevices: "Executing Devices",
                nmi: "NMI",
                failureCount: "Failure Count",
                status: "Status",
                success: "Dispatch Success",
                totalCount: "Total Count",
                estimatedProfit: "Estimated Profit",
                estimatedProfitValue: "+$340",
                devices: "",
                refresh: "Refresh",
                timeFilter: "Time Filter",
                refreshData: "Manually refresh data",
                dataRefreshed: "Data refreshed",
                chartsLoadFailed: "charts failed to load, check console",
                allChartsLoaded: "All charts loaded successfully",
                filterError: "Filter error occurred, please refresh the page and try again",
                dataLoading: "Loading data...",
                currentTime: "Current Time",
                userName1: "John Smith",
                userName2: "Emily Davis",
                userName3: "Michael Johnson",
                userName5: "David Brown",
                adminUser: "Administrator",
                remark: {
                    none: "-",
                    testAccount: "Test Account",
                    systemAdmin: "System Administrator",
                    tempUser: "Temporary User"
                },
                control: "Control",
                monitor: "Monitor",
                detail: "Detail",
                manage: "Manage",
                config: "Config",
                searchComplete: "Search Complete",
                foundRecords: "Found {count} matching records",
                resetComplete: "Reset Complete",
                clearedSearch: "Search criteria cleared",
                exporting: "Exporting",
                exportSuccess: "Data exported successfully",
                validationFailed: "Validation Failed",
                fillRequired: "Please fill in all required fields",
                saveSuccess: "Save Successful",
                userSaved: "User information saved",
                deleteSuccess: "Delete Successful",
                userDeleted: "User has been deleted",
                userName3: "Michael Johnson",
                adminUser: "Administrator",
                switchedTo: "Switched to",
                tabSwitched: "Tab switched",
                saving: "Saving...",
                deleting: "Deleting...",
                exporting: "Exporting...",
                selectDateRange: "Please select start and end dates",
                invalidDateRange: "Start date cannot be later than end date",
                dateRangeTooLong: "Selected time range cannot exceed 1 year",
                customRangeApplied: "Custom time range applied",
                filterApplied: "Filtered showing",
                noDataTable: "Data table not found",
                exportSuccess: "Successfully exported",
                exportFailed: "Export failed, please retry",
                sortCancelled: "Sorting cancelled",
                sortApplied: "Sorted by",
                filterReset: "Filter reset",
                socRangeError: "SOC minimum value cannot be greater than maximum value",
                profitRangeError: "Profit minimum value cannot be greater than maximum value",
                daysRangeError: "Usage days minimum value cannot be greater than maximum value",
                advancedFilterApplied: "Advanced filter applied",
                exportedRecords: "Exported",
                searchComplete: "Search completed",
                foundMatches: "Found",
                matchingMessages: "matching messages",
                resetComplete: "Reset completed",
                searchCleared: "Search criteria cleared",
                noData: "No data available",
                
                // Device command modal translations
                deviceCommand: "Device Command",
                confirmOperation: "Confirm Operation",
                operationType: "Operation Type",
                targetDevices: "Target Devices",
                executionTime: "Estimated Execution Time",
                immediately: "Immediately",
                minutes: "minutes",
                operationWarning: "This operation will affect all selected devices. Please confirm to continue.",
                confirmExecute: "Confirm",
                cancel: "Cancel",
                stop: "Stop",
                charging: "Charging",
                discharging: "Discharging",
                idle: "Idle",
                stopOperation: "Stop Operation",
                operationSuccess: "Operation Successful",
                operationFailed: "Operation Failed",
                confirmCharge: "Confirm Charge",
                confirmDischarge: "Confirm Discharge",
                confirmStop: "Confirm Stop",
                estimatedRevenue: "Estimated Profit",
                stopWarning: "Stopping will immediately terminate all device Charge/Discharge status. Devices will return to standby mode.",
                deviceResponseStatisticsTitle: "Device Response Statistics",
                operationCompleteMessage: "command completed. Here is the device response statistics report:",
                chargingCompleteMessage: "Charging command completed. Here is the device response statistics report:",
                dischargingCompleteMessage: "Discharging command completed. Here is the device response statistics report:",
                
                // Chart common translations
                charts: {
                    dischargeAmount: "Discharge Amount",
                    profit: "Profit",
                    timeHour: "Time: Hour",
                    socTrend: "SOC Trend",
                    charge: "Charge",
                    stopCharge: "Stop Charging",
                    discharge: "Discharge",
                    stopDischarge: "Stop Discharging", 
                    familyDistribution: "Family Distribution",
                    totalFamilies: "Total Families",
                    energyUsage: "Energy Usage",
                    dailyRevenue: "Daily Revenue",
                    cumulativeRevenue: "Cumulative Revenue",
                    deviceStatus: "Device Status",
                    standby: "Standby",
                    offline: "Offline",
                    pvGeneration: "PV Generation",
                    storageDischarge: "Storage Discharge",
                    powerLoad: "Power Load",
                    user: "User",
                    notParticipating: "Not Participating",
                    maxValue: "Maximum",
                    minValue: "Minimum",
                    avgValue: "Average",
                    efficiency: "Efficiency",
                    availability: "Availability",
                    device: "Device"
                },
                
                months: {
                    jan: "Jan", feb: "Feb", mar: "Mar", apr: "Apr",
                    may: "May", jun: "Jun", jul: "Jul", aug: "Aug",
                    sep: "Sep", oct: "Oct", nov: "Nov", dec: "Dec"
                },
                
                weekdays: {
                    mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu",
                    fri: "Fri", sat: "Sat", sun: "Sun"
                },
                systemAdmin: "System Administrator",
                operatorA: "Operator A",
                operatorB: "Operator B",
                dischargeStatistics: "Discharge Statistics",
                priceStatistics: "Price Statistics",
                actualDischargeAmount: "Actual Discharge Amount",
                actualDischargeEfficiency: "Actual Discharge Efficiency",
                outputAmount: "Feed-in Power",
                inputAmount: "Power Consumption",
                usersExceedingTarget: "Users Exceeding Target",
                usersNotExceedingTarget: "Users Not Meeting Target",
                todaysPrice: "Today's Price",
                avgDischargePrice: "Average Discharge Price",
                sellPrice: "Selling Price",
                todaysLowest: "Today's Lowest",
                todaysHighest: "Today's Highest",
                startDate: "Start Date",
                endDate: "End Date",
                reset: "Reset",
                query: "Query",
                quickSelect: "Quick Select",
                last7Days: "Last 7 days",
                last30Days: "Last 30 days",
                last90Days: "Last 90 days",
                energyManagementCenter: "Energy Management Center",
                unit: "",
                comparedToYesterdayPlus: "↑ vs Yesterday +",
                settings: "Settings",
                logout: "Logout",
                confirmLogout: "Confirm Logout",
                confirmLogoutMessage: "Are you sure you want to logout?",
                
                // Common translations
                common: {
                    back: "Back",
                    cancel: "Cancel",
                    confirm: "Confirm",
                    confirmAction: "Confirm Action",
                    confirmMessage: "Are you sure you want to proceed?",
                    backToList: "Back to List",
                    previous: "Previous",
                    next: "Next",
                    times: " times",
                    total: "Total",
                    items: " items",
                    page: "Page",
                    save: "Save",
                    close: "Close",
                    delete: "Delete",
                    edit: "Edit",
                    add: "Add",
                    search: "Search",
                    reset: "Reset",
                    loading: "Loading...",
                    noData: "No Data",
                    charge: "Charge",
                    discharge: "Discharge",
                    settings: "Settings",
                    logout: "Logout",
                    confirmLogout: "Confirm Logout",
                    confirmLogoutMsg: "Are you sure you want to logout?"
                },
                sortAsc: "Ascending",
                sortDesc: "Descending",
                export: "Export",
                refresh: "Refresh",
                estimatedDuration: "15-30 minutes",
                thisOperationWillAffectAll: "This operation will affect all connected devices. Please confirm to continue.",
                viewDetails: "View Details",
                successfullyActivated: "Successfully Activated",
                devicePrefix: "Device",
                statusLabel: "Status",
                regionLabel: "Region",
                stateLabel: "State",
                deviceCountLabel: "Device Count",
                statusNormalOperation: "Status: Normal Operation",
                inactive: "Standby",
                minutes: "minutes",
                confirmChargeOperation: "Confirm Charge Operation",
                confirmDischargeOperation: "Confirm Discharge Operation",
                confirmChargeMessage: "Are you sure you want to start charging?",
                confirmDischargeMessage: "Are you sure you want to start discharging?",
                chargeWarningMessage: "This will start charging all connected devices, consuming power from the grid.",
                dischargeWarningMessage: "This will start discharging all connected devices, supplying power to the grid for revenue.",
                confirmStopCharge: "Confirm Stop Charge",
                confirmStopDischarge: "Confirm Stop Discharge",
                confirmStopChargeMessage: "Are you sure you want to stop charging?",
                confirmStopDischargeMessage: "Are you sure you want to stop discharging?",
                confirmStopChargeTitle: "Confirm Stop Charging",
                confirmStopDischargeTitle: "Confirm Stop Discharging",
                stopCharge: "Stop Charge",
                stopDischarge: "Stop Discharge",
                allDevices: "All Devices",
                deviceResponseStatisticsTitle: "Device Response Statistics",
                operationCommandCompleted: "Command dispatched successfully. Here are the device response statistics:",
                
                // Operation Log translations
                operationLog: {
                    title: "Operation Log",
                    tabs: {
                        task: "Task Records",
                        operation: "Operation Records",
                        basic: "Basic Info",
                        stations: "Station Details",
                        timeline: "Execution Timeline"
                    },
                    table: {
                        time: "Time",
                        region: "Region",
                        dischargeType: "Discharge Type",
                        taskIssuer: "Task Issuer",
                        taskCount: "Tasks Issued",
                        participants: "Participants",
                        participationRate: "Participation Rate",
                        dischargeAmount: "Discharge (kWh)",
                        netProfit: "Net Profit ($)",
                        profitPerKwh: "Profit per kWh ($/kWh)",
                        command: "Command",
                        operator: "Operator",
                        stations: "Stations",
                        success: "Success",
                        failed: "Failed",
                        action: "Action"
                    },
                    filter: {
                        allRegions: "All Regions",
                        allStations: "All Stations",
                        operatorPlaceholder: "Enter operator name...",
                        allCommands: "All Commands",
                        charge: "Charge",
                        discharge: "Discharge",
                        stopCharge: "Stop Charge",
                        stopDischarge: "Stop Discharge",
                        timePlaceholder: "Select time..."
                    },
                    buttons: {
                        search: "🔍 Search",
                        reset: "🔄 Reset",
                        export: "📥 Export",
                        refresh: "🔄 Refresh",
                        viewDetails: "View Details"
                    },
                    noData: "No data",
                    total: "Total",
                    perPage: "/page",
                    goToPage: "Go to page",
                    notFound: "Operation record not found",
                    
                    // Detail drawer translations
                    detailTitle: "Operation Log Details",
                    tabs: {
                        basic: "Basic Info",
                        stations: "Station Details",
                        timeline: "Execution Timeline"
                    },
                    overview: {
                        title: "Operation Overview",
                        totalStations: "Total Stations",
                        successCount: "Success Count",
                        failedCount: "Failed Count",
                        successRate: "Success Rate"
                    },
                    basicInfo: {
                        title: "Basic Information",
                        operationTime: "Operation Time",
                        operationCommand: "Operation Command",
                        operator: "Operator",
                        operationId: "Operation ID",
                        executionStatus: "Execution Status",
                        allSuccess: "All Success",
                        partialSuccess: "Partial Success",
                        mostlyFailed: "Mostly Failed"
                    },
                    stationDetails: {
                        title: "Station Execution Details",
                        success: "Success",
                        failed: "Failed",
                        station: "Station",
                        area: "Area"
                    },
                    timeline: {
                        title: "Execution Timeline",
                        commandCreated: "Command Created",
                        validationPassed: "Validation Passed",
                        executionStarted: "Execution Started",
                        stationsSuccess: " stations executed successfully",
                        stationsFailed: " stations failed",
                        executionCompleted: "Execution Completed",
                        normal: "Normal",
                        warning: "Warning",
                        error: "Error"
                    },
                    dailyStats: {
                        title: "Daily Station Statistics",
                        date: "Date",
                        station: "Station",
                        chargeCount: "Charge Count",
                        dischargeCount: "Discharge Count",
                        operationMode: "Operation Mode",
                        modes: {
                            manual: "Manual",
                            automated: "Automated"
                        }
                    }
                },
                
                // Message Center translations
                messageCenter: {
                    title: "Message Center",
                    tabs: {
                        all: "All",
                        alert: "Alert",
                        system: "System",
                        operation: "Operation"
                    },
                    placeholder: {
                        searchKeyword: "Enter message keywords..."
                    },
                    types: {
                        chargeReminder: "Charge Reminder",
                        dischargeReminder: "Discharge Reminder"
                    },
                    status: {
                        unread: "Unread",
                        read: "Read"
                    },
                    buttons: {
                        search: "🔍 Search",
                        reset: "🔄 Reset",
                        export: "📥 Export",
                        delete: "Delete",
                        refresh: "🔄 Refresh"
                    },
                    markAsRead: "Mark as read",
                    delete: "Delete",
                    noMessages: "No messages",
                    loading: "Loading...",
                    messages: {
                        chargeAlert: "Current price {price} yuan, below preset threshold {threshold} yuan, please charge immediately",
                        dischargeAlert: "Current price {price} yuan, above preset threshold {threshold} yuan, please discharge immediately"
                    },
                    timeAgo: {
                        justNow: "Just now",
                        minutesAgo: "{minutes} minutes ago",
                        hoursAgo: "{hours} hours ago",
                        daysAgo: "{days} days ago"
                    }
                },
                
                // Common translations
                page: "page",
                items: "items",
                messageContent: "Message Content",
                description: "Description",
                type: "Warning",
                time: "Time",
                units: "items",
                allTypes: "All Types",
                alertMessage: "Alert Message",
                systemMessage: "System Message",
                operationMessage: "Operation Message",
                warning: "Warning",
                noMessagesFound: "No messages found with current filters",
                firstPage: "First",
                prevPage: "Previous",
                nextPage: "Next",
                lastPage: "Last",
                showingItems: "Showing",
                error: "Error",
                dateSelection: "Date Selection",
                dateSelected: "Date selected",
                go: "Go",
                
                // Profit page translations
                profitAnalysis: "Profit Analysis",
                profitSubtitle: "Real-time monitoring and analysis of your energy trading profits",
                todayProfit: "Today's Profit",
                weekProfit: "This Week's Profit",
                monthProfit: "This Month's Profit",
                comparedToLastWeek: "vs Last Week",
                comparedToLastMonth: "vs Last Month",
                yearToDate: "Year to Date",
                profitTrend: "Profit Trend",
                deviceProfitRanking: "Device Profit Ranking",
                energyRevenueComparison: "Energy vs Revenue Comparison",
                profitDistribution: "Profit Distribution",
                hourlyProfitAnalysis: "Hourly Profit Analysis",
                dailyProfitComparison: "Daily Profit Comparison",
                energyConsumption: "Energy Consumption",
                revenue: "Revenue",
                profit: "Profit",
                chargingProfit: "Charging Profit",
                dischargingProfit: "Discharging Profit",
                tradingProfit: "Trading Profit",
                profitSource: "Profit Source",
                hourlyProfit: "Hourly Profit",
                thisWeek: "This Week",
                lastWeek: "Last Week",
                thisMonth: "This Month",
                lastMonth: "Last Month",
                monday: "Monday",
                tuesday: "Tuesday",
                wednesday: "Wednesday",
                thursday: "Thursday",
                friday: "Friday",
                saturday: "Saturday",
                sunday: "Sunday",
                top10: "TOP 10",
                bottom10: "BOTTOM 10",
                searchDevice: "Search Device",
                search: "Search",
                deviceId: "Device ID",
                location: "Location",
                efficiency: "Efficiency",
                online: "Online",
                offline: "Offline",
                overview: "Overview",
                dailyProfit: "Daily Profit",
                deviceProfit: "Device Profit",
                chartView: "Chart View",
                tableView: "Table View",
                
                // Analysis page translations
                analysis: {
                    title: "Analysis - Daily Report",
                    profit: "Profit (10K Yuan)",
                    avgProfitPerPerson: "Avg Profit Per Person (Yuan)",
                    dischargeStats: "Discharge Statistics",
                    priceStats: "Price Statistics", 
                    userStats: "User Statistics",
                    dischargeAnalysis: "Discharge Analysis",
                    profitRatio: "Profit Ratio",
                    profitLabel: "Profit",
                    doubleRing: {
                        userPerspective: "Inner Ring: Active",
                        profitPerspective: "Outer Ring: Profit"
                    },
                    timeFilter: {
                        label: "Time Filter",
                        today: "Today",
                        thisMonth: "This Month", 
                        thisYear: "This Year"
                    },
                    metrics: {
                        userCount: "User Count",
                        activeUserRatio: "Active User Ratio",
                        dischargeAmount: "Discharge Amount (kWh)",
                        actualDischargeEfficiency: "Actual Discharge Efficiency",
                        exceedingUsers: "Users Exceeding Target",
                        notExceedingUsers: "Users Not Exceeding Target",
                        todayPrice: "Today's Price",
                        avgDischargePrice: "Avg Discharge Price",
                        actualDischargeAmount: "Actual Discharge Amount",
                        actualDischargeRate: "Actual Discharge Rate",
                        todayAvgDischargeRate: "Today Avg Discharge Rate",
                        todayAvgPrice: "Today Avg Price"
                    },
                    units: {
                        yuan: "Yuan",
                        kwh: "kWh",
                        percent: "%"
                    },
                    comparison: {
                        increase: "▲",
                        decrease: "▼",
                        compared: "vs prev"
                    },
                    priceRange: {
                        lowest: "Lowest",
                        highest: "Highest",
                        sellPrice: "Sell Price",
                        todayLowest: "Today's Lowest",
                        todayHighest: "Today's Highest",
                        currentPrice: "Current Price"
                    },
                    currency: {
                        yuan: "Yuan",
                        dollar: "$"
                    },
                    userTypes: {
                        active: "Active",
                        inactive: "Inactive", 
                        notParticipating: "Not Participating"
                    },
                    chartLabels: {
                        actualDischarge: "Actual Discharge",
                        price: "Price",
                        dischargeRate: "Discharge Rate"
                    },
                    userRatio: "User Ratio",
                    userLabel: "Users",
                    modal: {
                        exceedingUsersDetail: "Users Exceeding Target Details",
                        notExceedingUsersDetail: "Users Not Exceeding Target Details",
                        exceedingUsersTitle: "Users Exceeding Target Details",
                        notExceedingUsersTitle: "Users Not Exceeding Target Details"
                    },
                    table: {
                        userName: "User Name",
                        dischargeAmount: "Discharge Amount (kWh)",
                        efficiency: "Efficiency (%)",
                        profit: "Profit ($)"
                    },
                    profitTypes: {
                        highProfit: "High Profit",
                        mediumProfit: "Medium Profit",
                        lowProfit: "Low Profit"
                    }
                },
                
                // Family page translations
                family: {
                    title: "Family",
                    subtitle: "Manage and monitor energy usage for all families",
                    deviceId: "Device ID",
                    address: "Address",
                    status: "Status",
                    cumulativeDischarge: "Cumulative Discharge",
                    cumulativeRevenue: "Cumulative Revenue",
                    action: "Action",
                    enabled: "Enabled",
                    disabled: "Disabled",
                    totalFamilies: "Total Families",
                    totalRevenue: "Total Revenue",
                    familyDistribution: "Family Distribution Statistics",
                    deviceStatus: "Device Status",
                    deviceStatusDistribution: "Device Status Distribution",
                    allDeviceStatus: "All Device Status",
                    activeFamilies: "Active Families",
                    inactiveFamilies: "Inactive Families",
                    notParticipatingFamilies: "Non-participating Families",
                    foundFamilies: "Found {count} families",
                    views: {
                        grid: "🏠 Grid View",
                        chart: "📊 Chart View",
                        table: "📋 Table View"
                    },
                    buttons: {
                        search: "🔍 Search",
                        reset: "🔄 Reset", 
                        export: "📥 Export",
                        advancedFilter: "⚙️ Advanced Filter",
                        applyFilter: "Apply Advanced Filter",
                        cancel: "Cancel",
                        clearAll: "Clear All Filters",
                        viewDetails: "View Details",
                        runningData: "Running Data",
                        details: "Details",
                        all: "All"
                    },
                    placeholder: {
                        allStatus: "All Status",
                        allActivity: "All Activity",
                        deviceStatus: "All Device Status",
                        allBrands: "All Brands",
                        userName: "Enter user name...",
                        deviceCode: "Enter device code...",
                        meterNumber: "Enter NMI...",
                        minValue: "Min Value",
                        maxValue: "Max Value",
                        allLocations: "All Locations",
                        allDevices: "All Devices"
                    },
                    table: {
                        user: "User",
                        userName: "User Name",
                        location: "Location",
                        address: "Address",
                        activity: "Activity",
                        meterNumber: "Meter Number",
                        brand: "Brand",
                        version: "Version",
                        yesterdayProfit: "Yesterday's Profit ($)",
                        todayProfit: "Today's Profit ($)",
                        totalProfit: "Total Profit ($)",
                        cumulativeProfit: "Cumulative Profit ($)",
                        avgProfit: "Avg Daily Profit ($)",
                        deviceCode: "Device Code",
                        deviceStatus: "Device Status",
                        operationMode: "Operation Mode",
                        flowDirection: "Flow/Source",
                        soc: "SOC",
                        todayDischarge: "Today's Discharge (kWh)",
                        usageDays: "Usage Days",
                        activityStatus: "Activity Status",
                        action: "Action",
                        actions: "Actions"
                    },
                    activityStatus: {
                        active: "Active",
                        inactive: "Inactive"
                    },
                    deviceStates: {
                        charging: "Charging",
                        discharging: "Discharging",
                        standby: "Standby",
                        offline: "Offline",
                        lightOn: "Light On",
                        lightOff: "Light Off",
                        missingBattery: "Missing Battery"
                    },
                    operationMode: {
                        0: "Self used mode",
                        1: "Feed-in priority mode",
                        2: "Reserved",
                        3: "Back-up mode"
                    },
                    filters: {
                        socRange: "SOC Range",
                        profitRange: "Today's Profit Range",
                        usageDaysRange: "Usage Days Range",
                        days: "Days"
                    },
                    stats: {
                        activeRate: "Active Rate",
                        avgDischarge: "Avg Discharge (kWh)",
                        monthlyNew: "New This Month",
                        comparedLastMonth: "vs Last Month",
                        comparedYesterday: "vs Yesterday",
                        thisWeek: "This Week"
                    },
                    charts: {
                        activityTrend: "Activity Trend",
                        energyHeatmap: "Energy Usage Heatmap",
                        revenueAnalysis: "Revenue Analysis",
                        powerUsage: "Power Usage",
                        dischargeAmount: "Discharge Amount",
                        temperature: "Temperature",
                        revenueTrend: "Profit Trend",
                        socTrend: "SOC Trend",
                        operatingDays: "Operating Days",
                        chargeCycles: "Charge/Discharge Cycles",
                        operatingData: "Operating Data",
                        dailyRevenue: "Daily Revenue",
                        cumulativeRevenue: "Cumulative Revenue"
                    },
                    metrics: {
                        soc: "SOC",
                        todayDischarge: "Today's Discharge",
                        todayProfit: "Today's Profit"
                    },
                    details: {
                        device: "Device"
                    },
                    drawer: {
                        title: "Details",
                        tabs: {
                            basicInfo: "Basic Info",
                            revenueInfo: "Profit Info",
                            operatingData: "Operating Data",
                            dispatchRecords: "Dispatch Records"
                        },
                        basicInfo: "Basic Information",
                        userName: "User Name",
                        location: "Location",
                        address: "Address",
                        meterNumber: "NMI",
                        deviceCode: "Device Code",
                        batteryCapacity: "Battery Capacity",
                        soc: "SOC",
                        status: "Status",
                        operatingDays: "Operating Days",
                        owner: "Owner",
                        todayProfit: "Today's Profit",
                        avgProfit: "Avg Daily Profit",
                        totalRevenue: "Total Revenue",
                        todayDischarge: "Today's Discharge",
                        avgDischarge: "Avg Discharge",
                        totalDischarge: "Total Discharge",
                        revenue: "Revenue",
                        discharge: "Discharge",
                        profitTrend: "Profit Trend",
                        operatingDataTitle: "Operating Data",
                        socTrend: "SOC Trend",
                        chargeCycles: "Charge/Discharge Cycles",
                        day: "Day",
                        month: "Month",
                        year: "Year",
                        stopCharging: "Stop Charging",
                        charging: "Charging",
                        discharging: "Discharging",
                        stopDischarging: "Stop Discharging",
                        actions: {
                            cancel: "Cancel",
                            save: "Save",
                            delete: "Delete",
                            confirm: "Confirm"
                        },
                        messages: {
                            saveSuccess: "Saved successfully",
                            deleteConfirm: "Are you sure you want to delete this record?",
                            deleteSuccess: "Deleted successfully"
                        },
                        dispatchRecords: {
                            time: "Time",
                            type: "Type",
                            status: "Status",
                            startTime: "Start Time",
                            endTime: "End Time",
                            charge: "Charge",
                            discharge: "Discharge",
                            dischargeCount: "Successful Discharge Dispatches",
                            dischargeAmount: "Discharge",
                            profit: "Profit",
                            chargeCount: "Successful Charge Dispatches",
                            chargeAmount: "Charge",
                            failedCount: "Failed Dispatches",
                            success: "Success",
                            failed: "Failed",
                            executing: "Executing",
                            successCount: "Success Count",
                            failedCountLabel: "Failed Count",
                            executingCount: "Executing Count",
                            timesCharge: " charges",
                            timesDischarge: " discharges"
                        }
                    },
                    userName1: "John Smith",
                    userName2: "Michael Lee",
                    userName3: "Emily Wang",
                    userName4: "David Zhao",
                    userName5: "Sarah Chen",
                    modal: {
                        details: "Details",
                        basicInfo: "Basic Information",
                        revenueInfo: "Profit Information",
                        operatingData: "Operating Data",
                        deviceCode: "Device Code",
                        batteryCapacity: "Battery Capacity",
                        operatingDays: "Operating Days",
                        owner: "Owner",
                        todayProfit: "Today's Profit",
                        avgDailyProfit: "Avg Daily Profit",
                        todayDischarge: "Today's Discharge",
                        avgDailyDischarge: "Avg Daily Discharge",
                        cumulativeDischarge: "Cumulative Discharge"
                    },
                    timeFilters: {
                        day: "Day",
                        month: "Month",
                        year: "Year"
                    },
                    pagination: {
                        total: "Total {total} items",
                        perPage10: "10/page",
                        perPage20: "20/page",
                        perPage50: "50/page",
                        perPage100: "100/page"
                    },
                    discharge: {
                        yesterday: "Yesterday",
                        today: "Today",
                        title: "Discharge Data",
                        time: "Time",
                        discharge: "Discharge",
                        price: "Price",
                        profit: "Profit",
                        totalDischarge: "Total Discharge",
                        avgPrice: "Average Price",
                        totalProfit: "Total Profit"
                    }
                },
                
                // Organization page translations
                organization: {
                    title: "Organization",
                    subtitle: "Manage organization members and permissions",
                    placeholder: {
                        userName: "Enter user name...",
                        userEmail: "Enter user email..."
                    },
                    buttons: {
                        search: "🔍 Search",
                        reset: "🔄 Reset",
                        export: "📥 Export",
                        refresh: "🔄 Refresh",
                        add: "Add New"
                    },
                    table: {
                        userName: "User Name",
                        userEmail: "User Email",
                        status: "Status",
                        remarks: "Remarks",
                        createdTime: "Created Time",
                        action: "Action"
                    },
                    status: {
                        active: "Enabled",
                        inactive: "Disabled",
                        allStatus: "All Status"
                    },
                    actions: {
                        edit: "Edit",
                        delete: "Delete"
                    },
                    modal: {
                        addMember: "Add Member",
                        editMember: "Edit Member",
                        addOrganization: "Add Organization",
                        userName: "User Name",
                        email: "Email", 
                        password: "Password",
                        status: "Status",
                        remark: "Remark",
                        permissions: "Permissions",
                        expandCollapse: "Expand/Collapse",
                        selectAll: "Select All/None",
                        cancel: "Cancel",
                        confirm: "Confirm",
                        placeholders: {
                            userName: "Enter user name",
                            email: "Enter user email",
                            password: "Enter password",
                            remark: "Enter remark"
                        },
                        permissionModules: {
                            home: "Home",
                            user: "User",
                            station: "Station"
                        }
                    },
                    deleteConfirm: {
                        title: "Confirm Delete",
                        message: "This operation cannot be undone. Are you sure you want to delete this user?",
                        warning: "After deletion, the user will not be able to access the system, and all related data will be permanently removed",
                        cancel: "Cancel",
                        confirm: "Confirm Delete"
                    },
                    messages: {
                        validationFailed: "Validation Failed",
                        fillRequired: "Please fill in all required fields"
                    },
                    pagination: {
                        total: "Total {total} items",
                        perPage10: "10/page",
                        perPage20: "20/page",
                        perPage50: "50/page",
                        perPage100: "100/page",
                        goTo: "Go to"
                    }
                },
                
                // Push Strategy page translations
                pushStrategy: {
                    title: "Push Strategy",
                    buttons: {
                        add: "Add",
                        edit: "Edit",
                        delete: "Delete",
                        save: "Save",
                        cancel: "Cancel",
                        confirm: "Confirm",
                        refresh: "Refresh",
                        export: "Export",
                        back: "Back"
                    },
                    formTitle: {
                        add: "Add Push Strategy",
                        edit: "Edit Push Strategy"
                    },
                    regionPriceSettings: "Region Price Settings",
                    dischargePriceStrategy: "Discharge Notification Price Strategy",
                    chargePriceStrategy: "Charge Notification Price Strategy",
                    descriptions: {
                        regionPriceDescription: "Set charge and discharge notification strategy prices for each region",
                        dischargeDescription: "Send reminder when price exceeds set value",
                        chargeDescription: "Send reminder when price falls below set value"
                    },
                    reminderFrequency: "Reminder Frequency",
                    reminderDescription: "When conditions are met and no response, how often to send reminders",
                    sendingMethod: "Sending Method",
                    selectUsers: "Select Users",
                    methods: {
                        inSiteMessage: "In-site Message",
                        email: "Email",
                        sms: "SMS"
                    },
                    placeholder: {
                        price: "Price",
                        enterPrice: "Enter price"
                    },
                    table: {
                        region: "Region",
                        dischargePrice: "Discharge Price",
                        chargePrice: "Charge Price",
                        actions: "Actions",
                        status: "Status",
                        userName: "User Name",
                        userEmail: "User Email"
                    },
                    status: {
                        configured: "Configured",
                        notConfigured: "Not Configured",
                        enabled: "Enabled",
                        disabled: "Disabled"
                    },
                    tabs: {
                        normal: "Normal Strategy",
                        advanced: "Advanced Strategy"
                    },
                    settings: "Settings",
                    charge: "Charge",
                    discharge: "Discharge",
                    points: {
                        lowest: "Lowest Point",
                        low: "Low Point",
                        optimal: "Optimal Point",
                        high: "High Point"
                    },
                    priceDescriptions: {
                        valleyPlus10: "Price: Within 10% above valley",
                        valleyPlus20: "Price: Within 20% above valley",
                        peakAbove95: "Price: Above 95% of peak",
                        peak90to95: "Price: 90-95% of peak"
                    },
                    reminderSettings: {
                        advanceReminder: "Advance Reminder Time",
                        frequency: "Reminder Frequency: When conditions are met and no response, how often to send reminders"
                    },
                    pushNotification: {
                        normal: {
                            title: "Charge Reminder",
                            content: "NSW region charging price $300 exceeds threshold $250, please charge",
                            currentPrice: "Current price ",
                            belowThreshold: " below threshold ",
                            aboveThreshold: " above threshold ",
                            pleaseCharge: ", please charge",
                            pleaseDischarge: ", please discharge"
                        },
                        advanced: {
                            title: "Optimal Charge Reminder",
                            content: "NSW region charging price predicted to reach lowest point $180 in 15 minutes, recommend immediate preparation for charging",
                            regionPrice: "Region charging price ",
                            timeRemaining: ", ",
                            minutesToBest: " minutes until optimal discharge time, please prepare"
                        }
                    },
                    chargeReminder: "Charge Reminder",
                    dischargeReminder: "Discharge Reminder",
                    optimalReminder: "Optimal Charge Reminder",
                    optimalChargeReminder: "Optimal Charge Reminder",
                    optimalDischargeReminder: "Optimal Discharge Reminder",
                    highPriceChargeReminder: "High Price Charge Reminder",
                    priceAlert: "Alert",
                    currentPrice: "Current price ",
                    
                    // 新增推送通知英文翻译
                    chargeReminderTitle: "Charge Reminder——NSW",
                    dischargeReminderTitle: "Discharge Reminder——NSW",
                    optimalChargeTitle: "Optimal Charge Time Reminder——NSW",
                    lowPriceChargeTitle: "Low Price Charge Reminder——NSW",
                    belowThreshold: ", below threshold ",
                    aboveThreshold: ", above threshold ",
                    pleaseCharge: ", please charge",
                    pleaseDischarge: ", please discharge",
                    regionChargePrice: " region charge price ",
                    timeRemaining: ", remaining ",
                    minutesToOptimal: " minutes until optimal discharge time, please prepare",
                    minutesToLowPrice: " minutes until low price charge time, please prepare",
                    
                    // 充电提醒弹窗英文翻译
                    chargeNotificationTitle: "Charge Reminder——NSW",
                    currentElectricityPrice: "Current electricity price ",
                    belowThresholdText: ", below threshold ",
                    pleaseChargeText: ", please charge",
                    simulateCharge: "Charge Reminder",
                    simulateDischarge: "Discharge Reminder",
                    simulateOptimal: "Optimal Discharge Time Reminder",
                    simulateLowPrice: "Low Price Charge Reminder",
                    pushNotificationTest: "Push Notification Test",
                    belowThreshold: " below threshold ",
                    aboveThreshold: " above threshold ",
                    pleaseCharge: ", please charge",
                    pleaseDischarge: ", please discharge",
                    regionPrice: "Region charging price ",
                    timeRemaining: ", ",
                    minutesToOptimal: " minutes until optimal discharge time, please prepare",
                    minutesToPrice: " minutes until ",
                    timeOpportunity: " time, please prepare",
                    simulateCharge: "Simulate Charge Alert",
                    simulateDischarge: "Simulate Discharge Alert",
                    simulateOptimal: "Simulate Optimal Alert",
                    simulatePriceAlert: "Simulate Price Alert",
                    automationConditionsSettings: "Automation Conditions Settings",
                    selectChargeTime: "Select Charge Time",
                    selectDischargeTime: "Select Discharge Time",
                    chargeTimeSlot: "Charge Time Slot",
                    dischargeTimeSlot: "Discharge Time Slot",
                    dragToAddTimeSlot: "Drag on the timeline to add time slots",
                    modal: {
                        chargeReminderTitle: "Charge Reminder Settings",
                        dischargePeakPrediction: "Discharge Peak Prediction",
                        todayPeak: "Today's Peak",
                        todaySellHigh: "Today's Sell High",
                        todayPeakPercentage: "Today's Peak Percentage",
                        bestSellSettings: "Best Sell Point Settings",
                        bestSellAdvanceTime: "Best Sell Point Advance Time",
                        reminderFrequency: "Reminder Frequency",
                        userGroup: "User Group",
                        activityLevel: "Activity Level",
                        region: "Region",
                        allRegions: "All Regions",
                        admin: "Admin",
                        operator: "Operator",
                        viewer: "Viewer",
                        vipUser: "VIP User",
                        all: "All",
                        highActivity: "High Activity",
                        mediumActivity: "Medium Activity",
                        lowActivity: "Low Activity"
                    },
                    messages: {
                        saveSuccess: "Save Successful",
                        strategyUpdated: "Push strategy updated successfully",
                        cancelled: "Cancelled",
                        editCancelled: "Edit cancelled",
                        formReset: "Form has been reset to original state",
                        validationFailed: "Validation Failed",
                        missingRegionPrices: "Please set prices for the following regions: ",
                        enterDischargePrice: "Please enter discharge notification strategy price",
                        enterChargePrice: "Please enter charge notification strategy price",
                        invalidDischargePrice: "Discharge price must be a valid positive number",
                        invalidChargePrice: "Charge price must be a valid positive number",
                        invalidFrequency: "Reminder frequency must be between 1-60 minutes",
                        selectUser: "Please select at least one user",
                        exporting: "Exporting",
                        exportingData: "Exporting push strategy data...",
                        exportSuccess: "Export Successful",
                        dataExported: "Push strategy data exported",
                        refreshSuccess: "Refresh Successful",
                        dataRefreshed: "Push strategy data updated",
                        allConfigured: "All regions configured",
                        editExisting: "Please edit existing configurations",
                        confirmDelete: "Are you sure you want to delete this region's push strategy?",
                        deleteSuccess: "Delete Successful",
                        strategyDeleted: "Push strategy deleted"
                    }
                },
                
                // Settings translations
                settings: {
                    title: "Settings",
                    buttons: {
                        edit: "Edit",
                        exitEdit: "Exit Edit",
                        save: "Save",
                        cancel: "Cancel"
                    },
                    pricePredict: {
                        title: "Price Prediction",
                        accurate: "Accurate Prediction",
                        accurateDesc: "Price deviation within",
                        moderate: "Moderate Prediction",
                        moderateDesc: "Price deviation (auto-calculated)",
                        large: "Large Deviation",
                        largeDesc: "Price deviation greater than",
                        deviationRange: "±Deviation range",
                        greaterThan: "Greater than"
                    },
                    operationAnalysis: {
                        title: "Operation Analysis",
                        sellTitle: "Sell Analysis",
                        sellOptimal: "Sell at Optimal Point",
                        sellOptimalDesc: "Above 95% of peak range",
                        sellHigh: "Sell at High Point",
                        sellHighDesc: "Peak range",
                        sellNormal: "Sell at Normal Point",
                        sellNormalDesc: "Peak range",
                        sellLow: "Low Price",
                        sellLowDesc: "Below peak",
                        buyTitle: "Charge Analysis",
                        buyOptimal: "Charge at Optimal Point",
                        buyOptimalDesc: "Within 95% above valley",
                        buyLow: "Charge at Low Price",
                        buyLowDesc: "Above valley range",
                        buyNormal: "Charge at Normal Point",
                        buyNormalDesc: "Above valley range",
                        buyHigh: "Charge at High Price",
                        buyHighDesc: "Above valley",
                        belowPeak: "Below peak",
                        peakRange: "Peak range",
                        abovePeak: "Above peak",
                        valley: "Valley",
                        aboveValley: "Above valley",
                        normal: "Normal",
                        highPoint: "High point",
                        optimalPoint: "Optimal point",
                        lowPrice: "Low price",
                        buyLowestPoint: "Charge lowest point"
                    },
                    validation: {
                        moderateRangeError: "Moderate prediction range setting error",
                        sellHighRangeError: "Sell high point range setting error",
                        sellNormalRangeError: "Sell normal point range setting error",
                        buyLowRangeError: "Charge low price range setting error",
                        buyNormalRangeError: "Charge normal price range setting error",
                        pricePredictError: "Accurate prediction threshold must be less than large deviation threshold"
                    },
                    messages: {
                        saveSuccess: "Settings saved successfully"
                    },
                    profile: {
                        title: "Profile",
                        basic: "Basic Information",
                        avatar: "Avatar",
                        changeAvatar: "Change Avatar",
                        removeAvatar: "Remove",
                        avatarHint: "Supports JPG, PNG formats, max size 2MB",
                        username: "Username"
                    },
                    email: {
                        title: "Email Settings",
                        currentEmail: "Current Email",
                        newEmail: "New Email Address"
                    },
                    password: {
                        title: "Password Settings",
                        changePassword: "Change Password",
                        oldPassword: "Current Password",
                        newPassword: "New Password",
                        confirmPassword: "Confirm New Password",
                        updatePassword: "Update Password"
                    }
                },
                
                // Profit page translations
                profit: {
                    title: "Profit",
                    pageTitle: "Profit",
                    subtitle: "Real-time monitoring and analysis of your energy trading revenue",
                    views: {
                        chart: "Chart View",
                        table: "Table View"
                    },
                    stats: {
                        userCount: "User Count",
                        totalRevenue: "Total Revenue",
                        avgProfit: "Avg Profit per User",
                        maxStationProfit: "Max Family Profit",
                        minStationProfit: "Min Family Profit",
                        comparedYesterday: "vs Yesterday",
                        comparedLastMonth: "vs Last Month",
                        comparedLastYear: "vs Last Year"
                    },
                    charts: {
                        userManagement: "User Management",
                        revenueDistribution: "Revenue Distribution",
                        dischargeAndProfit: "Power & Profit",
                        profitFormula: "(Profit = Feed-in × Price)",
                        profitRanking: "Profit Ranking"
                    },
                    ranking: {
                        top5: "Top 5",
                        bottom5: "Bottom 5"
                    },
                    table: {
                        userParticipation: "User Participation",
                        date: "Date",
                        user: "User",
                        status: "Operating Status",
                        dischargeAmount: "Actual Discharge (kwh)",
                        sellPrice: "Selling Price ($/kWh)",
                        costPrice: "Cost Price ($/kWh)",
                        profit: "Profit ($)",
                        profitPerKwh: "Profit per kWh ($)",
                        dailyAvg: "Daily Avg",
                        monthlyAvg: "Monthly Avg",
                        yearlyAvg: "Yearly Avg",
                        historicalAvg: "Historical Avg",
                        compareDaily: "Compare Daily Avg ($)",
                        compareMonthly: "Compare Monthly Avg ($)",
                        compareYearly: "Compare Yearly Avg ($)",
                        compareHistorical: "Compare Historical Avg ($)"
                    },
                    filters: {
                        all: "All",
                        active: "Active",
                        inactive: "Inactive",
                        notParticipating: "Not Participating"
                    },
                    status: {
                        active: "Active",
                        inactive: "Inactive",
                        notParticipating: "Not Participating"
                    },
                    buttons: {
                        exportData: "Export Data"
                    }
                },
                
                // Pagination translations
                pagination: {
                    info: "Total {total} items",
                    itemsPerPage: "/page",
                    showing: "Showing",
                    to: "to",
                    of: "of",
                    total: "items",
                    perPage: {
                        "10": "10/page",
                        "20": "20/page",
                        "50": "50/page", 
                        "100": "100/page"
                    },
                    goTo: "Go to",
                    page: "page"
                },
                
                // Family page translations
                family: {
                    title: "Family",
                    subtitle: "Manage and monitor energy usage for all families",
                    views: {
                        grid: "🏠 Grid View"
                    },
                    placeholder: {
                        userName: "Enter user name...",
                        allActivity: "All Activity",
                        deviceCode: "Enter device code...",
                        deviceStatus: "All Device Status",
                        allBrands: "All Brands",
                        allRegions: "All Regions",
                        meterNumber: "Enter NMI..."
                    },
                    activityStatus: {
                        active: "Active",
                        inactive: "Inactive"
                    },
                    deviceStates: {
                        charging: "Charging",
                        discharging: "Discharging",
                        standby: "Standby",
                        offline: "Offline",
                        lightOn: "Light On",
                        lightOff: "Light Off",
                        missingBattery: "Missing Battery"
                    },
                    operationMode: {
                        0: "Self used mode",
                        1: "Feed-in priority mode",
                        2: "Reserved",
                        3: "Back-up mode"
                    },
                    buttons: {
                        search: "Search",
                        reset: "Reset",
                        export: "Export Family Data",
                        exportDetail: "Export Running Data",
                        refresh: "Refresh",
                        expand: "Expand",
                        collapse: "Collapse",
                        viewDetails: "View Details",
                        runningData: "Running Data"
                    },
                    export: {
                        noSelection: "Please select at least one row to export"
                    },
                    exportDetail: {
                        title: "Export Running Data",
                        startDate: "Start Date",
                        endDate: "End Date",
                        selectDate: "Select Date",
                        rangeHint: "Date range cannot exceed 31 days",
                        endBeforeStart: "End date cannot be earlier than start date",
                        rangeExceeded: "Date range exceeds 31 days",
                        hint: "You can only export data for a single date",
                        granularity: "Data Granularity",
                        granularity5min: "5 Minutes",
                        granularity15min: "15 Minutes",
                        granularity30min: "30 Minutes",
                        granularity1hour: "1 Hour",
                        discharge: "Discharge (kWh)",
                        price: "Price (¥/MWh)",
                        profit: "Profit (¥)",
                        confirmExport: "Confirm Export",
                        selectDateError: "Please select date range",
                        exportSuccess: "Running data exported successfully",
                        noSelection: "Please select at least one row to export"
                    },
                    exportScope: {
                        label: "Users: ",
                        all: "All",
                        page: "Page",
                        pageUsers: "Users",
                        selected: "Selected",
                        items: "items"
                    },
                    table: {
                        user: "User",
                        meterNumber: "Meter No.",
                        address: "Address",
                        activity: "Activity",
                        yesterdayProfit: "Yesterday's Profit ($)",
                        todayProfit: "Today's Profit ($)",
                        totalProfit: "Total Profit ($)",
                        avgProfit: "Avg Daily Profit ($)",
                        deviceCode: "Device Code",
                        deviceStatus: "Device Status",
                        operationMode: "Operation Mode",
                        flowDirection: "Flow/Source",
                        soc: "SOC",
                        socValue: "Battery Value",
                        batteryCost: "Cost per kWh",
                        location: "Location",
                        usageDays: "Usage Days",
                        action: "Action"
                    },
                    drawer: {
                        title: "Details",
                        tabs: {
                            basicInfo: "Basic Info",
                            revenueInfo: "Profit Info",
                            operatingData: "Operating Data",
                            dispatchRecords: "Dispatch Records"
                        },
                        basicInfo: "Basic Information",
                        userName: "User Name",
                        location: "Location",
                        address: "Address",
                        meterNumber: "NMI",
                        deviceCode: "Device Code",
                        manufacturer: "Manufacturer",
                        version: "Version",
                        batteryCapacity: "Battery Capacity",
                        soc: "SOC",
                        status: "Status",
                        operatingDays: "Operating Days",
                        owner: "Owner",
                        day: "Day",
                        realtimePower: "Realtime Power",
                        todayProfit: "Today's Profit",
                        avgProfit: "Avg Daily Profit",
                        totalRevenue: "Total Revenue",
                        todayCharge: "Today's Input",
                        todayDischarge: "Today's Output",
                        totalCharge: "Total Input",
                        totalDischarge: "Total Output",
                        pvPower: "PV Power",
                        outputPower: "Output Power",
                        todayPvDirectLoad: "Today PV Direct Load",
                        totalLoadConsumption: "Total Load Consumption",
                        userInfo: "User",
                        gridInfo: "Grid",
                        todayGridPurchase: "Today's Power Consumption",
                        todayGridFeedIn: "Today's Feed-in",
                        inverterInfo: "Inverter",
                        inverterManufacturer: "Manufacturer",
                        inverterDeviceCode: "Device Code",
                        inverterVersion: "Version",
                        inverterCapacity: "Inverter Capacity",
                        batteryInfo: "Battery",
                        todayCharge: "Today's Charge",
                        todayDischarge: "Today's Discharge",
                        loadInfo: "Load",
                        pvInfo: "PV",
                        todayPvGeneration: "Today's Generation",
                        pvGenerationPower: "Generation Power",
                        forReferenceOnly: " (For Reference Only)",
                        batteryMissing: "No Battery",
                        authExpired: "Authorization Expired",
                        revenue: "Revenue",
                        discharge: "Discharge",
                        profitTrend: "Profit Trend",
                        month: "Month",
                        year: "Year",
                        socTrend: "SOC Trend",
                        chargeCycles: "Charge/Discharge Cycles",
                        operatingDataTitle: "Operating Data",
                        operations: "Operations",
                        charging: "Start Charging",
                        stopCharging: "Stop Charging",
                        discharging: "Start Discharging",
                        stopDischarging: "Stop Discharging",
                        actions: {
                            cancel: "Cancel",
                            save: "Save",
                            delete: "Delete",
                            confirm: "Confirm"
                        },
                        messages: {
                            saveSuccess: "Saved successfully",
                            deleteConfirm: "Are you sure you want to delete this record?",
                            deleteSuccess: "Deleted successfully"
                        },
                        dispatchRecords: {
                            time: "Time",
                            type: "Type",
                            status: "Status",
                            startTime: "Start Time",
                            endTime: "End Time",
                            charge: "Charge",
                            discharge: "Discharge",
                            dischargeCount: "Successful Discharge Dispatches",
                            dischargeAmount: "Discharge",
                            profit: "Profit",
                            chargeCount: "Successful Charge Dispatches",
                            chargeAmount: "Charge",
                            failedCount: "Failed Dispatches",
                            success: "Success",
                            failed: "Failed",
                            executing: "Executing",
                            successCount: "Success Count",
                            failedCountLabel: "Failed Count",
                            executingCount: "Executing Count",
                            timesCharge: " charges",
                            timesDischarge: " discharges"
                        }
                    },
                    userName1: "John Smith",
                    userName2: "Sarah Johnson",
                    userName3: "Michael Brown",
                    userName4: "Emma Davis",
                    userName5: "James Wilson",
                    userName6: "Lisa Anderson",
                    userName7: "Robert Taylor",
                    userName8: "Jennifer Martin",
                    userName9: "David Lee",
                    userName10: "Mary White"
                },
                
                // User Settings translations
                settings: {
                    title: "Settings",
                    save: "Save Changes",
                    cancel: "Cancel",
                    profile: {
                        title: "Profile Information",
                        basic: "Basic Information",
                        avatar: "Avatar",
                        changeAvatar: "Change Avatar",
                        removeAvatar: "Remove",
                        avatarHint: "Supports JPG, PNG formats, max 2MB",
                        username: "Username"
                    },
                    email: {
                        title: "Email Settings",
                        currentEmail: "Current Email",
                        newEmail: "New Email Address",
                        bindEmail: "Bind Email",
                        emailAddress: "Email Address",
                        emailPlaceholder: "Enter email address",
                        emailCode: "Email Verification Code",
                        emailCodePlaceholder: "Enter verification code",
                        sendCode: "Send Verification Code",
                        codeWillBeSent: "Verification code will be sent to your email address",
                        selectVerificationMethod: "Select Verification Method",
                        useCurrentPassword: "Use Current Password",
                        emailVerification: "Email Verification",
                        verifyCurrentEmail: "Verify Current Email",
                        verifyNewEmail: "Verify New Email",
                        verifyCurrentEmailHint: "Please verify your current email first before setting a new email",
                        newEmailCodeHint: "Verification code will be sent to your new email address",
                        verificationCode: "Verification Code",
                        profileSaved: "Profile information saved",
                        codeSent: "Verification code sent to your email",
                        currentEmailCodeSent: "Verification code sent to your current email",
                        newEmailCodeSent: "Verification code sent to your new email",
                        codeError: "Verification code incorrect",
                        currentEmailVerified: "Current email verified successfully",
                        enterCode: "Please enter verification code"
                    },
                    password: {
                        title: "Password Settings",
                        changePassword: "Change Password",
                        oldPassword: "Current Password",
                        newPassword: "New Password",
                        confirmPassword: "Confirm New Password",
                        updatePassword: "Update Password",
                        currentPasswordPlaceholder: "Enter current password",
                        newPasswordPlaceholder: "Enter new password",
                        confirmPasswordPlaceholder: "Enter new password again"
                    }
                },
                aboveThreshold: ", above threshold",
                account: "Account",
                add: "Add",
                addTimeSlot: "Add Time Slot",
                aemoTabAnalysis: "Analysis",
                aemoTabMarket: "Market",
                aiAnalyzing: "AI Analyzing",
                aiEstProfit: "Est. Profit",
                automationConditionsSettings: "Automation Conditions Settings",
                backToLogin: "Back to Login",
                batteryCondition: "Battery Condition",
                batteryCost: "Battery Cost",
                captcha: "Verification Code",
                chargeCompleteMessage: "Charging command completed",
                chargeReminder: "Charge Reminder",
                chargeStrategyTip: "Set different price thresholds for different time slots",
                chargeTimeSlot: "Charge Time Slot",
                companyInfo: "Copyright: Xuheng Electronics (Shenzhen) Co., Ltd.",
                confirmLogout: "Confirm Logout",
                confirmLogoutMessage: "Are you sure you want to logout?",
                confirmPassword: "Confirm Password",
                contactPhone: "Website Record: ICP 2021169764",
                createAccount: "Create Account",
                currentSOC: "Current SOC",
                dischargeCompleteMessage: "Discharging command completed",
                dischargeReminder: "Discharge Reminder",
                dischargeStrategyTip: "Set different price thresholds for different time slots",
                dischargeTimeSlot: "Discharge Time Slot",
                dragToAddTimeSlot: "Drag to add time slot",
                email: "Email",
                executionTimeline: "Execution Timeline",
                export: "Export",
                failureReason: "Failure Reason",
                forgotPassword: "Forgot Password?",
                logout: "Logout",
                logoutLink: "Logout",
                minutesToOptimal: "min to optimal discharge time",
                minutesToPrice: "min to reach",
                notUsed: "Not Used",
                operatorBtn: "Enter Operator Panel",
                operatorDesc: "Smart dispatch assigned stations, view reports, record history, efficient O&M.",
                operatorF1: "AI Smart Dispatch",
                operatorF2: "View assigned station data",
                operatorF3: "Energy Revenue Reports",
                operatorF4: "Dispatch History",
                operatorSubtitle: "O&M Provider",
                operatorTitle: "Operator",
                optimalReminder: "Optimal Charge Reminder",
                ownerBtn: "Enter Owner Panel",
                ownerDesc: "Create and manage stations, handle faults, assign O&M accounts, full control of station assets.",
                ownerF1: "Create stations & view operation data",
                ownerF2: "Fault viewing & handling",
                ownerF3: "Create O&M providers & assign stations",
                ownerSubtitle: "Property Owner",
                ownerTitle: "Owner",
                pageSubtitle: "Choose your role to enter the system",
                pageTitle: "Select Your Role",
                password: "Password",
                pleaseCharge: ", please charge",
                pleaseDischarge: ", please discharge",
                priceAlert: "Alert",
                recordNumber: "Contact: xuheng@alwayscontrol.com.cn",
                regionPrice: "Region charge price",
                selectChargeTime: "Select Charge Time",
                selectDischargeTime: "Select Discharge Time",
                sendResetLink: "Send Reset Link",
                signIn: "Sign In",
                stationDetails: "Station Details",
                stopChargeDischarge: "Stop Charge/Discharge",
                stopCompleteMessage: "Stop command completed",
                submitLogin: "Submit",
                submitRegister: "Submit",
                timeOpportunity: "opportunity, please prepare",
                timeRemaining: ", remaining",
                todayCharge: "Today Charge",
                todayDischarge: "Today Discharge",
                totalChargeCost: "Charge Cost",
                totalChargeCount: "Total Charges",
                totalDischargeCount: "Total Discharges",
                totalDischargeRevenue: "Discharge Revenue",
                userRegister: "User Register",
                username: "Username/Email",
                vppSubtitle: "The Future of Distributed Energy",
                vppTitle: "Virtual Power Plant",
                faultAlarm: {
                    buttons: {
                        batchProcess: "Batch Process",
                        clear: "Reset",
                        detail: "Detail",
                        export: "Export",
                        markProcessed: "Mark as Processed",
                        markUnprocessed: "Mark as Unprocessed",
                        resolve: "Resolve",
                        search: "Search",
                        selectAll: "Select All",
                    },
                    detail: {
                        title: "Alarm Detail",
                    },
                    filter: {
                        allLevels: "All Alarm Levels",
                        allStations: "All Stations",
                    },
                    levels: {
                        alarm: "Alarm",
                        fault: "Fault",
                    },
                    noData: "No Data",
                    table: {
                        actions: "Actions",
                        alarmDevice: "Alarm Device",
                        alarmLevel: "Alarm Level",
                        alarmStation: "Alarm Station",
                        alarmStatus: "Alarm Status",
                        alarmTime: "Alarm Time",
                        description: "Description",
                        recoveryTime: "Recovery Time",
                    },
                    tabs: {
                        processed: "Processed",
                        unprocessed: "Unprocessed",
                    },
                    title: "Fault Alarm",
                },
                messageCenter: {
                    buttons: {
                        refresh: "Refresh",
                    },
                },
                pushNotification: {
                    advanced: {
                        content: "NSW charge price $300, 15 min to optimal discharge",
                        title: "Optimal Charge Reminder - Advanced",
                    },
                    normal: {
                        content: "NSW charge price $300, above threshold $250, please charge",
                        title: "Charge Reminder - Normal",
                    },
                },
                report: {
                    buttons: {
                        exportData: "Export Data",
                        refresh: "Refresh",
                    },
                    compare: {
                        day: "vs Yesterday",
                    },
                    pageTitle: "Reports",
                    period: {
                        day: "Day",
                        month: "Month",
                        total: "Total",
                        year: "Year",
                    },
                    stats: {
                        avgBuyPrice: "Avg Buy Price",
                        avgSellPrice: "Avg Sell Price",
                        charge: "Charge",
                        discharge: "Discharge",
                        netProfit: "Net Profit",
                    },
                    table: {
                        avgBuyPrice: "Avg Buy Price ($/MWh)",
                        avgSellPrice: "Avg Sell Price ($/MWh)",
                        charge: "Charge (MWh)",
                        chargeCost: "Charge Cost ($)",
                        discharge: "Discharge (MWh)",
                        dischargeRevenue: "Discharge Revenue ($)",
                        netProfit: "Net Profit ($)",
                        period: "Period",
                    },
                    title: "Reports - AlwaysControl",
                    views: {
                        chart: "Chart View",
                        table: "Table View",
                    },
                },
                settings: {
                    cancel: "Cancel",
                    password: {
                        confirmPasswordPlaceholder: "Enter new password again",
                        currentPasswordPlaceholder: "Enter current password",
                        newPasswordPlaceholder: "Enter new password",
                    },
                    save: "Save Changes",
                },
                station: {
                    actions: "Actions",
                    addStation: "Add New",
                    add_addAddress: "Add Address",
                    add_cancel: "Cancel",
                    add_changeAddress: "Change",
                    add_deviceHint: "You can skip this step and add devices later",
                    add_deviceSN: "Device SN",
                    add_name: "Station Name",
                    add_nextStep: "Next",
                    add_prevStep: "Previous",
                    add_stationAddress: "Station Address",
                    add_submit: "Save",
                    add_timezone: "Timezone",
                    add_title: "Add Station",
                    allRegions: "All Regions",
                    allStatus: "All Status",
                    capacity: "Capacity (MW)",
                    cardView: "Card",
                    delete: "Delete",
                    detail: "Detail",
                    detail_backToList: "Back to List",
                    detail_basicInfo: "Basic Info",
                    detail_brandModel: "Brand & Model",
                    detail_breadcrumb: "Station Management",
                    detail_capacity: "Capacity",
                    detail_commStatus: "Comm Status",
                    detail_controlMode: "Control Mode",
                    detail_coordinates: "Coordinates",
                    detail_fcasStatus: "FCAS Status",
                    detail_nemPrice: "NEM Price",
                    detail_operationLog: "Operation Log",
                    detail_realtimePower: "Realtime Power",
                    detail_region: "Region",
                    detail_remoteControl: "Remote Control",
                    detail_revenueTrend: "Revenue Trend",
                    detail_runMode: "Run Mode",
                    detail_runTrend: "Run Trend",
                    detail_stationId: "Station ID",
                    dispatch_action: "Dispatch Action",
                    dispatch_duration: "Duration",
                    dispatch_operator: "Operator",
                    dispatch_power: "Dispatch Power",
                    dispatch_result: "Result",
                    dispatch_source: "Source",
                    dispatch_time: "Dispatch Time",
                    edit: "Edit",
                    map_cancel: "Cancel",
                    map_clickToSelect: "Click map to select",
                    map_confirm: "Confirm",
                    map_selectAddress: "Select Station Address",
                    offline: "Offline",
                    onlineCharging: "Online - Charging",
                    onlineDischarging: "Online - Discharging",
                    onlineIdle: "Online - Idle",
                    pageTitle: "Stations",
                    power: "Power (MW)",
                    profit_chartTitle: "Profit Chart",
                    profit_daily: "Daily Profit",
                    profit_monthly: "Monthly Profit",
                    region: "Region",
                    reset: "Reset",
                    search: "Search",
                    soc: "SOC",
                    stationName: "Station Name",
                    status: "Status",
                    step1_title: "Basic Info",
                    step2_title: "Add Device",
                    tab_dispatch: "Dispatch",
                    tab_dispatchHistory: "Dispatch History",
                    tab_equipment: "Equipment",
                    tab_equipmentList: "Equipment List",
                    tab_overview: "Overview",
                    tab_profit: "Profit",
                    tab_profitOverview: "Profit Overview",
                    tableView: "Table",
                    todayProfit: "Today Net Profit",
                    totalProfit: "Total Net Profit",
                    status_online: "Online",
                    status_offline: "Offline",
                    status_charging: "Charging",
                    status_discharging: "Discharging",
                    status_idle: "Idle",
                    searchPlaceholder: "Search station name...",
                    mode_auto: "Auto",
                    mode_manual: "Manual",
                    mode_auto_title: "Auto Mode",
                    mode_manual_title: "Manual Mode",
                },

                // Operation Log Detail translations
                operationLogDetail: {
                    filter: {
                        all: "All Operations",
                        auto: "Auto Operations",
                        manual: "Manual Operations"
                    },
                    dispatchRecord: "Dispatch Record",
                    autoManagement: "Auto Management",
                    dataLoaded: "Data Loaded",
                    autoStatus: "Auto Status",
                    autoOn: "Auto Mode On",
                    autoOff: "Auto Mode Off",
                    chart: {
                        actualPrice: "Actual Price",
                        forecastPrice: "Forecast Price",
                        autoCharge: "Auto Charge",
                        autoDischarge: "Auto Discharge",
                        manualCharge: "Manual Charge",
                        manualDischarge: "Manual Discharge",
                        dispatchType: "Dispatch Type",
                        custodyBaseline: "Custody Baseline"
                    }
                },

                // Dashboard specific translations
                dashboard: {
                    totalChargeLabel: "Total Charges",
                    totalDischargeLabel: "Total Discharges",
                    chargeCost: "Charge Cost",
                    dischargeRevenue: "Discharge Revenue",
                    netProfit: "Net Profit",
                    aiCustody: "AI Custody",
                    hour: "H",
                    minute: "M",
                    second: "S",
                    currentSOC: "Current SOC",
                    batteryCost: "Battery Cost",
                    todayProfit: "Today's Profit",
                    todayCharge: "Today Charge",
                    todayDischarge: "Today Discharge",
                    market: "Market",
                    analysis: "Analysis",
                    aiAnalyzing: "AI Analyzing",
                    aiReanalyzing: "AI Re-analyzing...",
                    aiActive: "AI Active",
                    aiEstProfit: "Est. Profit",
                    day: "Day",
                    monthShort: "Month",
                    year: "Year",
                    cumulative: "Total",
                    dataCutoff: "* Data as of ",
                    timesUnit: "",
                    dailyAvg: "Daily avg",
                    dispatchableDevices: "Dispatchable Devices",
                    estimatedTime: "Est. Time",
                    duration15to30: "15-30 min",
                    type: "Type",
                    add: "Add",
                    multiPeriodStrategy: "Multi-Period Price Strategy",
                    aiCustodySettings: "AI Custody Settings",
                    autoModeType: "Auto Mode Type",
                    aiCharge: "AI Charge",
                    aiDischarge: "AI Discharge",
                    chargeStrategyTip: "Set different price thresholds for different time periods, system monitors all periods simultaneously",
                    dischargeStrategyTip: "Set different price thresholds for different time periods, system monitors all periods simultaneously",
                    addTimeSlot: "Add Time Slot",
                    batteryCondition: "Battery Condition",
                    chargeReminder: "Charge Alert",
                    dischargeReminder: "Discharge Alert",
                    optimalReminder: "Optimal Charge Alert",
                    regionPrice: "region charge price",
                    highPrice: "High",
                    currentPriceLabel: "Current Price",
                    pleaseCharge: "please charge",
                    pleaseDischarge: "please discharge",
                    aboveThreshold: "above threshold",
                    belowThreshold: "below threshold",
                    to: "to",
                    estCost: "Est. Cost",
                    estRevenue: "Est. Revenue",
                    time: "Time",
                    avgPrice: "Avg Price",
                    noChargeWindow: "No charge window",
                    noDischargeWindow: "No discharge window",
                    price: "Price",
                    forecast: "Forecast",
                    batteryCostLine: "Battery Cost",
                    costPrefix: "Cost $",
                    analyzing: "Analyzing...",
                    monitoringMarket: "🤖 Monitoring market...",
                    aiAnalyzingEmoji: "🤖 AI analyzing...",
                    expectedExecution: "🤖 Est.",
                    executionInProgress: "⚡",
                    executingCharge: "charging",
                    executingDischarge: "discharging",
                    chargeLabel: "CHG",
                    dischargeLabel: "DCH",
                    stopLabel: "STOP",
                    autoOperation: "Auto Operation",
                    aiChargeStarted: "AI Charge started",
                    aiDischargeStarted: "AI Discharge started",
                    settingsSaved: "AI Custody settings saved",
                    chargeAction: "Charge",
                    dischargeAction: "Discharge",
                    chargeConditionLabel: "Charge Condition",
                    dischargeConditionLabel: "Discharge Condition",
                    noTimeSlots: "No time slots set",
                    timeSlotCount: " time slots",
                    newTimeSlotAdded: "✓ New time slot added",
                    timeSlotDeleted: "✓ Time slot deleted",
                    allTimeSlotsCleared: "✓ All time slots cleared",
                    dragToAddTimeSlot: "Click empty area to add time slot",
                    noChargeTimeSlots: "No charge time slots",
                    noDischargeTimeSlots: "No discharge time slots",
                    chargeTime: "Charge Time",
                    dischargeTime: "Discharge Time",
                    addTimeSegment: "+ Add Time Slot",
                    edit: "Edit",
                    delete: "Delete",
                    addChargeTimeSlot: "Add Charge Time Slot",
                    addDischargeTimeSlot: "Add Discharge Time Slot",
                    editChargeTimeSlot: "Edit Charge Time Slot",
                    editDischargeTimeSlot: "Edit Discharge Time Slot",
                    startTime: "Start Time",
                    endTime: "End Time",
                    confirm: "Confirm",
                    selectStartEndTime: "Please select start and end time",
                    timeSlotOverlap: "Time slots overlap, please reselect",
                    confirmDeleteTimeSlot: "Delete this time slot?",
                    settingsSavedSuccess: "Settings saved!",
                    saveSettingsFailed: "Save failed: ",
                    openSettingsError: "Error opening settings: ",
                    settingsCancelled: "Settings cancelled",
                    settingsSavedShort: "Settings saved",
                    selectTimeOnTimeline: "Please select time slots on timeline first",
                    savedRegionsCount: "Saved automation conditions for {count} regions",
                    device: "Device",
                    priceUnit: "Price ($/MWh)",
                    demandUnit: "Demand (MW)",
                    baseOnDataAnalysis: "Based on {time} data",
                    exportTime: "Export Time",
                    exportSuccess: "Export successful!",
                    noDataToExport: "No data to export",
                    unknownError: "Unknown error",
                    failureReason: "Failure Reason",
                    networkTimeout: "Network timeout",
                    deviceOffline: "Device offline",
                    commandFormatError: "Command format error",
                    deviceBusy: "Device busy",
                    insufficientPower: "Insufficient power",
                    protocolError: "Protocol error",
                    noResponse: "No response",
                    paramValidationFailed: "Parameter validation failed",
                    crcError: "CRC error",
                    deviceFault: "Device fault",
                    commandIssued: "Command Issued",
                    devicesResponded: " devices confirmed receipt",
                    executionStarted: "Execution Started",
                    devicesStartedExecution: " devices started execution",
                    partialCompletion: "Partial Completion",
                    devicesCompleted: " devices completed",
                    devicesConfirmed: " devices confirmed receipt",
                    systemSentCommand: "System sent operation command to all devices",
                    monthLabels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                    daySuffix: "",
                    reminderTitle: "{action} Alert — {region}",
                    optimalTimingTitle: "Optimal {action} — {region}",
                    minutesUnit: " min",
                    optimalTimeLabel: "Optimal {action} time",
                    priceAboveThreshold: "above",
                    priceBelowThreshold: "below",
                    confirmAutoMode: "Confirm Enable AI Custody",
                    autoModeDesc: "Once enabled, AI will analyze market data in real-time, automatically finding optimal charge/discharge timing to maximize your revenue.",
                    aiPriceAnalysis: "Real-time Price Analysis",
                    aiPriceAnalysisDesc: "Continuously monitoring AEMO spot prices and demand trends",
                    aiSmartCharge: "Smart Charge Decisions",
                    aiSmartChargeDesc: "Automatically identifies low-price windows for lowest cost charging",
                    aiSmartDischarge: "Optimal Discharge Timing",
                    aiSmartDischargeDesc: "Precisely captures high-price periods to maximize feed-in revenue",
                    aiBatteryManage: "Battery Health Management",
                    aiBatteryManageDesc: "Intelligently manages SOC range, balancing revenue and battery life",
                    aiCustodyHint: "AI runs 24/7. You can manually intervene or disable custody at any time",
                    confirmDisableAutoMode: "Confirm Disable AI Custody",
                    disableAutoModeDesc: "After disabling AI Custody, AI will stop smart analysis. You need to control charge/discharge manually.",
                    disableAutoModeWarningText: "After disabling AI Custody, you may miss AI-recommended optimal charge/discharge timing, affecting revenue.",
                    socChangeMessage: "Current region is {status}, apply {socType} change to {value}%?",
                    enablePriceCondition: "Enable Price Condition",
                    mustKeepOneTimeSlot: "At least one time slot must be kept",
                    timeSlotLabel: "Time Slot",
                    pageTitle: "Energy Management",
                    stationManagement: "Dispatch Center",
                    todayChargeLabel: "Today Charge",
                    chargeEnergy: "Charge (MWh)",
                    dischargeEnergy: "Discharge (MWh)",
                    chargeCostLegend: "Charge Cost ($)",
                    dischargeRevenueLegend: "Discharge Revenue ($)",
                    netProfitLegend: "Net Profit ($)",
                    todayDischargeLabel: "Today Discharge",
                    costLabel: "Cost",
                    revenueLabel: "Revenue",
                    netProfitLabel: "Net Profit",
                    vsYesterday: "vs Yesterday",
                    modal: {
                        operationType: "Operation Type",
                        currentSOC: "Current SOC",
                        currentPrice: "Current Price",
                        avgBatteryCost: "Avg Battery Cost",
                        estFullTime: "Est. Full Charge Time",
                        estCost: "Est. Cost"
                    },
                    chargeWarning: "Charging will begin for all connected devices, consuming grid power.",
                    spotPrice: "Spot Price",
                    currentDemand: "Current Demand",
                    forecastPrice: "Forecast Price",
                    forecastDemand: "Forecast Demand",
                    demand: "Demand",
                    generation: "Generation",
                    powerAndProfit: "Power & Profit",
                    profitFormula: "(Profit = Feed-in × Price)",
                    systemOverview: "System Overview",
                    totalCapacity: "Total Capacity",
                    onlineDevices: "Online Devices",
                    networkStatus: "Network Status",
                    normal: "Normal",
                    totalFeedIn: "Total Feed-in",
                    totalRevenue: "Total Revenue",
                    totalProfitLabel: "Total Profit",
                    family: "Family",
                    installedCapacity: "Installed Capacity",
                    dischargeStats: "Discharge Stats",
                    feedInAmount: "Feed-in",
                    consumption: "Consumption",
                    aboveTarget: "Above Target",
                    belowTarget: "Below Target",
                    priceStats: "Price Stats",
                    todayPrice: "Today Price",
                    avgDischargePrice: "Avg Discharge Price",
                    sellPrice: "Sell Price",
                    todayLow: "Today Low",
                    todayHigh: "Today High",
                    confirmChargeTitle: "Confirm Charge Operation",
                    confirmChargeMsg: "Are you sure you want to charge?",
                    confirmChargeBtn: "Confirm Charge",
                    operationType: "Operation Type",
                    estimatedPower: "Est. Power",
                    estimatedProfit: "Est. Profit",
                    chargeProgress: "Charge Progress",
                    executingOperation: "Executing operation...",
                    targetDevice: "Target Device",
                    warning: "Warning",
                    reading: "Reading...",
                    waiting: "Waiting...",
                    commandSuccess: "Command Sent Successfully",
                    executingCommand: "Executing your command...",
                    deviceResponseStats: "Device Response Stats",
                    successRate: "Success Rate",
                    viewDetails: "View Details",
                    operationDetails: "Operation Details",
                    basicInfo: "Basic Info",
                    affectedDevices: "Affected Devices",
                    operationTime: "Operation Time",
                    executionStatus: "Execution Status",
                    export: "Export",
                    commandSent: "Sent",
                    executing: "Executing",
                    commandFailed: "Failed",
                    failCount: "Fail Count",
                    status: "Status",
                    between: "Between",
                    saveSettings: "Save Settings",
                    deviceCommand: "Device Command",
                    immediately: "Now",
                    confirmExecute: "Confirm Execute",
                    operationCompleteReport: "Operation complete. Device response report:",
                    clickToViewDetails: "💡 Click numbers to view device details",
                    socSettings: "SOC Settings",
                    chargeStopSOC: "Charge Stop SOC",
                    dischargeStopSOC: "Discharge Stop SOC",
                    autoConditions: "Auto Conditions",
                    timeConditionSettings: "Time Condition Settings",
                    automationConditions: "Automation Conditions",
                    region: "Region",
                    chargeCondition: "Charge Condition",
                    dischargeCondition: "Discharge Condition",
                    timeCondition: "Time Condition",
                    priceCondition: "Price Condition",
                    stopSOC: "Stop SOC",
                },
            },
            
            ja: {
                // ナビゲーション
                nav: {
                    home: 'ホーム',
                    profit: '利益',
                    family: 'ファミリー',
                    analysis: '分析',
                    organization: '組織',
                    pushStrategy: 'プッシュ戦略',
                    operationLog: '操作ログ',
                    messageCenter: 'メッセージセンター'
                },
                
                // ホームページ
                home: "ホーム",
                station: "ステーション管理",
                highestPriceRegion: "最高価格地域：",
                todayLow: "本日最低",
                todayHigh: "本日最高",
                charge: "充電",
                discharge: "放電",
                family: "家庭",
                availableHomes: "可放电家庭",
                availablePower: "放電可能量",
                estimatedProfit: "利益",
                todayDischargeHomes: "本日放電家庭",
                discharged: "放電済み",
                actualDischarge: "実際放電量",
                profit: "利益($)",
                market: "市場",
                map: "マップ",
                autoSwitch: "自動切替",
                currentSpotPrice: "現在のスポット価格",
                currentDemand: "現在の需要",
                forecastPrice: "予測価格",
                forecastDemand: "予測需要",
                demand: "需要",
                generation: "発電",
                averagePrice: "平均価格",
                maxPrice: "最高価格",
                minPrice: "最低価格",
                priceFluctuation: "価格変動",
                comparedYesterday: "昨日比",
                within24h: "24時間以内",
                powerRevenueTrend: "放電と収益トレンド",
                systemOverview: "システム概要",
                totalCapacity: "総容量",
                onlineDevices: "オンラインデバイス",
                networkStatus: "ネットワーク状態",
                normal: "正常",
                totalDischarge: "累計放電",
                totalRevenue: "累計収益",
                totalHomes: "家庭",
                totalInstall: "設置容量",
                totalActualDischarge: "累計実際放電",
                totalProfit: "累計利益",
                cumulativePrice: "累積価格",
                actualDischargeRate: "実際放電率",
                today: "今日",
                week: "今週",
                month: "今月",
                custom: "カスタム",
                refresh: "更新",
                charging: "充電中",
                discharging: "放電中",
                standby: "待機",
                offline: "オフライン",
                active: "アクティブ",
                device: "デバイス",
                status: "状態",
                region: "地域",
                state: "州",
                deviceCount: "デバイス数",
                normalOperation: "正常動作",
                price: "価格",
                historicalPrice: "履歴価格",
                predictedPrice: "予測価格",
                predictedDemand: "予測需要",
                operationConfirm: "操作確認",
                confirmMessage: "この操作を実行してもよろしいですか？",
                operationType: "操作タイプ",
                targetDevices: "対象デバイス",
                estimatedPower: "予想電力",
                currentPrice: "現在価格",
                estimatedDuration: "予想時間",
                estimatedCost: "予想コスト/利益",
                cancel: "キャンセル",
                stop: "停止",
                units: "個",
                comparedToYesterday: "昨日比",
                currentCumulativePrice: "現在の累積価格",
                forecastCumulativePrice5min: "予測累積価格（5分）",
                thresholdStatus: "閾値状態",
                notExceeded: "閾値未満",
                confirmExecute: "実行確認",
                operationSuccess: "指令送信成功",
                systemExecuting: "システムが操作指令を実行中...",
                devicesDispatched: "指令送信",
                devicesReceived: "指令受信",
                devicesActivated: "アクティベート成功",
                successRate: "成功率",
                close: "閉じる",
                viewDetails: "詳細表示",
                totalDevices: "総デバイス数",
                offlineDevices: "オフラインデバイス",
                dispatchedDevices: "送信デバイス",
                successfullyDispatched: "送信成功",
                executing: "実行中",
                successStatus: "成功",
                failedStatus: "失敗",
                failed: "送信失敗",
                failedDevices: "送信失敗デバイス",
                successDevices: "送信成功デバイス",
                executingDevices: "実行中のデバイス",
                nmi: "NMI",
                failureCount: "失敗回数",
                status: "ステータス",
                success: "送信成功",
                totalCount: "総数",
                family: "家庭",
                
                // 通知センター
                notification: {
                    center: '通知センター',
                    all: 'すべて',
                    alert: 'アラート',
                    system: 'システム',
                    operation: '操作',
                    markAllRead: 'すべて既読',
                    clear: 'クリア',
                    viewMore: 'もっと見る',
                    markRead: '既読にする',
                    delete: '削除',
                    noMessages: 'メッセージがありません',
                    justNow: 'たった今',
                    minutesAgo: '分前',
                    hoursAgo: '時間前'
                },
                
                // 操作ログページ
                operationLog: {
                    title: '操作ログ',
                    operator: 'オペレーター',
                    selectTime: '時間選択',
                    operationCommand: '操作コマンド',
                    placeholder: {
                        operator: 'オペレーター名を入力',
                        time: '時間を選択',
                        command: 'コマンドを選択'
                    },
                    commands: {
                        charge: '充電',
                        discharge: '放電',
                        stopCharge: '充電停止',
                        stopDischarge: '放電停止'
                    },
                    table: {
                        time: '時間',
                        command: 'コマンド',
                        operator: 'オペレーター',
                        stations: 'ステーション',
                        success: '成功',
                        failed: '失敗',
                        action: 'アクション',
                        details: '詳細'
                    },
                    buttons: {
                        search: '検索',
                        reset: 'リセット',
                        clear: 'クリア',
                        confirm: '確認'
                    },
                    pagination: {
                        total: '合計 {count} 件',
                        page: 'ページ',
                        goto: 'ジャンプ'
                    },
                    drawer: {
                        title: '操作詳細',
                        basicInfo: '基本情報',
                        stationDetails: 'ステーション詳細',
                        timeline: 'タイムライン',
                        overview: '操作概要',
                        totalStations: '総ステーション数',
                        successCount: '成功数',
                        failedCount: '失敗数',
                        successRate: '成功率',
                        operationTime: '操作時間',
                        operationCommand: '操作コマンド',
                        operationNumber: '操作番号',
                        executionStatus: '実行状態',
                        stationExecution: 'ステーション実行詳細',
                        executionTimeline: '実行タイムライン',
                        success: '成功',
                        failed: '失敗',
                        allSuccess: 'すべて成功',
                        partialSuccess: '部分成功',
                        mostlyFailed: 'ほとんど失敗'
                    },
                    toast: {
                        searchComplete: '検索完了',
                        resetComplete: 'リセット完了',
                        foundRecords: '{count} 件見つかりました',
                        searchCleared: '検索条件をクリアしました',
                        dateSelected: '日付選択: {date}',
                        error: 'エラー',
                        notFound: '操作記録が見つかりません'
                    }
                },
                
                // 日付ピッカー
                datePicker: {
                    weekdays: ['日', '月', '火', '水', '木', '金', '土'],
                    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
                    clear: 'クリア',
                    confirm: '確認',
                    selectDate: '日付選択'
                }
            },
            
            ko: {
                // 내비게이션
                nav: {
                    home: '홈',
                    profit: '수익',
                    family: '가족',
                    analysis: '분석',
                    organization: '조직',
                    pushStrategy: '푸시 전략',
                    operationLog: '작업 로그',
                    messageCenter: '메시지 센터'
                },
                
                // 홈페이지
                home: "홈",
                station: "스테이션 관리",
                highestPriceRegion: "최고 가격 지역:",
                todayLow: "오늘 최저",
                todayHigh: "오늘 최고",
                charge: "충전",
                discharge: "방전",
                family: "가족",
                availableHomes: "가족",
                availablePower: "방전 가능량",
                estimatedProfit: "수익",
                todayDischargeHomes: "오늘 방전 가정",
                discharged: "방전됨",
                actualDischarge: "실제 방전량",
                profit: "수익($)",
                market: "시장",
                map: "지도",
                autoSwitch: "자동 전환",
                currentSpotPrice: "현재 현물 가격",
                currentDemand: "현재 수요",
                forecastPrice: "예측 가격",
                forecastDemand: "예측 수요",
                demand: "수요",
                generation: "발전",
                averagePrice: "평균 가격",
                maxPrice: "최고 가격",
                minPrice: "최저 가격",
                priceFluctuation: "가격 변동",
                comparedYesterday: "어제 대비",
                within24h: "24시간 이내",
                powerRevenueTrend: "방전 및 수익 동향",
                systemOverview: "시스템 개요",
                totalCapacity: "총 용량",
                onlineDevices: "온라인 장치",
                networkStatus: "네트워크 상태",
                normal: "정상",
                totalDischarge: "누적 방전",
                totalRevenue: "누적 수익",
                totalHomes: "가족",
                totalInstall: "설치 용량",
                totalActualDischarge: "누적 실제 방전",
                totalProfit: "누적 수익",
                cumulativePrice: "누적 가격",
                actualDischargeRate: "실제 방전율",
                today: "오늘",
                week: "이번 주",
                month: "이번 달",
                custom: "사용자 정의",
                refresh: "새로고침",
                charging: "충전 중",
                discharging: "방전 중",
                standby: "대기",
                offline: "오프라인",
                active: "활성",
                device: "장치",
                status: "상태",
                region: "지역",
                state: "주",
                deviceCount: "장치 수",
                normalOperation: "정상 작동",
                price: "가격",
                historicalPrice: "과거 가격",
                predictedPrice: "예측 가격",
                predictedDemand: "예측 수요",
                operationConfirm: "작업 확인",
                confirmMessage: "이 작업을 실행하시겠습니까?",
                operationType: "작업 유형",
                targetDevices: "대상 장치",
                estimatedPower: "예상 전력",
                currentPrice: "현재 가격",
                estimatedDuration: "예상 시간",
                estimatedCost: "예상 비용/수익",
                cancel: "취소",
                stop: "중지",
                units: "개",
                comparedToYesterday: "어제대비",
                currentCumulativePrice: "현재 누적 가격",
                forecastCumulativePrice5min: "예측 누적 가격 (5분)",
                thresholdStatus: "임계값 상태",
                notExceeded: "임계값 미만",
                confirmExecute: "실행 확인",
                operationSuccess: "명령 전송 성공",
                systemExecuting: "시스템이 작업 명령을 실행 중...",
                devicesDispatched: "명령 전송",
                devicesReceived: "명령 수신",
                devicesActivated: "활성화 성공",
                successRate: "성공률",
                close: "닫기",
                viewDetails: "세부정보 보기",
                totalDevices: "총 장치 수",
                offlineDevices: "오프라인 장치",
                dispatchedDevices: "전송 장치",
                successfullyDispatched: "전송 성공",
                executing: "실행 중",
                successStatus: "성공",
                failedStatus: "실패",
                failed: "전송 실패",
                failedDevices: "전송 실패 장치",
                successDevices: "전송 성공 장치",
                executingDevices: "실행 중인 장치",
                nmi: "NMI",
                failureCount: "실패 횟수",
                status: "상태",
                success: "전송 성공",
                totalCount: "총 개수",
                family: "가족",
                
                // 알림 센터
                notification: {
                    center: '알림 센터',
                    all: '전체',
                    alert: '경고',
                    system: '시스템',
                    operation: '작업',
                    markAllRead: '모두 읽음',
                    clear: '지우기',
                    viewMore: '더 보기',
                    markRead: '읽음 표시',
                    delete: '삭제',
                    noMessages: '메시지가 없습니다',
                    justNow: '방금',
                    minutesAgo: '분 전',
                    hoursAgo: '시간 전'
                },
                
                // 작업 로그 페이지
                operationLog: {
                    title: '작업 로그',
                    operator: '운영자',
                    selectTime: '시간 선택',
                    operationCommand: '작업 명령',
                    placeholder: {
                        operator: '운영자 이름 입력',
                        time: '시간 선택',
                        command: '명령 선택'
                    },
                    commands: {
                        charge: '충전',
                        discharge: '방전',
                        stopCharge: '충전 중지',
                        stopDischarge: '방전 중지'
                    },
                    table: {
                        time: '시간',
                        command: '명령',
                        operator: '운영자',
                        stations: '스테이션',
                        success: '성공',
                        failed: '실패',
                        action: '작업',
                        details: '세부정보'
                    },
                    buttons: {
                        search: '검색',
                        reset: '재설정',
                        clear: '지우기',
                        confirm: '확인'
                    },
                    pagination: {
                        total: '총 {count} 항목',
                        page: '페이지',
                        goto: '이동'
                    },
                    drawer: {
                        title: '작업 세부정보',
                        basicInfo: '기본 정보',
                        stationDetails: '스테이션 세부정보',
                        timeline: '타임라인',
                        overview: '작업 개요',
                        totalStations: '총 스테이션 수',
                        successCount: '성공 수',
                        failedCount: '실패 수',
                        successRate: '성공률',
                        operationTime: '작업 시간',
                        operationCommand: '작업 명령',
                        operationNumber: '작업 번호',
                        executionStatus: '실행 상태',
                        stationExecution: '스테이션 실행 세부정보',
                        executionTimeline: '실행 타임라인',
                        success: '성공',
                        failed: '실패',
                        allSuccess: '모두 성공',
                        partialSuccess: '부분 성공',
                        mostlyFailed: '대부분 실패'
                    },
                    toast: {
                        searchComplete: '검색 완료',
                        resetComplete: '재설정 완료',
                        foundRecords: '{count}개 레코드 찾음',
                        searchCleared: '검색 조건 클리어',
                        dateSelected: '날짜 선택: {date}',
                        error: '오류',
                        notFound: '작업 기록을 찾을 수 없음'
                    }
                },
                
                // 날짜 선택기
                datePicker: {
                    weekdays: ['일', '월', '화', '수', '목', '금', '토'],
                    months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
                    clear: '지우기',
                    confirm: '확인',
                    selectDate: '날짜 선택'
                }
            }
        };
    }
    
    createLanguageSelectorHTML() {
        const selectorHTML = `
            <div class="language-selector" id="${this.containerId}">
                <div class="language-current" onclick="window.i18n.toggle()">
                    <span class="language-flag">${this.supportedLanguages[this.currentLanguage].flag}</span>
                    <span class="language-name" id="currentLanguageName">${this.supportedLanguages[this.currentLanguage].nativeName}</span>
                    <span class="language-arrow">▼</span>
                </div>
                <div class="language-dropdown" id="languageDropdown" style="display: none;">
                    ${Object.keys(this.supportedLanguages).map(code => `
                        <div class="language-option ${code === this.currentLanguage ? 'active' : ''}" 
                             onclick="window.i18n.setLanguage('${code}')">
                            <span class="language-flag">${this.supportedLanguages[code].flag}</span>
                            <span class="language-name">${this.supportedLanguages[code].nativeName}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        // 插入到header-right中角色切换按钮前面
        const headerRight = document.querySelector('.header-right');
        if (headerRight) {
            const roleBtn = headerRight.querySelector('.role-switch-btn');
            if (roleBtn) {
                roleBtn.insertAdjacentHTML('beforebegin', selectorHTML);
            } else {
                headerRight.insertAdjacentHTML('afterbegin', selectorHTML);
            }
        }
        
        // 设置全局实例引用
        window.i18n = this;
    }
    
    bindEvents() {
        // 点击外部区域关闭下拉框
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-selector')) {
                this.closeDropdown();
            }
        });
        
        // ESC键关闭下拉框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeDropdown();
            }
        });
    }
    
    toggle() {
        const dropdown = document.getElementById('languageDropdown');
        if (!dropdown) return;
        
        if (dropdown.style.display === 'none') {
            dropdown.style.display = 'block';
            setTimeout(() => dropdown.classList.add('show'), 10);
        } else {
            this.closeDropdown();
        }
    }
    
    closeDropdown() {
        const dropdown = document.getElementById('languageDropdown');
        if (!dropdown) return;
        
        dropdown.classList.remove('show');
        setTimeout(() => {
            dropdown.style.display = 'none';
        }, 300);
    }
    
    setLanguage(language) {
        if (!this.supportedLanguages[language]) {
            console.warn(`Language ${language} is not supported`);
            return;
        }
        
        const oldLanguage = this.currentLanguage;
        this.currentLanguage = language;
        
        // 保存到本地存储
        this.saveLanguageToStorage(language);
        
        // 更新UI
        this.updateLanguageSelector();
        this.updatePageTexts();
        this.closeDropdown();
        
        // Update HTML lang attribute
        document.documentElement.lang = language === 'zh' ? 'zh-CN' : language;
        
        // 通知观察者
        this.notifyObservers(language, oldLanguage);
        
        // Dispatch language change event for components to listen
        const languageChangeEvent = new CustomEvent('languageChanged', {
            detail: { newLanguage: language, oldLanguage: oldLanguage }
        });
        document.dispatchEvent(languageChangeEvent);
        
        // 重新渲染需要多语言的组件
        this.reloadComponents();

        // 新增：切换语言时同步刷新导航栏
        if (window.headerNav && typeof window.headerNav.updateTexts === 'function') {
            window.headerNav.updateTexts();
        }
        
        // 强制更新页面所有翻译文本，避免页面刷新导致的问题
        setTimeout(() => {
            this.updatePageTexts();
        }, 50);
        
        // 额外的延迟更新，确保所有内容都被翻译
        setTimeout(() => {
            this.updatePageTexts();
        }, 300);
    }
    
    updateLanguageSelector() {
        const currentName = document.getElementById('currentLanguageName');
        const currentFlag = document.querySelector('.language-current .language-flag');
        
        if (currentName) {
            currentName.textContent = this.supportedLanguages[this.currentLanguage].nativeName;
        }
        
        if (currentFlag) {
            currentFlag.textContent = this.supportedLanguages[this.currentLanguage].flag;
        }
        
        // 更新选项状态
        document.querySelectorAll('.language-option').forEach(option => {
            option.classList.remove('active');
        });
        
        const activeOption = document.querySelector(`[onclick="window.i18n.setLanguage('${this.currentLanguage}')"]`);
        if (activeOption) {
            activeOption.classList.add('active');
        }
    }
    
    updatePageTexts() {
        
        // 首先处理强制翻译元素 (data-text-zh 和 data-text-en)
        const forceTranslateElements = document.querySelectorAll('[data-text-zh][data-text-en]');
        
        forceTranslateElements.forEach(element => {
            const zhText = element.getAttribute('data-text-zh');
            const enText = element.getAttribute('data-text-en');
            element.textContent = this.currentLanguage === 'zh' ? zhText : enText;
        });
        
        // 然后更新所有标记了 data-i18n 的元素
        const dataI18nElements = document.querySelectorAll('[data-i18n]');
        
        dataI18nElements.forEach(element => {
            // 如果元素已经有强制翻译属性，跳过
            if (element.hasAttribute('data-text-zh') && element.hasAttribute('data-text-en')) {
                return;
            }
            
            const key = element.getAttribute('data-i18n');
            const text = this.getText(key);
            if (text !== key) { // 只有找到翻译时才更新
                if (element.tagName === 'INPUT' && (element.type === 'text' || element.type === 'search')) {
                    element.placeholder = text;
                } else {
                    element.textContent = text;
                }
            }
        });

        // 新增：批量替换所有 data-i18n-key
        const dataI18nKeyElements = document.querySelectorAll('[data-i18n-key]');
        
        dataI18nKeyElements.forEach(el => {
            const key = el.getAttribute('data-i18n-key');
            const text = this.getText(key);
            if (text !== key) {
                if (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'search')) {
                    el.placeholder = text;
                } else if (el.tagName === 'TITLE') {
                    el.textContent = text;
                } else {
                    el.textContent = text;
                }
            }
        });
        
        // 新增：处理 data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const text = this.getText(key);
            if (text !== key) {
                el.placeholder = text;
            }
        });
        
        // 处理 select option 的翻译
        document.querySelectorAll('option[data-i18n]').forEach(option => {
            const key = option.getAttribute('data-i18n');
            const text = this.getText(key);
            if (text !== key) {
                option.textContent = text;
            }
        });

        // 更新页面标题
        const pageTitle = this.getText('operationLog.title');
        if (pageTitle && pageTitle !== 'operationLog.title') {
            document.title = `${pageTitle} - U Energy`;
        }
    }
    
    getText(key, params = {}) {
        const keys = key.split('.');
        let text = this.translations[this.currentLanguage];
        
        
        for (const k of keys) {
            if (text && typeof text === 'object' && k in text) {
                text = text[k];
            } else {
                // fallback to default language
                text = this.translations[this.defaultLanguage];
                for (const fallbackKey of keys) {
                    if (text && typeof text === 'object' && fallbackKey in text) {
                        text = text[fallbackKey];
                    } else {
                        return key; // 返回原始key作为fallback
                    }
                }
                break;
            }
        }
        
        if (typeof text !== 'string') {
            return key;
        }
        
        // 替换参数
        const result = text.replace(/{(\w+)}/g, (match, param) => {
            return params[param] !== undefined ? params[param] : match;
        });
        
        return result;
    }
    
    // 添加观察者
    addObserver(callback) {
        this.observers.add(callback);
    }
    
    // 移除观察者
    removeObserver(callback) {
        this.observers.delete(callback);
    }
    
    // 通知所有观察者
    notifyObservers(newLanguage, oldLanguage) {
        this.observers.forEach(callback => {
            try {
                callback(newLanguage, oldLanguage);
            } catch (error) {
                console.error('Error in i18n observer:', error);
            }
        });
    }
    
    // 重新加载组件
    reloadComponents() {
        // 重新渲染消息中心
        if (window.notificationCenter) {
            window.notificationCenter.updateTexts();
        }
        
        // 重新渲染抽屉组件
        if (window.operationDrawer) {
            window.operationDrawer.updateTexts();
        }
        
        // 更新行情图表语言
        if (window.updateMarketChartLanguage) {
            window.updateMarketChartLanguage();
        }
        
        // 更新放电与获利图表语言
        if (window.updatePowerRevenueChartLanguage) {
            window.updatePowerRevenueChartLanguage();
        }
        
        // 更新其他图表
        if (window.marketChart) {
            window.marketChart.resize();
        }
        if (window.mapChart) {
            window.mapChart.resize();
        }
        if (window.powerRevenueChart) {
            window.powerRevenueChart.resize();
        }
    }
    
    // 保存语言设置到本地存储
    saveLanguageToStorage(language) {
        try {
            localStorage.setItem(this.storageKey, language);
        } catch (error) {
            console.warn('Failed to save language to localStorage:', error);
        }
    }
    
    // 从本地存储加载语言设置
    loadLanguageFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored;
        } catch (error) {
            console.warn('Failed to load language from localStorage:', error);
            return null;
        }
    }
    
    // 重置语言设置
    resetLanguage() {
        localStorage.removeItem(this.storageKey);
        sessionStorage.removeItem('pageStateBeforeLanguageSwitch');
        this.currentLanguage = this.defaultLanguage;
        this.updatePageTexts();
    }
    
    // 强制完整翻译更新
    forceUpdateAllTexts() {
        this.updatePageTexts();
        // 多次尝试确保所有动态内容都被翻译
        setTimeout(() => this.updatePageTexts(), 100);
        setTimeout(() => this.updatePageTexts(), 300);
        setTimeout(() => this.updatePageTexts(), 500);
        return this;
    }
    
    // 获取当前语言
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    // 获取支持的语言列表
    getSupportedLanguages() {
        return this.supportedLanguages;
    }
    
    // 格式化时间（支持多语言）
    formatTime(date, options = {}) {
        const localeMap = {
            'zh': 'zh-CN',
            'en': 'en-US',
            'ja': 'ja-JP',
            'ko': 'ko-KR'
        };
        
        const locale = localeMap[this.currentLanguage] || 'zh-CN';
        
        if (options.relative) {
            const now = new Date();
            const diff = now - date;
            
            if (diff < 60000) { // 1分钟内
                return this.getText('notification.justNow');
            } else if (diff < 3600000) { // 1小时内
                const minutes = Math.floor(diff / 60000);
                return `${minutes} ${this.getText('notification.minutesAgo')}`;
            } else if (diff < 86400000) { // 24小时内
                const hours = Math.floor(diff / 3600000);
                return `${hours} ${this.getText('notification.hoursAgo')}`;
            }
        }
        
        return date.toLocaleDateString(locale, options);
    }
    
    // 刷新页面同时保持状态
    refreshPageWithState() {
        try {
            // 保存当前页面状态
            const pageState = {
                // 保存当前菜单状态
                currentPage: window.headerNav ? window.headerNav.currentPage : null,
                
                // 保存分页状态
                currentPageNum: window.currentPage || 1,
                pageSize: window.pageSize || 20,
                
                // 保存搜索/筛选状态
                searchInputs: {},
                selectValues: {}
            };
            
            // 保存所有搜索输入框的值
            document.querySelectorAll('input[type="text"], input[type="email"], input[type="search"]').forEach((input, index) => {
                if (input.value) {
                    pageState.searchInputs[`input_${index}`] = {
                        value: input.value,
                        id: input.id,
                        placeholder: input.placeholder
                    };
                }
            });
            
            // 保存所有下拉选择框的值
            document.querySelectorAll('select').forEach((select, index) => {
                if (select.value) {
                    pageState.selectValues[`select_${index}`] = {
                        value: select.value,
                        id: select.id
                    };
                }
            });
            
            // 将状态保存到sessionStorage
            sessionStorage.setItem('pageStateBeforeLanguageSwitch', JSON.stringify(pageState));
            
            // 延迟刷新页面，确保语言设置已保存
            setTimeout(() => {
                window.location.reload();
            }, 100);
            
        } catch (error) {
            console.warn('Failed to save page state before language switch:', error);
            // 即使保存状态失败，也要刷新页面以确保语言切换正确
            setTimeout(() => {
                window.location.reload();
            }, 100);
        }
    }
    
    // 恢复页面状态
    restorePageState() {
        try {
            const savedState = sessionStorage.getItem('pageStateBeforeLanguageSwitch');
            if (!savedState) return;
            
            const pageState = JSON.parse(savedState);
            
            // 清除已使用的状态
            sessionStorage.removeItem('pageStateBeforeLanguageSwitch');
            
            // 延迟恢复状态，确保页面已完全加载
            setTimeout(() => {
                // 恢复搜索输入框的值
                Object.entries(pageState.searchInputs || {}).forEach(([key, inputData]) => {
                    const input = inputData.id ? 
                        document.getElementById(inputData.id) : 
                        document.querySelector(`input[placeholder*="${inputData.placeholder}"]`);
                    if (input) {
                        input.value = inputData.value;
                    }
                });
                
                // 恢复下拉选择框的值
                Object.entries(pageState.selectValues || {}).forEach(([key, selectData]) => {
                    const select = selectData.id ? 
                        document.getElementById(selectData.id) : 
                        null;
                    if (select) {
                        select.value = selectData.value;
                    }
                });
                
                // 恢复分页状态
                if (pageState.currentPageNum && window.currentPage !== pageState.currentPageNum) {
                    window.currentPage = pageState.currentPageNum;
                }
                if (pageState.pageSize && window.pageSize !== pageState.pageSize) {
                    window.pageSize = pageState.pageSize;
                    const pageSizeSelect = document.getElementById('pageSize');
                    if (pageSizeSelect) {
                        pageSizeSelect.value = pageState.pageSize;
                    }
                }
                
                // 触发搜索/刷新以应用恢复的状态
                if (typeof window.searchUsers === 'function') {
                    window.searchUsers();
                } else if (typeof window.applyFilters === 'function') {
                    window.applyFilters();
                } else if (typeof window.updateTableDisplay === 'function') {
                    window.updateTableDisplay();
                    if (typeof window.updatePaginationDisplay === 'function') {
                        window.updatePaginationDisplay();
                    }
                } else if (typeof window.renderMessages === 'function') {
                    window.renderMessages();
                    if (typeof window.updatePagination === 'function') {
                        window.updatePagination();
                    }
                }
            }, 500);
            
        } catch (error) {
            console.warn('Failed to restore page state after language switch:', error);
        }
    }
}

// 导出供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18n;
}

// 设置全局变量，确保在页面加载时自动创建i18n实例
if (typeof window !== 'undefined') {
    // 确保 I18n 类可用
    window.I18n = I18n;
    
    // 创建默认实例
    if (!window.i18n) {
        window.i18n = new I18n({
            defaultLanguage: 'zh',
            containerId: 'languageSelector'
        });
    }
}