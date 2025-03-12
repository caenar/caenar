-- CreateTable
CREATE TABLE "projects" (
    "id" BIGSERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "desc" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);
