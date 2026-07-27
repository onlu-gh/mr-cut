import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Returns the registry of known cookies (by exact name) from CookieVersioning.
// The client uses this to know which cookies to clear on consent rejection.
export async function GET() {
  try {
    const cookies = await prisma.cookieVersioning.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(cookies);
  } catch (error) {
    console.error('Error fetching cookie registry:', error);
    return NextResponse.json({ error: 'Failed to fetch cookie registry' }, { status: 500 });
  }
}
