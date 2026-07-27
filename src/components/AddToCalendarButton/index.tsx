"use client";

import { useEffect, useState } from "react";
import { Button, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import { CalendarMonth } from "@mui/icons-material";
import { CalendarEvent, googleCalendarUrl, icsDownloadUrl } from "@/lib/ics";

type AddToCalendarButtonProps = {
    event: CalendarEvent;
    className?: string;
    children?: React.ReactNode;
    googleOnlyLabel?: string;
    googleLabel?: string;
    icsLabel?: string;
    iconOnly?: boolean;
    onSelect?: () => void;
};

const brandButtonSx = {
    bgcolor: "#2D5043",
    "&:hover": {
        bgcolor: "#233D34",
    },
};

export default function AddToCalendarButton({
                                                event,
                                                className,
                                                children = "Add to Calendar",
                                                googleOnlyLabel = "Add to Google Calendar",
                                                googleLabel = "Google Calendar",
                                                icsLabel = "Apple / Outlook",
                                                iconOnly = false,
                                                onSelect,
                                            }: AddToCalendarButtonProps) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [offerChoice, setOfferChoice] = useState(false);

    // Everyone gets the choice dropdown (Google + .ics) except Android. iOS hands a
    // text/calendar response straight to Calendar.app; desktop (Windows/Mac/Linux)
    // opens the downloaded .ics in Outlook / Apple Calendar. Android is the only
    // platform where .ics is useless — Chrome forces CATEGORY_BROWSABLE on intent:
    // URIs and calendar event editors don't declare it — so Google is best there.
    // Checked after mount (no navigator during SSR).
    useEffect(() => {
        const ua = navigator.userAgent;
        const isAndroid = /Android/.test(ua);
        setOfferChoice(!isAndroid);
    }, []);

    const handleSelect = () => {
        setAnchorEl(null);
        onSelect?.();
    };

    // On Android there's only one destination, so link straight to it rather than
    // making the user open a dropdown to pick from a list of one. The label names
    // that destination outright, since the button no longer leads to a choice.
    if (!offerChoice) {
        if (iconOnly) {
            return (
                <Tooltip title={googleOnlyLabel}>
                    <IconButton
                        className={className}
                        component="a"
                        href={googleCalendarUrl(event)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onSelect}
                        aria-label={googleOnlyLabel}
                        sx={{color: "#2D5043"}}
                    >
                        <CalendarMonth/>
                    </IconButton>
                </Tooltip>
            );
        }

        return (
            <Button
                variant="contained"
                className={className}
                component="a"
                href={googleCalendarUrl(event)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onSelect}
                sx={brandButtonSx}
            >
                {googleOnlyLabel}
            </Button>
        );
    }

    return (
        <>
            {iconOnly ? (
                <Tooltip title={children}>
                    <IconButton
                        className={className}
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        aria-label={typeof children === "string" ? children : "Add to Calendar"}
                        sx={{color: "#2D5043"}}
                    >
                        <CalendarMonth/>
                    </IconButton>
                </Tooltip>
            ) : (
                <Button
                    variant="contained"
                    className={className}
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={brandButtonSx}
                >
                    {children}
                </Button>
            )}

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem
                    component="a"
                    href={googleCalendarUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleSelect}
                >
                    {googleLabel}
                </MenuItem>
                <MenuItem
                    component="a"
                    href={icsDownloadUrl(event)}
                    onClick={handleSelect}
                >
                    {icsLabel}
                </MenuItem>
            </Menu>
        </>
    );
}
