        // powerRevenueChart is already declared globally above
        function initPowerRevenueChart() {
            powerRevenueChart = echarts.init(document.getElementById('powerRevenueChart'));

            // Generate BESS energy data: charge/discharge quantities and financials
            function generateBESSData() {
                var chargeEnergy = [];   // MWh (negative for visual)
                var chargeCost = [];     // $ (cost, negative)
                var dischargeEnergy = []; // MWh (positive)
                var dischargeRevenue = []; // $ (revenue, positive)
                var netProfit = [];       // $ (revenue - cost)

                // AEMO spot price simulation ($/MWh)
                function getSpotPrice(hour) {
                    if (hour >= 0 && hour < 5) return 30 + Math.random() * 20;      // Off-peak
                    if (hour >= 5 && hour < 7) return 60 + Math.random() * 30;      // Shoulder
                    if (hour >= 7 && hour < 10) return 80 + Math.random() * 40;     // Morning peak
                    if (hour >= 10 && hour < 15) return 50 + Math.random() * 30;    // Mid-day (solar surplus)
                    if (hour >= 15 && hour < 17) return 90 + Math.random() * 60;    // Afternoon peak
                    if (hour >= 17 && hour < 21) return 120 + Math.random() * 80;   // Evening peak
                    return 40 + Math.random() * 25;                                  // Night
                }

                // BESS operation: charge during low price, discharge during high price
                for (var i = 0; i < 24; i++) {
                    var price = getSpotPrice(i);
                    var chgMWh = 0, dchMWh = 0;

                    // Charge during off-peak/mid-day (low prices)
                    if (i >= 1 && i < 5) {
                        chgMWh = 0.8 + Math.random() * 0.4;  // ~0.8-1.2 MWh per hour
                    } else if (i >= 10 && i < 14) {
                        chgMWh = 0.5 + Math.random() * 0.3;  // Solar surplus charging
                    }

                    // Discharge during peaks
                    if (i >= 7 && i < 9) {
                        dchMWh = 0.4 + Math.random() * 0.3;  // Morning peak
                    } else if (i >= 16 && i < 21) {
                        dchMWh = 0.6 + Math.random() * 0.5;  // Evening peak (main revenue)
                    }

                    var costVal = chgMWh * price;     // Cost to charge
                    var revVal = dchMWh * price;       // Revenue from discharge
                    var profitVal = revVal - costVal;

                    chargeEnergy.push(parseFloat((-chgMWh).toFixed(3)));
                    chargeCost.push(parseFloat((-costVal).toFixed(2)));
                    dischargeEnergy.push(parseFloat(dchMWh.toFixed(3)));
                    dischargeRevenue.push(parseFloat(revVal.toFixed(2)));
                    netProfit.push(parseFloat(profitVal.toFixed(2)));
                }

                return { chargeEnergy: chargeEnergy, chargeCost: chargeCost, dischargeEnergy: dischargeEnergy, dischargeRevenue: dischargeRevenue, netProfit: netProfit };
            }

            var data = generateBESSData();
            var hours = [];
            for (var h = 0; h < 24; h++) { hours.push(h.toString().padStart(2, '0') + ':00'); }

            var t = function(key, fallback) { return window.i18n ? window.i18n.getText(key) : fallback; };

            var options = {
                tooltip: {
                    trigger: 'axis',
                    backgroundColor: 'rgba(0,0,0,0.92)',
                    borderColor: 'rgba(255,255,255,0.1)',
                    textStyle: { color: '#fff', fontSize: 12 },
                    formatter: function(params) {
                        var time = params[0].axisValue;
                        var lines = ['<b>' + time + '</b>'];
                        params.forEach(function(p) {
                            var val = p.value;
                            var unit = (p.seriesName.indexOf('MWh') > -1 || p.seriesName.indexOf('Charge') > -1 && p.seriesName.indexOf('$') === -1) ? ' MWh' : '';
                            if (p.seriesName.indexOf('Cost') > -1 || p.seriesName.indexOf('Revenue') > -1 || p.seriesName.indexOf('Profit') > -1 || p.seriesName.indexOf('$') > -1) {
                                unit = '';
                                val = '$' + Math.abs(val).toFixed(0);
                            } else {
                                val = Math.abs(val).toFixed(2) + ' MWh';
                            }
                            lines.push(p.marker + ' ' + p.seriesName + ': ' + val);
                        });
                        return lines.join('<br>');
                    }
                },
                legend: {
                    data: [
                        t('dashboard.chargeEnergy', 'Charge (MWh)'),
                        t('dashboard.dischargeEnergy', 'Discharge (MWh)'),
                        t('dashboard.chargeCostLegend', 'Charge Cost ($)'),
                        t('dashboard.dischargeRevenueLegend', 'Discharge Revenue ($)'),
                        t('dashboard.netProfitLegend', 'Net Profit ($)')
                    ],
                    textStyle: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
                    top: 0,
                    itemGap: 12,
                    itemWidth: 14,
                    itemHeight: 10
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    top: '14%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: hours,
                    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
                    axisLabel: { color: 'rgba(255,255,255,0.6)', interval: 2 }
                },
                yAxis: [{
                    type: 'value',
                    name: 'MWh',
                    nameTextStyle: { color: 'rgba(255,255,255,0.6)' },
                    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
                    axisLabel: { color: 'rgba(255,255,255,0.6)' },
                    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } }
                }, {
                    type: 'value',
                    name: 'AUD ($)',
                    nameTextStyle: { color: 'rgba(255,255,255,0.6)' },
                    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
                    axisLabel: { color: 'rgba(255,255,255,0.6)', formatter: '${value}' },
                    splitLine: { show: false }
                }],
                series: [
                    {
                        name: t('dashboard.chargeEnergy', 'Charge (MWh)'),
                        type: 'bar',
                        stack: 'energy',
                        data: data.chargeEnergy,
                        itemStyle: { color: 'rgba(0,255,136,0.7)', borderRadius: [0,0,3,3] },
                        barWidth: '35%'
                    },
                    {
                        name: t('dashboard.dischargeEnergy', 'Discharge (MWh)'),
                        type: 'bar',
                        stack: 'energy',
                        data: data.dischargeEnergy,
                        itemStyle: { color: 'rgba(255,193,7,0.8)', borderRadius: [3,3,0,0] },
                        barWidth: '35%'
                    },
                    {
                        name: t('dashboard.chargeCostLegend', 'Charge Cost ($)'),
                        type: 'line',
                        yAxisIndex: 1,
                        data: data.chargeCost,
                        lineStyle: { width: 2, color: '#ff6b6b', type: 'dashed' },
                        itemStyle: { color: '#ff6b6b' },
                        symbol: 'none',
                        smooth: true
                    },
                    {
                        name: t('dashboard.dischargeRevenueLegend', 'Discharge Revenue ($)'),
                        type: 'line',
                        yAxisIndex: 1,
                        data: data.dischargeRevenue,
                        lineStyle: { width: 2, color: '#00ff88' },
                        itemStyle: { color: '#00ff88' },
                        symbol: 'none',
                        smooth: true
                    },
                    {
                        name: t('dashboard.netProfitLegend', 'Net Profit ($)'),
                        type: 'line',
                        yAxisIndex: 1,
                        data: data.netProfit,
                        lineStyle: { width: 3, color: '#ffd700' },
                        itemStyle: { color: '#ffd700' },
                        symbol: 'circle',
                        symbolSize: 5,
                        smooth: true,
                        areaStyle: {
                            color: {
                                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                                colorStops: [
                                    { offset: 0, color: 'rgba(255,215,0,0.15)' },
                                    { offset: 1, color: 'rgba(255,215,0,0)' }
                                ]
                            }
                        }
                    }
                ]
            };
            
            powerRevenueChart.setOption(options);
            window.addEventListener('resize', throttle(function() {
                if (powerRevenueChart && typeof powerRevenueChart.resize === 'function') {
                    powerRevenueChart.resize();
                }
            }, 250));
        }
