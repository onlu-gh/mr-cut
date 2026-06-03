'use client';

import React, {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/navigation';
import Image from 'next/image';
import {Alert, Box, Button, CircularProgress, Container, MenuItem, Select, TextField, Typography} from '@mui/material';
import Cookies from 'js-cookie';
import {Config} from '@/lib/config';

const phoneNumberPrefixes = {
   '050': '50',
   '051': '51',
   '052': '52',
   '053': '53',
   '054': '54',
   '055': '55',
   '056': '56',
   '057': '57',
   '058': '58',
   '059': '59',
} as const;

const PHONE_REGEX = new RegExp(`^\\d{9,}$`, "g");

export default function Login() {
   const router = useRouter();
   const [phoneNumberPrefix, setPhoneNumberPrefix] = useState<keyof typeof phoneNumberPrefixes>('050');
   const [phoneNumberBody, setPhoneNumberBody] = useState('');
   const [otpCode, setOtpCode] = useState('');
   const [error, setError] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const [otpState, setOtpState] = useState({isSent: false, expiresAt: undefined});
   const [remainingOtpThrottleTime, setRemainingOtpThrottleTime] = useState(null);
   const otpTimerRef = useRef(null);

   useEffect(() => {
      const script = document.createElement("script");
      script.src = "https://cdn.userway.org/widget.js";
      script.setAttribute("data-account", "zZBTJsNovh");
      script.setAttribute("data-position", '3'); // 1–8, see table above
      script.setAttribute("data-color", "#FF0000");
      script.async = true;
      document.body.appendChild(script);

      return () => {
         document.body.removeChild(script);
      };
   }, []);

   useEffect(() => {
      (async () => {
         const userData = Cookies.get("userData");

         if (userData) {
            setIsLoading(true);

            try {
               await login();
            } catch {
               setError('ההתחברות נכשלה. נסו שנית');
               setIsLoading(false);
            }
         }
      })();
   }, []);

   useEffect(() => {
      console.log(otpState.expiresAt);

      if (otpState.expiresAt) {
         otpTimerRef.current = setInterval(() => setRemainingOtpThrottleTime(new Date(otpState.expiresAt?.getTime() - new Date().getTime())), 1000);
      } else {
         clearInterval(otpTimerRef.current);
         otpTimerRef.current = null;
      }

      return () => clearInterval(otpTimerRef.current);
   }, [otpState]);

   useEffect(() => {
      if (remainingOtpThrottleTime?.getTime() <= 0) {
         clearInterval(otpTimerRef.current);
         otpTimerRef.current = null;
         setRemainingOtpThrottleTime(null);
      }
   }, [remainingOtpThrottleTime]);

   const constructPhoneNumber = () => (
      `${phoneNumberPrefixes[phoneNumberPrefix]}${phoneNumberBody}`
   );

   const validatePhoneNumber = (phoneNumber: string) => {
      return PHONE_REGEX.test(phoneNumber);
   };

   async function login() {
      const response = await fetch('/api/auth/login', {
         method: 'POST',
         credentials: 'same-origin',
         headers: {
            'Content-Type': 'application/json',
         },
      });

      const data = await response.json();

      if (!response.ok) {
         throw new Error(data.message || 'Login failed');
      }

      if (data.user.role === 'BARBER' || data.user.role === 'ADMIN') {
         router.push('/management');
      } else {
         router.push('/home');
      }
   }

   async function requestOtp(phoneNumber: string) {
      setIsLoading(true);

      try {
         const response = await fetch(`/api/auth/otp?phoneNumber=${phoneNumber}`, {
            method: 'GET',
            credentials: 'same-origin',
            headers: {
               'Content-Type': 'application/json',
            },
         });

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.message || 'Otp request failed');
         }

         if (data) {
            setOtpState({
               isSent: true,
               expiresAt: new Date(data.expiresAt),
            });
         }
      } catch {
         setError('שליחת קוד חד פעמי נכשלה, נסה שנית');
      } finally {
         setIsLoading(false);
      }
   }

   async function submitOtp(phoneNumber: string, code: string) {
      try {
         const response = await fetch(`/api/auth/otp`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({phone_number: phoneNumber, code}),
         });

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.message || 'Otp submit failed');
         }

         if (data) {
            Cookies.set('userData', JSON.stringify(data.user), {expires: 30, secure: true, sameSite: 'strict'});
            await login();
         }
      } catch {
         setError('הקוד שהוזן שגוי או פג תוקף');
         setIsLoading(false);
      }
   }

   async function handleSubmit(e) {
      e?.preventDefault();
      setError('');
      setIsLoading(true);
      const phoneNumber = constructPhoneNumber();

      if (!otpState.isSent) {
         // Validate phone number format
         if (!validatePhoneNumber(phoneNumber)) {
            setError('המספר שהוזן אינו תקין');
            setIsLoading(false);

            return;
         }

         await requestOtp(phoneNumber);
      } else {
         submitOtp(phoneNumber, otpCode).finally(() => setIsLoading(false));
      }
   }

   return (
      <Container component="main" maxWidth="xs">
         <Box
            sx={{
               marginTop: 8,
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center',
               backgroundColor: '#f5f5f5',
               padding: 4,
               borderRadius: 2,
               boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
               position: 'relative',
            }}>
            {isLoading && (
               <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                  zIndex: 1,
               }}>
                  <CircularProgress sx={{color: '#fff'}}/>
               </Box>
            )}
            <Image
               src="/mrcut.png"
               alt="Mr. Cut"
               width={150}
               height={150}
               priority
               style={{borderRadius: '50%'}}
            />
            <Typography
               component="h1"
               variant="h4"
               sx={{
                  mt: 3,
                  fontWeight: 'bold',
                  color: '#2D5043',
                  textAlign: 'center'
               }}>
               MR. CUT
            </Typography>
            <Box component="form" onSubmit={handleSubmit}
                 sx={{
                    mt: 1,
                    width: '100%',
                    marginTop: 3,
                    marginBottom: 2,
                 }}>
               <div style={{
                  display: 'flex',
                  flexDirection: 'row-reverse',
                  alignItems: 'center',
                  gap: 10,
               }}>
                  {otpState.isSent ? (
                     <div style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                     }}>
                        <TextField
                           margin="normal"
                           required
                           // fullWidth
                           id="otp_code"
                           name="otp_code"
                           autoFocus
                           value={otpCode}
                           InputProps={{
                              type: "number",
                              sx: {
                                 '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                    display: 'none'
                                 },
                                 '& input[type=number]': {
                                    textAlign: 'center',
                                    MozAppearance: 'textfield'
                                 },
                              }
                           }}
                           onChange={(e) => setOtpCode((prev) => e.target.value.length <= Config.otpLength ? e.target.value : prev)}
                           sx={{
                              margin: 0,
                              direction: 'ltr',
                              backgroundColor: 'white',
                              '& .MuiOutlinedInput-root': {
                                 '&:hover fieldset': {
                                    borderColor: '#2D5043',
                                 },
                              },
                           }}
                        />
                        <Alert severity="info"
                               sx={{
                                  mt: 2,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 1,
                                  width: '100%',
                                  "& .MuiAlert-message": {
                                     display: 'flex',
                                     alignItems: 'center'
                                  }
                               }}>
                           {`לקבלת קוד חדש`}
                           <Button disabled={!!remainingOtpThrottleTime}
                                   sx={{padding: '0 5px', marginTop: '-2px', minWidth: 'unset'}}
                                   onClick={() => requestOtp(constructPhoneNumber())}>
                              {`לחץ כאן`}
                           </Button>
                           <Typography
                              sx={{opacity: !remainingOtpThrottleTime ? 0 : 1}}
                              fontSize={'small'}
                              width={'min-content'}>{!!remainingOtpThrottleTime ? `(${String(remainingOtpThrottleTime.getMinutes()).padStart(2, '0')}:${String(remainingOtpThrottleTime.getSeconds()).padStart(2, '0')})` : '(00:00)'}</Typography>
                        </Alert>
                     </div>
                  ) : (
                     <>
                        <Select fullWidth
                                variant={'outlined'}
                                className={"bg-white flex-1/2"}
                                sx={{
                                   "& .MuiInputBase-input": {
                                      // padding: '4.5px !important',
                                   },
                                   "& .MuiSelect-select.MuiSelect-outlined": {
                                      // paddingLeft: '32px !important',
                                      // paddingRight: '14px !important',
                                   },
                                   "& .MuiSvgIcon-root": {
                                      right: "unset",
                                      left: "7px",
                                   },
                                }}
                                value={phoneNumberPrefix}
                                onChange={(e) => setPhoneNumberPrefix(e.target.value as typeof phoneNumberPrefix)}>
                           {
                              Object.keys(phoneNumberPrefixes).map((prefixId) => (
                                 <MenuItem key={prefixId}
                                           value={prefixId}>
                                    {prefixId}
                                 </MenuItem>
                              ))
                           }
                        </Select>
                        <Typography>-</Typography>
                        <TextField
                           margin="normal"
                           required
                           fullWidth
                           id="phone_number"
                           // label="טלפון"
                           name="phone_number"
                           autoComplete="tel"
                           // autoFocus
                           value={phoneNumberBody}
                           InputProps={{
                              type: "number",
                              sx: {
                                 '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                    display: 'none'
                                 },
                                 '& input[type=number]': {
                                    MozAppearance: 'textfield'
                                 },
                              }
                           }}
                           onChange={(e) => setPhoneNumberBody((prev) => e.target.value.length <= 7 ? e.target.value : prev)}
                           sx={{
                              margin: 0,
                              direction: 'ltr',
                              backgroundColor: 'white',
                              '& .MuiOutlinedInput-root': {
                                 '&:hover fieldset': {
                                    borderColor: '#2D5043',
                                 },
                              },
                           }}
                        />
                     </>
                  )}
               </div>
               {error && (
                  <Alert severity="error" sx={{mt: 2}}>
                     {error}
                  </Alert>
               )}
               <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                     mt: 3,
                     mb: 2,
                     bgcolor: '#2D5043',
                     py: 1.5,
                     fontSize: '1.1rem',
                     '&:hover': {
                        bgcolor: '#1A3028',
                     },
                  }}
                  disabled={isLoading}
               >
                  {isLoading ? 'מתחבר...' : 'התחבר'}
               </Button>
            </Box>
         </Box>
      </Container>
   );
} 