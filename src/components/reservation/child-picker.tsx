type Child = {
    id: string;
    firstName: string;
    lastName: string;
    school: { name: string };
    grade: { name: string };
};

type ChildPickerProps = {
    children: Child[];
    selectedChildId: string | null;
    onSelect: (childId: string) => void;
};

export function ChildPicker({ children, selectedChildId, onSelect }: ChildPickerProps) {
    return (
        <div className="flex flex-col gap-3">
            {children.map((child) => {
                const isSelected = selectedChildId === child.id;

                return (
                    <button
                        key={child.id}
                        type="button"
                        onClick={() => onSelect(child.id)}
                        className={`rounded-2xl border p-4 text-right transition-colors ${isSelected
                                ? "border-[#183D2B] bg-[#EAF3ED]/50"
                                : "border-border/70 bg-background hover:bg-muted/40"
                            }`}
                    >
                        <p className="text-sm font-semibold">
                            {child.firstName} {child.lastName}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {child.school.name} · {child.grade.name}
                        </p>
                    </button>
                );
            })}
        </div>
    );
}