import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongoose';
import Report from '@/models/Report';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  await dbConnect();
  
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const year = searchParams.get('year');

  const query: { userId: string; createdAt?: object, status?: string } = { userId: session.user.id };

  if (month && year) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    query.createdAt = {
      $gte: startDate,
      $lte: endDate,
    };
    query.status = 'Complete';
  }

  try {
    const reports = await Report.find(query).sort({ createdAt: -1 });
    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error }, { status: 500 });
  }
}

// ... (kode fungsi POST tetap sama)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  await dbConnect();

  try {
    const body = await request.json();
    const newReport = new Report({
      ...body,
      userId: session.user.id,
      // Jika body.createdAt ada, Mongoose akan menggunakannya.
      // Jika tidak, timestamps: true akan mengisinya otomatis.
    });
    await newReport.save();
    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Server error', error }, { status: 500 });
  }
}