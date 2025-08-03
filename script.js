document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const navTitle = document.getElementById('navTitle');
    const mainSearchContainer = document.getElementById('mainSearchContainer');
    const forecastSearchContainer = document.getElementById('forecastSearchContainer');
    const stockInput = document.getElementById('stockInput');
    const forecastInput = document.getElementById('forecastInput');
    let mainChart, volumeChart, trendChart, rangeChart, forecastChart;

    // Cache for forecast data to improve performance
    const forecastCache = new Map();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Initialize all charts
    function initializeCharts() {
        const ctx = document.getElementById('candlestickChart').getContext('2d');
        mainChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Price',
                    data: [],
                    borderColor: '#00ffcc',
                    backgroundColor: '#00ffcc',
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#00ffcc',
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 2,
                    tension: 0.1,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index',
                    axis: 'x'
                },
                scales: {
                    x: {
                        position: 'left',
                        grid: {
                            color: '#1c2230'
                        },
                        ticks: {
                            color: '#e1e1e1',
                            font: {
                                size: 11
                            }
                        },
                        reverse: false
                    },
                    y: {
                        position: 'left',
                        grid: {
                            color: '#1c2230'
                        },
                        ticks: {
                            color: '#e1e1e1',
                            font: {
                                size: 11
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: '#131722',
                        titleColor: '#e1e1e1',
                        bodyColor: '#e1e1e1',
                        borderColor: '#1c2230',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            title: function(tooltipItems) {
                                return 'Date: ' + tooltipItems[0].label;
                            },
                            label: function(context) {
                                const i = context.dataIndex;
                                const data = context.dataset.data[i];
                                const priceChange = data.close - data.open;
                                const percentChange = (priceChange / data.open * 100).toFixed(2);
                                
                                return [
                                    `Open: $${data.open.toFixed(2)}`,
                                    `High: $${data.high.toFixed(2)}`,
                                    `Low: $${data.low.toFixed(2)}`,
                                    `Close: $${data.close.toFixed(2)}`,
                                    `Volume: ${data.volume.toLocaleString()}`,
                                    `Change: ${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} (${percentChange}%)`
                                    ];
                            }
                        }
                    }
                }
            },
        });
        
        const volumeCtx = document.getElementById('volumeChart').getContext('2d');
        volumeChart = new Chart(volumeCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Volume',
                    data: [],
                    backgroundColor: '#7b7880',
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index',
                    axis: 'x'
                },
                scales: {
                    x: {
                        display: true
                    },
                    y: {
                        position: 'left',
                        grid: {
                            color: '#1c2230'
                        },
                        ticks: {
                            color: '#e1e1e1'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: '#131722',
                        titleColor: '#e1e1e1',
                        bodyColor: '#e1e1e1',
                        callbacks: {
                            label: function(context) {
                                return `Volume: ${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                }
            },
        });

        const trendCtx = document.getElementById('trendChart').getContext('2d');
        trendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Price Trend',
                    data: [],
                    backgroundColor: '#FF1493',
                    borderColor: '#FF1493',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4,
                    pointRadius: 1,
                    pointHoverRadius: 4,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index',
                    axis: 'x'
                },
                plugins: {
                    legend: {
                        labels: { color: '#FFFFFF' }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: '#131722',
                        titleColor: '#e1e1e1',
                        bodyColor: '#e1e1e1',
                        callbacks: {
                            label: function(context) {
                                return `Price: $${context.parsed.y.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: { color: '#FFFFFF' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#FFFFFF' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            },
        });

        const rangeCtx = document.getElementById('rangeChart').getContext('2d');
        rangeChart = new Chart(rangeCtx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Price Range',
                    data: [],
                    backgroundColor: '#00FFFF',
                    borderColor: '#FFFFFF',
                    pointRadius: 0,
                    borderWidth: 1
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index',
                    axis: 'x'
                },
                plugins: {
                    legend: {
                        labels: { color: '#FFFFFF' }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: '#131722',
                        titleColor: '#e1e1e1',
                        bodyColor: '#e1e1e1',
                        callbacks: {
                            title: function(tooltipItems) {
                                return 'Date: ' + tooltipItems[0].label;
                            },
                            label: function(context) {
                                const data = context.dataset.data[context.dataIndex];
                                return [
                                    `High: $${data.high.toFixed(2)}`,
                                    `Low: $${data.low.toFixed(2)}`,
                                    `Range: $${(data.high - data.low).toFixed(2)}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: { color: '#FFFFFF' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#FFFFFF' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            },
        });
    }

    // Initialize forecast chart with enhanced performance
    function initializeForecastChart() {
        const forecastCtx = document.getElementById('forecastChart').getContext('2d');
        forecastChart = new Chart(forecastCtx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Historical Price',
                    data: [],
                    borderColor: 'rgb(0, 255, 255)',
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    borderWidth: 2,
                    pointRadius: 1,
                    pointHoverRadius: 5,
                    fill: false,
                    tension: 0.1
                }, {
                    label: 'Forecasted Price',
                    data: [],
                    borderColor: 'rgb(255, 0, 255)',
                    backgroundColor: 'rgba(255, 0, 255, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 1,
                    pointHoverRadius: 5,
                    fill: false,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += new Intl.NumberFormat('en-US', { 
                                        style: 'currency', 
                                        currency: 'USD' 
                                    }).format(context.parsed.y);
                                }
                                return label;
                            }
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#ffffff',
                            font: {
                                size: 12
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'minute',
                            displayFormats: {
                                minute: 'HH:mm',
                                hour: 'HH:mm',
                                day: 'MMM d',
                                week: 'MMM d',
                                month: 'MMM yyyy'
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff',
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#ffffff',
                            callback: function(value) {
                                return new Intl.NumberFormat('en-US', { 
                                    style: 'currency', 
                                    currency: 'USD' 
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    }

    // Initialize all charts
    initializeCharts();
    initializeForecastChart();

    // Sidebar toggle functionality
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
    });

    // Add click events to sidebar items
    document.querySelectorAll('.sidebar-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all sidebar items
            document.querySelectorAll('.sidebar-item').forEach(sideItem => {
                sideItem.classList.remove('active');
            });

            // Add active class to clicked item
            this.classList.add('active');

            // Update navbar title
            const newTitle = this.getAttribute('data-title');
            navTitle.textContent = newTitle;

            // Hide all containers first
            document.querySelectorAll('.content-container').forEach(container => {
                container.classList.remove('active');
            });

            // Show selected container
            const targetId = this.getAttribute('data-target');
            const targetContainer = document.getElementById(targetId);
            targetContainer.classList.add('active');

            // Always hide the main search container (will be conditionally shown if needed)
            mainSearchContainer.style.display = 'none';
            
            // Show the main search container only when in Stock Analysis tab
            if (targetId === 'stockAnalysisContainer') {
                mainSearchContainer.style.display = 'flex';
            }

            // Fetch news when news tab is clicked
            if (targetId === 'newsContainer') {
                fetchAndDisplayNews();
            }

            // Close sidebar after selection
            sidebar.classList.remove('active');
        });
    });

    // Search functionality on Enter key or search icon click
    const searchIcon = document.querySelector('.search-icon');
    searchIcon.addEventListener('click', () => updateChartsTimeframe(document.querySelector('.buttons button').dataset.interval));
    
    stockInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') updateChartsTimeframe(document.querySelector('.buttons button').dataset.interval);
    });
    
    // Add event listeners for duration buttons
    document.querySelectorAll('.buttons button').forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons
            document.querySelectorAll('.buttons button').forEach(btn => btn.classList.remove('active-button'));
            
            // Add active class to the clicked button
            this.classList.add('active-button');
    
            // Update charts timeframe
            const period = this.getAttribute('data-interval');
            updateChartsTimeframe(period);
        });
    });
    
    
    // Global function for onclick handlers in HTML buttons
    window.updateTimeframe = function(period, extraParam, customRange) {
        // Check if we're in the forecast view
        const isForecastContainer = document.getElementById('futureForecastingContainer').classList.contains('active');
        
        // If we're in the forecast view, use the forecast input
        if (isForecastContainer) {
            const forecastInput = document.getElementById('forecastInput');
            const symbol = forecastInput.value.trim();
            if (!symbol) {
                showMessage('Please enter a company name or ticker symbol.', 'error');
                return;
            }
            // Call the forecast data function
            fetchAndUpdateForecastData(symbol, period, extraParam, customRange);
        } else {
            // Original code for stock analysis
            updateChartsTimeframe(period);
        }
    };

    // Function to update charts timeframe
    function updateChartsTimeframe(period) {
        const symbol = stockInput.value.trim();
        if (!symbol) {
            showMessage('Please enter a company name or ticker symbol.', 'error');
            return;
        }
        if (symbol) {
            fetchAndUpdateData(symbol, period);
        }
    }

    // Enhanced message display function
    function showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = message;
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '100px';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translateX(-50%)';
        messageDiv.style.zIndex = '10000';
        messageDiv.style.padding = '15px 25px';
        messageDiv.style.borderRadius = '8px';
        messageDiv.style.fontWeight = 'bold';
        messageDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';

        document.body.appendChild(messageDiv);

        // Auto remove after 3 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    //-------------------------UPDATE DATA OF THE CHARTS-----------------
    // Function to fetch and update data
    async function fetchAndUpdateData(symbol, duration) {
        try {
            document.querySelector('.loading').classList.add('active');
            
            let url = `http://127.0.0.1:5000/stock-data?symbol=${symbol}&duration=${duration}`;
            
            const response = await fetch(url);
            const jsonData = await response.json();

            document.querySelector('.loading').classList.remove('active');

            if (!jsonData || jsonData.error) {
                showMessage(jsonData.error || 'Invalid data received from server.', 'error');
                return;
            }

            // Format data for charts
            const dates = jsonData.map(item => item.datetime).reverse();
            const openPrices = jsonData.map(item => parseFloat(item.open)).reverse();
            const highPrices = jsonData.map(item => parseFloat(item.high)).reverse();
            const lowPrices = jsonData.map(item => parseFloat(item.low)).reverse();
            const closePrices = jsonData.map(item => parseFloat(item.close)).reverse();
            const volumes = jsonData.map(item => parseInt(item.volume, 10)).reverse();

            // Create properly formatted data for the main chart
            const chartData = closePrices.map((price, index) => ({
                x: dates[index],
                y: price,
                open: openPrices[index],
                high: highPrices[index],
                low: lowPrices[index],
                close: closePrices[index],
                volume: volumes[index]
            }));
            
            // Update main chart with formatted data
            mainChart.data.labels = dates;
            mainChart.data.datasets[0].data = chartData;
            mainChart.options.scales.y.min = Math.min(...closePrices) * 0.995;
            mainChart.options.scales.y.max = Math.max(...closePrices) * 1.005;
            mainChart.update('none');
            
            // Update volume chart
            volumeChart.data.labels = dates;
            volumeChart.data.datasets[0].data = volumes;
            volumeChart.update();
            
            // Update trend chart
            trendChart.data.labels = dates;
            trendChart.data.datasets[0].data = closePrices;
            trendChart.update();
            
            // Update range chart
            rangeChart.data.labels = dates;
            rangeChart.data.datasets[0].data = highPrices.map((high, i) => ({
                x: dates[i],
                y: high - lowPrices[i],
                high: high,
                low: lowPrices[i]
            }));
            rangeChart.update();
            
            // Update stats panel
            const latestData = closePrices[closePrices.length - 1];
            document.getElementById('currentPrice').textContent = `$${latestData.toFixed(2)}`;
            document.getElementById('dayRange').textContent = 
                `$${Math.min(...lowPrices).toFixed(2)} - $${Math.max(...highPrices).toFixed(2)}`;
            document.getElementById('volume').textContent = 
                volumes.reduce((a, b) => a + b, 0).toLocaleString();
            
            const priceChange = latestData - openPrices[0];
            const percentChange = (priceChange / openPrices[0] * 100).toFixed(2);
            document.getElementById('priceChange').textContent = 
                `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} (${percentChange}%)`;

            showMessage('Data updated successfully!', 'success');

        } catch (error) {
            console.error('Error fetching data:', error);
            showMessage('An error occurred while fetching data.', 'error');
            document.querySelector('.loading').classList.remove('active');
        }
    }


    // Enhanced function to fetch and update forecast data with caching
    async function fetchAndUpdateForecastData(symbol, duration) {
        try {
            // Check cache first
            const cacheKey = `${symbol}_${duration}`;
            const cachedData = forecastCache.get(cacheKey);
            
            if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
                console.log('Using cached forecast data');
                await updateForecastChartWithData(cachedData.historicalDates, cachedData.historicalPrices, cachedData.forecastData);
                showMessage('Forecast data loaded from cache!', 'success');
                return;
            }

            // Show loading container and update progress
            const loadingContainer = document.getElementById('loadingContainer');
            loadingContainer.style.display = 'block';
            updateProgress(10, 'Starting');

            // Construct URL and fetch data
            const url = `http://127.0.0.1:5000/forecast?symbol=${encodeURIComponent(symbol)}&duration=${encodeURIComponent(duration)}`;
            console.log('Fetching from:', url);
            updateProgress(30, 'Data fetching');
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            updateProgress(50, 'Data received');

            const data = await response.json();
            if (!data || data.error) {
                throw new Error(data.error || 'Invalid data received');
            }
            updateProgress(70, 'Data parsed');

            console.log('Received data:', data);

            // Process historical data
            const historicalEntries = Object.entries(data.historical);
            const historicalDates = historicalEntries.map(([date]) => date);
            const historicalPrices = historicalEntries.map(([, values]) => parseFloat(values['4. close']));

            // Sort historical data by date
            const sortedIndices = historicalDates
                .map((date, index) => ({ date, index }))
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(item => item.index);

            const sortedDates = sortedIndices.map(i => historicalDates[i]);
            const sortedPrices = sortedIndices.map(i => historicalPrices[i]);

            updateProgress(85, 'Historical data processed');

            // Process and sort forecast data
            const sortedForecast = data.forecast
                .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
                .map(item => ({
                    datetime: item.datetime,
                    close: parseFloat(item.close)
                }));

            console.log('Processed data:', {
                historicalDates: sortedDates.length,
                historicalPrices: sortedPrices.length,
                forecast: sortedForecast.length
            });

            updateProgress(95, 'Forecast data processed');

            // Cache the processed data
            forecastCache.set(cacheKey, {
                historicalDates: sortedDates,
                historicalPrices: sortedPrices,
                forecastData: sortedForecast,
                timestamp: Date.now()
            });

            // Update chart with processed data
            await updateForecastChartWithData(sortedDates, sortedPrices, sortedForecast);
            
            updateProgress(100, 'Chart updated');
            setTimeout(() => {
                loadingContainer.style.display = 'none';
            }, 500);
            
            showMessage('Forecast data updated successfully!', 'success');
            
        } catch (error) {
            console.error('Error fetching forecast data:', error);
            showMessage('Error: ' + error.message, 'error');
            document.getElementById('loadingContainer').style.display = 'none';
        }
    }
    
    // Update progress bar function with status message
    function updateProgress(percent, status) {
        const progressBar = document.querySelector('#loadingContainer .progress');
        const progressText = document.querySelector('#loadingContainer .progress-text');
        const statusText = document.querySelector('#loadingContainer .status-text');
        
        if (progressBar && progressText && statusText) {
            progressBar.style.width = `${percent}%`;
            progressText.textContent = `${percent}%`;
            statusText.textContent = status;

            // Add loading effect class at 50%
            if (percent >= 50) {
                progressBar.classList.add('loading');
            }
            // Remove loading effect class at 100%
            if (percent === 100) {
                progressBar.classList.remove('loading');
            }
        }
    }
    
    // Helper function to determine appropriate time unit
    function getTimeUnit(startTime, endTime) {
        const duration = endTime - startTime;
        const hours = duration / (1000 * 60 * 60);
        
        if (hours <= 1) return 'minute';
        if (hours <= 24) return 'hour';
        if (hours <= 24 * 7) return 'day';
        if (hours <= 24 * 30) return 'week';
        return 'month';
    }

    // Helper function to update stats panel
    function updateStatsPanel(historicalPoints, forecastPoints) {
        if (forecastPoints.length > 0 && historicalPoints.length > 0) {
            const lastHistoricalPrice = historicalPoints[historicalPoints.length - 1].y;
            const lastForecastPrice = forecastPoints[forecastPoints.length - 1].y;
            const priceChange = lastForecastPrice - lastHistoricalPrice;
            const percentageChange = (priceChange / lastHistoricalPrice) * 100;

            // Update predicted price
            document.getElementById('predictedPrice').textContent = 
                new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
                    .format(lastForecastPrice);

            // Update predicted change
            const changeElement = document.getElementById('predictedChange');
            changeElement.textContent = `${percentageChange >= 0 ? '+' : ''}${percentageChange.toFixed(2)}%`;
            changeElement.style.color = percentageChange >= 0 ? '#00ff00' : '#ff4444';

            // Update prediction range
            const minForecast = Math.min(...forecastPoints.map(p => p.y));
            const maxForecast = Math.max(...forecastPoints.map(p => p.y));
            document.getElementById('predictionRange').textContent = 
                `${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(minForecast)} - ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(maxForecast)}`;

            // Update confidence level
            const avgConfidence = forecastPoints.reduce((sum, point) => sum + (point.confidence || 0.85), 0) / forecastPoints.length;
            document.getElementById('confidenceLevel').textContent = `${(avgConfidence * 100).toFixed(1)}%`;
        }
    }

    // Enhanced function to update forecast chart with data
    async function updateForecastChartWithData(historicalDates, historicalPrices, forecastData) {
        try {
            // Validate input data
            if (!Array.isArray(historicalDates) || !Array.isArray(historicalPrices) || !Array.isArray(forecastData)) {
                console.error('Invalid input data');
                showMessage('Invalid data format received', 'error');
                return;
            }

            // Convert historical data to points with error handling
            const historicalPoints = historicalDates
                .map((date, i) => ({
                    x: new Date(date).getTime(),
                    y: parseFloat(historicalPrices[i])
                }))
                .filter(point => !isNaN(point.x) && !isNaN(point.y) && point.y > 0);

            // Convert forecast data to points with error handling
            const forecastPoints = forecastData
                .map(item => ({
                    x: new Date(item.datetime).getTime(),
                    y: parseFloat(item.close),
                    confidence: item.confidence || 0.85
                }))
                .filter(point => !isNaN(point.x) && !isNaN(point.y) && point.y > 0);

            // Sort points by time
            historicalPoints.sort((a, b) => a.x - b.x);
            forecastPoints.sort((a, b) => a.x - b.x);

            // Validate we have enough data
            if (historicalPoints.length < 2 || forecastPoints.length < 1) {
                showMessage('Insufficient data for forecasting', 'error');
                return;
            }

            // Calculate and log data proportions
            const totalPoints = historicalPoints.length + forecastPoints.length;
            const historicalProportion = (historicalPoints.length / totalPoints * 100).toFixed(2);
            const forecastProportion = (forecastPoints.length / totalPoints * 100).toFixed(2);

            console.log('Data proportions:', {
                historicalPoints: historicalPoints.length,
                forecastPoints: forecastPoints.length,
                historicalProportion: historicalProportion + '%',
                forecastProportion: forecastProportion + '%'
            });

            // Ensure forecast starts from last historical point
            const lastHistoricalDate = historicalPoints[historicalPoints.length - 1].x;
            const filteredForecastPoints = forecastPoints.filter(point => point.x >= lastHistoricalDate);

            if (filteredForecastPoints.length === 0) {
                showMessage('No valid forecast data available', 'error');
                return;
            }

            // Update chart options
            forecastChart.options.scales.x.time.unit = getTimeUnit(historicalPoints[0].x, 
                filteredForecastPoints[filteredForecastPoints.length - 1].x);

            // Calculate y-axis range with padding
            const allPrices = [...historicalPoints.map(p => p.y), ...filteredForecastPoints.map(p => p.y)];
            const minPrice = Math.min(...allPrices);
            const maxPrice = Math.max(...allPrices);
            const padding = (maxPrice - minPrice) * 0.1;

            // Update chart options
            forecastChart.options.scales.y.min = minPrice - padding;
            forecastChart.options.scales.y.max = maxPrice + padding;

            // Update datasets
            forecastChart.data.datasets[0].data = historicalPoints;
            forecastChart.data.datasets[1].data = filteredForecastPoints;

            // Force chart update without animation for better performance
            forecastChart.update('none');

            // Update stats panel
            updateStatsPanel(historicalPoints, filteredForecastPoints);

        } catch (error) {
            console.error('Error updating forecast chart:', error);
            showMessage('Error updating forecast chart: ' + error.message, 'error');
        }
    }

    // Update the forecast buttons to use the new function
    document.querySelectorAll('#futureForecastingContainer .forecast-buttons button').forEach(button => {
        button.addEventListener('click', function() {
            const duration = this.getAttribute('data-interval');
            const symbol = document.getElementById('forecastInput').value.trim();
            
            if (!symbol) {
                showMessage('Please enter a stock symbol', 'error');
                return;
            }
            
            // Update active button state
            document.querySelectorAll('#futureForecastingContainer .forecast-buttons button').forEach(btn => {
                btn.classList.remove('active-button');
            });
            this.classList.add('active-button');
            
            // Fetch and update forecast data
            fetchAndUpdateForecastData(symbol, duration);
        });
    });

    // Add forecast search functionality
    const forecastSearchIcon = document.querySelector('.forecast-search-icon');
    if (forecastSearchIcon) {
        forecastSearchIcon.addEventListener('click', function() {
            const symbol = document.getElementById('forecastInput').value.trim();
            if (!symbol) {
                showMessage('Please enter a stock symbol for forecast', 'error');
                return;
            }
            // Use the first button's interval as default
            const defaultInterval = document.querySelector('#futureForecastingContainer .forecast-buttons button').getAttribute('data-interval');
            fetchAndUpdateForecastData(symbol, defaultInterval);
        });
    }

    // Add Enter key support for forecast input
    const forecastInputElement = document.getElementById('forecastInput');
    if (forecastInputElement) {
        forecastInputElement.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const symbol = this.value.trim();
                if (!symbol) {
                    showMessage('Please enter a stock symbol for forecast', 'error');
                    return;
                }
                const defaultInterval = document.querySelector('#futureForecastingContainer .forecast-buttons button').getAttribute('data-interval');
                fetchAndUpdateForecastData(symbol, defaultInterval);
            }
        });
    }
});

//---------------NEWS SECTION---------
// Add this function to fetch and display news
async function fetchAndDisplayNews() {
    try {
        const response = await fetch('https://finnhub.io/api/v1/news?category=general&token=cvm3r89r01qnndmbus70cvm3r89r01qnndmbus7g');
        const newsData = await response.json();
        
        const newsGrid = document.querySelector('.news-grid');
        newsGrid.innerHTML = ''; // Clear existing news

        if (!newsData || newsData.length === 0) {
            newsGrid.innerHTML = '<p class="error-message">No news available at the moment.</p>';
            return;
        }

        newsData.forEach(news => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card';
            
            // Convert Unix timestamp to readable date
            const date = new Date(news.datetime * 1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            newsCard.innerHTML = `
                <img src="${news.image}" alt="${news.headline}" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
                <div class="news-content">
                    <h3>${news.headline}</h3>
                    <p>${news.summary}</p>
                    <div class="news-meta">
                        <span class="news-source">${news.source}</span>
                        <span class="news-date">${date}</span>
                    </div>
                    <a href="${news.url}" target="_blank" class="read-more">Read More</a>
                </div>
            `;
            
            newsGrid.appendChild(newsCard);
        });
    } catch (error) {
        console.error('Error fetching news:', error);
        document.querySelector('.news-grid').innerHTML = '<p class="error-message">Failed to load news. Please try again later.</p>';
    }
} 