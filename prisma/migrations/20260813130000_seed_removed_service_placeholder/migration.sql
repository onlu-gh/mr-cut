-- Seed the "removed service" placeholder. Past appointments of a deleted service
-- get reassigned to this row so the records survive. Hidden from the services tab
-- and booking; never selectable or deletable.
-- Sentinel -1 for price/duration; the UI renders that as "לא ידוע".
INSERT INTO "Service" ("id", "name", "duration_minutes", "price", "suspended", "created_at", "updated_at")
VALUES ('removed-service', 'שירות שהוסר', -1, -1, false, NOW(), NOW())
ON CONFLICT ("id") DO NOTHING;
