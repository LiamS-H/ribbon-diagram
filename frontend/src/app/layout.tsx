import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/(theme)/theme-provider";
import { NavBar } from "./navbar";
import { Toaster } from "@/components/(ui)/sonner";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Ribbon Diagram Generator",
    description: "An application for generating ribbon diagrams.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="w-full h-full dark" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased h-full w-full`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <NavBar />
                    {children}
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
