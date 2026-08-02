-- Keep updated_at current on every UPDATE at the DB level, so raw SQL updates
-- (outside Prisma Client) also bump the timestamp. Prisma's @updatedAt still
-- sets it on writes through the client; this trigger is the DB-side backstop.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updated_at" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "CookieVersioning_set_updated_at"
    BEFORE UPDATE ON "CookieVersioning"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "BroadcastMessage_set_updated_at"
    BEFORE UPDATE ON "BroadcastMessage"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "User_set_updated_at"
    BEFORE UPDATE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "Barber_set_updated_at"
    BEFORE UPDATE ON "Barber"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "Service_set_updated_at"
    BEFORE UPDATE ON "Service"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER "Appointment_set_updated_at"
    BEFORE UPDATE ON "Appointment"
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
