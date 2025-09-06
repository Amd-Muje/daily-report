import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import Report from "@/models/Report";

// PUT /api/reports/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { id } = params;
  await dbConnect();

  try {
    const body = await request.json();
    // Kita pastikan untuk menyertakan createdAt dalam data yang diupdate
    const updatedReport = await Report.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: body }, // Gunakan $set untuk memastikan semua field ter-update
      { new: true }
    );

    if (!updatedReport) {
      return NextResponse.json(
        { message: "Report not found or user not authorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedReport);
  } catch (error) { // Tambahkan variabel error
    console.error("Update error:", error); // Log error untuk debugging
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// DELETE /api/reports/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Tandai request sebagai "terpakai" supaya lolos no-unused-vars
  void request;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params; // Next 15 validator: params berupa Promise
  await dbConnect();

  try {
    const deletedReport = await Report.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!deletedReport) {
      return NextResponse.json(
        { message: "Report not found or user not authorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Report deleted successfully" });
  } catch {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
