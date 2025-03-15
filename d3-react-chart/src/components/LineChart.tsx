import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import sampleData from "../data/sampleData.json";
import { ThemeProvider } from "styled-components";
import "../styles/Chart.css"; // Reuse existing CSS

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
  salesLine: "#3498db",   // Blue for sales
  revenueLine: "#e74c3c", // Red for revenue
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
  salesLine: "#1f78b4",   // Darker blue
  revenueLine: "#d62728", // Darker red
};

const LineChart = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState(lightTheme);
  const [data, setData] = useState<DataPoint[]>(sampleData);
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });

  // Responsive dimensions
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
    const margin = { top: 60, right: 50, bottom: 60, left: 60 };

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("background", theme.background)
      .style("border-radius", "12px");

    // Clear previous content
    svg.selectAll("*").remove();

    // Create xScale (using scalePoint for categorical months)
    const months = data.map((d) => d.month);
    const xScale = d3
      .scalePoint()
      .domain(months)
      .range([margin.left, width - margin.right])
      .padding(0.5);

    // yScale: using the maximum of sales and revenue values
    const maxY = d3.max(data, (d) => Math.max(d.sales, d.revenue)) || 0;
    const yScale = d3
      .scaleLinear()
      .domain([0, maxY * 1.1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).ticks(6);

    svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fill", theme.text)
      .style("font-size", "1rem")
      .style("font-weight", "bold");

    svg.append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis)
      .selectAll("text")
      .attr("fill", theme.text)
      .style("font-size", "1rem")
      .style("font-weight", "bold");

    const tooltip = d3.select(tooltipRef.current);

    // Create line generator for Sales
    const lineSales = d3.line<DataPoint>()
      .x((d) => xScale(d.month)!)
      .y((d) => yScale(d.sales))
      .curve(d3.curveMonotoneX);

    // Create line generator for Revenue
    const lineRevenue = d3.line<DataPoint>()
      .x((d) => xScale(d.month)!)
      .y((d) => yScale(d.revenue))
      .curve(d3.curveMonotoneX);

    // Draw Sales Line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", theme.salesLine)
      .attr("stroke-width", 2)
      .attr("d", lineSales);

    // Draw Revenue Line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", theme.revenueLine)
      .attr("stroke-width", 2)
      .attr("d", lineRevenue);

    // Draw circles for Sales data points
    svg.selectAll(".sales-circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "sales-circle")
      .attr("cx", (d) => xScale(d.month)!)
      .attr("cy", (d) => yScale(d.sales))
      .attr("r", 4)
      .attr("fill", theme.salesLine)
      .on("mouseover", function (event, d) {
        const cx = d3.select(this).attr("cx");
        const cy = d3.select(this).attr("cy");
        tooltip
          .style("opacity", 1)
          .html(`${d.month}<br/>Sales: $${d.sales}`)
          .attr("class", `tooltip ${theme === lightTheme ? "light" : "dark"}`)
          .style("left", `${cx}px`)
          .style("top", `${parseFloat(cy) - 10}px`);
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

    // Draw circles for Revenue data points
    svg.selectAll(".revenue-circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "revenue-circle")
      .attr("cx", (d) => xScale(d.month)!)
      .attr("cy", (d) => yScale(d.revenue))
      .attr("r", 4)
      .attr("fill", theme.revenueLine)
      .on("mouseover", function (event, d) {
        const cx = d3.select(this).attr("cx");
        const cy = d3.select(this).attr("cy");
        tooltip
          .style("opacity", 1)
          .html(`${d.month}<br/>Revenue: $${d.revenue}`)
          .attr("class", `tooltip ${theme === lightTheme ? "light" : "dark"}`)
          .style("left", `${cx}px`)
          .style("top", `${parseFloat(cy) - 10}px`);
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

    // Add Legend (Centered at the top)
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${(width / 2) - 80}, ${margin.top - 30})`);

    // Sales legend
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", theme.salesLine);
    legend.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .attr("fill", theme.text)
      .style("font-size", "0.9rem")
      .style("font-weight", "bold")
      .text("Sales");

    // Revenue legend
    legend.append("rect")
      .attr("x", 100)
      .attr("y", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", theme.revenueLine);
    legend.append("text")
      .attr("x", 120)
      .attr("y", 12)
      .attr("fill", theme.text)
      .style("font-size", "0.9rem")
      .style("font-weight", "bold")
      .text("Revenue");

  }, [data, theme, dimensions]);

  const toggleTheme = () => {
    setTheme(theme === lightTheme ? darkTheme : lightTheme);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="chart-container">
        <h2 className="chart-title">📊 Monthly Sales & Revenue Line Chart</h2>
        <div className="controls">
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

export default LineChart;
