// prisma/seed.ts
//
// Seeds baseline reference data:
// - Grades (پایه تحصیلی) — fixed 12-grade list, ordered
// - Schools (مدرسه) — dummy sample schools
// - Foods (غذا) — food bank admin can assign to menu days
// - One ADMIN user (phone+OTP login, same flow as parents)
// - PortionPricing — single row, نیم پرس / تمام پرس prices in تومن
//
// Run with: pnpm exec prisma db seed

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const GRADES = [
    { name: "پایه اول ابتدایی", order: 1 },
    { name: "پایه دوم ابتدایی", order: 2 },
    { name: "پایه سوم ابتدایی", order: 3 },
    { name: "پایه چهارم ابتدایی", order: 4 },
    { name: "پایه پنجم ابتدایی", order: 5 },
    { name: "پایه ششم ابتدایی", order: 6 },
    { name: "پایه هفتم", order: 7 },
    { name: "پایه هشتم", order: 8 },
    { name: "پایه نهم", order: 9 },
    { name: "پایه دهم", order: 10 },
    { name: "پایه یازدهم", order: 11 },
    { name: "پایه دوازدهم", order: 12 },
];

const SCHOOLS = [
    "مدرسه علامه علی",
    "مدرسه شهید بهشتی",
    "مدرسه فرزانگان",
    "مدرسه امام رضا",
];

// Mix of traditional Iranian dishes + fast food, per admin's request.
// Admin can add more later via the menu-management page (Step 5).
const FOODS = [
    "زرشک پلو با مرغ",
    "قرمه سبزی",
    "قیمه",
    "چلو کباب کوبیده",
    "باقالی پلو با گوشت",
    "عدس پلو",
    "استانبولی پلو",
    "خوراک لوبیا",
    "پیتزا مخصوص",
    "ساندویچ مرغ",
    "همبرگر",
    "سیب زمینی سرخ کرده و ناگت",
];

// Single seeded admin account. Same OTP login flow as parents — the
// `role: ADMIN` field is what gates access to the admin dashboard.
const ADMIN_PHONE = "09120000000";
const MENU_START_DATE = new Date("2026-09-22T00:00:00.000Z");
const MENU_END_DATE = new Date("2026-10-22T00:00:00.000Z");

async function seedMenuItems() {
    const foods = await prisma.food.findMany({
        orderBy: {
            name: "asc",
        },
    });

    if (foods.length < 3) {
        throw new Error("At least 3 foods are required to seed menu items.");
    }

    const menuItems: {
        date: Date;
        foodId: string;
    }[] = [];

    const currentDate = new Date(MENU_START_DATE);

    let dayIndex = 0;

    while (currentDate <= MENU_END_DATE) {
        const date = new Date(currentDate);

        // Different number of food choices per day:
        // 1 food, then 2 foods, then 3 foods, repeated.
        const foodCount = (dayIndex % 3) + 1;

        for (let i = 0; i < foodCount; i++) {
            const food = foods[(dayIndex + i) % foods.length];

            menuItems.push({
                date,
                foodId: food.id,
            });
        }

        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        dayIndex++;
    }

    for (const menuItem of menuItems) {
        await prisma.menuItem.upsert({
            where: {
                date_foodId: {
                    date: menuItem.date,
                    foodId: menuItem.foodId,
                },
            },
            update: {},
            create: menuItem,
        });
    }

    console.log(
        `✅ Seeded ${menuItems.length} menu items from 2026-09-22 to 2026-10-22`
    );
}

async function main() {
    console.log("🌱 Seeding...");

    // --- Grades (order field guarantees correct dropdown sort) ---
    for (const grade of GRADES) {
        await prisma.grade.upsert({
            where: { name: grade.name },
            update: { order: grade.order },
            create: grade,
        });
    }
    console.log(`✅ Seeded ${GRADES.length} grades`);

    // --- Schools ---
    for (const name of SCHOOLS) {
        await prisma.school.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }
    console.log(`✅ Seeded ${SCHOOLS.length} schools`);

    // --- Foods ---
    for (const name of FOODS) {
        await prisma.food.upsert({
            where: { name },
            update: {},
            create: { name },
        });
    }
    console.log(`✅ Seeded ${FOODS.length} foods`);

    // --- Menu items ---
    await seedMenuItems();

    // --- Admin user ---
    await prisma.user.upsert({
        where: { phone: ADMIN_PHONE },
        update: { role: "ADMIN" },
        create: { phone: ADMIN_PHONE, role: "ADMIN" },
    });
    console.log(`✅ Seeded admin user (${ADMIN_PHONE})`);

    // --- Portion pricing (single row) ---
    const existingPricing = await prisma.portionPricing.findFirst();
    if (!existingPricing) {
        await prisma.portionPricing.create({
            data: {
                dailyHalfPrice: 680_000,
                dailyFullPrice: 790_000,
                monthlyHalfPrice: 680_000,
                monthlyFullPrice: 790_000,
            },
        });
        console.log("✅ Seeded portion pricing");
    } else {
        console.log("↩️  Portion pricing already exists, skipping");
    }

    console.log("🌱 Done.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });