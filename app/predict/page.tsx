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
import { useState } from "react";

export default function PredictPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This would come from your auth state in a real app

  return (
    <div className="container py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="flex flex-col items-center gap-8 text-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Predict Market Value
          </h1>
          <p className="text-muted-foreground mt-2 text-black">
            Get AI-powered predictions for player market values based on
            performance data
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
              <div className="space-y-2">
                <Label htmlFor="player-name" className=" text-black">
                  Player Name
                </Label>
                <Input id="player-name" placeholder="Search for a player..." />
              </div>
              <div className="space-y-2 ">
                <Label className="text-black">Year</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 text-white">
                    <SelectItem value="2026">2026</SelectItem>
                    <SelectItem value="2027">2027</SelectItem>
                    <SelectItem value="2028">2028</SelectItem>
                    <SelectItem value="2029">2029</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-slate-600">
                Generate Prediction
              </Button>
            </CardContent>
          </Card>
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
                  <p className="text-muted-foreground text-slate-600 mb-4">
                    Generate a prediction to see the results
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-black">
                    <span>Current Value:</span>
                    <span className="font-medium text-black">--</span>
                  </div>
                  <div className="flex justify-between text-black">
                    <span>Predicted Value:</span>
                    <span className="font-medium text-black">--</span>
                  </div>
                  <div className="flex justify-between text-black">
                    <span>Confidence Level:</span>
                    <span className="font-medium text-black">--</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toggle login state for demo purposes */}
        <div className="mt-4">
          <Button variant="outline" onClick={() => setIsLoggedIn(!isLoggedIn)}>
            {isLoggedIn ? "Logout (Demo)" : "Login (Demo)"}
          </Button>
        </div>
      </div>
    </div>
  );
}
