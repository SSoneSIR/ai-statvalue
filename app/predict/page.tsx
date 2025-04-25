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

export default function PredictPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Search players - keeping your existing implementation
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
          const filteredResults = data.filter((player: { name: string }) => 
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
  
  const handleGeneratePrediction = async () => {
    if (!selectedPlayer || !year) {
      setError("Please select both a player and prediction year");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Make request to the Django prediction endpoint - without playerID
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
    } catch (err: unknown) {
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

  // Generate current year and future years for dropdown
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
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
              {prediction.projectedAge && ` (Age: ${prediction.projectedAge})`}
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
          <span>Last Known Value ({prediction?.lastKnownYear || ""}):</span>
          <span className="font-medium text-black">
            {prediction ? `$${prediction.currentValue.toLocaleString()}` : "--"}
          </span>
        </div>
        {prediction && prediction.lastKnownAge && (
          <div className="flex justify-between text-black">
            <span>Player Age in {prediction.lastKnownYear}:</span>
            <span className="font-medium text-black">
              {prediction.lastKnownAge} years
            </span>
          </div>
        )}
        <div className="flex justify-between text-black">
          <span>Predicted Value for {year || "--"}:</span>
          <span className="font-medium text-black">
            {prediction ? `$${prediction.predictedValue.toLocaleString()}` : "--"}
          </span>
        </div>
        {prediction && prediction.projectedAge && (
          <div className="flex justify-between text-black">
            <span>Projected Age in {prediction.year}:</span>
            <span className="font-medium text-black">
              {prediction.projectedAge} years
              {prediction.projectedAge > 30 ? 
                <span className="text-amber-600 ml-1">(Post-peak)</span> : 
                prediction.projectedAge >= 26 && prediction.projectedAge <= 30 ? 
                <span className="text-green-600 ml-1">(Peak years)</span> : 
                <span className="text-blue-600 ml-1">(Development)</span>}
            </span>
          </div>
        )}
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
            {prediction.projectedAge > 30 && " Player age is an important factor in market value trends, with values typically declining after age 30."}
            {prediction.yearsForward > 2 && " Longer prediction periods may have reduced accuracy."}
          </p>
        </div>
      )}
    </div>
  </CardContent>
</Card>
        </div>
      </div>
    </div>
  );
}