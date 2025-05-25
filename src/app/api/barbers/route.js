import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';

export async function GET() {
    try {
        const barbers = await prisma.barber.findMany({
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        phone_number: true,
                        role: true
                    }
                }
            }
        });

        // Transform the data to include user information
        const formattedBarbers = barbers.map(barber => ({
            id: barber.id,
            firstName: barber.firstName || barber.user.firstName,
            lastName: barber.lastName || barber.user.lastName,
            phoneNumber: barber.phone_number,
            specialties: barber.specialties,
            workingHours: barber.working_hours,
            bio: barber.bio,
            createdAt: barber.created_at,
            updatedAt: barber.updated_at
        }));

        return NextResponse.json(formattedBarbers);
    } catch (error) {
        console.error('Error fetching barbers:', error);
        return NextResponse.json({error: 'Failed to fetch barbers'}, {status: 500});
    }
}

export async function POST(request) {
    try {
        const {
            phone_number,
            first_name,
            last_name,
            specialties,
            working_hours,
            photo_url,
            bio
        } = await request.json();

        if (!phone_number || !first_name || !last_name) {
            return NextResponse.json(
                {error: 'Phone number, first name, and last name are required'},
                {status: 400}
            );
        }

        // Convert specialties string to array if it's a string
        const specialtiesArray = typeof specialties === 'string'
            ? specialties.split(',').map(s => s.trim())
            : specialties || [];

        // Create a new barber user and profile in a transaction
        const result = await prisma.$transaction(async (prisma) => {
            // Create the user
            let user = {};

            try {
                user = await prisma.user.create({
                    data: {
                        phone_number,
                        firstName: first_name,
                        lastName: last_name,
                        role: 'BARBER'
                    }
                });
            } catch (error) {
                throw new Error('user already exists');
            }

            // Create the barber profile
            const barber = await prisma.barber.create({
                data: {
                    id: user.id,
                    firstName: first_name,
                    lastName: last_name,
                    phone_number,
                    specialties: specialtiesArray,
                    working_hours: working_hours || {},
                    photo_url,
                    bio
                }
            });

            return {user, barber};
        });

        return NextResponse.json(result.barber, {status: 201});
    } catch (error) {
        console.error('Error creating barber:', error);
        return NextResponse.json({error: error.message}, {status: 500});
    }
} 