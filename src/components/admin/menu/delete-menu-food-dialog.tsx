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

type MenuItem = {
    id: string;
    food: {
        id: string;
        name: string;
    };
};

type DeleteMenuFoodDialogProps = {
    item: MenuItem | null;
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
};

export function DeleteMenuFoodDialog({
    item,
    isDeleting,
    onClose,
    onConfirm,
}: DeleteMenuFoodDialogProps) {
    return (
        <AlertDialog
            open={Boolean(item)}
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
                        حذف غذا از منو؟
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-sm leading-6">
                        آیا مطمئن هستید که می‌خواهید{" "}
                        <span className="font-semibold text-foreground">
                            «{item?.food.name}»
                        </span>{" "}
                        را از منوی این روز حذف کنید؟
                        <br />
                        اگر برای این غذا سفارشی ثبت شده باشد، حذف آن انجام نمی‌شود.
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
                        onClick={async (event) => {
                            event.preventDefault();
                            await onConfirm();
                        }}
                        className="h-11 rounded-2xl bg-red-600 text-white hover:bg-red-700"
                    >
                        {isDeleting && (
                            <Loader2 className="size-4 animate-spin" />
                        )}

                        حذف از منو
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}