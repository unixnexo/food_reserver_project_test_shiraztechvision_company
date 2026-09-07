// lib/prisma.ts
//
// Singleton Prisma client. In Next.js dev mode, hot-reload re-executes
// modules on every file save — without this pattern, each reload would
// spin up a fresh PrismaClient and eventually exhaust Postgres connections.
// We stash the instance on `globalThis` so it survives hot reloads.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}