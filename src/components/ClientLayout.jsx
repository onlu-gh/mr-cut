"use client";

import React, {Fragment, useEffect, useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {LogOut, Menu, X} from "lucide-react";
import {
    AppBar,
    Backdrop,
    Box,
    Button,
    CircularProgress,
    Container,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";
import Cookies from "js-cookie";
import {usePathname, useRouter} from "next/navigation";
import {getTranslations} from "@/translations";

export default function ClientLayout({children}) {
    const router = useRouter();
    const path = usePathname();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isHebrew] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [navigation, setNavigation] = useState([]);
    const [navigating, setNavigating] = useState(false);

    // Layout survives route changes, so the loader must be cleared once the new page is in.
    useEffect(() => {
        setNavigating(false);
    }, [path]);

    const handleNavClick = (e, href) => {
        // Skip same-page clicks and new-tab clicks (modifier/middle button) — no navigation happens.
        if (href === path || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        setNavigating(true);
    };

    useEffect(() => {
        const userData = Cookies.get("userData");
        // const langPref = Cookies.get("langPref");

        if (!userData && window.location.pathname !== "/") {
            handleLogout();
            return;
        }

        try {
            if (userData) {
                const parsedUserData = JSON.parse(userData);
                // Validate cookie has required fields — clear stale/corrupted cookies
                if (!parsedUserData?.id || !parsedUserData?.role) {
                    console.warn("Invalid cookie structure, clearing session");
                    handleLogout();
                    return;
                }
                setCurrentUser(parsedUserData);
            }
            // Set language preference from cookie or default to false
            // setIsHebrew(langPref === "hebrew");
        } catch (error) {
            console.error("Error parsing user data:", error);
            handleLogout();
        }
        setIsLoading(false);
    }, [router, path]);

    // // Add effect to update language preference cookie
    // useEffect(() => {
    //   Cookies.set("langPref", isHebrew ? "hebrew" : "english");
    // }, [isHebrew]);

    const handleLogout = () => {
        Cookies.remove("userData");
        setCurrentUser(null);
        router.push("/");
    };

    const t = getTranslations(isHebrew);

    useEffect(() => {
        if (currentUser) {
            let tempNavigation = [
                {name: t.home, href: "/home"},
                {name: t.bookNow, href: "/book"},
                {name: t.dashboard, href: "/customer/dashboard"},
                {name: t.about, href: "/about"},
            ];

            const isBarber = currentUser?.role?.toUpperCase() === "BARBER";
            const isAdmin = currentUser?.role?.toUpperCase() === "ADMIN";

            if (isBarber || isAdmin) {
                tempNavigation = [
                    {name: t.management, href: "/management"},
                    {name: t.calendar, href: "/management/calendar"},
                    {name: t.appointmentManagement, href: "/management/appointments"},
                    {name: t.barberManagement, href: "/management/barbers"},
                ];

                if (isAdmin) {
                    tempNavigation = [
                        ...tempNavigation,
                        {name: t.serviceManagement, href: "/management/services"},
                        {name: t.broadcastMessages, href: "/management/broadcast"},
                    ]
                }
            }

            setNavigation(tempNavigation);
        } else {
            setNavigation([]);
        }
    }, [currentUser]);

    if (isLoading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    bgcolor: '#F5F1E6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Image
                    src="/mrcut.png"
                    alt="Mr. Cut"
                    width={48}
                    height={48}
                    style={{height: '48px', width: 'auto'}}
                    priority
                />
            </Box>
        );
    }

    return (
        <Box
            className={"client layout"}
            sx={{
                minHeight: '100vh',
                bgcolor: '#F5F1E6',
                direction: isHebrew ? 'rtl' : 'ltr',
                display: 'flex',
                flexDirection: 'column'
            }}>
            <Backdrop
                open={navigating}
                sx={{zIndex: (theme) => theme.zIndex.modal + 1}}
            >
                <CircularProgress color="inherit"/>
            </Backdrop>
            {currentUser &&
                <AppBar position="fixed" sx={{bgcolor: '#2D5043', zIndex: 1200}}>
                    <Toolbar>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            // On mobile the logo is centered in the AppBar, leaving the hamburger at the edge
                            ...(isMobile && {
                                position: 'absolute',
                                left: '50%',
                                transform: 'translateX(-50%)',
                            }),
                        }}>
                            <Link href={`/${currentUser?.role?.toUpperCase() === "CUSTOMER" ? 'home' : 'management'}`}
                                  onClick={(e) => handleNavClick(e, `/${currentUser?.role?.toUpperCase() === "CUSTOMER" ? 'home' : 'management'}`)}
                                  style={{display: 'flex', alignItems: 'center'}}>
                                <Image
                                    src="/mrcut.png"
                                    alt="Mr. Cut"
                                    width={48}
                                    height={48}
                                    style={{height: '48px', width: 'auto'}}
                                    priority
                                />
                            </Link>
                        </Box>

                        {!isMobile && (
                            <Box sx={{marginInlineStart: 5, display: 'flex', flex: 1, alignItems: 'center', gap: 1}}>
                                {/*<LanguageToggle isHebrew={isHebrew} setIsHebrew={setIsHebrew} />*/}

                                {navigation.map((item, index) => (
                                    <Fragment key={item.name}>
                                        <Link href={item.href}
                                              onClick={(e) => handleNavClick(e, item.href)}
                                              style={{
                                                  textDecoration: 'none',
                                                  // backgroundColor: path === item.href ? 'white' : 'none',
                                                  padding: '2px 16px',
                                                  borderRadius: 5,
                                                  border: path === item.href ? '1px solid #FFFFFF55' : 'none',
                                              }}>
                                            <Typography variant="body1">{item.name}</Typography>
                                        </Link>
                                        {index < navigation.length - 1 && <span style={{opacity: 0.25}}>|</span>}
                                    </Fragment>
                                ))}

                                <Button
                                    onClick={handleLogout}
                                    sx={{
                                        color: 'white',
                                        '&:hover': {color: '#AFBFAD'},
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginInlineStart: 'auto',
                                        gap: 1
                                    }}
                                    startIcon={<LogOut style={{height: '20px', width: '20px'}}/>}
                                >
                                    {t.logout}
                                </Button>
                            </Box>
                        )}

                        {isMobile && (
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                {/*<LanguageToggle isHebrew={isHebrew} setIsHebrew={setIsHebrew} />*/}
                                <IconButton
                                    color="inherit"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                >
                                    {mobileMenuOpen ? (
                                        <X style={{height: '24px', width: '24px'}}/>
                                    ) : (
                                        <Menu style={{height: '24px', width: '24px'}}/>
                                    )}
                                </IconButton>
                            </Box>
                        )}
                    </Toolbar>
                </AppBar>
            }

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    mt: '64px', // Add margin top to account for fixed AppBar
                    minHeight: 'calc(100vh - 64px)', // Subtract AppBar height
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {children}
            </Box>

            <Box
                component="footer"
                sx={{
                    bgcolor: '#2D5043',
                    color: 'white',
                    py: 6,
                    mt: 'auto' // Push footer to bottom
                }}
            >
                <Container maxWidth="lg">
                    <Box sx={{display: 'flex', justifyContent: 'center', mb: 4}}>
                        <Image
                            src="/mrcut.png"
                            alt="Mr. Cut"
                            width={48}
                            height={48}
                            style={{height: '64px', width: 'auto'}}
                            priority
                        />
                    </Box>
                    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr 1fr', md: 'repeat(4, 1fr)'}, gap: 4}}>
                        <Box>
                            <Typography variant="subtitle2" sx={{color: '#AFBFAD', textTransform: 'uppercase', mb: 2}}>
                                {t.location}
                            </Typography>
                            <Typography variant="body2" sx={{color: 'rgba(255, 255, 255, 0.7)'}}>
                                קנאי הגליל 9
                                <br/>
                                ירושלים
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" sx={{color: '#AFBFAD', textTransform: 'uppercase', mb: 2}}>
                                {t.hours}
                            </Typography>
                            <Typography variant="body2" sx={{color: 'rgba(255, 255, 255, 0.7)'}}>
                                ראשון עד שישי:<br/>
                                09:00 - 20:00
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" sx={{color: '#AFBFAD', textTransform: 'uppercase', mb: 2}}>
                                {t.contact}
                            </Typography>
                            <Typography variant="body2" sx={{color: 'rgba(255, 255, 255, 0.7)'}}>
                                טלפון: 053-7152798
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" sx={{color: '#AFBFAD', textTransform: 'uppercase', mb: 2}}>
                                {"מידע"}
                            </Typography>
                            <Typography variant="body2" sx={{color: 'rgba(255, 255, 255, 0.7)'}}>
                                <Link href={"/accessibility"}
                                      style={{
                                          textDecoration: 'underline',
                                      }}>
                                    {"הצהרת נגישות"}
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{mt: 4, textAlign: 'center'}}>
                        <Typography variant="body2" sx={{color: 'rgba(255, 255, 255, 0.7)'}}>
                            © {new Date().getFullYear()} Mr. Cut. {t.rights}
                        </Typography>
                    </Box>
                </Container>
            </Box>

            {isMobile &&
                <Drawer
                    anchor="right"
                    // The rtl theme flips the slide animation to the opposite edge; force it back
                    // so the drawer slides open from its own (right) edge.
                    SlideProps={{direction: 'left'}}
                    open={mobileMenuOpen}
                    onClose={() => setMobileMenuOpen(false)}
                    sx={{
                        '& .MuiDrawer-paper': {
                            bgcolor: '#2D5043',
                            width: 240,
                        },
                    }}
                >
                    <List>
                        {navigation.map((item) => (
                            <ListItem
                                key={item.name}
                                component={Link}
                                href={item.href}
                                onClick={(e) => {
                                    handleNavClick(e, item.href);
                                    setMobileMenuOpen(false);
                                }}
                                sx={{
                                    color: path === item.href ? '#B87333' : 'white',
                                    textAlign: 'right',
                                    '&:hover': {
                                        bgcolor: '#233D34',
                                        color: '#AFBFAD',
                                    },
                                }}
                            >
                                <ListItemText primary={item.name}/>
                            </ListItem>
                        ))}
                        <ListItem
                            onClick={() => {
                                handleLogout();
                                setMobileMenuOpen(false);
                            }}
                            sx={{
                                textAlign: 'right',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: '#233D34',
                                    color: '#AFBFAD',
                                },
                            }}
                        >
                            <ListItemText primary={t.logout}/>
                            <LogOut style={{height: '20px', width: '20px', marginRight: '8px'}}/>
                        </ListItem>
                    </List>
                </Drawer>
            }
        </Box>
    );
} 