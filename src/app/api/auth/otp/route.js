import {NextResponse} from 'next/server';
import {customAlphabet} from 'nanoid';
import {OtpService} from '@/services/otp.service';
import {MessagingService} from '@/services/messaging.service';
import {Config} from '@/lib/config';
import {prisma} from '@/lib/prisma';

const generateOtp = customAlphabet('0123456789', Config.otpLength);

const IL_COUNTRY_CODE = '+972';

export async function GET(request) {
    const {searchParams} = request.nextUrl;
    const phoneNumberParam = searchParams.get('phoneNumber');

    if (!phoneNumberParam) {
        return NextResponse.json({error: 'phoneNumber is required'}, {status: 400});
    }

    const phoneNumber = `${IL_COUNTRY_CODE}${phoneNumberParam}`;

    const existing = await OtpService.findByPhone(phoneNumber);

    if (existing && !existing.isExpired()) {
        return NextResponse.json({throttled: true, expiresAt: existing.expiresAt});
    }

    const code = generateOtp();
    const otp = await OtpService.upsert(phoneNumber, code);

    try {
        await MessagingService.sendUserOtp({clientPhoneNumber: phoneNumber, code});
    } catch {
        await OtpService.deleteByPhone(phoneNumber);

        return NextResponse.json({error: 'sending otp failed'}, {status: 502});
    }

    return NextResponse.json({throttled: false, expiresAt: otp.expiresAt});
}

export async function POST(request) {
    const {phone_number: phoneNumberParam, code} = await request.json();

    if (!phoneNumberParam || !code) {
        return NextResponse.json({error: 'phone_number and code are required'}, {status: 400});
    }

    const phoneNumber = `${IL_COUNTRY_CODE}${phoneNumberParam}`;

    const isValid = await OtpService.verify(phoneNumber, code);

    if (!isValid) {
        return NextResponse.json({error: 'Invalid or expired OTP'}, {status: 401});
    }

    const existingUser = await prisma.user.findUnique({where: {phone_number: phoneNumber}});

    let user;

    if (existingUser) {
        user = existingUser;
    } else {
        user = await prisma.user.create({
            data: {
                phone_number: phoneNumber,
                role: 'CUSTOMER',
            },
        });
    }

    const userType =
        user.role === 'BARBER' ?
            'barber' :
            user.role === 'ADMIN' ?
                'admin' :
                'customer';

    return NextResponse.json({
        message: existingUser ? 'Login successful' : 'New user created as customer',
        user: {...user, userType},
    });
}
