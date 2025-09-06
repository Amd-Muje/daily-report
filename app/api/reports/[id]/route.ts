import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import Report from "@/models/Report";

// PUT /api/reports/[id]
export async function PUT(
  request: NextRequest,
  // PERBAIKAN 1: Tipe params sekarang adalah Promise
  { params }: { params: Promise<{ id: string }> } 
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  // PERBAIKAN 2: Gunakan 'await' untuk mendapatkan nilai dari params
  const { id } = await params; 
  await dbConnect();

  try {
    const body = await request.json();
    const updatedReport = await Report.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: body },
      { new: true }
    );

    if (!updatedReport) {
      return NextResponse.json(
        { message: "Report not found or user not authorized" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedReport);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// DELETE /api/reports/[id]
export async function DELETE(
  request: NextRequest,
  // PERBAIKAN 3: Pastikan tipe di sini juga benar
  { params }: { params: Promise<{ id: string }> }
) {
  // Tandai request sebagai "terpakai" supaya lolos no-unused-vars
  void request;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  // PERBAIKAN 4: Gunakan 'await' juga di sini
  const { id } = await params; 
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