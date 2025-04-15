"use client"; // Ensure this is a client component

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { toast } from "react-hot-toast";

interface Player {
  id: number;
  name: string;
  position: string;
  age: number;
  value: number;
}

export default function AdminPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // Default to null
  const router = useRouter();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/api/auth/status");
        if (!response.ok) throw new Error("Failed to check authentication");
        const data = await response.json();
        if (data.role === "admin") {
          setIsAdmin(true); // User is admin, show admin page
        } else {
          setIsAdmin(false); // Not an admin, set as false
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        toast.error("Not authorized");
        setIsAdmin(false); // If error occurs, assume not authorized
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isAdmin === false) {
      router.push("/"); // Redirect immediately if not admin
    } else if (isAdmin === true) {
      fetchPlayers(); // Fetch players only if admin
    }
  }, [isAdmin, router]);

  const fetchPlayers = async () => {
    try {
      const response = await fetch("/api/players");
      if (!response.ok) throw new Error("Failed to fetch players");
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error("Error fetching players:", error);
      toast.error("Failed to load players");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/players/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete player");
      setPlayers(players.filter((player) => player.id !== id));
      toast.success("Player deleted successfully");
    } catch (error) {
      console.error("Error deleting player:", error);
      toast.error("Failed to delete player");
    }
  };

  const handleEdit = (player: Player) => {
    setEditingPlayer(player);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPlayer) return;

    try {
      const response = await fetch(`/api/players/${editingPlayer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingPlayer),
      });
      if (!response.ok) throw new Error("Failed to update player");
      setPlayers(
        players.map((p) => (p.id === editingPlayer.id ? editingPlayer : p))
      );
      setEditingPlayer(null);
      toast.success("Player updated successfully");
    } catch (error) {
      console.error("Error updating player:", error);
      toast.error("Failed to update player");
    }
  };

  if (isAdmin === null) {
    return <div>Loading...</div>; // Show loading state while checking authentication
  }
  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>

      <Card>
        <CardHeader>
          <CardTitle>Player List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Value (€M)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>{player.name}</TableCell>
                  <TableCell>{player.position}</TableCell>
                  <TableCell>{player.age}</TableCell>
                  <TableCell>{player.value}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      className="mr-2"
                      onClick={() => handleEdit(player)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(player.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {editingPlayer && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Player</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editingPlayer.name}
                  onChange={(e) =>
                    setEditingPlayer({ ...editingPlayer, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={editingPlayer.position}
                  onChange={(e) =>
                    setEditingPlayer({
                      ...editingPlayer,
                      position: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={editingPlayer.age}
                  onChange={(e) =>
                    setEditingPlayer({
                      ...editingPlayer,
                      age: Number.parseInt(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="value">Value (€M)</Label>
                <Input
                  id="value"
                  type="number"
                  value={editingPlayer.value}
                  onChange={(e) =>
                    setEditingPlayer({
                      ...editingPlayer,
                      value: Number.parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <Button type="submit">Update Player</Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
