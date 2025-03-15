import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import sampleData from "../data/sampleData.json";
import { ThemeProvider } from "styled-components";
import "../styles/Chart.css"; // Import existing CSS for consistency

interface DataPoint {
  month: string;
  sales: number;
  revenue: number;
}

interface PieData {
  label: string;
  value: number;
}

const lightTheme = {
  background: "#f8f9fa",
  text: "#333",
  tooltipBg: "#2c3e50",
  tooltipText: "#ecf0f1",
};

const darkTheme = {
  background: "#795d55",
  text: "#fff",
  tooltipBg: "#3498db",
  tooltipText: "#ffffff",
};

const PieChart = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [theme, setTheme] = useState(lightTheme);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });

  // Compute total sales and revenue from the static data
  const dataPoints: DataPoint[] = sampleData;
  const totalSales = dataPoints.reduce((acc, cur) => acc + cur.sales, 0);
  const totalRevenue = dataPoints.reduce((acc, cur) => acc + cur.revenue, 0);

  const pieData: PieData[] = [
    { label: "Sales", value: totalSales },
    { label: "Revenue", value: totalRevenue },
  ];

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      let width, height;
      if (windowWidth >= 1200) {
        width = 400;
        height = 400;
      } else {
        width = windowWidth * 0.8;
        height = width; // keep square
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
    const radius = Math.min(width, height) / 2;

    // Clear previous svg content
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create a centered group container
    const g = svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Create the pie layout
    const pie = d3.pie<PieData>().value((d) => d.value);
    const arcs = pie(pieData);

    // Create the arc generator
    const arcGenerator = d3
      .arc<d3.PieArcDatum<PieData>>()
      .innerRadius(0)
      .outerRadius(radius);

    // Define a color scale
    const color = d3
      .scaleOrdinal<string>()
      .domain(pieData.map((d) => d.label))
      .range(["#3498db", "#e74c3c"]);

    const tooltip = d3.select(tooltipRef.current);

    // Append pie slices
    g.selectAll("path")
      .data(arcs)
      .enter()
      .append("path")
      .attr("d", arcGenerator)
      .attr("fill", (d) => color(d.data.label) as string)
      .on("mouseover", function (event, d) {
        tooltip
          .style("opacity", 1)
          .attr("class", `tooltip ${theme === lightTheme ? "light" : "dark"}`)
          .html(`${d.data.label}: $${d.data.value}`)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY - 28}px`);
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      });

    // Append data labels (as percentages)
    const total = d3.sum(pieData, (d) => d.value);
    g.selectAll(".label")
      .data(arcs)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("transform", (d) => `translate(${arcGenerator.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("fill", theme.text)
      .style("font-size", "0.9rem")
      .style("font-weight", "bold")
      .text((d) => {
        const percent = (d.data.value / total) * 100;
        return `${Math.round(percent)}%`;
      });

    // Append Legend (centered at bottom)
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(10, ${height - 30})`);
    
    legend.selectAll("rect")
      .data(pieData)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * 120)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", (d) => color(d.label) as string);
    
    legend.selectAll("text")
      .data(pieData)
      .enter()
      .append("text")
      .attr("x", (d, i) => i * 120 + 20)
      .attr("y", 12)
      .attr("fill", theme.text)
      .style("font-size", "0.9rem")
      .text((d) => d.label);

  }, [dimensions, theme, pieData]);

  const toggleTheme = () => {
    setTheme(theme === lightTheme ? darkTheme : lightTheme);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="chart-container">
        <h2 className="chart-title">📊 Sales vs Revenue Distribution</h2>
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

export default PieChart;
