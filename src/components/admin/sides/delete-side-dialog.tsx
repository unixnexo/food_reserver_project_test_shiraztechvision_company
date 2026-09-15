"use client";

import { Loader2, Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Side = {
    id: string;
    name: string;
};

type DeleteSideDialogProps = {
    side: Side | null;
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
};

export function DeleteSideDialog({
    side,
    isDeleting,
    onClose,
    onConfirm,
}: DeleteSideDialogProps) {
    return (
        <AlertDialog
            open={Boolean(side)}
            onOpenChange={(open) => {
                if (!open && !isDeleting) {
                    onClose();
                }
            }}
        >
            <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-3xl sm:max-w-md">
                <AlertDialogHeader className="text-right">
                    <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                        <Trash2 className="size-5" />
                    </div>

                    <AlertDialogTitle className="text-lg">
                        حذف آیتم؟
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-sm leading-6">
                        آیا مطمئن هستید که می‌خواهید{" "}
                        <span className="font-semibold text-foreground">
                            «{side?.name}»
                        </span>{" "}
                        را حذف کنید؟
                        <br />
                        اگر این آیتم در سفارشی استفاده شده باشد، حذف آن انجام نمی‌شود.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
                    <AlertDialogCancel
                        disabled={isDeleting}
                        className="h-11 rounded-2xl sm:mt-0"
                    >
                        انصراف
                    </AlertDialogCancel>

                    <AlertDialogAction
                        disabled={isDeleting}
                        onClick={async (e) => {
                            e.preventDefault();
                            await onConfirm();
                        }}
                        className="h-11 rounded-2xl bg-red-600 text-white hover:bg-red-700"
                    >
                        {isDeleting && (
                            <Loader2 className="size-4 animate-spin" />
                        )}

                        حذف آیتم
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}