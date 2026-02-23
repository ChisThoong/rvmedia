import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "../../../../lib/mongodb";
import { getAuthUser } from "../../../../lib/auth";

const getObjectId = (id: string) => {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  return new ObjectId(id);
};

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const objectId = getObjectId(id);
  if (!objectId) {
    return NextResponse.json(
      { ok: false, error: "Invalid id" },
      { status: 400 }
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
    await db.collection("landmarks").updateOne(
      { _id: objectId },
      {
        $set: {
          embed: body.embed,
          title: body.title,
          description: body.description,
          categories,
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Unable to update item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const objectId = getObjectId(id);
  if (!objectId) {
    return NextResponse.json(
      { ok: false, error: "Invalid id" },
      { status: 400 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "rvmedia");
    await db.collection("landmarks").deleteOne({ _id: objectId });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Unable to delete item" },
      { status: 500 }
    );
  }
}
