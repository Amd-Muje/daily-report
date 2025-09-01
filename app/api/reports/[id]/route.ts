import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import Report from "@/models/Report";

interface Params {
	params: { id: string };
}

export async function PUT(request: Request, { params }: Params) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
	}

	await dbConnect();

	try {
		const body = await request.json();
		const updatedReport = await Report.findOneAndUpdate(
			{ _id: params.id, userId: session.user.id },
			body,
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
		return NextResponse.json(
			{ message: "Server error", error },
			{ status: 500 }
		);
	}
}

export async function DELETE(request: Request, { params }: Params) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
	}

	await dbConnect();

	try {
		const deletedReport = await Report.findOneAndDelete({
			_id: params.id,
			userId: session.user.id,
		});

		if (!deletedReport) {
			return NextResponse.json(
				{ message: "Report not found or user not authorized" },
				{ status: 404 }
			);
		}

		return NextResponse.json({ message: "Report deleted successfully" });
	} catch (error) {
		return NextResponse.json(
			{ message: "Server error", error },
			{ status: 500 }
		);
	}
}
