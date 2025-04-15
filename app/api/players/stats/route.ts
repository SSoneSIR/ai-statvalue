import { NextResponse } from "next/server"
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = process.env.MONGODB_DB || "statvalue_db"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const playerId = url.searchParams.get("id")
    const playerName = url.searchParams.get("name")
    const season = url.searchParams.get("season") || "2023/24"

    if (!playerId && !playerName) {
      return NextResponse.json({ error: "Either player ID or name must be provided" }, { status: 400 })
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

    // Find player
    let playerQuery = {}
    if (playerId) {
      try {
        playerQuery = { _id: new ObjectId(playerId) }
      } catch {
        playerQuery = { id: playerId }
      }
    } else if (playerName) {
      playerQuery = { name: playerName }
    }

    const player = await db.collection("players").findOne(playerQuery)

    if (!player) {
      await client.close()
      return NextResponse.json({ error: "Player not found" }, { status: 404 })
    }

    // Find player stats
    const stats = await db.collection("player_stats").findOne({
      player_id: player._id.toString(),
      season: season,
    })

    await client.close()

    return NextResponse.json({
      player,
      stats: stats || null,
    })
  } catch (error) {
    console.error("Player stats error:", error)
    return NextResponse.json(
      { error: `Failed to get player stats: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}

