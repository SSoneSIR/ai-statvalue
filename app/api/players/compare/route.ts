import { NextResponse } from "next/server"
import { MongoClient, ServerApiVersion } from "mongodb"
import { ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = process.env.MONGODB_DB || "statvalue_db"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const player1Id = url.searchParams.get("player1")
    const player2Id = url.searchParams.get("player2")
    const season = url.searchParams.get("season") || "2023/24"

    if (!player1Id || !player2Id) {
      return NextResponse.json({ error: "Both player IDs must be provided" }, { status: 400 })
    }

    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    })

    await client.connect()
    const db = client.db(dbName)

    // Get player 1 data
const player1 = await db.collection("players").findOne({
    $or: [{ _id: new ObjectId(player1Id) }, { id: player1Id }],
  })
  
  // Get player 2 data
  const player2 = await db.collection("players").findOne({
    $or: [{ _id: new ObjectId(player2Id) }, { id: player2Id }],
  })

    if (!player1 || !player2) {
      await client.close()
      return NextResponse.json({ error: "One or both players not found" }, { status: 404 })
    }

    // Get stats for player 1
    const stats1 = await db.collection("player_stats").findOne({
      player_id: player1._id.toString(),
      season: season,
    })

    // Get stats for player 2
    const stats2 = await db.collection("player_stats").findOne({
      player_id: player2._id.toString(),
      season: season,
    })

    // Find similar players to player 1
    const similarPlayers = await db
      .collection("players")
      .find({
        position: player1.position,
        _id: { $ne: player1._id },
      })
      .limit(4)
      .toArray()

    await client.close()

    return NextResponse.json({
      player1: {
        info: player1,
        stats: stats1,
      },
      player2: {
        info: player2,
        stats: stats2,
      },
      similarPlayers,
    })
  } catch (error) {
    console.error("Compare error:", error)
    return NextResponse.json(
      { error: `Failed to compare players: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}

