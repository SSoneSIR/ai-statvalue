import { NextResponse } from "next/server"
import { MongoClient, ServerApiVersion } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
const dbName = process.env.MONGODB_DB || "statvalue_db"

export async function POST(req: Request) {
  try {
    const { data, collection } = await req.json()

    if (!data || !Array.isArray(data) || !collection) {
      return NextResponse.json(
        { error: "Invalid request. Data must be an array and collection must be specified." },
        { status: 400 },
      )
    }

    // Connect to MongoDB
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    })

    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db(dbName)
    const col = db.collection(collection)

    // If the collection already exists, drop it to avoid duplicates
    // This can be made optional based on your needs
    await col.deleteMany({})

    // Insert the data
    const result = await col.insertMany(data)

    await client.close()

    return NextResponse.json({
      success: true,
      message: `${result.insertedCount} records imported into ${collection}`,
    })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json(
      { error: `Failed to import data: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}

