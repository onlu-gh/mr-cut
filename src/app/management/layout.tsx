'use client';

import React, {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import Cookies from 'js-cookie';
import {Box, Container} from '@mui/material';

const ManagementLayout: React.FC<React.PropsWithChildren> = ({children}) => {
  const router = useRouter();

  useEffect(() => {
    const userData = Cookies.get('userData');
    if (!userData) {
      router.push('/');
      return;
    }

    const {userType} = JSON.parse(userData) as {userType?: string};
    if (userType !== 'barber' && userType !== 'admin') {
      router.push('/home');
    }
  }, [router]);

  return (
      <Container maxWidth="lg">
        <Box sx={{my: 4}}>
          {children}
        </Box>
      </Container>
  );
};

export default ManagementLayout;
