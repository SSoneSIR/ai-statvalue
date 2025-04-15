import { NextResponse } from "next/server"
import { MongoClient, ServerApiVersion } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = process.env.MONGODB_DB || "statvalue_db"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const query = url.searchParams.get("query") || ""
    const limit = Number.parseInt(url.searchParams.get("limit") || "10", 10)

    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    })

    await client.connect()
    const db = client.db(dbName)
    const collection = db.collection("players")

    // Search for players by name (case-insensitive)
    const players = await collection
      .find({
        name: { $regex: query, $options: "i" },
      })
      .limit(limit)
      .toArray()

    await client.close()

    return NextResponse.json(players)
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json(
      { error: `Failed to search players: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}

