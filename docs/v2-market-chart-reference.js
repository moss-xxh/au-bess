        function initMarketChart() {
            const container = document.getElementById('marketChart');
            if (!container) {
                // error('Market chart container not found!');
                return;
            }
            
            // Dispose existing instance if any
            if (marketChart) {
                marketChart.dispose();
            }
            
            // Wait for container to be visible
            setTimeout(() => {
                // Initialize chart
                marketChart = echarts.init(container, 'dark');
                
                // Force container to have proper dimensions
                container.style.width = '100%';
                container.style.height = '400px';
                
                // Force a reflow to apply the new dimensions
                container.offsetHeight;
            
            // Real AEMO data from AEMO.xlsx - 从AEMO.xlsx文件中读取的真实数据（每5分钟一个数据点）
            aemoTimeLabels = ["00:00", "00:05", "00:10", "00:15", "00:20", "00:25", "00:30", "00:35", "00:40", "00:45", "00:50", "00:55", "01:00", "01:05", "01:10", "01:15", "01:20", "01:25", "01:30", "01:35", "01:40", "01:45", "01:50", "01:55", "02:00", "02:05", "02:10", "02:15", "02:20", "02:25", "02:30", "02:35", "02:40", "02:45", "02:50", "02:55", "03:00", "03:05", "03:10", "03:15", "03:20", "03:25", "03:30", "03:35", "03:40", "03:45", "03:50", "03:55", "04:00", "04:05", "04:10", "04:15", "04:20", "04:25", "04:30", "04:35", "04:40", "04:45", "04:50", "04:55", "05:00", "05:05", "05:10", "05:15", "05:20", "05:25", "05:30", "05:35", "05:40", "05:45", "05:50", "05:55", "06:00", "06:05", "06:10", "06:15", "06:20", "06:25", "06:30", "06:35", "06:40", "06:45", "06:50", "06:55", "07:00", "07:05", "07:10", "07:15", "07:20", "07:25", "07:30", "07:35", "07:40", "07:45", "07:50", "07:55", "08:00", "08:05", "08:10", "08:15", "08:20", "08:25", "08:30", "08:35", "08:40", "08:45", "08:50", "08:55", "09:00", "09:05", "09:10", "09:15", "09:20", "09:25", "09:30", "09:35", "09:40", "09:45", "09:50", "09:55", "10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30", "10:35", "10:40", "10:45", "10:50", "10:55", "11:00", "11:05", "11:10", "11:15", "11:20", "11:25", "11:30", "11:35", "11:40", "11:45", "11:50", "11:55", "12:00", "12:05", "12:10", "12:15", "12:20", "12:25", "12:30", "12:35", "12:40", "12:45", "12:50", "12:55", "13:00", "13:05", "13:10", "13:15", "13:20", "13:25", "13:30", "13:35", "13:40", "13:45", "13:50", "13:55", "14:00", "14:05", "14:10", "14:15", "14:20", "14:25", "14:30", "14:35", "14:40", "14:45", "14:50", "14:55", "15:00", "15:05", "15:10", "15:15", "15:20", "15:25", "15:30", "15:35", "15:40", "15:45", "15:50", "15:55", "16:00", "16:05", "16:10", "16:15", "16:20", "16:25", "16:30", "16:35", "16:40", "16:45", "16:50", "16:55", "17:00", "17:05", "17:10", "17:15", "17:20", "17:25", "17:30", "17:35", "17:40", "17:45", "17:50", "17:55", "18:00", "18:05", "18:10", "18:15", "18:20", "18:25", "18:30", "18:35", "18:40", "18:45", "18:50", "18:55", "19:00", "19:05", "19:10", "19:15", "19:20", "19:25", "19:30", "19:35", "19:40", "19:45", "19:50", "19:55", "20:00", "20:05", "20:10", "20:15", "20:20", "20:25", "20:30", "20:35", "20:40", "20:45", "20:50", "20:55", "21:00", "21:05", "21:10", "21:15", "21:20", "21:25", "21:30", "21:35", "21:40", "21:45", "21:50", "21:55", "22:00", "22:05", "22:10", "22:15", "22:20", "22:25", "22:30", "22:35", "22:40", "22:45", "22:50", "22:55", "23:00", "23:05", "23:10", "23:15", "23:20", "23:25", "23:30", "23:35", "23:40", "23:45", "23:50", "23:55"];
            aemoRealPriceData = [66.14, 66.04, 77.56, 80.01, 80.01, 80.01, 78.38, 66.28, 77.27, 63.98, 65.05, 64.0, 57.06, 62.87, 62.92, 65.64, 65.22, 65.23, 62.96, 65.0, 80.01, 76.94, 77.1, 65.0, 65.28, 65.3, 77.13, 65.54, 65.05, 64.66, 64.72, 64.28, 64.72, 64.69, 64.26, 64.72, 64.34, 64.33, 66.65, 65.0, 65.0, 65.08, 65.98, 65.0, 76.86, 65.15, 66.18, 76.19, 76.26, 79.95, 80.01, 80.01, 86.94, 105.79, 105.79, 130.23, 125.62, 127.49, 158.99, 158.99, 158.99, 126.29, 138.19, 158.99, 154.19, 158.99, 158.19, 120.01, 83.87, 84.79, 69.71, 68.86, -0.08, 0.01, -0.01, -8.23, -6.66, -8.19, -0.01, -6.66, 0, 0.01, -9.46, -5.84, -5.85, -5.99, 0.0, -2.65, -6.29, -6.29, -6.5, -6.46, -6.37, -8.79, -11.13, -11.25, -13.04, -11.32, -10.51, -11.63, -14.12, -12.25, -12.19, -11.72, -12.71, -11.9, -14.99, -11.98, -15.29, -15.6, -12.7, -14.99, -15.33, -18.48, -18.17, -15.46, -16.0, -17.93, -18.7, -17.51, -18.73, -18.44, -13.68, -16.0, -18.28, -19.01, -19.56, -20.0, -20.13, -18.79, -20.52, -22.73, -24.67, -20.75, -21.92, -25.09, -21.61, -21.3, -25.33, -25.94, -19.83, -21.12, -21.58, -21.14, -21.13, -25.14, -24.31, -20.0, -22.81, -24.72, -21.52, -23.94, -25.24, -22.9, -23.91, -32.19, -27.5, -27.5, -27.5, -34.11, -34.11, -24.72, -27.5, -34.11, -34.11, -34.11, -31.01, -27.5, -27.5, -27.5, -27.5, -27.5, -27.5, -27.5, -24.02, -20.27, -27.5, -27.5, -20.81, -20.1, -20.13, -20.51, -20.35, -27.5, -19.89, -18.84, -21.06, -27.5, -18.89, -12.99, -12.64, -12.26, -10.87, -12.76, -12.55, -12.42, -11.84, -3.0, -3.0, -8.96, -6.82, -6.81, 54.94, -6.19, -0.81, -0.72, -0.81, 0.45, 9.13, 16.65, 4.77, 51.86, 69.09, 83.54, 92.45, 132.77, 139.42, 136.16, 100.24, 139.83, 117.94, 114.8, 116.34, 101.53, 126.26, 120.29, 112.12, 117.51, 122.08, 132.59, 127.47, 132.84, 137.61, 129.37, 130.71, 139.68, 127.07, 161.15, 145.97, 158.68, 159.77, 149.87, 177.5, 134.17, 156.17, 160.24, 140.38, 177.7, 181.52, 131.7, 173.91, 171.39, 147.36, 146.24, 174.0, 243.2, 126.93, 158.5, 108.89, 128.97, 125.45, 106.33, 89.38, 88.05, 80.9, 87.3, 125.69, 123.79, 108.89, 108.89, 108.89, 108.89, 106.73, 106.96, 97.74, 100.01, 107.69, 105.74, 158.99, 158.99, 158.99, 158.99, 158.99, 158.99, 158.99, 158.99, 158.99, 158.99];
            aemoRealDemandData = [6944.17, 6898.47, 6893.63, 6829.3, 6850.61, 6774.74, 6759.83, 6648.21, 6669.78, 6569.73, 6617.86, 6573.83, 6479.18, 6468.57, 6466.79, 6530.03, 6436.35, 6466.99, 6438.46, 6480.32, 6391.91, 6429.17, 6460.58, 6421.28, 6443.13, 6272.65, 6341.68, 6276.72, 6274.57, 6278.81, 6241.81, 6228.63, 6242.68, 6247.2, 6195.57, 6217.48, 6210.87, 6195.27, 6197.42, 6210.22, 6210.93, 6244.7, 6276.44, 6274.01, 6295.57, 6296.73, 6314.99, 6353.57, 6340.07, 6325.78, 6427.73, 6462.66, 6537.16, 6588.73, 6552.47, 6576.69, 6635.77, 6665.0, 6732.0, 6746.01, 6799.1, 6853.33, 6969.46, 7014.85, 7087.52, 7164.67, 7161.88, 7079.85, 7092.18, 7153.41, 7111.21, 7078.06, 7047.26, 7053.51, 6980.02, 6954.91, 6998.64, 6901.06, 6878.11, 6845.43, 6794.63, 6706.81, 6580.9, 6542.29, 6439.06, 6447.79, 6580.94, 6451.57, 6312.2, 6196.7, 6189.7, 6024.56, 5891.87, 5764.17, 5675.92, 5574.41, 5437.06, 5298.3, 5304.67, 5198.75, 5073.44, 4929.02, 4854.91, 4917.83, 4876.59, 4901.98, 4874.92, 4913.56, 4909.23, 4773.02, 4775.89, 4708.02, 4725.72, 4640.68, 4478.4, 4455.44, 4513.4, 4428.34, 4369.43, 4425.16, 4391.35, 4356.77, 4375.8, 4376.23, 4304.1, 4223.98, 4182.73, 4219.16, 4357.73, 4205.29, 4243.99, 4155.65, 4174.0, 4124.9, 4218.79, 4233.37, 4218.3, 4197.21, 4146.02, 4184.5, 4150.86, 4200.1, 4148.84, 4060.27, 4064.63, 4027.7, 4062.16, 4055.0, 4064.33, 4148.36, 4143.95, 4073.54, 4071.72, 4091.67, 4104.26, 3957.83, 4044.9, 3962.61, 4046.45, 4021.29, 4077.47, 4091.37, 4106.81, 4116.55, 4093.43, 4154.6, 4189.06, 4172.79, 4327.09, 4454.43, 4481.58, 4385.69, 4507.94, 4538.22, 4771.57, 4758.78, 4753.8, 4776.51, 4938.62, 4991.94, 5110.06, 5027.95, 5078.17, 5199.79, 5292.9, 5354.01, 5436.35, 5546.75, 5787.91, 5874.7, 5981.58, 6246.98, 6364.78, 6339.58, 6457.68, 6499.84, 6667.6, 6825.92, 7021.9, 7147.29, 7254.92, 7341.2, 7526.05, 7364.37, 7477.81, 7575.31, 7730.51, 7845.58, 7941.2, 7962.68, 7892.07, 8014.79, 8033.63, 7996.21, 8033.32, 8170.29, 8129.35, 8103.97, 7977.04, 8143.95, 8140.22, 8201.66, 8159.9, 8136.33, 8146.82, 8060.84, 8090.79, 8165.4, 8184.86, 8196.96, 8200.54, 8190.62, 8174.33, 8199.12, 8068.88, 8161.38, 8066.38, 8125.4, 7979.9, 8062.75, 8012.55, 7958.27, 7975.92, 7805.3, 7864.63, 7886.33, 7878.94, 7793.18, 7755.09, 7710.03, 7768.5, 7665.61, 7565.89, 7512.26, 7617.91, 7671.08, 7538.85, 7541.03, 7483.12, 7586.36, 7578.41, 7594.6, 7600.68, 7555.02, 7407.75, 7356.12, 7444.59, 7427.32, 7431.03, 7366.29, 7356.18, 7322.61, 7310.67, 7278.75, 7208.81, 7247.65, 7286.98, 7159.5, 7244.63, 7149.35, 7162.89, 7165.12, 7161.65, 7048.02, 7082.02, 7023.69, 7116.38, 7145.64];

            // 获取当前时间并计算对应的数据索引
            const now = new Date();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            // 将分钟数向下取整到最近的5分钟
            const roundedMinute = Math.floor(currentMinute / 5) * 5;
            // 计算当前时间对应的数组索引（每小时12个点，每5分钟一个）
            const currentTimeIndex = currentHour * 12 + (roundedMinute / 5);

            const prices = [];
            const demands = [];
            const forecastPrices = [];
            const forecastDemands = [];

            // 遍历所有288个数据点
            for (let i = 0; i < aemoTimeLabels.length; i++) {
                if (i < currentTimeIndex) {
                    // 当前时间之前 - 历史数据，显示为实线
                    prices.push(aemoRealPriceData[i]);
                    demands.push(aemoRealDemandData[i]);
                    forecastPrices.push(null);
                    forecastDemands.push(null);
                } else if (i === currentTimeIndex) {
                    // 当前时间点 - 同时作为实线和虚线的连接点
                    prices.push(aemoRealPriceData[i]);
                    demands.push(aemoRealDemandData[i]);
                    forecastPrices.push(aemoRealPriceData[i]);
                    forecastDemands.push(aemoRealDemandData[i]);
                } else {
                    // 当前时间之后 - 预测数据，显示为虚线
                    prices.push(null);
                    demands.push(null);
                    forecastPrices.push(aemoRealPriceData[i]);
                    forecastDemands.push(aemoRealDemandData[i]);
                }
            }

                // Get translations
                const getText = (key) => window.i18n ? window.i18n.getText(key) : translations.en[key];
                const translations = {
                    en: {
                        historicalPrice: 'Historical Price',
                        predictedPrice: 'Predicted Price',
                        demand: 'Demand',
                        predictedDemand: 'Predicted Demand',
                        price: 'Price ($/MWh)',
                        demandUnit: 'Demand (MW)'
                    },
                    zh: {
                        historicalPrice: '历史价格',
                        predictedPrice: '预测价格',
                        demand: '需求',
                        predictedDemand: '预测需求',
                        price: '价格 ($/MWh)',
                        demandUnit: '需求 (MW)'
                    }
                };
                
                const option = {
                    backgroundColor: 'transparent',
                    tooltip: {
                        trigger: 'axis',
                        backgroundColor: 'rgba(0, 0, 0, 0.9)',
                        borderColor: '#00ff88',
                        borderWidth: 1,
                        textStyle: { color: '#fff' },
                        formatter: function(params) {
                            let result = `<div style="font-weight: bold; margin-bottom: 5px;">${params[0].axisValue}</div>`;
                            params.forEach(param => {
                                if (param.value !== null && param.value !== undefined) {
                                    const color = param.color;
                                    const value = param.seriesName.includes(getText('price')) || param.seriesName.includes('Price') 
                                        ? `$${param.value.toFixed ? param.value.toFixed(2) : param.value}` 
                                        : `${param.value.toFixed ? param.value.toFixed(0) : param.value} MW`;
                                    result += `<div>${param.marker} ${param.seriesName}: <strong>${value}</strong></div>`;
                                }
                            });
                            return result;
                        }
                    },
                    legend: {
                        data: [getText('historicalPrice'), getText('demand'), getText('predictedPrice'), getText('predictedDemand')],
                        textStyle: { color: 'rgba(255, 255, 255, 0.7)' },
                        top: 10
                    },
                    grid: {
                        left: '60',
                        right: '60',
                        bottom: '40',
                        top: '50',
                        containLabel: true
                    },
                    xAxis: {
                        type: 'category',
                        data: aemoTimeLabels,
                        axisLine: {
                            show: false  // 隐藏X轴线
                        },
                        axisLabel: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            interval: 23, // 每2小时显示一次（每24个点=2小时，显示：00:00, 02:00, 04:00, 06:00, 08:00, 10:00, 12:00, 14:00, 16:00, 18:00, 20:00, 22:00）
                            fontSize: 12,
                            rotate: 0
                        },
                        splitLine: { show: false }
                    },
                    yAxis: [
                        {
                            type: 'value',
                            name: getText('price'),
                            nameTextStyle: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: 12
                            },
                            position: 'left',
                            scale: true,  // 自动缩放
                            min: 'dataMin',  // 从数据最小值开始
                            max: 'dataMax',  // 到数据最大值结束
                            axisLine: {
                                show: false  // 隐藏Y轴线
                            },
                            axisLabel: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                formatter: '${value}'
                            },
                            splitLine: {
                                show: true,
                                lineStyle: {
                                    color: 'rgba(255, 255, 255, 0.05)',  // 降低网格线透明度
                                    type: 'dashed',
                                    width: 1
                                }
                            }
                        },
                        {
                            type: 'value',
                            name: getText('demandUnit'),
                            nameTextStyle: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: 12
                            },
                            position: 'right',
                            scale: true,  // 自动缩放
                            min: 'dataMin',  // 从数据最小值开始
                            max: 'dataMax',  // 到数据最大值结束
                            axisLine: {
                                show: false  // 隐藏Y轴线
                            },
                            axisLabel: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                formatter: '{value} MW'
                            },
                        splitLine: { show: false }
                    }
                ],
                    series: [
                        {
                            name: getText('historicalPrice'),
                            type: 'line',
                            data: prices,
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 4,
                            lineStyle: {
                                color: '#00ff88',
                                width: 3
                            },
                            itemStyle: {
                                color: '#00ff88'
                            },
                            areaStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: 'rgba(0, 255, 136, 0.3)' },
                                    { offset: 1, color: 'rgba(0, 255, 136, 0.05)' }
                                ])
                            },
                            markLine: {
                                symbol: 'none',
                                silent: true,
                                data: [
                                    {
                                        xAxis: currentTimeIndex,
                                        lineStyle: {
                                            color: 'rgba(255, 255, 255, 0.4)',
                                            type: 'dashed',
                                            width: 2
                                        },
                                        label: {
                                            show: false
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            name: getText('demand'),
                            type: 'line',
                            yAxisIndex: 1,
                            data: demands,
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 4,
                            lineStyle: { 
                                color: '#ffd700', 
                                width: 2
                            },
                            itemStyle: {
                                color: '#ffd700'
                            }
                        },
                        {
                            name: getText('predictedPrice'),
                            type: 'line',
                            data: forecastPrices,
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 4,
                            lineStyle: { 
                                color: '#00ff88', 
                                width: 2,
                                type: 'dashed'
                            },
                            itemStyle: {
                                color: '#00ff88'
                            },
                            areaStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: 'rgba(0, 255, 136, 0.15)' },
                                    { offset: 1, color: 'rgba(0, 255, 136, 0.02)' }
                                ])
                            }
                        },
                        {
                            name: getText('predictedDemand'),
                            type: 'line',
                            yAxisIndex: 1,
                            data: forecastDemands,
                            smooth: true,
                            symbol: 'circle',
                            symbolSize: 4,
                            lineStyle: {
                                color: '#ffd700',
                                width: 2,
                                type: 'dashed'
                            },
                            itemStyle: {
                                color: '#ffd700'
                            }
                        }
                    ]
                };

                // Apply configuration
                marketChart.setOption(option);
                
                // Force resize after setting option
                setTimeout(() => {
                    if (marketChart && typeof marketChart.resize === 'function') {
                        marketChart.resize();
                    }
                }, 100);
                
                // Handle resize
                window.addEventListener('resize', () => {
                    if (marketChart && typeof marketChart.resize === 'function') {
                        if (marketChart && typeof marketChart.resize === 'function') {
                        marketChart.resize();
                    }
                    }
                });
                
                // Force initial resize
                setTimeout(() => {
                    if (marketChart && typeof marketChart.resize === 'function') {
                        marketChart.resize();
                    }
                }, 100);


