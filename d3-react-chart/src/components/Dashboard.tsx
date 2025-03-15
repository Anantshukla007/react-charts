import { useState } from "react";
import Chart from "./Chart";
import RevenueChart from "./RevenueChart";
import DualPieChart from "./DualPieChart";
import LineChart from "./LineChart";
import "../styles/Chart.css";

const Dashboard = () => {
  // Extend state type to include "line"
  const [chartType, setChartType] = useState<"sales" | "revenue" | "pie" | "line">("sales");

  return (
    <div className="chart-wrapper">
      {chartType === "sales" && <Chart />}
      {chartType === "revenue" && <RevenueChart />}
      {chartType === "pie" && <DualPieChart />}
      {chartType === "line" && <LineChart />}
      <div className="controls" style={{ marginTop: "2rem" }}>
        <button className="button" onClick={() => setChartType("sales")}>
          Sales Chart
        </button>
        <button className="button" onClick={() => setChartType("revenue")}>
          Revenue Chart
        </button>
        <button className="button" onClick={() => setChartType("pie")}>
          Dual Pie Chart
        </button>
        <button className="button" onClick={() => setChartType("line")}>
          Line Chart
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
