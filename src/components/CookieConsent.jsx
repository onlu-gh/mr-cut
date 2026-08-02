"use client";

import { useEffect, useState } from "react";
import { Box, Button, Paper, Slide, Typography } from "@mui/material";
import Link from "next/link";
import { getTranslations } from "@/translations";
import { acceptCookies, hasChosenConsent, rejectCookies } from "@/lib/cookieConsent";

const t = getTranslations(true);

export default function CookieConsent() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // Show only until the user makes a choice. Reads the cookie on the
        // client so SSR never renders the banner.
        if (!hasChosenConsent()) setOpen(true);
    }, []);

    const handleAccept = async () => {
        setOpen(false);
        await acceptCookies();
    };

    const handleReject = async () => {
        // Auth cookie is exempt; all other registered cookies are cleared.
        setOpen(false);
        await rejectCookies();
    };

    return (
        <Slide direction="up" in={open} mountOnEnter unmountOnExit>
            <Paper
                elevation={8}
                dir="rtl"
                sx={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: (theme) => theme.zIndex.snackbar,
                    bgcolor: "#2D5043",
                    color: "white",
                    p: { xs: 2, sm: 3 },
                    borderRadius: 0,
                }}
            >
                <Box
                    sx={{
                        maxWidth: "lg",
                        mx: "auto",
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        alignItems: { xs: "stretch", md: "center" },
                        gap: 2,
                    }}
                >
                    <Typography variant="body2" sx={{ flex: 1, color: "rgba(255, 255, 255, 0.85)" }}>
                        {t.cookieNotice}{" "}
                        <Link
                            href="/cookie-policy"
                            style={{ color: "#B87333", textDecoration: "underline" }}
                        >
                            {t.cookieLearnMore}
                        </Link>
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                        <Button
                            onClick={handleReject}
                            variant="outlined"
                            sx={{
                                color: "white",
                                borderColor: "#AFBFAD",
                                "&:hover": { borderColor: "white", bgcolor: "#233D34" },
                            }}
                        >
                            {t.cookieReject}
                        </Button>
                        <Button
                            onClick={handleAccept}
                            variant="contained"
                            sx={{ bgcolor: "#B87333", "&:hover": { bgcolor: "#a5652d" } }}
                        >
                            {t.cookieAccept}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Slide>
    );
}
