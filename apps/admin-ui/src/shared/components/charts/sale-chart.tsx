"use client";

import React, { useState, useEffect } from 'react';
import dynamic from "next/dynamic";

// Dynamically import Chart only on client side (no SSR)
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

function SalesChart({ data = [] }: { data?: any[] }) {
  const [chartData, setChartData] = useState({
    series: [
      {
        name: "Revenue",
        data: [],
      },
      {
        name: "Orders",
        data: [],
      },
    ],
    options: {
      chart: {
        id: 'sales-line-chart',
        type: 'line',
        height: 350,
        toolbar: {
          show: true,
        },
        background: '#1e293b',
      },
      theme: {
        mode: 'dark',
      },
      colors: ['#4ade80', '#60a5fa'],
      title: {
        text: 'Sales Performance',
        align: 'left',
        style: {
          color: '#fff',
        }
      },
      xaxis: {
        categories: [],
        labels: {
          style: {
            colors: '#94a3b8',
          }
        },
        title: {
          text: 'Date',
          style: {
            color: '#94a3b8',
          }
        }
      },
      yaxis: [
        {
          title: {
            text: 'Revenue ($)',
            style: {
              color: '#4ade80',
            }
          },
          labels: {
            style: {
              colors: '#94a3b8',
            },
            formatter: function (val: number) {
              return "$" + val.toFixed(2);
            }
          }
        },
        {
          opposite: true,
          title: {
            text: 'Orders',
            style: {
              color: '#60a5fa',
            }
          },
          labels: {
            style: {
              colors: '#94a3b8',
            }
          }
        }
      ],
      stroke: {
        curve: 'smooth',
        width: 2,
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: function (val: number) {
            return "$" + val.toFixed(2);
          }
        }
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        labels: {
          colors: '#94a3b8',
        }
      },
      grid: {
        borderColor: '#334155',
      }
    },
  });

  useEffect(() => {
    if (data && data.length > 0) {
      const categories = data.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });
      
      const revenueData = data.map(item => item.revenue);
      const ordersData = data.map(item => item.orders);

      setChartData(prev => ({
        ...prev,
        series: [
          {
            name: "Revenue",
            data: revenueData,
          },
          {
            name: "Orders",
            data: ordersData,
          },
        ],
        options: {
          ...prev.options,
          xaxis: {
            ...prev.options.xaxis,
            categories: categories,
          }
        }
      }));
    }
  }, [data]);

  return (
    <div className="chart-container">
      <Chart
        options={chartData.options}
        series={chartData.series}
        type="line"
        height={350}
      />
    </div>
  );
}

export default SalesChart;
