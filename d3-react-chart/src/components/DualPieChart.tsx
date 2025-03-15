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

const DualPieChart = () => {
  const svgSalesRef = useRef<SVGSVGElement | null>(null);
  const svgRevenueRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [theme] = useState(lightTheme);
  const [dimensions, setDimensions] = useState({ width: 320, height: 320 });

  const data: DataPoint[] = sampleData;
  const pieDataSales: PieData[] = data.map((d) => ({ label: d.month, value: d.sales }));
  const pieDataRevenue: PieData[] = data.map((d) => ({ label: d.month, value: d.revenue }));

  const salesColors = d3.scaleOrdinal<string>().domain(data.map((d) => d.month)).range(d3.schemeCategory10);
  const revenueColors = d3.scaleOrdinal<string>().domain(data.map((d) => d.month)).range(d3.schemeSet3);

  useEffect(() => {
    const handleResize = () => {
      const windowWidth = window.innerWidth;
      let size = windowWidth >= 1200 ? 320 : windowWidth * 0.6;
      setDimensions({ width: size, height: size });
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const drawPieChart = (svgRef: React.RefObject<SVGSVGElement>, pieData: PieData[], colors: d3.ScaleOrdinal<string, string>) => {
    if (!svgRef.current || !tooltipRef.current) return;
    const { width, height } = dimensions;
    const radius = Math.min(width, height) / 2.3;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    const g = svg.append("g").attr("transform", `translate(${width / 2}, ${height / 2})`);
    const pie = d3.pie<PieData>().value((d) => d.value);
    const arcs = pie(pieData);
    const arcGenerator = d3.arc<d3.PieArcDatum<PieData>>().innerRadius(0).outerRadius(radius - 5);
    const tooltip = d3.select(tooltipRef.current);

    g.selectAll("path")
      .data(arcs)
      .enter()
      .append("path")
      .attr("d", arcGenerator)
      .attr("fill", (d) => colors(d.data.label) as string)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseover", function (event, d) {
        tooltip
          .style("opacity", 1)
          .html(`${d.data.label}<br/>Value: $${d.data.value}`)
          .attr("class", `tooltip ${theme === lightTheme ? "light" : "dark"}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 40}px`);
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

    // Labels - Centered in Each Slice
    g.selectAll("text")
      .data(arcs)
      .enter()
      .append("text")
      .attr("transform", (d) => {
        const pos = arcGenerator.centroid(d);
        return `translate(${pos[0]}, ${pos[1]})`; // Center text within the slice
      })
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .style("font-size", "0.75rem")
      .style("font-weight", "bold")
      .text((d) => d.data.label);
  };

  useEffect(() => {
    drawPieChart(svgSalesRef, pieDataSales, salesColors);
    drawPieChart(svgRevenueRef, pieDataRevenue, revenueColors);
  }, [dimensions, pieDataSales, pieDataRevenue, salesColors, revenueColors]);

  return (
    <ThemeProvider theme={theme}>
      <div className="chart-container">
        <h2 className="chart-title">📊 Month-wise Sales & Revenue Breakdown</h2>
        <div className="dual-pie-wrapper" style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
          <div>
            <h3 style={{ textAlign: "center", fontWeight: "bold", color: theme.text }}>Sales Distribution</h3>
            <svg ref={svgSalesRef} className="chart-svg" style={{ width: dimensions.width, height: dimensions.height }} />
          </div>
          <div>
            <h3 style={{ textAlign: "center", fontWeight: "bold", color: theme.text }}>Revenue Distribution</h3>
            <svg ref={svgRevenueRef} className="chart-svg" style={{ width: dimensions.width, height: dimensions.height }} />
          </div>
        </div>
        <div ref={tooltipRef} className="tooltip" />
      </div>
    </ThemeProvider>
  );
};

export default DualPieChart;
