  "use client";

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
  import { useState, useEffect, useRef } from "react";
  import axios from "axios";
  import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
  } from "recharts";

  export default function PredictPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Array<{ name: string }>>([]);
    const [selectedPlayer, setSelectedPlayer] = useState<{ name: string } | null>(null);
    const [year, setYear] = useState("");
    const [loading, setLoading] = useState(false);
    interface Prediction {
      playerName: string;
      year: number;
      predictedValue: number;
      currentValue: number;
      confidenceLevel: string;
      yearsForward: number;
      lastKnownYear: number;
      lastKnownAge?: number;
      projectedAge?: number;
    }
    const [prediction, setPrediction] = useState<Prediction | null>(null);
    const [error, setError] = useState<string | null>(null);
    interface PlayerHistoryEntry {
      year: number;
      marketValue: number;
      age?: number;
      isPrediction?: boolean;
    }
    const [playerHistory, setPlayerHistory] = useState<PlayerHistoryEntry[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [chartData, setChartData] = useState<PlayerHistoryEntry[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handler = (event: MouseEvent): void => {
        if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
        }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Search players
    useEffect(() => {
      const handleSearch = async () => {
        if (searchTerm.length >= 1) {
          try {
            const response = await fetch('http://localhost:8000/api/players/');
            
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Filter players based on search term
            interface Player {
              name: string;
              // Add other player properties if needed
            }

                      const filteredResults: Player[] = data.filter((player: Player) => 
                        player.name.toLowerCase().includes(searchTerm.toLowerCase())
                      );
            
            setSearchResults(filteredResults);
          } catch (err) {
            console.error("Error fetching players", err);
            setSearchResults([]);
          }
        } else {
          setSearchResults([]);
        }
      };
    
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 300); // Debounce for 300ms
    
      return () => clearTimeout(timeoutId);
    }, [searchTerm]);
    
    // Fetch player history when a player is selected
    useEffect(() => {
      const fetchPlayerHistory = async () => {
        if (!selectedPlayer) return;
        
        setHistoryLoading(true);
        setError(null);
        
        try {
          const response = await axios.get(`http://localhost:8000/api/player-history/${encodeURIComponent(selectedPlayer.name)}`);
          setPlayerHistory(response.data);
        } catch (err) {
          console.error("Error fetching player history:", err);
          setError("Failed to fetch player history. The player may not have sufficient historical data.");
          setPlayerHistory([]);
        } finally {
          setHistoryLoading(false);
        }
      };
      
      fetchPlayerHistory();
    }, [selectedPlayer]);
    
    // Update chart data when both history and prediction are available
    useEffect(() => {
      if (playerHistory.length > 0) {
        let newChartData = [...playerHistory];
        
        // If we have a prediction for a future year, add it to the chart
        if (prediction && prediction.year > playerHistory[playerHistory.length - 1].year) {
          newChartData.push({
            year: prediction.year,
            marketValue: prediction.predictedValue,
            isPrediction: true
          });
        }
        
        // Sort by year to ensure correct ordering
        newChartData.sort((a, b) => a.year - b.year);
        setChartData(newChartData);
      }
    }, [playerHistory, prediction]);
    
    const handleGeneratePrediction = async () => {
      if (!selectedPlayer || !year) {
        setError("Please select both a player and prediction year");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Make request to the Django prediction endpoint
        const response = await axios.post("http://localhost:8000/api/predict/", {
          playerName: selectedPlayer.name,
          year: parseInt(year)
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        // Handle the response from Django
        setPrediction({
          playerName: response.data.playerName,
          year: response.data.year,
          predictedValue: response.data.predictedValue,
          currentValue: response.data.currentValue,
          confidenceLevel: response.data.confidenceLevel,
          yearsForward: response.data.yearsForward,
          lastKnownYear: response.data.lastKnownYear,
          lastKnownAge: response.data.lastKnownAge,
          projectedAge: response.data.projectedAge
        });
      } catch (err) {
        console.error("Prediction error:", err);
        if (axios.isAxiosError(err)) {
          const errorMessage = err.response?.data?.error || "Failed to generate prediction";
          setError(errorMessage);
          console.log("API Error details:", err.response?.data);
        } else {
          setError("Failed to generate prediction. Make sure the player has sufficient historical data.");
        }
      } finally {
        setLoading(false);
      }
    };

    // Format market value for display
    interface MarketValueFormatOptions {
      value: number;
    }

    const formatMarketValue = (value: number): string => {
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
      }
      return `$${value.toFixed(0)}`;
    };

    // Generate current year and future years for dropdown
    const generateYearOptions = () => {
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let i = currentYear; i <= currentYear + 5; i++) {
        years.push(i);
      }
      return years;
    };

    // Custom tooltip for the chart
    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className="bg-white p-3 border rounded shadow-md">
            <p className="font-medium text-black">{`Year: ${label}`}</p>
            <p className="text-black">
              {`Market Value: ${formatMarketValue(data.marketValue)}`}
            </p>
            {data.age && <p className="text-black">{`Age: ${data.age}`}</p>}
            {data.isPrediction && (
              <p className="text-blue-600 font-medium">Predicted Value</p>
            )}
          </div>
        );
      }
      return null;
    };

    return (
      <div className="container py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="flex flex-col items-center gap-8 text-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Predict Market Value
            </h1>
            <p className="text-muted-foreground mt-2 text-black">
              Get AI-powered predictions for player market values based on performance data
            </p>
          </div>
          <div className="grid gap-6 w-full md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Player Details
                </CardTitle>
                <CardDescription className="text-black">
                  Enter player information for prediction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 relative" ref={searchRef}>
                  <Label htmlFor="player-name" className="text-black">
                    Player Name
                  </Label>
                  <Input
                    id="player-name"
                    placeholder="Search for a player..."
                    className="text-black"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />

                  {searchResults.length > 0 && (
                    <div className="absolute mt-1 left-0 right-0 grid gap-2 max-h-64 overflow-y-auto border rounded-md p-2 bg-white shadow-lg z-50">
                      {searchResults.map((player, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            setSelectedPlayer(player);
                            setSearchTerm(player.name);
                            setSearchResults([]);
                          }}
                          className="flex justify-between items-center gap-4 px-3 py-2 hover:bg-slate-100 cursor-pointer rounded text-left"
                        >
                          <div>
                            <p className="text-sm font-medium text-black">{player.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-black">Year</Label>
                  <Select onValueChange={(value) => setYear(value)}>
                    <SelectTrigger className="text-black">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      {generateYearOptions().map((yearOption) => (
                        <SelectItem key={yearOption} value={yearOption.toString()}>
                          {yearOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                  onClick={handleGeneratePrediction}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Generate Prediction"}
                </Button>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </CardContent>
            </Card>

            {/* Prediction Card */}
            <Card>
              <CardHeader>
                <CardTitle className="font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Value Prediction
                </CardTitle>
                <CardDescription className="text-black">
                  Predicted market value details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-6 border rounded-md flex flex-col items-center justify-center min-h-[300px]">
                    {prediction ? (
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-black mb-2">
                          {prediction.playerName}
                        </h3>
                        <p className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                          ${prediction.predictedValue.toLocaleString()}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          Predicted value for {prediction.year}
                          {prediction.projectedAge && ` (Age: ${prediction.projectedAge + 3})`}
                        </p>
                        {prediction.yearsForward > 0 && (
                          <p className="text-xs text-slate-500 mt-1">
                            {prediction.yearsForward} year{prediction.yearsForward > 1 ? 's' : ''} into the future
                          </p>
                        )}
                      </div>
                    ) : loading ? (
                      <div className="text-slate-600">
                        <p>Loading prediction...</p>
                        <div className="mt-4 w-8 h-8 border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
                      </div>
                    ) : (
                      <p className="text-slate-600">
                        Generate a prediction to see the results
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    
                    <div className="flex justify-between text-black">
                      <span>Predicted Value for {year || "--"}:</span>
                      <span className="font-medium text-black">
                        {prediction ? `$${prediction.predictedValue.toLocaleString()}` : "--"}
                      </span>
                    </div>
                  
                    {prediction && prediction.predictedValue && prediction.currentValue && (
                      <div className="flex justify-between text-black">
                        <span>Value Change:</span>
                        <span className={`font-medium ${prediction.predictedValue > prediction.currentValue ? "text-green-600" : "text-red-600"}`}>
                          {prediction ? 
                            `${prediction.predictedValue > prediction.currentValue ? "+" : ""}${((prediction.predictedValue - prediction.currentValue)/prediction.currentValue * 100).toFixed(1)}%` 
                            : "--"}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-black">
                      <span>Confidence Level:</span>
                      <span className="font-medium text-black">
                        {prediction ? prediction.confidenceLevel : "--"}
                      </span>
                    </div>
                    {prediction && prediction.yearsForward > 0 && (
                      <div className="flex justify-between text-black">
                        <span>Prediction Timespan:</span>
                        <span className="font-medium text-black">
                          {`${prediction.lastKnownYear} → ${prediction.year} (${prediction.yearsForward} years)`}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {prediction && (
                      <div className="pt-4 border-t">
                      <p className="text-xs text-slate-500 mt-1">
                        This prediction is based on historical performance data through {prediction.lastKnownYear}.
                        {prediction?.projectedAge && prediction.projectedAge > 30 && " Player age is an important factor in market value trends, with values typically declining after age 30."}
                        {prediction.yearsForward > 2 && " Longer prediction periods may have reduced accuracy."}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Market Value History Chart Card */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Market Value History
              </CardTitle>
              <CardDescription className="text-black">
                Historical market value data from 2018 with prediction
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>
              ) : chartData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="year" 
                        label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        tickFormatter={formatMarketValue}
                        label={{ value: 'Market Value', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {prediction && (
                        <ReferenceLine
                          x={prediction.year}
                          stroke="#8884d8"
                          strokeDasharray="3 3"
                          label={{ value: 'Prediction', position: 'top' }}
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="marketValue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={(props: any) => (
                          <circle
                            key={`dot-${props.cx}-${props.cy}`}
                            cx={props.cx}
                            cy={props.cy}
                            r={props.payload.isPrediction ? 6 : 4}
                            fill={props.payload.isPrediction ? '#8b5cf6' : '#3b82f6'}
                            strokeWidth={2}
                          />
                        )}
                        name="Market Value"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : selectedPlayer ? (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-slate-500">No historical  data available for this player.</p>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-slate-500">Select a player to view market value history.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }