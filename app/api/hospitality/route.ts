import { NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb";
import { getAuthUser } from "../../../lib/auth";

const serializeItem = (item: any) => ({
  ...item,
  _id: item._id?.toString?.() || item._id
});

export async function GET(request: Request) {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "rvmedia");
  const { searchParams } = new URL(request.url);

  const page = Math.max(Number(searchParams.get("page") || 1), 1);
  const limit = Math.max(Number(searchParams.get("limit") || 12), 1);
  const search = (searchParams.get("search") || "").trim();
  const type = (searchParams.get("type") || "").trim();

  const query: Record<string, unknown> = {};
  if (search) {
    query.$or = [
      { "title.en": { $regex: search, $options: "i" } },
      { "title.vi": { $regex: search, $options: "i" } }
    ];
  }
  if (type) {
    query.categories = type;
  }

  const [items, total, types] = await Promise.all([
    db
      .collection("hospitality")
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray(),
    db.collection("hospitality").countDocuments(query),
    db.collection("hospitality").distinct("categories")
  ]);

  return NextResponse.json({
    items: items.map(serializeItem),
    total,
    page,
    limit,
    types: types.filter((value) => typeof value === "string").sort()
  });
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    if (!body?.embed || !body?.title || !body?.description) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    const categories = Array.isArray(body.categories)
      ? body.categories.filter((item: unknown) => typeof item === "string")
      : [];

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "rvmedia");
    const result = await db.collection("hospitality").insertOne({
      embed: body.embed,
      title: body.title,
      description: body.description,
      categories,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ ok: true, id: result.insertedId.toString() });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Unable to create item" },
      { status: 500 }
    );
  }
}
