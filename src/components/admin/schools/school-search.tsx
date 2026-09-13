"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type SchoolSearchProps = {
    value: string;
    onChange: (value: string) => void;
};

export function SchoolSearch({
    value,
    onChange,
}: SchoolSearchProps) {
    return (
        <div className="relative">
            <Search className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="جستجوی مدرسه..."
                className="h-12 rounded-2xl border-border/70 bg-muted/40 px-11 pl-12 text-sm shadow-none"
            />

            {value && (
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onChange("")}
                    className="absolute left-1.5 top-1/2 size-9 -translate-y-1/2 rounded-xl text-muted-foreground hover:bg-background"
                >
                    <X className="size-4" />
                </Button>
            )}
        </div>
    );
}