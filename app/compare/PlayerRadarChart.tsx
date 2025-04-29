import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Define the PlayerRadarChart component
interface Player {
  name: string;
  [key: string]: string | number; // Adjust based on the actual structure of player stats
}

// Define position-specific stats
const positionStats = {
  defender: [
    "AerWonPerc",
    "TklWon",
    "Clr",
    "BlkSh",
    "Int",
    "PasMedCmp",
    "PasMedCmpPerc",
  ],
  forward: ["Goals", "SoT", "SoTPerc", "ScaSh", "TouAttPen", "Assists", "Sca"],
  goalkeeper: [
    "PasTotCmpPerc",
    "PasTotCmp",
    "Err",
    "SavePerc",
    "SweeperActions",
    "Pas3rd",
  ],
  midfielder: [
    "Recov",
    "PasTotCmp",
    "PasTotCmpPerc",
    "PasProg",
    "TklMid3rd",
    "CarProg",
    "Int",
  ],
};

interface PlayerRadarChartProps {
    players: {
      [key: string]: string | number | undefined;
      name: string;
      Nation: string;
    }[];
    position: keyof typeof positionStats;
  }

export default function PlayerRadarChart({ players, position }: PlayerRadarChartProps) {
  const chartRef = useRef(null);

  // Get user-friendly names for stats
interface StatMap {
    [key: string]: string;
}

const getStatDisplayName = (stat: string): string => {
    const statMap: StatMap = {
        "AerWonPerc": "Aerial Duels Won %",
        "TklWon": "Tackles Won",
        "Clr": "Clearances",
        "BlkSh": "Blocked Shots",
        "Int": "Interceptions",
        "PasMedCmp": "Medium Passes",
        "PasMedCmpPerc": "Medium Pass %",
        "Goals": "Goals",
        "SoT": "Shots on Target",
        "SoTPerc": "Shots on Target %",
        "ScaSh": "Shot-Creating Actions",
        "TouAttPen": "Penalty Area Touches",
        "Assists": "Assists",
        "Sca": "Shot-Creating Actions",
        "Recov": "Ball Recoveries",
        "PasTotCmp": "Total Passes",
        "PasTotCmpPerc": "Pass Completion %",
        "PasProg": "Progressive Passes",
        "TklMid3rd": "Mid-Third Tackles",
        "CarProg": "Progressive Carries",
        "SavePerc": "Save %",
        "Err": "Errors",
        "SweeperActions": "Sweeper Actions",
        "Pas3rd": "Passes into Final Third",
    };

    return statMap[stat] || stat;
};

  // Draw the radar chart
  useEffect(() => {
    if (!chartRef.current || !players || players.length === 0) return;
    
    // Clear any existing chart
    d3.select(chartRef.current).selectAll("*").remove();
    
    // Define chart dimensions
    const margin = { top: 80, right: 80, bottom: 80, left: 80 };
    const width = 600;
    const height = 500;
    const radius = Math.min(width, height) / 2 - Math.max(...Object.values(margin));
    
    // Create SVG element
    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);
    
    // Get stats for selected position
    const stats = positionStats[position];
    
    // Normalize data for radar chart
    const normalizedData = players.map(player => {
      const playerStats: { [key: string]: number } = {};
      stats.forEach(stat => {
        // Find max value for each stat across all players for normalization
        const maxValue = Math.max(...players.map(p => parseFloat(String(p[stat])) || 0));
        playerStats[stat] = maxValue > 0 ? (parseFloat(String(player[stat])) || 0) / maxValue * 100 : 0;
      });
      return {
        name: player.name,
        stats: playerStats
      };
    });
    
    // Create scale for radar chart
    const radialScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);
    
    // Create angles for each stat
    const angleSlice = (Math.PI * 2) / stats.length;
    
    // Draw axis lines
    svg
      .selectAll(".axis-line")
      .data(stats)
      .enter()
      .append("line")
      .attr("class", "axis-line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d, i) => radialScale(100) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y2", (d, i) => radialScale(100) * Math.sin(angleSlice * i - Math.PI / 2))
      .attr("stroke", "#ddd")
      .attr("stroke-width", 1);
    
    // Draw circular grid lines
    const ticks = [20, 40, 60, 80, 100];
    svg
      .selectAll(".grid-circle")
      .data(ticks)
      .enter()
      .append("circle")
      .attr("class", "grid-circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("fill", "none")
      .attr("stroke", "#ddd")
      .attr("stroke-width", 1)
      .attr("r", d => radialScale(d));
    
    // Add axis labels
    svg
      .selectAll(".axis-label")
      .data(stats)
      .enter()
      .append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", (d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        return Math.cos(angle) < -0.1 ? "end" : Math.cos(angle) > 0.1 ? "start" : "middle";
      })
      .attr("dy", (d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        return Math.sin(angle) < -0.1 ? "-0.5em" : Math.sin(angle) > 0.1 ? "1em" : "0.3em";
      })
      .attr("x", (d, i) => radialScale(110) * Math.cos(angleSlice * i - Math.PI / 2))
      .attr("y", (d, i) => radialScale(110) * Math.sin(angleSlice * i - Math.PI / 2))
      .text(d => getStatDisplayName(d))
      .attr("fill", "#64748b")
      .style("font-size", "12px");
    
    // Define colors for each player
    const colors = ["#4F46E5", "#10B981", "#8B5CF6", "#F97316"];
    
    // Draw radar chart for each player
    normalizedData.forEach((player, index) => {
      // Create path generator

      const pathData = stats.map((stat, i) => ({
        angle: angleSlice * i,
        value: player.stats[stat] || 0,
      }));

      const radarLine = d3
  .lineRadial<any>()
  .angle(d => d.angle)
  .radius(d => radialScale(d.value))
  .curve(d3.curveLinearClosed);
      // Create path coordinates
      const pathCoordinates = stats.map(stat => player.stats[stat] || 0);
      
      // Draw radar path
      svg
        .append("path")
        .datum(pathData)
        .attr("d", radarLine)
        .attr("stroke", colors[index % colors.length])
        .attr("stroke-width", 2)
        .attr("fill", colors[index % colors.length])
        .attr("fill-opacity", 0.3);
      
      // Add data points
      svg
        .selectAll(`.data-point-${index}`)
        .data(pathData)
        .enter()
        .append("circle")
        .attr("class", `data-point-${index}`)
        .attr("cx", (d, i) => radialScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
        .attr("cy", (d, i) => radialScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
        .attr("r", 4)
        .attr("fill", colors[index % colors.length]);
    });
    
    // Add legend
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${radius - 40}, ${-radius + 20})`);
    
    normalizedData.forEach((player, index) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${index * 20})`);     
    });
  }, [players, position]);
  
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-center mb-4 text-black">
        {position.charAt(0).toUpperCase() + position.slice(1)} Performance Comparison
      </h3>
      <div 
        ref={chartRef} 
        className="w-full h-[500px] bg-white rounded-lg shadow-sm flex items-center justify-center"
      >
      </div>
    </div>
  );
}