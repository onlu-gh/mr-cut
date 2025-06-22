'use client';

import {useEffect} from 'react';
import {usePathname, useRouter} from 'next/navigation';
import Cookies from 'js-cookie';
import {Box, Container} from '@mui/material';
import {getTranslations} from '@/translations';

export default function ManagementLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isHebrew = true;
  const t = getTranslations(isHebrew);

  // Check if we're in a subfolder of management
  const isSubFolder = pathname !== '/management';

  useEffect(() => {
    const userData = Cookies.get('userData');
    if (!userData) {
      router.push('/');
      return;
    }

    const { userType } = JSON.parse(userData);
    if (userType !== 'barber' && userType !== 'admin') {
      router.push('/home');
    }
  }, [router]);

  return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          {/*{isSubFolder && (*/}
          {/*  <Button*/}
          {/*    onClick={() => router.push('/management')}*/}
          {/*    sx={{*/}
          {/*      mb: 3,*/}
          {/*      color: '#2D5043',*/}
          {/*      '&:hover': {*/}
          {/*        bgcolor: 'rgba(45, 80, 67, 0.1)',*/}
          {/*      },*/}
          {/*    }}>*/}
          {/*    <ArrowRight />*/}
          {/*    {t.backToManagement}*/}
          {/*  </Button>*/}
          {/*)}*/}
          {children}
        </Box>
      </Container>
  );
} 