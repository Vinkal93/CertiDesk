"use client";

import React, { useState } from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import AuthGuard from "@/components/auth/AuthGuard";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if public page (landing page, verification routes, or login)
  const isPublicPage =
    pathname === "/" ||
    pathname === "/landing" ||
    pathname.startsWith("/verify") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/su/login");

  return (
    <html lang="en">
      <head>
        <title>CertiDesk Pro - Certificate & Student Management System</title>
        <meta
          name="description"
          content="Production-ready multi-institute student, batch, course, certificate and marksheet management SaaS."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Great+Vibes&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Playball&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F7F8FC] text-[#171A2B] antialiased">
        <AuthProvider>
          <AuthGuard>
            {isPublicPage ? (
              <div className="min-h-screen">{children}</div>
            ) : (
              <div className="flex min-h-screen bg-[#F7F8FC]">
                {/* Fixed / Sticky Sidebar for Desktop - Never scrolls with page */}
                <div className="hidden lg:block sticky top-0 h-screen flex-shrink-0 z-30">
                  <Sidebar />
                </div>

                {/* Mobile Sidebar Drawer */}
                {sidebarOpen && (
                  <div className="fixed inset-0 z-50 flex lg:hidden">
                    <div
                      className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                      onClick={() => setSidebarOpen(false)}
                    />
                    <div className="relative z-10 h-screen">
                      <Sidebar onNavigate={() => setSidebarOpen(false)} />
                    </div>
                  </div>
                )}

                {/* Main Content Area - Scrolls independently */}
                <div className="flex-1 flex flex-col min-w-0 min-h-screen">
                  <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
                  <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    {children}
                  </main>
                </div>
              </div>
            )}
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
