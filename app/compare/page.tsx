"use client";

import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

import { X, Flag, Calendar, Info, User, Shield, PieChart } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../components/ui/table";

// Define a type for player data
interface PlayerData {
  name: string;
  Nation: string;
  Squad?: string;
  Comp?: string;
  Age?: number;
  Born?: number;
  MP?: number;
  Starts?: number;
  Min?: number;
  NinetyS?: number;
  [key: string]: string | number | undefined;
}

// Define position-specific stat types
interface PositionStats {
  defender: string[];
  forward: string[];
  goalkeeper: string[];
  midfielder: string[];
}

// Define interface for comparison results
interface ComparisonResult {
  player: PlayerData;
  stats: {
    [key: string]: number;
  };
  normalizedStats?: {
    [key: string]: number;
  };
}

export default function ComparePage() {
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [search, setSearch] = useState("");
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerData[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerData[]>([]);
  const [selectedPosition, setSelectedPosition] = useState("defender");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonResults, setComparisonResults] = useState<
    ComparisonResult[]
  >([]);
  const [isComparing, setIsComparing] = useState(false);
  const [activeTab, setActiveTab] = useState("radar");
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Position-specific stats mapping
  const positionStats: PositionStats = {
    defender: [
      "aerwon%",
      "tklwon",
      "clr",
      "blksh",
      "int",
      "pasmedcmp",
      "pasmedcmp%",
    ],
    forward: ["goals", "sot", "sot%", "scash", "touattpen", "assists", "sca"],
    goalkeeper: [
      "pastotcmp%",
      "pastotcmp",
      "err",
      "save %",
      "sweeper actions",
      "pas3rd",
    ],
    midfielder: [
      "recov",
      "pastotcmp",
      "pastotcmp%",
      "pasprog",
      "tklmid3rd",
      "carprog",
      "int",
    ],
  };

  // Filter players based on search input
  useEffect(() => {
    if (search) {
      setFilteredPlayers(
        players.filter((player) =>
          player.name.toLowerCase().includes(search.toLowerCase())
        )
      );
      setIsDropdownOpen(true);
    } else {
      setFilteredPlayers([]);
      setIsDropdownOpen(false);
    }
  }, [search, players]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectPlayer = (player: PlayerData) => {
    // Check if player is already selected
    if (selectedPlayers.some((p) => p.name === player.name)) {
      return; // Prevent selecting the same player again
    }

    // Limit to 4 players for better visualization
    if (selectedPlayers.length >= 4) {
      setError(
        "Maximum 4 players can be compared at once for better visualization"
      );
      return;
    }

    setSelectedPlayers((prev) => [...prev, player]);
    setSearch("");
    setIsDropdownOpen(false);
    setError(null);
  };

  const handleRemovePlayer = (playerName: string) => {
    setSelectedPlayers((prev) => prev.filter((p) => p.name !== playerName));
  };

  const clearSearch = () => {
    setSearch("");
    inputRef.current?.focus();
  };

  // Fetch players based on selected position
  useEffect(() => {
    const fetchPlayers = async () => {
      if (!selectedPosition) return;

      setLoading(true);
      setError(null);
      setSelectedPlayers([]);
      setComparisonResults([]);

      try {
        const position = selectedPosition.toLowerCase();
        const response = await fetch(
          `http://localhost:8000/api/comp/${position}s/`
        );
        if (!response.ok) {
          throw new Error(
            `HTTP error! Status: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        if (data && data.players) {
          setPlayers(data.players);
        } else {
          throw new Error("Invalid data format: 'players' array not found");
        }
      } catch (error) {
        console.error("Error fetching players:", error);
        setError(
          error instanceof Error ? error.message : "Failed to fetch players"
        );
        setPlayers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [selectedPosition]);

  // Function to normalize stats for better comparison
  const normalizeStats = (results: ComparisonResult[]): ComparisonResult[] => {
    const stats = positionStats[selectedPosition as keyof PositionStats];

    return results.map((result) => {
      const normalizedStats: { [key: string]: number } = {};

      stats.forEach((stat) => {
        // Get max value across all players for this stat
        const maxValue = Math.max(...results.map((r) => r.stats[stat] || 0));

        // Prevent division by zero
        if (maxValue > 0) {
          // Scale to 0-100 range
          normalizedStats[stat] = ((result.stats[stat] || 0) / maxValue) * 100;
        } else {
          normalizedStats[stat] = 0;
        }
      });

      return {
        ...result,
        normalizedStats,
      };
    });
  };

  // Function to handle player comparison
  const handleCompare = async () => {
    if (selectedPlayers.length < 2) {
      setError("Please select at least 2 players to compare.");
      return;
    }

    setIsComparing(true);
    setError(null);

    try {
      // Make API call to compare players
      const response = await fetch(
        "http://localhost:8000/api/comp/compare-players/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            players: selectedPlayers.map((p) => p.name),
            position: selectedPosition,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const results = await response.json();

      // Normalize the stats for better visualization
      const normalizedResults = normalizeStats(results);
      setComparisonResults(normalizedResults);

      // Draw radar chart after results are processed
      setTimeout(() => {
        if (normalizedResults.length > 0) {
          drawRadarChart(normalizedResults);
        }
      }, 100);
    } catch (err) {
      console.error("Error comparing players:", err);
      setError(
        err instanceof Error ? err.message : "Failed to compare players"
      );
    } finally {
      setIsComparing(false);
    }
  };

  // Improved function to draw radar chart using D3.js
  const drawRadarChart = (results: ComparisonResult[]) => {
    if (!chartContainerRef.current) {
      console.error("Chart container not found");
      return;
    }

    // Clear previous chart
    chartContainerRef.current.innerHTML = "";

    const chartColors = ["#4F46E5", "#10B981", "#8B5CF6", "#F97316"];
    const features = positionStats[selectedPosition as keyof PositionStats];

    // Setup chart dimensions
    const margin = { top: 70, right: 100, bottom: 50, left: 100 };
    const width = Math.min(
      700,
      chartContainerRef.current.offsetWidth - margin.left - margin.right
    );
    const height = Math.min(
      width,
      window.innerHeight - margin.top - margin.bottom - 20
    );
    const radius = Math.min(width, height) / 2;

    // Append SVG to chart container
    const svg = d3
      .select(chartContainerRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left + width / 2},${margin.top + height / 2})`
      );

    // Scale for the radius
    const radialScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

    // Create circular grid lines with improved styling
    const ticks = [20, 40, 60, 80, 100];

    // Add axis background for better readability
    svg
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", radius)
      .attr("fill", "#f8fafc")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1);

    svg
      .selectAll(".grid-circle")
      .data(ticks)
      .enter()
      .append("circle")
      .attr("class", "grid-circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("fill", "none")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1)
      .attr("r", (d) => radialScale(d));

    // Add tick labels with improved styling
    svg
      .selectAll(".tick-label")
      .data(ticks)
      .enter()
      .append("text")
      .attr("class", "tick-label")
      .attr("x", 5)
      .attr("y", (d) => -radialScale(d))
      .text((d) => d.toString())
      .style("font-size", "10px")
      .style("font-weight", "500")
      .style("fill", "#64748b");

    // Create axes with improved styling
    const angleSlice = (Math.PI * 2) / features.length;

    // Draw axis lines
    const axes = svg
      .selectAll(".axis")
      .data(features)
      .enter()
      .append("g")
      .attr("class", "axis");

    axes
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr(
        "x2",
        (d, i) => radialScale(100) * Math.cos(angleSlice * i - Math.PI / 2)
      )
      .attr(
        "y2",
        (d, i) => radialScale(100) * Math.sin(angleSlice * i - Math.PI / 2)
      )
      .attr("stroke", "#cbd5e0")
      .attr("stroke-width", 1.5);

    // Add axis labels with improved styling and positioning
    axes
      .append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", (d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        return Math.cos(angle) < -0.1
          ? "end"
          : Math.cos(angle) > 0.1
          ? "start"
          : "middle";
      })
      .attr("dy", (d, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        return Math.sin(angle) < -0.1
          ? "-0.5em"
          : Math.sin(angle) > 0.1
          ? "1em"
          : "0.3em";
      })
      .attr(
        "x",
        (d, i) => radialScale(115) * Math.cos(angleSlice * i - Math.PI / 2)
      )
      .attr(
        "y",
        (d, i) => radialScale(115) * Math.sin(angleSlice * i - Math.PI / 2)
      )
      .text((d) => getStatDisplayName(d))
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "#475569");

    // Draw radar areas for each player with improved styling
    results.forEach((result, index) => {
      const dataPoints = features.map((feature, i) => {
        const value = result.normalizedStats?.[feature] || 0;
        return {
          x: radialScale(value) * Math.cos(angleSlice * i - Math.PI / 2),
          y: radialScale(value) * Math.sin(angleSlice * i - Math.PI / 2),
          value,
          stat: feature,
        };
      });

      // Create radar area
      const radarLine = d3
        .lineRadial<{ angle: number; radius: number }>()
        .angle((d) => d.angle)
        .radius((d) => d.radius)
        .curve(d3.curveLinearClosed);

      const radarData = dataPoints.map((d, i) => ({
        angle: angleSlice * i - Math.PI / 2,
        radius: radialScale(d.value),
      }));

      // Add radar area
      svg
        .append("path")
        .datum(radarData)
        .attr("d", radarLine as any)
        .attr("fill", chartColors[index % chartColors.length])
        .attr("fill-opacity", 0.2)
        .attr("stroke", chartColors[index % chartColors.length])
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.8);

      // Add dots at each data point
      svg
        .selectAll(`.dots-${index}`)
        .data(dataPoints)
        .enter()
        .append("circle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", 4)
        .attr("fill", chartColors[index % chartColors.length])
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1)
        .append("title");
    });

    // Add chart title
    svg
      .append("text")
      .attr("x", 0)
      .attr("y", -height / 2 - 30)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("fill", "#1e293b")
      .text(
        `${
          selectedPosition.charAt(0).toUpperCase() + selectedPosition.slice(1)
        } Performance Comparison`
      );

    // Add legend with improved styling
    const legendItemHeight = 20;
    const legendWidth = 150;
    const legendStartY = -height / 2 + 15;

    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        `translate(${width / 2 - legendWidth + 20}, ${legendStartY})`
      );

    // Add legend background
    legend
      .append("rect")
      .attr("x", -10)
      .attr("y", -10)
      .attr("width", legendWidth)
      .attr("height", results.length * legendItemHeight + 20)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("fill", "white")
      .attr("stroke", "#e2e8f0")
      .attr("stroke-width", 1);

    results.forEach((result, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * legendItemHeight})`);

      legendRow
        .append("rect")
        .attr("width", 14)
        .attr("height", 14)
        .attr("rx", 2)
        .attr("fill", chartColors[i % chartColors.length]);

      legendRow
        .append("text")
        .attr("x", 24)
        .attr("y", 12)
        .style("font-size", "13px")
        .style("font-weight", "500")
        .style("fill", "#334155")
        .text(result.player.name);
    });
  };

  // Get colors for player cards and charts
  const getPlayerColor = (index: number) => {
    const colors = [
      "bg-indigo-100 text-indigo-800",
      "bg-emerald-100 text-emerald-800",
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
    ];
    return colors[index % colors.length];
  };

  const getChartColor = (index: number) => {
    const colors = ["#4F46E5", "#10B981", "#8B5CF6", "#F97316"];
    return colors[index % colors.length];
  };

  // Get user-friendly names for stats
  const getStatDisplayName = (stat: string) => {
    const statMap: { [key: string]: string } = {
      "aerwon%": "Aerial Duels Won %",
      tklwon: "Tackles Won",
      clr: "Clearances",
      blksh: "Blocked Shots",
      int: "Interceptions",
      pasmedcmp: "Medium Passes",
      "pasmedcmp%": "Medium Pass %",
      goals: "Goals",
      sot: "Shots on Target",
      "sot%": "Shots on Target %",
      scash: "Shot-Creating Actions",
      touattpen: "Penalty Area Touches",
      assists: "Assists",
      sca: "Shot-Creating Actions",
      recov: "Ball Recoveries",
      pastotcmp: "Total Passes",
      "pastotcmp%": "Pass Completion %",
      pasprog: "Progressive Passes",
      tklmid3rd: "Mid-Third Tackles",
      carprog: "Progressive Carries",
      "save %": "Save %",
      err: "Errors",
      "sweeper actions": "Sweeper Actions",
      pas3rd: "Passes into Final Third",
    };

    return statMap[stat] || stat;
  };

  function getStatDescription(stat: string): import("react").ReactNode {
    const descriptions: { [key: string]: string } = {
      "aerwon%": "Percentage of aerial duels won by the player.",
      tklwon: "Number of tackles successfully won.",
      clr: "Number of clearances made by the player.",
      blksh: "Number of shots blocked by the player.",
      int: "Number of interceptions made by the player.",
      pasmedcmp: "Number of medium-range passes completed.",
      "pasmedcmp%": "Percentage of medium-range passes completed.",
      goals: "Total goals scored by the player.",
      sot: "Number of shots on target.",
      "sot%": "Percentage of shots that were on target.",
      scash: "Number of shot-creating actions by the player.",
      touattpen: "Touches in the attacking penalty area.",
      assists: "Number of assists provided by the player.",
      sca: "Number of shot-creating actions.",
      recov: "Number of ball recoveries made by the player.",
      pastotcmp: "Total number of passes completed.",
      "pastotcmp%": "Percentage of total passes completed.",
      pasprog: "Number of progressive passes made.",
      tklmid3rd: "Number of tackles made in the middle third of the pitch.",
      carprog: "Number of progressive carries made by the player.",
      "save %": "Percentage of shots saved by the goalkeeper.",
      err: "Number of errors made by the player.",
      "sweeper actions":
        "Number of sweeper actions performed by the goalkeeper.",
      pas3rd: "Number of passes into the final third.",
    };

    return (
      descriptions[stat] || "Description not available for this statistic."
    );
  }

  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="flex flex-col items-center gap-8">
        <div className="max-w-2xl text-center">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Football Player Comparison
          </h1>
          <p className="text-black mt-2">
            Compare player statistics based on position-specific metrics
          </p>
        </div>

        <div className="grid gap-6 w-full lg:grid-cols-3">
          {/* Left Card: Player Selection */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-t-2 border-t-indigo-500 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-indigo-600 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Select Players
              </CardTitle>
              <CardDescription className="text-black">
                Choose players to compare statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Position Selection Dropdown */}
              <div className="space-y-2">
                <Label className="font-medium text-indigo-600">
                  Player Position
                </Label>
                <Select
                  value={selectedPosition}
                  onValueChange={(value) => {
                    setSelectedPosition(value);
                  }}
                >
                  <SelectTrigger className="focus:ring-2 bg-black focus:ring-indigo-500 focus:border-indigo-500 transition-all text-yellow-500 hover:bg-slate-600">
                    <SelectValue
                      placeholder="Select position"
                      className="bg-slate-600"
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-600">
                    <SelectItem
                      value="midfielder"
                      className="text-yellow-500 hover:bg-yellow-100"
                    >
                      Midfielder
                    </SelectItem>
                    <SelectItem
                      value="goalkeeper"
                      className="text-yellow-500 hover:bg-yellow-100"
                    >
                      Goalkeeper
                    </SelectItem>
                    <SelectItem
                      value="forward"
                      className="text-yellow-500 hover:bg-yellow-100"
                    >
                      Forward
                    </SelectItem>
                    <SelectItem
                      value="defender"
                      className="text-yellow-500 hover:bg-yellow-100"
                    >
                      Defender
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Player Search Input with Suggestions */}
              <div className="space-y-2 relative">
                <Label
                  htmlFor="player-name"
                  className="font-medium text-indigo-600"
                >
                  Player Name
                </Label>
                <div className="relative">
                  <Input
                    id="player-name"
                    ref={inputRef}
                    placeholder="Search for a player..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all pr-8"
                    onFocus={() => {
                      if (search && filteredPlayers.length > 0) {
                        setIsDropdownOpen(true);
                      }
                    }}
                  />
                  {search && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Enhanced Dropdown for Player Suggestions */}
                {isDropdownOpen && filteredPlayers.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-10 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-gray-700 rounded-md mt-1 w-full max-h-60 overflow-y-auto shadow-lg"
                  >
                    {filteredPlayers.map((player, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer transition-colors text-left border-b border-indigo-100 dark:border-gray-700 last:border-b-0"
                        onClick={() => handleSelectPlayer(player)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{player.name}</span>
                          <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 mt-1">
                            <div className="flex items-center gap-1">
                              <Flag className="h-3 w-3" />
                              <span>{player.Nation}</span>
                            </div>
                            {player.Squad && (
                              <div className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                <span>{player.Squad}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Players Display */}
              <div className="space-y-2">
                <Label className="font-medium text-indigo-600">
                  Selected Players ({selectedPlayers.length}/4)
                </Label>
                <div className="flex flex-col gap-2">
                  {selectedPlayers.length > 0 ? (
                    selectedPlayers.map((player, index) => (
                      <div
                        key={index}
                        className={`${getPlayerColor(
                          index
                        )} px-4 py-2 rounded-lg flex flex-col gap-1 w-full`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{player.name}</span>
                          <button
                            onClick={() => handleRemovePlayer(player.name)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-3 text-xs opacity-80">
                          <div className="flex items-center gap-1">
                            <Flag className="h-3 w-3" />
                            <span>{player.Nation}</span>
                          </div>
                          {player.Squad && (
                            <div className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              <span>{player.Squad}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No players selected</p>
                  )}
                </div>
              </div>

              {/* Loading and Error States */}
              {loading && <p className="text-indigo-500">Loading players...</p>}
              {error && <p className="text-red-500">{error}</p>}

              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 transition-colors mt-2"
                disabled={selectedPlayers.length < 2 || isComparing}
                onClick={handleCompare}
              >
                {isComparing ? "Comparing..." : "Compare Players"}
              </Button>
            </CardContent>
          </Card>

          {/* Middle Card: Radar Chart */}
          {comparisonResults.length > 0 && (
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-t-2 border-t-purple-500 lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-purple-600 flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Performance Visualization
                </CardTitle>
                <CardDescription className="text-black">
                  {selectedPosition.charAt(0).toUpperCase() +
                    selectedPosition.slice(1)}{" "}
                  performance radar chart
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  ref={chartContainerRef}
                  className="w-full aspect-square max-w-[700px] mx-auto"
                ></div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Player Details Table */}
        {comparisonResults.length > 0 && (
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-t-2 border-t-emerald-500 w-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-emerald-600 flex items-center">
                <Info className="h-5 w-5 mr-2" />
                Performance Details
              </CardTitle>
              <CardDescription className="text-black">
                Detailed statistical comparison between selected players
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold text-indigo-700">
                        Stat
                      </TableHead>
                      {comparisonResults.map((result, index) => (
                        <TableHead
                          key={index}
                          className="font-semibold"
                          style={{ color: getChartColor(index) }}
                        >
                          {result.player.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      "name",
                      "Nation",
                      "Squad",
                      "Comp",
                      "Age",
                      "Born",
                      "MP",
                      "Starts",
                      "Min",
                      "NinetyS",
                    ].map((key) => {
                      const label =
                        key === "name"
                          ? "Name"
                          : key === "NinetyS"
                          ? "90s"
                          : key;
                      const shouldRender =
                        comparisonResults[0].player[key] !== undefined;
                      return (
                        shouldRender && (
                          <TableRow className="bg-slate-50/50" key={key}>
                            <TableCell className="font-medium text-black">
                              {label}
                            </TableCell>
                            {comparisonResults.map((result, index) => (
                              <TableCell key={index} className="text-black">
                                {result.player[key] || "N/A"}
                              </TableCell>
                            ))}
                          </TableRow>
                        )
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
