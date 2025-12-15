import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/layout/Sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NuSound | Discover",
  description: "Find your next obsession.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-[#0a0a0a] text-white`}>
        <Sidebar />
        <main className="md:pl-64 min-h-screen relative z-0">
          {/* Background Ambience */}
          <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#b0fb5d] rounded-full mix-blend-screen filter blur-[120px] opacity-10 animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#0affff] rounded-full mix-blend-screen filter blur-[100px] opacity-10" />
          </div>
          {children}
        </main>
      </body>
    </html>
  );
}
