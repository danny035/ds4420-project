// ===================================
// INTERACTIVE VISUALIZATIONS
// ===================================

// Global variable to store loaded data
let predictionData = null;
let scatterChart = null;
let currentModel = 'mlp';

// ===================================
// LOAD REAL PREDICTION DATA
// ===================================

async function loadPredictionData() {
    try {
        const response = await fetch('data/predictions.json');
        if (!response.ok) {
            throw new Error('Failed to load predictions.json');
        }
        predictionData = await response.json();
        console.log(`✓ Loaded ${predictionData.length} real predictions`);
        return predictionData;
    } catch (error) {
        console.error('Error loading predictions:', error);
        console.log('⚠ Falling back to synthetic data');
        // Fallback to synthetic data if JSON loading fails
        return generateSampleData(200);
    }
}

// We fall back to synthetic data (if JSON fails to load)
function generateSampleData(numPoints = 200) {
    const data = [];
    for (let i = 0; i < numPoints; i++) {
        const actual = Math.max(30, Math.min(95, 71 + (Math.random() - 0.5) * 24));
        const mlpError = (Math.random() - 0.5) * 21;
        const mlpPredicted = Math.max(30, Math.min(95, actual + mlpError));
        const bayesError = (Math.random() - 0.5) * 22;
        const bayesPredicted = Math.max(30, Math.min(95, actual + bayesError));
        
        data.push({
            actual: actual,
            mlp: mlpPredicted,
            bayesian: bayesPredicted
        });
    }
    return data;
}

// ===================================
// SCATTER PLOT: PREDICTED VS ACTUAL
// ===================================

function createScatterPlot(modelType) {
    const ctx = document.getElementById('scatterChart');
    if (!ctx || !predictionData) return;

    // Destroying an existing chart if there is one
    if (scatterChart) {
        scatterChart.destroy();
    }

    // Prepare data based on model type
    const predictedValues = predictionData.map(d => modelType === 'mlp' ? d.mlp : d.bayesian);
    const actualValues = predictionData.map(d => d.actual);

    // Create diagonal line data (perfect predictions)
    const minVal = Math.min(...actualValues, ...predictedValues);
    const maxVal = Math.max(...actualValues, ...predictedValues);
    const diagonalData = [
        { x: minVal, y: minVal },
        { x: maxVal, y: maxVal }
    ];

    scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: modelType === 'mlp' ? 'MLP Predictions' : 'Bayesian Predictions',
                    data: predictedValues.map((pred, i) => ({
                        x: actualValues[i],
                        y: pred
                    })),
                    backgroundColor: modelType === 'mlp' ? 'rgba(102, 126, 234, 0.5)' : 'rgba(118, 75, 162, 0.5)',
                    borderColor: modelType === 'mlp' ? 'rgba(102, 126, 234, 0.8)' : 'rgba(118, 75, 162, 0.8)',
                    borderWidth: 1,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Perfect Prediction',
                    data: diagonalData,
                    type: 'line',
                    borderColor: 'rgba(204, 0, 0, 0.8)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            plugins: {
                title: {
                    display: true,
                    text: modelType === 'mlp' ? 'Wide & Deep MLP: Predicted vs Actual' : 'Bayesian Model: Predicted vs Actual',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (context.dataset.label.includes('Perfect')) return null;
                            const actual = context.parsed.x.toFixed(1);
                            const predicted = context.parsed.y.toFixed(1);
                            const error = Math.abs(predicted - actual).toFixed(1);
                            return `Actual: ${actual}, Predicted: ${predicted}, Error: ${error}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Actual User Rating',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    min: Math.floor(minVal / 10) * 10,
                    max: Math.ceil(maxVal / 10) * 10,
                    ticks: {
                        stepSize: 10
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Predicted User Rating',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    min: Math.floor(minVal / 10) * 10,
                    max: Math.ceil(maxVal / 10) * 10,
                    ticks: {
                        stepSize: 10
                    }
                }
            }
        }
    });

    // Log RMSE for verification
    const rmse = Math.sqrt(
        predictedValues.reduce((sum, pred, i) => 
            sum + Math.pow(pred - actualValues[i], 2), 0
        ) / predictedValues.length
    );
    console.log(`${modelType.toUpperCase()} RMSE from chart data: ${rmse.toFixed(2)}`);
}

// ===================================
// FEATURE IMPORTANCE CHART
// ===================================

function createFeatureChart() {
    const ctx = document.getElementById('featureChart');
    if (!ctx) return;

    // Top 15 features from Bayesian model
    const features = [
        'Critic Score',
        'Genre: Sports',
        'Platform: PC',
        'Rating: E10+',
        'Platform: Xbox One',
        'Rating: K-A',
        'Year of Release',
        'Platform: PS2',
        'Platform: Wii',
        'Genre: Strategy',
        'User Count',
        'Global Sales',
        'Platform: DS',
        'Genre: Fighting',
        'Platform: PS3'
    ];

    const coefficients = [
        9.05,   // Critic Score
        -4.69,  // Sports
        -4.34,  // PC
        -4.10,  // E10+
        -3.56,  // Xbox One
        -3.44,  // K-A
        -2.32,  // Year
        2.65,   // PS2
        2.43,   // Wii
        -2.31,  // Strategy
        1.89,   // User Count
        1.67,   // Global Sales
        -1.54,  // DS
        1.42,   // Fighting
        -1.28   // PS3
    ];

    // Colors based on positive/negative
    const colors = coefficients.map(c => 
        c > 0 ? 'rgba(72, 187, 120, 0.7)' : 'rgba(245, 101, 101, 0.7)'
    );

    const borderColors = coefficients.map(c => 
        c > 0 ? 'rgba(72, 187, 120, 1)' : 'rgba(245, 101, 101, 1)'
    );

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: features,
            datasets: [{
                label: 'Coefficient Value',
                data: coefficients,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.2,
            plugins: {
                title: {
                    display: true,
                    text: 'Top 15 Most Important Features',
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.x.toFixed(2);
                            const direction = value > 0 ? 'increases' : 'decreases';
                            return `${direction} rating by ${Math.abs(value)} points`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Effect on User Rating (points)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        drawOnChartArea: true,
                        color: function(context) {
                            if (context.tick.value === 0) {
                                return 'rgba(204, 0, 0, 0.5)';
                            }
                            return 'rgba(0, 0, 0, 0.1)';
                        },
                        lineWidth: function(context) {
                            if (context.tick.value === 0) {
                                return 2;
                            }
                            return 1;
                        }
                    }
                },
                y: {
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// ===================================
// EVENT LISTENERS
// ===================================

document.addEventListener('DOMContentLoaded', async function() {
    // Load prediction data first
    predictionData = await loadPredictionData();
    
    createScatterPlot('mlp');
    createFeatureChart();

    // Model toggle buttons
    const mlpBtn = document.getElementById('mlpBtn');
    const bayesianBtn = document.getElementById('bayesianBtn');

    if (mlpBtn && bayesianBtn) {
        mlpBtn.addEventListener('click', function() {
            currentModel = 'mlp';
            mlpBtn.classList.add('active');
            bayesianBtn.classList.remove('active');
            createScatterPlot('mlp');
        });

        bayesianBtn.addEventListener('click', function() {
            currentModel = 'bayesian';
            bayesianBtn.classList.add('active');
            mlpBtn.classList.remove('active');
            createScatterPlot('bayesian');
        });
    }
});

// ===================================
// SMOOTH SCROLL FOR LINKS
// ===================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});