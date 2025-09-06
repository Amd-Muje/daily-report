import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import dbConnect from '@/lib/mongoose';
import Summary from '@/models/Summary';



export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    await dbConnect();

    // Ambil semua ringkasan milik pengguna, urutkan dari yang terbaru
    const summaries = await Summary.find({ userId: session.user.id }).sort({
      year: -1,
      month: -1,
    });

    return NextResponse.json(summaries);
  } catch (error) {
    console.error('Error fetching summaries:', error);
    return NextResponse.json({ message: 'Server error', error }, { status: 500 });
  }
}
// POST /api/summaries
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { month, year, activitySummary, resultSummary } = body;

    if (!month || !year || !activitySummary || !resultSummary) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    await dbConnect();

    // Gunakan findOneAndUpdate dengan upsert untuk membuat atau memperbarui
    const savedSummary = await Summary.findOneAndUpdate(
      { userId: session.user.id, month, year },
      {
        $set: {
          activitySummary,
          resultSummary,
        },
      },
      { new: true, upsert: true } // upsert: true akan membuat dokumen baru jika tidak ada
    );

    return NextResponse.json(savedSummary, { status: 201 });
  } catch (error) {
    console.error('Error saving summary:', error);
    return NextResponse.json({ message: 'Server error', error }, { status: 500 });
  }
}