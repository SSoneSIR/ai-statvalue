"use client";
import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Button } from "../../components/ui/button";

import { X, Flag, Calendar, Info, User, Shield, PieChart, UserPlus } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../../components/ui/table";
import axios from 'axios';
import PlayerRadarChart from "../compare/PlayerRadarChart";

// Define a type for player data - updated to match API field names
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
  // Stats with correct capitalization to match API
  Goals?: number;
  Assists?: number;
  SoT?: number;
  SoTPerc?: number;
  ScaSh?: number;
  Sca?: number;
  TouAttPen?: number;
  AerWonPerc?: number;
  TklWon?: number;
  Clr?: number;
  BlkSh?: number;
  Int?: number;
  PasMedCmp?: number;
  PasMedCmpPerc?: number;
  Recov?: number;
  PasTotCmp?: number;
  PasTotCmpPerc?: number;
  PasProg?: number;
  TklMid3rd?: number;
  CarProg?: number;
  SavePerc?: number;
  Err?: number;
  SweeperActions?: number;
  Pas3rd?: number;
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

// Define interface for similar players
interface SimilarPlayer {
  name: string;
  stats: { [key: string]: number };
  distance: number;
}

export default function ComparePage() {
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [search, setSearch] = useState("");
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerData[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerData[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<"defender" | "forward" | "goalkeeper" | "midfielder">("defender");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonResults, setComparisonResults] = useState<
    ComparisonResult[]
  >([]);
  const [isComparing, setIsComparing] = useState(false);
  const [similarPlayers, setSimilarPlayers] = useState<SimilarPlayer[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Position-specific stats mapping with correct capitalization
  const positionStats: PositionStats = {
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

  // Define player profile details to display in the table
  const playerDetailFields = [
    { key: "Age", label: "Age" },
    { key: "Born", label: "Year Born" },
    { key: "Squad", label: "Team" },
    { key: "Comp", label: "Competition" },
    { key: "MP", label: "Matches Played" },
    { key: "Starts", label: "Starts" },
    { key: "Min", label: "Minutes Played" },
    { key: "NinetyS", label: "90s Played" },
  ];

  // Filter players based on search input
  useEffect(() => {
    if (search) {
      setFilteredPlayers(
        players.filter((player) => {
          if (!player || !player.name) return false;
          return player.name.toLowerCase().includes(search.toLowerCase());
        })
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
    // Clear similar players when a new player is selected
    setSimilarPlayers([]);
  };

  const handleRemovePlayer = (playerName: string) => {
    setSelectedPlayers((prev) => prev.filter((p) => p.name !== playerName));
    // Clear similar players when a player is removed
    setSimilarPlayers([]);
  };

  const clearSearch = () => {
    setSearch("");
    inputRef.current?.focus();
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!selectedPosition) return;
    
      setLoading(true);
      setError(null);
      setSelectedPlayers([]);
      setComparisonResults([]);
      setSimilarPlayers([]);
      try {
        const position = selectedPosition.toLowerCase();
        const url = `http://localhost:8000/api/${position}s/`; 
        console.log("Fetching players from:", url);
        const response = await fetch(url);
    
        if (!response.ok) {
          const errorData = await response.text();
          console.error("API Error:", errorData);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          setPlayers(data);
        } else {
          throw new Error("Invalid data format: expected an array");
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
    // Get stats relevant to the selected position
    const stats = positionStats[selectedPosition as keyof PositionStats];
    
    if (!stats || stats.length === 0) {
      console.error("No stats defined for position:", selectedPosition);
      return results;
    }
  
    console.log("Normalizing stats:", stats);
  
    // For each stat, find max value across all players
    const maxValues: { [key: string]: number } = {};
    
    stats.forEach((stat) => {
      let max = 0;
      // Find max value for this stat across all players
      results.forEach((result) => {
        const value = result.stats[stat] || 0;
        if (value > max) max = value;
      });
      maxValues[stat] = max > 0 ? max : 1; // Avoid division by zero
    });
    
    console.log("Max values for normalization:", maxValues);
  
    // Now normalize each player's stats based on the max values
    return results.map((result) => {
      const normalizedStats: { [key: string]: number } = {};
  
      stats.forEach((stat) => {
        // Get actual value, default to 0 if missing
        const actualValue = result.stats[stat] || 0;
        
        // Scale to 0-100 range based on max value
        normalizedStats[stat] = (actualValue / maxValues[stat]) * 100;
      });
  
      return {
        ...result,
        normalizedStats,
      };
    }); 
  };

  // Function to handle player comparison
  const handleCompare = () => {
    if (selectedPlayers.length < 2) {
      setError("Please select at least 2 players to compare.");
      return;
    }
  
    setIsComparing(true);
    setError(null);
  
    try {
      // Extract relevant stats based on position
      const relevantStats = positionStats[selectedPosition as keyof PositionStats];
      
      // Process each selected player
      const results: ComparisonResult[] = selectedPlayers.map(player => {
        // Extract the stats we want to compare for this player
        const playerStats: { [key: string]: number } = {};
        
        relevantStats.forEach(stat => {
          // Convert string values to numbers if needed
          const value = player[stat];
          playerStats[stat] = typeof value === 'number' ? value : 
                             typeof value === 'string' ? parseFloat(value) || 0 : 0;
        });
        
        return {
          player: {
            name: player.name,
            Nation: player.Nation,
            Squad: player.Squad,
          },
          stats: playerStats
        };
      });
      
      // Normalize the stats for better visualization
      const normalizedResults = normalizeStats(results);
      setComparisonResults(normalizedResults);
    } catch (err) {
      console.error("Error comparing players:", err);
      setError(
        err instanceof Error ? err.message : "Failed to compare players"
      );
    } finally {
      setIsComparing(false);
    }
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

  // Format values for display in the details table
  const formatValue = (value: string | number | undefined): string => {
    if (value === undefined || value === null) return "N/A";
    if (typeof value === "number") {
      // Format numbers with 2 decimal places if they have decimals
      return Number.isInteger(value) ? value.toString() : value.toFixed(2);
    }
    return value.toString();
  };

  // Single unified function to fetch similar players
  const fetchSimilarPlayers = async () => {
    if (selectedPlayers.length === 0) {
      setError("Please select a player first to find similar players");
      return;
    }
    setLoadingSimilar(true);
    setError(null);
    try {
      const referencePlayer = selectedPlayers[0];      
      console.log("Fetching similar players for:", referencePlayer.name);
      const response = await axios.post('http://localhost:8000/api/similar_players/', {
        player: {
          name: referencePlayer.name,
          Nation: referencePlayer.Nation,
          Squad: referencePlayer.Squad
        },
        position: selectedPosition
      });   
      console.log("Similar players response:", response.data);
      if (response.data && response.data.similar_players) {
        setSimilarPlayers(response.data.similar_players);
      } else {
        throw new Error("Invalid response format from similar players API");
      }
    } catch (err) {
      console.error("Error fetching similar players:", err);
      setError(
        err instanceof Error 
          ? `Failed to fetch similar players: ${err.message}`
          : "Failed to fetch similar players"
      );
      setSimilarPlayers([]);
    } finally {
      setLoadingSimilar(false);
    }
  };

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
          {/* Left Column: Player Selection and Similar Players */}
          <div className="space-y-6">
            {/* Player Selection Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-t-2 border-t-indigo-500">
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
                    onValueChange={(value: "defender" | "forward" | "goalkeeper" | "midfielder") => {
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
  <div className="relative w-full">
    <Input
      id="player-name"
      ref={inputRef}
      placeholder="Search for a player..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="focus:ring-2 text-black focus:ring-indigo-500 focus:border-indigo-500 transition-all pr-8"
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
    {isDropdownOpen && filteredPlayers.length > 0 && (
      <div
        ref={dropdownRef}
        className="absolute left-0 right-0 z-10 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-gray-700 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg p-2"
        >
        {filteredPlayers.map((player, index) => (
           <div
           key={index}
           className="p-2 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer transition-colors text-left border-b border-indigo-100 dark:border-gray-700 last:border-b-0"
           onClick={() => handleSelectPlayer(player)}
         >
           <div className="font-medium">{player.name}</div>
           <div className="text-sm text-gray-500 dark:text-gray-400">{player.club}</div>
         </div>
        ))}
      </div>
    )}
  </div>
</div>
                {/* Selected Players List */}
                <div className="mt-4">
                  <Label className="font-medium text-indigo-600">
                    Selected Players ({selectedPlayers.length}/4)
                  </Label>
                  <div className="mt-2 space-y-2">
                    {selectedPlayers.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No players selected yet
                      </p>
                    ) : (
                      selectedPlayers.map((player, index) => (
                        <div
                          key={index}
                          className={`px-3 py-2 rounded-md flex justify-between items-center ${getPlayerColor(
                            index
                          )}`}
                        >
                          <div className="flex items-center">
                            <span className="text-sm font-medium">
                              {player.name}
                            </span>
                            <span className="ml-2 text-xs opacity-75">
                              {player.Nation}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemovePlayer(player.name)}
                            className="text-gray-700 hover:text-gray-900 transition-colors"
                            aria-label={`Remove ${player.name}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Find Similar Players Button */}
                {selectedPlayers.length > 0 && (
                  <Button 
                    onClick={fetchSimilarPlayers}
                    disabled={loadingSimilar || selectedPlayers.length === 0}
                    className="bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center w-full"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {loadingSimilar ? 'Finding Similar Players...' : 'Find Similar Players'}
                  </Button>
                )}
                
                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm mt-2">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Similar Players Card - Moved to left column */}
            {similarPlayers.length > 0 && (
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-t-2 border-t-yellow-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-yellow-600 flex items-center">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Similar Players
                  </CardTitle>
                  <CardDescription className="text-black">
                    Players similar to {selectedPlayers[0]?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {similarPlayers.map((player, index) => (
                      <div
                        key={index}
                        className={`px-3 py-2 rounded-md flex justify-between items-center ${
                          index === 0 ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50 border border-gray-200"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-black">
                            {player.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            Similarity: {(100 - player.distance).toFixed(1)}%
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            // Find this player in the full players list and add to selection
                            const playerToAdd = players.find(p => p.name === player.name);
                            if (playerToAdd) handleSelectPlayer(playerToAdd);
                          }}
                          className="text-purple-600 hover:text-purple-800 transition-colors"
                          aria-label={`Add ${player.name}`}
                          disabled={selectedPlayers.some(p => p.name === player.name)}
                        >
                          {selectedPlayers.some(p => p.name === player.name) ? (
                            <span className="text-xs">Selected</span>
                          ) : (
                            <UserPlus className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Visualization and Data */}
          <div className="lg:col-span-2 space-y-6">
            {/* Radar Chart with Legend at the top right */}
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-t-2 border-t-purple-500">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl text-purple-600 flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-black" />
                    Performance Comparison
                  </CardTitle>
                  
                  {/* Legend moved to top right */}
                  {selectedPlayers.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-1">
                        {selectedPlayers.map((player, index) => (
                          <div key={index} className="flex items-center gap-2 text-black">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: getChartColor(index) }}
                            ></div>
                            <span className="text-xs font-medium">{player.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <CardDescription className="text-black">
                  Visual comparison of player statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* This is where the radar chart goes */}
                <PlayerRadarChart
                  players={selectedPlayers}
                  position={selectedPosition}
                />
              </CardContent>
            </Card>

            {/* Player Details Table */}
            {selectedPlayers.length > 0 && (
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-t-2 border-t-emerald-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-emerald-600 flex items-center">
                    <Info className="h-5 w-5 mr-2" />
                    Player Details
                  </CardTitle>
                  <CardDescription className="text-black">
                    Biographical and season information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px] text-black font-bold">Attribute</TableHead>
                          {selectedPlayers.map((player, index) => (
                            <TableHead
                              key={index}
                              className={`text-center ${getPlayerColor(index)}`}
                            >
                              {player.name}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {playerDetailFields.map((field, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium text-black">
                              {field.label}
                            </TableCell>
                            {selectedPlayers.map((player, playerIndex) => (
                              <TableCell
                                key={playerIndex}
                                className="text-center text-black"
                              >
                                {formatValue(player[field.key])}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Comparison Table - You can keep this here or remove it based on your needs */}
            {comparisonResults.length > 0 && (
              <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 border-t-2 border-t-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-blue-600 flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Position-Specific Stats
                  </CardTitle>
                  <CardDescription className="text-black">
                    Key statistics for {selectedPosition}s
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[180px] text-black font-bold">Stat</TableHead>
                          {comparisonResults.map((result, index) => (
                            <TableHead
                              key={index}
                              className={`text-center ${getPlayerColor(index)}`}
                            >
                              {result.player.name}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {positionStats[selectedPosition as keyof PositionStats].map((stat, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium text-black">
                              {stat}
                            </TableCell>
                            {comparisonResults.map((result, playerIndex) => (
                              <TableCell
                                key={playerIndex}
                                className="text-center text-black"
                              >
                                {formatValue(result.stats[stat])}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}