'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {createPageUrl} from '@/utils';
import {Box, Button, Card, CardContent, Container, Grid, Stack, Typography} from '@mui/material';
import {Calendar, Clock, MapPin, Scissors} from 'lucide-react';
import {getTranslations} from '@/translations';

export default function LandingPage() {
    const isHebrew = true;
    const t = getTranslations(isHebrew);

    return (
        // <ClientLayout currentPageName="Home">
        <Box>
            {/* Hero Section */}
            <Box sx={{position: 'relative'}}>
                <Box sx={{position: 'absolute', inset: 0, zIndex: 0}}>
                    <Image
                        style={{width: '100%', height: '100%', objectFit: 'cover'}}
                        src="/background.jpg"
                        alt="Barber Shop"
                        fill
                        priority
                    />
                    <Box sx={{position: 'absolute', inset: 0, bgcolor: 'rgba(45, 80, 67, 0.8)'}}/>
                </Box>
                <Container maxWidth="xl" sx={{
                    position: 'relative',
                    zIndex: 1,
                    py: {xs: 12, sm: 16},
                    px: {xs: 2, sm: 3, lg: 4},
                    textAlign: 'center'
                }}>
                    <Image
                        src="/mrcut.png"
                        alt="Mr. Cut"
                        width={128}
                        height={128}
                        style={{height: '128px', margin: '0 auto 1.5rem'}}
                    />
                    <Typography
                        variant="h2"
                        sx={{
                            mt: 3,
                            fontWeight: 'bold',
                            color: 'white',
                            fontSize: {xs: '2.5rem', md: '3.75rem'}
                        }}
                    >
                        {t.oldSchoolNewStyle}
                    </Typography>
                    <Typography
                        variant="h5"
                        sx={{
                            mt: 3,
                            maxWidth: '42rem',
                            mx: 'auto',
                            color: '#F5F1E6'
                        }}
                    >
                        {t.experiencePrecision}
                    </Typography>
                    <Box sx={{mt: 5}}>
                        <Link href={createPageUrl('Book')}>
                            <Button
                                variant="contained"
                                size="large"
                                sx={{
                                    bgcolor: '#B87333',
                                    '&:hover': {
                                        bgcolor: '#8B5A2B',
                                    },
                                    marginInlineEnd: 5,
                                    color: 'white',
                                }}
                            >
                                {t.bookYourAppointment}
                            </Button>
                        </Link>
                        <Link href={createPageUrl('Customer/dashboard')}>
                            <Button
                                variant="contained"
                                size="large"
                                sx={{
                                    bgcolor: '#4F8864',
                                    '&:hover': {
                                        bgcolor: '#316145',
                                    },
                                    color: 'white',
                                }}
                            >
                                {t.myAppointments}
                            </Button>
                        </Link>
                    </Box>
                </Container>
            </Box>

            {/* Features */}
            <Box sx={{py: 8, bgcolor: '#F5F1E6'}}>
                <Container maxWidth="xl">
                    <Box sx={{textAlign: 'center', mb: 6}}>
                        <Typography variant="h3" sx={{fontWeight: 'bold', color: '#2D5043'}}>
                            {t.whyChooseUs}
                        </Typography>
                        <Box sx={{width: '96px', height: '4px', bgcolor: '#B87333', mx: 'auto', mt: 2}}/>
                    </Box>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6} lg={3}>
                            <Card sx={{bgcolor: 'rgba(255, 255, 255, 0.8)', borderColor: '#AFBFAD'}}>
                                <CardContent>
                                    <Scissors style={{
                                        height: '32px',
                                        width: '32px',
                                        color: '#2D5043',
                                        marginBottom: '1rem'
                                    }}/>
                                    <Typography variant="h6" sx={{fontWeight: 500, color: '#2D5043'}}>
                                        {t.expertBarbers}
                                    </Typography>
                                    <Typography sx={{mt: 1, color: '#8B5A2B'}}>
                                        {t.skilledProfessionals}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6} lg={3}>
                            <Card sx={{bgcolor: 'rgba(255, 255, 255, 0.8)', borderColor: '#AFBFAD'}}>
                                <CardContent>
                                    <Calendar style={{
                                        height: '32px',
                                        width: '32px',
                                        color: '#2D5043',
                                        marginBottom: '1rem'
                                    }}/>
                                    <Typography variant="h6" sx={{fontWeight: 500, color: '#2D5043'}}>
                                        {t.easyBooking}
                                    </Typography>
                                    <Typography sx={{mt: 1, color: '#8B5A2B'}}>
                                        {t.bookOnline}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6} lg={3}>
                            <Card sx={{bgcolor: 'rgba(255, 255, 255, 0.8)', borderColor: '#AFBFAD'}}>
                                <CardContent>
                                    <Clock style={{
                                        height: '32px',
                                        width: '32px',
                                        color: '#2D5043',
                                        marginBottom: '1rem'
                                    }}/>
                                    <Typography variant="h6" sx={{fontWeight: 500, color: '#2D5043'}}>
                                        {t.flexibleHours}
                                    </Typography>
                                    <Typography sx={{mt: 1, color: '#8B5A2B'}}>
                                        {t.openSixDays}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={6} lg={3}>
                            <Card sx={{bgcolor: 'rgba(255, 255, 255, 0.8)', borderColor: '#AFBFAD'}}>
                                <CardContent>
                                    <MapPin style={{
                                        height: '32px',
                                        width: '32px',
                                        color: '#2D5043',
                                        marginBottom: '1rem'
                                    }}/>
                                    <Typography variant="h6" sx={{fontWeight: 500, color: '#2D5043'}}>
                                        {t.primeLocation}
                                    </Typography>
                                    <Typography sx={{mt: 1, color: '#8B5A2B'}}>
                                        {t.easilyAccessible}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* CTA Section */}
            <Box sx={{bgcolor: '#2D5043'}}>
                <Container maxWidth="xl">
                    <Stack
                        direction={{xs: 'column', lg: 'row'}}
                        spacing={4}
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{py: {xs: 6, lg: 8}, px: {xs: 2, sm: 3, lg: 4}}}
                    >
                        <Box>
                            <Typography variant="h3" sx={{fontWeight: 'bold', color: 'white'}}>
                                {t.readyForFreshLook}
                            </Typography>
                            <Typography variant="h6" sx={{color: '#AFBFAD', mt: 1}}>
                                {t.bookToday}
                            </Typography>
                        </Box>
                        <Box>
                            <Link href={createPageUrl('Book')}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        bgcolor: '#B87333',
                                        '&:hover': {
                                            bgcolor: '#8B5A2B',
                                        },
                                        color: 'white',
                                        marginInlineEnd: 5,
                                    }}
                                >
                                    {t.bookYourAppointment}
                                </Button>
                            </Link>
                            <Link href={createPageUrl('Customer/dashboard')}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        bgcolor: '#4F8864',
                                        '&:hover': {
                                            bgcolor: '#316145',
                                        },
                                        color: 'white',
                                    }}
                                >
                                    {t.myAppointments}
                                </Button>
                            </Link>
                        </Box>
                    </Stack>
                </Container>
            </Box>
        </Box>
        // </ClientLayout>
    );
}