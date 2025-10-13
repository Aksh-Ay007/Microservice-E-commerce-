 "use client";


import React, { useState } from 'react';
import dynamic from "next/dynamic";


// Dynamically import Chart only on client side (no SSR)
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

function SalesChart() {
  // A Line or Area chart is great for showing trends over time (sales)
  const [chartData] = useState({
    // The main data to be plotted on the chart
    series: [
      {
        name: "Monthly Sales", // Name of the line/series for the tooltip and legend
        data: [400, 550, 480, 700, 690, 1000, 1100, 950, 1200, 1500, 1400, 1800],
      },
    ],
    // Configuration options for the chart's appearance and behavior
    options: {
      chart: {
        id: 'sales-line-chart', // Unique ID for the chart
        type: 'line', // The type of chart to render
        height: 350,
        toolbar: {
          show: true,
        }
      },
      title: {
        text: 'Annual Sales Performance',
        align: 'left',
      },
      // X-axis configuration (The time-based categories)
      xaxis: {
        categories: [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ], // Categories for the X-axis
        title: {
          text: 'Month'
        }
      },
      // Y-axis configuration (The sales values)
      yaxis: {
        title: {
          text: 'Revenue ($)'
        }
      },
      // Styling the line to make it smooth (spline chart)
      stroke: {
        curve: 'smooth', // Can be 'smooth', 'straight', or 'stepline'
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "$" + val + " thousand"
          }
        }
      },
      dataLabels: {
        enabled: false, // Hide data labels on the line itself
      },
    },
  });

  return (
    <div className="chart-container">
      <Chart
        options={chartData.options}
        series={chartData.series}
        type="line" // Must match chart.type in options if not using a combo chart
        height={350}
      />
    </div>
  );
}

export default SalesChart;
