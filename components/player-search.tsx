"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Loader2 } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "../components/ui/command";

type Player = {
  _id: string;
  name: string;
  position: string;
};

interface PlayerSearchProps {
  onSelect: (player: Player) => void;
  selectedPlayer: Player | null;
}

export default function PlayerSearch({
  onSelect,
  selectedPlayer,
}: PlayerSearchProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (search.trim().length < 2) {
        setPlayers([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/players/search?query=${encodeURIComponent(search)}`
        );
        if (!response.ok) throw new Error("Failed to fetch players");
        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error("Error searching players:", error);
      } finally {
        setLoading(false);
      }
    };

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(fetchPlayers, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [search]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <Input
          value={selectedPlayer?.name || ""}
          readOnly
          placeholder="Search for a player..."
          onClick={() => setOpen(true)}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => {
            if (selectedPlayer) {
              onSelect(null as any);
            } else {
              setOpen(true);
            }
          }}
        >
          {selectedPlayer ? "×" : "🔍"}
        </Button>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search players..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          {loading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          <CommandEmpty>No players found.</CommandEmpty>

          <CommandGroup>
            {players.map((player) => (
              <CommandItem
                key={player._id}
                onSelect={() => {
                  onSelect(player);
                  setOpen(false);
                }}
              >
                <span>{player.name}</span>
                <span className="ml-2 text-muted-foreground">
                  ({player.position})
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
