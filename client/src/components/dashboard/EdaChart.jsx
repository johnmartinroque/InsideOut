import React from "react";
import Chart from "react-apexcharts";

function EdaChart() {
  const chartConfig = {
    series: [
      {
        name: "EDA (µS)", // <-- label for EDA data
        data: [0.5, 0.8, 1.2, 0.9, 1.5, 1.1], // sample GSR/EDA values
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 300,
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: "50%",
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val) => `${val} µS`, // show units
      },
      xaxis: {
        categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], // time or days
        title: { text: "Days" },
      },
      yaxis: {
        title: { text: "Electrodermal Activity (µS)" },
        min: 0,
      },
      colors: ["#00897b"], // teal/green for biometric feel
    },
  };

  return (
    <div className="relative flex flex-col rounded-xl bg-white p-6 shadow-md">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-max rounded-lg bg-gray-900 p-5 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6l4 2"
            />
          </svg>
        </div>
        <div>
          <h6 className="text-base font-semibold text-gray-900">
            Electrodermal Activity
          </h6>
          <p className="text-sm text-gray-700">
            Visualize your EDA (GSR sensor) data in µS.
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="pt-6">
        <Chart
          options={chartConfig.options}
          series={chartConfig.series}
          type="bar"
          height={250}
          width={700}
        />
      </div>
    </div>
  );
}

export default EdaChart;
