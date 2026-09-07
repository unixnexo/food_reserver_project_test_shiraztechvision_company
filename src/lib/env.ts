// lib/env.ts
//
// Central place to read required env vars. Throwing here means a missing
// var fails immediately and loudly at the first import, instead of causing
// a confusing runtime error deep inside a request handler later.

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

export const env = {
    JWT_SECRET: requireEnv("JWT_SECRET"),
    ZARINPAL_MERCHANT_ID: requireEnv("ZARINPAL_MERCHANT_ID"),
    APP_BASE_URL: requireEnv("APP_BASE_URL"),
};