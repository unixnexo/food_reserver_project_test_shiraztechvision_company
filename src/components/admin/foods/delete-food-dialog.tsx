// "use client";

// import { Loader2, Trash2 } from "lucide-react";
// import {
//     AlertDialog,
//     AlertDialogAction,
//     AlertDialogCancel,
//     AlertDialogContent,
//     AlertDialogDescription,
//     AlertDialogFooter,
//     AlertDialogHeader,
//     AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// type Food = {
//     id: string;
//     name: string;
// };

// type DeleteFoodDialogProps = {
//     food: Food | null;
//     isDeleting: boolean;
//     onClose: () => void;
//     onConfirm: () => Promise<void>;
// };

// export function DeleteFoodDialog({
//     food,
//     isDeleting,
//     onClose,
//     onConfirm,
// }: DeleteFoodDialogProps) {
//     return (
//         <AlertDialog
//             open={Boolean(food)}
//             onOpenChange={(open) => {
//                 if (!open && !isDeleting) {
//                     onClose();
//                 }
//             }}
//         >
//             <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-3xl sm:max-w-md">
//                 <AlertDialogHeader className="text-right">
//                     <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
//                         <Trash2 className="size-5" />
//                     </div>

//                     <AlertDialogTitle className="text-lg">
//                         حذف غذا؟
//                     </AlertDialogTitle>

//                     <AlertDialogDescription className="text-sm leading-6">
//                         آیا مطمئن هستید که می‌خواهید غذای{" "}
//                         <span className="font-semibold text-foreground">
//                             «{food?.name}»
//                         </span>{" "}
//                         را حذف کنید؟
//                         <br />
//                         اگر این غذا در منویی استفاده شده باشد، حذف آن انجام نمی‌شود.
//                     </AlertDialogDescription>
//                 </AlertDialogHeader>

//                 <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
//                     <AlertDialogCancel
//                         disabled={isDeleting}
//                         className="h-11 rounded-2xl sm:mt-0"
//                     >
//                         انصراف
//                     </AlertDialogCancel>

//                     <AlertDialogAction
//                         disabled={isDeleting}
//                         onClick={async (e) => {
//                             e.preventDefault();
//                             await onConfirm();
//                         }}
//                         className="h-11 rounded-2xl bg-red-600 text-white hover:bg-red-700"
//                     >
//                         {isDeleting && (
//                             <Loader2 className="size-4 animate-spin" />
//                         )}

//                         حذف غذا
//                     </AlertDialogAction>
//                 </AlertDialogFooter>
//             </AlertDialogContent>
//         </AlertDialog>
//     );
// }











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

type Food = {
    id: string;
    name: string;
};

type DeleteFoodDialogProps = {
    food: Food | null;
    isDeleting: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
};

export function DeleteFoodDialog({
    food,
    isDeleting,
    onClose,
    onConfirm,
}: DeleteFoodDialogProps) {
    return (
        <AlertDialog
            open={Boolean(food)}
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
                        حذف غذا؟
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-sm leading-6">
                        آیا مطمئن هستید که می‌خواهید غذای{" "}
                        <span className="font-semibold text-foreground">
                            «{food?.name}»
                        </span>{" "}
                        را حذف کنید؟
                        <br />
                        اگر این غذا در منویی استفاده شده باشد، حذف آن انجام نمی‌شود.
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

                        حذف غذا
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}


