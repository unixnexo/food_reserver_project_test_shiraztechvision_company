// src/lib/sms/sms-sender.ts
//
// Abstraction over "sending an SMS". There is no real SMS panel/provider
// integrated yet — once the client provides their panel's API details,
// implement a new class satisfying this same interface (e.g.
// `KavenegarSmsSender`) and swap it in `getSmsSender()` below. Nothing
// else in the codebase should change.
//
// Every call site should go through `getSmsSender().send(...)` rather
// than instantiating a sender directly, so swapping providers is a
// one-line change.

export type SmsSender = {
    send(phone: string, message: string): Promise<void>;
};

// Temporary no-op implementation: logs to the console instead of
// actually sending anything. Safe to use in dev/test — never throws, so
// a missing/misbehaving SMS provider can never break the calling flow
// (e.g. an order should still succeed even if the "order placed" SMS
// fails to send).
class ConsoleSmsSender implements SmsSender {
    async send(phone: string, message: string): Promise<void> {
        console.log(`[SMS -> ${phone}] ${message}`);
    }
}

let smsSenderInstance: SmsSender | null = null;

export function getSmsSender(): SmsSender {
    if (!smsSenderInstance) {
        smsSenderInstance = new ConsoleSmsSender();
    }
    return smsSenderInstance;
}