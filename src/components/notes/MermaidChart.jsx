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
      flowchart: {
        useMaxWidth: false,
        htmlLabels: false, // Set to false to avoid Tailwind CSS resets breaking the node styling
      }
    });

    if (chartRef.current && chart) {
      const renderChart = async () => {
        try {
          // Use a valid, unique ID for the SVG
          const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
          const { svg } = await mermaid.render(id, chart);
          if (chartRef.current) {
            chartRef.current.innerHTML = svg;
          }
        } catch (error) {
          console.error('Mermaid rendering failed:', error);
          if (chartRef.current) {
            chartRef.current.innerHTML = `<div class="text-red-500 bg-red-500/10 p-4 rounded-xl text-sm overflow-x-auto">Failed to render diagram: ${error.message}</div>`;
          }
        }
      };
      renderChart();
    }
  }, [chart, isDarkMode]);

  return (
    <div className="mermaid-chart w-full overflow-x-auto my-6 flex justify-center items-center py-4 rounded-xl bg-surface/30 border border-surfaceBorder">
      <div ref={chartRef} className="min-w-fit" />
    </div>
  );
}
