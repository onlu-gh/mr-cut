import {NextResponse} from 'next/server';
import {prisma} from '@/lib/prisma';
import {cookies} from 'next/headers';

export async function POST() {
    try {
        const userData = (await cookies()).get('userData') ?? null;

        if (!userData) {
            return NextResponse.json(
                {message: 'user data is required'},
                {status: 400}
            );
        }

        const id = userData ? JSON.parse(decodeURI(userData.value)).id : undefined;

        const user = await prisma.user.findUnique({
            where: {id},
        });

        if (!user) {
            NextResponse.json(
                {message: 'wrong user credentials'},
                {status: 401}
            );
        }

        // Map role to userType for client-side compatibility
        const userType = user.role === 'BARBER' ? 'barber' :
            user.role === 'ADMIN' ? 'admin' : 'customer';

        // Return user data with userType
        return NextResponse.json({
            message: 'Login successful',
            user: {
                ...user,
                userType
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            {message: 'Internal server error'},
            {status: 500}
        );
    }
}