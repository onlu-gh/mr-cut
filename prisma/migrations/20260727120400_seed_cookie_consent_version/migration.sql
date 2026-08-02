-- Register the cookieConsent cookie in the versioning table.
INSERT INTO "CookieVersioning" ("name") VALUES ('cookieConsent')
ON CONFLICT ("name") DO NOTHING;
