-- CreateTable
CREATE TABLE "CookieVersioning" (
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CookieVersioning_pkey" PRIMARY KEY ("name")
);

-- Seed the default cookie version row.
INSERT INTO "CookieVersioning" ("name") VALUES ('userData');
