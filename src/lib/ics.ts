export type CalendarEvent = {
    title: string;
    description?: string;
    location?: string;
    start: Date;
    end: Date;
};

function toICSDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function escapeICSText(text: string): string {
    // Per RFC 5545: escape backslashes, semicolons, commas, and newlines
    return text
        .replace(/\\/g, "\\\\")
        .replace(/;/g, "\\;")
        .replace(/,/g, "\\,")
        .replace(/\n/g, "\\n");
}

export function buildICS(event: CalendarEvent, uidHost = "mrcut"): string {
    const uid = `${Date.now()}@${uidHost}`;

    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//MrCut//AddToCalendar 1.0//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${toICSDate(new Date())}`,
        `DTSTART:${toICSDate(event.start)}`,
        `DTEND:${toICSDate(event.end)}`,
        `SUMMARY:${escapeICSText(event.title)}`,
        event.description ? `DESCRIPTION:${escapeICSText(event.description)}` : "",
        event.location ? `LOCATION:${escapeICSText(event.location)}` : "",
        "END:VEVENT",
        "END:VCALENDAR",
    ]
        .filter(Boolean)
        .join("\r\n");
}

/**
 * URL of the app's own .ics endpoint. Must be a real HTTPS URL rather than a
 * blob: URL — mobile browsers block blob downloads as insecure, and only a
 * text/calendar response over HTTP(S) gets handed to the OS calendar app.
 */
export function icsDownloadUrl(event: CalendarEvent): string {
    const params = new URLSearchParams({
        title: event.title,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
    });

    if (event.description) params.set("description", event.description);
    if (event.location) params.set("location", event.location);

    return `/api/calendar?${params.toString()}`;
}

/** Google Calendar's event-template deep link. Opens the app/site, no file involved. */
export function googleCalendarUrl(event: CalendarEvent): string {
    const stamp = (date: Date) => toICSDate(date);

    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: event.title,
        dates: `${stamp(event.start)}/${stamp(event.end)}`,
    });

    if (event.description) params.set("details", event.description);
    if (event.location) params.set("location", event.location);

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
