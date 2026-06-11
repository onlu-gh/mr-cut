import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const {searchParams} = new URL(request.url);
    const featureName = searchParams.get('feature');

    const featureVersioning = await prisma.featureVersioning.findUnique({where: {feature_name: featureName}});

    return NextResponse.json(featureVersioning.version);
  } catch (error) {
    console.error('Error fetching feature version:', error);
    return NextResponse.json(
        {error: 'Failed to fetch feature version'},
        {status: 500}
    );
  }
}