import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const iranSans = localFont({
  src: "../fonts/iransans.woff2",
  variable: "--font-iran-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "رزرو غذای مدرسه | PH Food",
  description: "سامانه رزرو غذای مدرسه برای والدین",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${iranSans.variable} h-full antialiased bg-[#F4F6F3]`}
    >
      <head>
        <meta name="apple-mobile-web-app-title" content="PHfood" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F4F6F3]">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}