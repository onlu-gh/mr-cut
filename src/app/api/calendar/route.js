import { NextResponse } from 'next/server';
import { buildICS } from '@/lib/ics';

export const GET = async (request) => {
  try {
    const params = request.nextUrl.searchParams;

    const title = params.get('title');
    const startParam = params.get('start');
    const endParam = params.get('end');

    // guard the params before parsing: new Date(null) is the epoch, not Invalid Date,
    // so an isNaN check alone would happily serve a 1970 event
    if (!title || !startParam || !endParam) {
      return NextResponse.json(
        { error: 'title, start and end are required' },
        { status: 400 }
      );
    }

    const start = new Date(startParam);
    const end = new Date(endParam);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'start and end must be valid dates' },
        { status: 400 }
      );
    }

    const ics = buildICS({
      title,
      description: params.get('description') || undefined,
      location: params.get('location') || undefined,
      start,
      end,
    }, request.nextUrl.hostname);

    // inline (not attachment) so iOS Safari hands the event straight to
    // Calendar.app instead of dropping a file the user has to hunt down
    return new NextResponse(ics, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="appointment.ics"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error generating calendar event:', error);
    return NextResponse.json(
      { error: 'Failed to generate calendar event' },
      { status: 500 }
    );
  }
}
