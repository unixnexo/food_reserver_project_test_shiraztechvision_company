"use client";

import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaginationProps = {
    page: number; // 1-based
    totalPages: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
};

export function Pagination({
    page,
    totalPages,
    totalCount,
    pageSize,
    onPageChange,
    isLoading = false,
}: PaginationProps) {
    if (totalCount === 0) return null;

    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalCount);

    return (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
                نمایش {from.toLocaleString("fa-IR")} تا {to.toLocaleString("fa-IR")}{" "}
                از {totalCount.toLocaleString("fa-IR")} مورد
            </p>

            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isLoading || page <= 1}
                    onClick={() => onPageChange(page - 1)}
                    className="size-9 rounded-xl"
                >
                    <ChevronRight className="size-4" />
                </Button>

                <span className="min-w-[70px] text-center text-xs font-medium text-muted-foreground">
                    صفحه {page.toLocaleString("fa-IR")} از{" "}
                    {Math.max(totalPages, 1).toLocaleString("fa-IR")}
                </span>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isLoading || page >= totalPages}
                    onClick={() => onPageChange(page + 1)}
                    className="size-9 rounded-xl"
                >
                    <ChevronLeft className="size-4" />
                </Button>
            </div>
        </div>
    );
}