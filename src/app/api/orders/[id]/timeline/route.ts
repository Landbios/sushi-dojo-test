import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '50');

    const timeline = await db.getTimeline(id, page, pageSize);

    return NextResponse.json(timeline);
  } catch (error) {
    console.error('Failed to fetch timeline', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
