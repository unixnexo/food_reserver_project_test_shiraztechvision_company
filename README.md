## MVP Notice

This project is currently an **MVP (Minimum Viable Product)**.

Some features may not be fully implemented yet, including:

* Pagination
* Search and filtering
* Advanced admin tools
* Additional validation and edge-case handling
* Some UI and UX improvements
* Other production-level features

## Tech Stack

* Next.js
* React
* TypeScript
* Prisma
* PostgreSQL
* Tailwind CSS
* JWT Authentication
* Zarinpal Payment Gateway
* pnpm
* Vitest

## Requirements

Make sure you have the following installed:

* Node.js
* pnpm
* PostgreSQL

## Installation

Clone the repository and install the dependencies:

```bash
pnpm install
```

## Environment Variables

Create a `.env` file in the project root.

Add the following variables:

```env
DATABASE_URL="postgresql://postgres:@localhost:5432/food_reserver_school?schema=public"

JWT_SECRET="nMekqRRu/YH2/176u8hA9krF4AHE6FVT0mERuDGbDLE="

ZARINPAL_MERCHANT_ID="a973c029-4016-4864-9998-3a45ea304189"

APP_BASE_URL="http://localhost:3000"
```

### Important

Update `DATABASE_URL` according to your local PostgreSQL configuration.

For example, if your PostgreSQL user has a password:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/food_reserver_school?schema=public"
```

## Prisma Setup

Generate the Prisma client:

```bash
pnpm prisma generate
```

Run the database migrations:

```bash
pnpm prisma migrate dev
```

Seed the database:

```bash
pnpm prisma db seed
```

If the project uses a combined Prisma script, you can also run:

```bash
pnpm prisma migrate dev
pnpm prisma db seed
```

## Run the Development Server

Start the development server:

```bash
pnpm dev
```

The application will be available at:

```text
http://localhost:3000
```

## Authentication

During development, the OTP code is printed in the terminal console when a login request is made.

You can also use the following development OTP:

```text
11111
```

This OTP is intended for development and testing only.

## Run Tests

To run the test suite:

```bash
pnpm run test
```

## Available Scripts

| Command                   | Description                      |
| ------------------------- | -------------------------------- |
| `pnpm install`            | Install project dependencies     |
| `pnpm dev`                | Start the development server     |
| `pnpm build`              | Build the project for production |
| `pnpm start`              | Start the production server      |
| `pnpm run test`           | Run the test suite               |
| `pnpm run test:watch`     | Run tests in watch mode          |
| `pnpm prisma generate`    | Generate the Prisma client       |
| `pnpm prisma migrate dev` | Run database migrations          |
| `pnpm prisma db seed`     | Seed the database                |
