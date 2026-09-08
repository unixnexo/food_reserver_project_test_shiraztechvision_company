"use client";

import { useSearchParams } from "next/navigation";

export function useChildIdParam(): string | null {
    const searchParams = useSearchParams();
    return searchParams.get("childId");
}