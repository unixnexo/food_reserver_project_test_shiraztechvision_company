"use client";

import { useState } from "react";
import { Trash2, School as SchoolIcon, Pencil, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type School = {
    id: string;
    name: string;
};

type SchoolListProps = {
    schools: School[];
    isRenaming: boolean;
    onDelete: (school: School) => void;
    onRename: (school: School, newName: string) => Promise<void>;
};

export function SchoolList({
    schools,
    isRenaming,
    onDelete,
    onRename,
}: SchoolListProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftName, setDraftName] = useState("");

    function startEditing(school: School) {
        setEditingId(school.id);
        setDraftName(school.name);
    }

    function cancelEditing() {
        setEditingId(null);
        setDraftName("");
    }

    async function submitRename(school: School) {
        const trimmed = draftName.trim();
        if (!trimmed || trimmed === school.name) {
            cancelEditing();
            return;
        }
        await onRename(school, trimmed);
        cancelEditing();
    }

    if (schools.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 px-6 py-14 text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                    <SchoolIcon className="size-6 text-muted-foreground" />
                </div>

                <h3 className="text-sm font-semibold">
                    مدرسه‌ای پیدا نشد
                </h3>

                <p className="mt-1 text-xs text-muted-foreground">
                    هنوز مدرسه‌ای ثبت نشده است.
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-border/60 overflow-hidden rounded-3xl border border-border/70">
            {schools.map((school) => {
                const isEditing = editingId === school.id;

                return (
                    <div
                        key={school.id}
                        className="flex items-center justify-between gap-4 bg-background px-4 py-4 transition-colors hover:bg-muted/30 sm:px-5"
                    >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF3ED] text-[#183D2B]">
                                <SchoolIcon className="size-4" />
                            </div>

                            {isEditing ? (
                                <Input
                                    autoFocus
                                    value={draftName}
                                    onChange={(e) => setDraftName(e.target.value)}
                                    disabled={isRenaming}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") submitRename(school);
                                        if (e.key === "Escape") cancelEditing();
                                    }}
                                    className="h-10 rounded-xl border-border/70 bg-muted/40 px-3 text-sm shadow-none"
                                />
                            ) : (
                                <span className="truncate text-sm font-medium">
                                    {school.name}
                                </span>
                            )}
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                            {isEditing ? (
                                <>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => submitRename(school)}
                                        disabled={isRenaming}
                                        className="size-10 rounded-xl text-[#183D2B] hover:bg-[#EAF3ED]"
                                    >
                                        {isRenaming ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <Check className="size-4" />
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={cancelEditing}
                                        disabled={isRenaming}
                                        className="size-10 rounded-xl text-muted-foreground hover:bg-muted"
                                    >
                                        <X className="size-4" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => startEditing(school)}
                                        className="size-10 rounded-xl text-muted-foreground hover:bg-muted"
                                    >
                                        <Pencil className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onDelete(school)}
                                        className="size-10 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}