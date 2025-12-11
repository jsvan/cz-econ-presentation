// Chart.js Global Configuration
// This file sets up common defaults for all charts in the presentation

(function() {
    'use strict';

    // Set global Chart.js defaults
    Chart.defaults.color = '#a3a3a3';
    Chart.defaults.borderColor = '#2a2a2a';
    Chart.defaults.font.family = "'Source Sans 3', sans-serif";

    // Disable datalabels plugin by default (enable per-chart as needed)
    Chart.defaults.plugins.datalabels = { display: false };

    // Common chart options presets
    window.ChartPresets = {
        // Default options for line charts
        line: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' }
            },
            scales: {
                y: {
                    grid: { color: '#1a1a1a' }
                },
                x: {
                    grid: { color: '#1a1a1a' }
                }
            }
        },

        // Default options for horizontal bar charts
        horizontalBar: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { color: '#1a1a1a' }
                },
                y: {
                    grid: { display: false }
                }
            }
        },

        // Default options for doughnut charts
        doughnut: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: { color: '#a3a3a3', padding: 15 }
                }
            }
        }
    };

    // Color palette for consistent styling
    window.ChartColors = {
        gold: '#c9a227',
        red: '#b8342e',
        blue: '#2563eb',
        green: '#16a34a',
        purple: '#7c3aed',
        gray: '#555',
        darkGray: '#333',

        // With transparency
        goldAlpha: 'rgba(201, 162, 39, 0.2)',
        redAlpha: 'rgba(184, 52, 46, 0.1)',
        blueAlpha: 'rgba(37, 99, 235, 0.2)',
        greenAlpha: 'rgba(22, 163, 74, 0.2)',
        grayAlpha: 'rgba(107, 107, 107, 0.1)'
    };

    // Registry for chart instances (for cleanup/resize)
    window.ChartRegistry = {
        charts: {},

        register: function(id, chart) {
            this.charts[id] = chart;
        },

        destroy: function(id) {
            if (this.charts[id]) {
                this.charts[id].destroy();
                delete this.charts[id];
            }
        },

        destroyAll: function() {
            Object.keys(this.charts).forEach(id => this.destroy(id));
        },

        get: function(id) {
            return this.charts[id];
        }
    };

    // Helper to create a chart and register it
    window.createChart = function(canvasId, config) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn('Canvas not found:', canvasId);
            return null;
        }

        // Destroy existing chart on same canvas
        ChartRegistry.destroy(canvasId);

        const chart = new Chart(canvas, config);
        ChartRegistry.register(canvasId, chart);
        return chart;
    };

    // Initialize charts when a slide becomes visible
    // This is important because Chart.js doesn't render correctly in hidden containers
    window.initChartsForSlide = function(slideIndex) {
        // First try the dynamically mapped function (handles reordered slides)
        if (window.slideInitFunctions && typeof window.slideInitFunctions[slideIndex] === 'function') {
            window.slideInitFunctions[slideIndex]();
            return;
        }
        // Fallback to legacy naming convention
        const initFn = window['initChartsSlide' + slideIndex];
        if (typeof initFn === 'function') {
            initFn();
        }
    };

    console.log('Chart.js common configuration loaded');
})();
