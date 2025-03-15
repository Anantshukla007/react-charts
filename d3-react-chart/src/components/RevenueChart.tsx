import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import sampleData from "../data/sampleData.json";
import { ThemeProvider } from "styled-components";
import "../styles/Chart.css"; // Import CSS file

interface DataPoint {
  month: string;
  sales: number;
  revenue: number;
}

const lightTheme = {
  background: "#f8f9fa",
  text: "#333",
  tooltipBg: "#2c3e50",
  tooltipText: "#ecf0f1",
  buttonBg: "#3498db",
  buttonHover: "#2980b9",
  buttonText: "#fff",
  axis: "#333",
  barGradient: ["#e74c3c", "#e67e22"],
};

const darkTheme = {
  background: "#795d55",
  text: "#fff",
  tooltipBg: "#3498db",
  tooltipText: "#ffffff",
  buttonBg: "#2980b9",
  buttonHover: "#1f6692",
  buttonText: "#ecf0f1",
  axis: "#fff",
  barGradient: ["#c0392b", "#d35400"],
};

const RevenueChart = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState(lightTheme);
  const [data, setData] = useState<DataPoint[]>(sampleData);
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      let width, height;
      if (windowWidth >= 1200) {
        width = 800;
        height = 450;
      } else {
        width = windowWidth * 0.9;
        height = width * 0.5;
      }
      setDimensions({ width, height });
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !tooltipRef.current) return;
    const { width, height } = dimensions;
    const margin = { top: 40, right: 40, bottom: 80, left: 80 };

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", theme.background)
      .style("border-radius", "12px");

    svg.selectAll("*").remove();

    // Gradient Definition for Revenue Bars
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "revenueBarGradient")
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", theme.barGradient[0]);
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", theme.barGradient[1]);

    const xScale = d3
      .scaleBand<string>()
      .domain(data.map((d) => d.month))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.revenue)! * 1.1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Draw Axes for Revenue Chart
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", theme.text)
      .style("font-size", "1rem")
      .style("font-weight", "bold");

    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale).ticks(6))
      .selectAll("text")
      .attr("fill", theme.text)
      .style("font-size", "1rem")
      .style("font-weight", "bold");

    const tooltip = d3.select(tooltipRef.current);

    // Draw Revenue Bars with Tooltip (using 'revenue' data)
    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.month)!)
      .attr("y", (d) => yScale(d.revenue))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - margin.bottom - yScale(d.revenue))
      .attr("fill", "url(#revenueBarGradient)")
      .on("mouseover", function (event, d) {
        const currentBar = d3.select(this);
        const barX = parseFloat(currentBar.attr("x"));
        const barY = parseFloat(currentBar.attr("y"));
        const barWidth = parseFloat(currentBar.attr("width"));
        tooltip
          .style("opacity", 1)
          .attr("class", `tooltip ${theme === lightTheme ? "light" : "dark"}`)
          .html(`${d.month}<br/>Revenue: $${d.revenue}`)
          .style("left", `${barX + barWidth / 2}px`)
          .style("top", `${barY - 10}px`);
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      });

    // Add Revenue Data Labels
    svg
      .selectAll(".label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => xScale(d.month)! + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d.revenue) - 5)
      .attr("text-anchor", "middle")
      .attr("fill", theme.text)
      .style("font-size", "0.9rem")
      .style("font-weight", "bold")
      .text((d) => d.revenue);

    // Add Legend for Revenue Chart (Centered at the top)
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${(width / 2) - 50}, ${margin.top - 20})`);

    legend.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", "url(#revenueBarGradient)");

    legend.append("text")
      .attr("x", 30)
      .attr("y", 15)
      .attr("fill", theme.text)
      .style("font-size", "1rem")
      .style("font-weight", "bold")
      .text("Monthly Revenue");

  }, [data, theme, dimensions]);

  // Updated addDataPoint: update revenue for the current month if it exists, otherwise append new data.
  const addDataPoint = () => {
    const newMonth = new Date().toLocaleString("en-US", { month: "short" });
    const newRevenue = Math.floor(Math.random() * 400) + 100;
    const monthExists = data.find((d) => d.month === newMonth);
    if (monthExists) {
      setData(data.map((d) => (d.month === newMonth ? { ...d, revenue: newRevenue } : d)));
    } else {
      setData([...data, { month: newMonth, sales: 0, revenue: newRevenue }]);
    }
  };

  const filterData = () => {
    setData(data.filter((d) => d.revenue >= 200));
  };

  const toggleTheme = () => {
    setTheme(theme === lightTheme ? darkTheme : lightTheme);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="chart-container">
        <h2 className="chart-title">📊 Monthly Revenue Chart</h2>
        <div className="controls">
          <button className="button" onClick={addDataPoint}>
            Add Data
          </button>
          <button className="button" onClick={filterData}>
            Filter Revenue ≥ $200
          </button>
          <button className="button" onClick={toggleTheme}>
            Toggle Theme
          </button>
        </div>
        <div ref={tooltipRef} className="tooltip" />
        <svg ref={svgRef} className="chart-svg" />
      </div>
    </ThemeProvider>
  );
};

export default RevenueChart;
