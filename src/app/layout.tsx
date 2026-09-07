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
  title: "رزرو غذای مدرسه",
  description: "سامانه رزرو غذای مدرسه برای والدین",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${iranSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}