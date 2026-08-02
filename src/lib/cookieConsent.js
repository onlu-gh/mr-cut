import Cookies from "js-cookie";
import { CookieVersioning } from "@/entities/CookieVersioning";

// The consent record is strictly-necessary (it only stores the user's choice),
// so it is always written — even when the user rejects cookies.
export const CONSENT_COOKIE = "cookieConsent";
export const CONSENT_ACCEPTED = "accepted";
export const CONSENT_REJECTED = "rejected";

// Essential cookies exempt from rejection: the auth session and the consent
// record itself. Every other name in the CookieVersioning registry is cleared
// on rejection, so new cookies added there are handled automatically.
const ESSENTIAL_COOKIES = new Set(["userData", CONSENT_COOKIE]);

// Version is embedded directly in each cookie's JSON value under this key.
const VERSION_FIELD = "_v";

const BASE_OPTIONS = {
    secure: false,
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "strict",
};
const CONSENT_OPTIONS = { ...BASE_OPTIONS, expires: 365 };
// 400 days is the max lifetime browsers honor; renewed on each login.
const USER_DATA_OPTIONS = { ...BASE_OPTIONS, expires: 400 };

// Registry versions cached after the first fetch this page load.
let versionCache = null;

const fetchVersions = async () => {
    const registry = await CookieVersioning.getAll();
    versionCache = {};
    registry.forEach((cookie) => {
        versionCache[cookie.name] = cookie.version;
    });
    return versionCache;
};

const getVersions = async () => versionCache ?? fetchVersions();

// Reads the embedded version from a cookie's JSON value.
// Returns { present, version }; version is undefined when missing/unparseable.
const readCookieVersion = (name) => {
    const raw = Cookies.get(name);
    if (raw == null) return { present: false, version: undefined };
    try {
        const parsed = JSON.parse(raw);
        return { present: true, version: parsed?.[VERSION_FIELD] };
    } catch {
        return { present: true, version: undefined };
    }
};

// Writes an object cookie with the current server version embedded as `_v`.
const setVersionedCookie = async (name, payload, options) => {
    const versions = await getVersions();
    const value = { ...payload, [VERSION_FIELD]: versions[name] ?? 1 };
    Cookies.set(name, JSON.stringify(value), options);
};

// Sets the auth session cookie (essential, exempt from consent) with its version.
export const setUserDataCookie = (user) =>
    setVersionedCookie("userData", user, USER_DATA_OPTIONS);

export const getCookieConsent = () => {
    const raw = Cookies.get(CONSENT_COOKIE);
    if (raw == null) return null;
    try {
        return JSON.parse(raw)?.status ?? null;
    } catch {
        return null;
    }
};

// True once the user has made a choice (accepted or rejected).
export const hasChosenConsent = () => getCookieConsent() !== null;

// Clears the consent record so the banner is shown again (e.g. on logout).
export const clearConsent = () => Cookies.remove(CONSENT_COOKIE);

// Whether non-essential cookies may be written. Strictly-necessary cookies
// (e.g. the `userData` auth session) ignore this and are always allowed.
export const cookiesAllowed = () => getCookieConsent() === CONSENT_ACCEPTED;

// Guarded setter for FUTURE non-essential cookies (analytics, preferences, etc.).
// Only writes when the user has accepted; no-ops (returns false) otherwise.
export const setCookie = (name, value, options = {}) => {
    if (!cookiesAllowed()) return false;
    Cookies.set(name, value, { ...BASE_OPTIONS, ...options });
    return true;
};

export const acceptCookies = () =>
    setVersionedCookie(CONSENT_COOKIE, { status: CONSENT_ACCEPTED }, CONSENT_OPTIONS);

export const rejectCookies = async () => {
    await setVersionedCookie(CONSENT_COOKIE, { status: CONSENT_REJECTED }, CONSENT_OPTIONS);
    // Clear every registered non-essential cookie. Names come from the
    // CookieVersioning registry, so newly added cookies are removed without
    // touching this code.
    try {
        const registry = await CookieVersioning.getAll();
        registry
            .filter((cookie) => !ESSENTIAL_COOKIES.has(cookie.name))
            .forEach((cookie) => Cookies.remove(cookie.name));
    } catch {
        // Registry fetch failed; consent choice is still recorded.
    }
};

// On load: delete any present cookie whose embedded version is missing or older
// than the server's, then refresh so the app re-initializes without it.
export const enforceCookieVersions = async () => {
    if (typeof window === "undefined") return;
    let stale = false;
    try {
        const versions = await fetchVersions();
        Object.keys(versions).forEach((name) => {
            const { present, version } = readCookieVersion(name);
            if (!present) return; // cookie not set, nothing to check
            if (version === undefined || version < versions[name]) {
                Cookies.remove(name);
                stale = true;
            }
        });
    } catch {
        return; // registry unreachable; leave cookies as-is
    }
    if (stale) window.location.reload();
};
