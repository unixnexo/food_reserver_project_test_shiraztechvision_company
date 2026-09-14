// import { Label } from "@/components/ui/label";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";

// type Option = { id: string; name: string };

// type SchoolGradeFieldsProps = {
//     schools: Option[];
//     grades: Option[];
//     schoolId: string;
//     gradeId: string;
//     onSchoolChange: (value: string) => void;
//     onGradeChange: (value: string) => void;
// };

// export function SchoolGradeFields({
//     schools,
//     grades,
//     schoolId,
//     gradeId,
//     onSchoolChange,
//     onGradeChange,
// }: SchoolGradeFieldsProps) {
//     return (
//         <>
//             <div className="flex flex-col gap-2">
//                 <Label className="text-sm">مدرسه</Label>
//                 <Select
//                     value={schoolId || undefined}
//                     onValueChange={(v) => v && onSchoolChange(v)}
//                 >
//                     <SelectTrigger className="h-12 w-full rounded-2xl border-border/70 px-4 text-base">
//                         <SelectValue placeholder="انتخاب کنید">
//                             {(v: string) =>
//                                 schools.find((s) => s.id === v)?.name ?? "انتخاب کنید"
//                             }
//                         </SelectValue>
//                     </SelectTrigger>
//                     <SelectContent>
//                         {schools.map((s) => (
//                             <SelectItem key={s.id} value={s.id}>
//                                 {s.name}
//                             </SelectItem>
//                         ))}
//                     </SelectContent>
//                 </Select>
//             </div>

//             <div className="flex flex-col gap-2">
//                 <Label className="text-sm">مقطع تحصیلی</Label>
//                 <Select
//                     value={gradeId || undefined}
//                     onValueChange={(v) => v && onGradeChange(v)}
//                 >
//                     <SelectTrigger className="h-12 w-full rounded-2xl border-border/70 px-4 text-base">
//                         <SelectValue placeholder="انتخاب کنید">
//                             {(v: string) =>
//                                 grades.find((g) => g.id === v)?.name ?? "انتخاب کنید"
//                             }
//                         </SelectValue>
//                     </SelectTrigger>
//                     <SelectContent>
//                         {grades.map((g) => (
//                             <SelectItem key={g.id} value={g.id}>
//                                 {g.name}
//                             </SelectItem>
//                         ))}
//                     </SelectContent>
//                 </Select>
//             </div>
//         </>
//     );
// }







import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Option = {
    id: string;
    name: string;
};

type SchoolGradeFieldsProps = {
    schools: Option[];
    grades: Option[];
    schoolId: string;
    gradeId: string;
    onSchoolChange: (value: string) => void;
    onGradeChange: (value: string) => void;
};

export function SchoolGradeFields({
    schools,
    grades,
    schoolId,
    gradeId,
    onSchoolChange,
    onGradeChange,
}: SchoolGradeFieldsProps) {
    return (
        <>
            {/* School */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm">مدرسه</Label>

                <Select
                    value={schoolId}
                    onValueChange={(value) => onSchoolChange(value ?? "")}
                >
                    <SelectTrigger className="h-12 w-full rounded-xl border-[#D5DCD7] px-4 text-base">
                        <SelectValue placeholder="انتخاب کنید">
                            {(value) =>
                                schools.find((school) => school.id === value)?.name ??
                                "انتخاب کنید"
                            }
                        </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                        {schools.map((school) => (
                            <SelectItem key={school.id} value={school.id}>
                                {school.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Grade */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm">مقطع تحصیلی</Label>

                <Select
                    value={gradeId}
                    onValueChange={(value) => onGradeChange(value ?? "")}
                >
                    <SelectTrigger className="h-12 w-full rounded-xl border-[#D5DCD7] px-4 text-base">
                        <SelectValue placeholder="انتخاب کنید">
                            {(value) =>
                                grades.find((grade) => grade.id === value)?.name ??
                                "انتخاب کنید"
                            }
                        </SelectValue>
                    </SelectTrigger>

                    <SelectContent>
                        {grades.map((grade) => (
                            <SelectItem key={grade.id} value={grade.id}>
                                {grade.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </>
    );
}
