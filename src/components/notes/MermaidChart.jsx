import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { useTheme } from '../../context/ThemeContext';

export default function MermaidChart({ chart }) {
  const chartRef = useRef(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: isDarkMode ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
      flowchart: {
        useMaxWidth: false, // Allow scrolling for wide diagrams
        htmlLabels: true,
        curve: 'basis'
      },
      themeVariables: {
        fontSize: '14px',
        primaryColor: '#3b82f6',
        primaryTextColor: '#fff',
        primaryBorderColor: '#3b82f6',
        lineColor: isDarkMode ? '#4b5563' : '#9ca3af',
        secondaryColor: '#10b981',
        tertiaryColor: '#f59e0b',
      }
    });

    if (chartRef.current && chart) {
      const renderChart = async () => {
        try {
          chartRef.current.innerHTML = '';
          const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          if (chartRef.current) {
            chartRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Mermaid rendering failed:', error);
          if (chartRef.current) {
            chartRef.current.innerHTML = `<div class="text-red-500 bg-red-500/10 p-4 rounded-xl text-sm overflow-x-auto font-sans">Failed to render diagram: ${error.message}</div>`;
          }
        }
      };
      renderChart();
    }
  }, [chart, isDarkMode]);

  return (
    <div className="mermaid-chart w-full overflow-x-auto my-6 py-4 px-4 rounded-xl bg-surface/30 border border-surfaceBorder scrollbar-thin scrollbar-thumb-surfaceBorder scrollbar-track-transparent text-center">
      <div ref={chartRef} className="inline-block min-w-fit" />
    </div>
  );
}
