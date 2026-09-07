// src/app/admin/pricing/page.tsx
//
// PAGE PURPOSE (for AI agents / future readers):
// "قیمت‌گذاری" — admin edits the two global prices (نیم پرس / تمام پرس),
// both in تومن (whole numbers). This is a single settings row, not
// per-food pricing. Changing these values only affects FUTURE orders —
// existing orders keep the price that was in effect when they were placed
// (see OrderItem.unitPrice snapshot, described in schema.prisma).

"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPricingPage() {
    const [halfPortionPrice, setHalfPortionPrice] = useState("");
    const [fullPortionPrice, setFullPortionPrice] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetch("/api/admin/portion-pricing")
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.pricing) {
                    setHalfPortionPrice(String(data.pricing.halfPortionPrice));
                    setFullPortionPrice(String(data.pricing.fullPortionPrice));
                }
            });
    }, []);

    async function handleSave() {
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/admin/portion-pricing", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    halfPortionPrice: Number(halfPortionPrice),
                    fullPortionPrice: Number(fullPortionPrice),
                }),
            });
            const data = await res.json();
            if (!data.success) {
                toast.error(data.error);
                return;
            }
            toast.success("قیمت‌ها بروزرسانی شد");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card className="max-w-sm">
            <CardHeader>
                <CardTitle>قیمت‌گذاری پرس‌ها</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <Label htmlFor="half">نیم پرس (تومن)</Label>
                    <Input
                        id="half"
                        type="number"
                        dir="ltr"
                        value={halfPortionPrice}
                        onChange={(e) => setHalfPortionPrice(e.target.value)}
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="full">تمام پرس (تومن)</Label>
                    <Input
                        id="full"
                        type="number"
                        dir="ltr"
                        value={fullPortionPrice}
                        onChange={(e) => setFullPortionPrice(e.target.value)}
                    />
                </div>
                <Button onClick={handleSave} disabled={isSubmitting}>
                    ذخیره
                </Button>
            </CardContent>
        </Card>
    );
}