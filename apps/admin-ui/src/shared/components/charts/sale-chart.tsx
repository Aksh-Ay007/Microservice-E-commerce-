"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import Chart only on client side (no SSR)
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type SalesChartProps = {
  categories?: string[];
  series?: number[];
  title?: string;
};

function SalesChart({ categories, series, title = "Revenue" }: SalesChartProps) {
  const categoriesSafe =
    categories && categories.length > 0
      ? categories
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const seriesSafe = series && series.length > 0 ? series : [400, 550, 480, 700, 690, 1000, 1100, 950, 1200, 1500, 1400, 1800];

  const options: any = {
    chart: {
      id: "sales-line-chart",
      type: "line",
      height: 350,
      toolbar: { show: true },
      foreColor: "#cbd5e1",
    },
    title: { text: title, align: "left" },
    xaxis: {
      categories: categoriesSafe,
      title: { text: "Month" },
      labels: { style: { colors: Array(categoriesSafe.length).fill("#94a3b8") } },
    },
    yaxis: { title: { text: "Revenue ($)" } },
    stroke: { curve: "smooth" },
    tooltip: {
      theme: "dark",
      y: { formatter: (val: number) => `$${val.toFixed(2)}` },
    },
    dataLabels: { enabled: false },
    grid: { borderColor: "#334155" },
  };

  const seriesData: any = [
    {
      name: "Monthly Revenue",
      data: seriesSafe,
    },
  ];

  return (
    <div className="chart-container">
      <Chart options={options} series={seriesData} type="line" height={350} />
    </div>
  );
}

export default SalesChart;
