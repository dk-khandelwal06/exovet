import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import SolarSystemBackground from "../components/3d/SolarSystemBackground";
import Navbar from "../components/navigation/Navbar";
import Footer from "../components/navigation/Footer";

export const metadata: Metadata = {
  title: "ExoVet — Teaching AI to Tell Real Planets from Impostors",
  description:
    "An astronomical machine-learning platform separating genuine Kepler exoplanets from false-positive impostors using supervised classification, permutation feature importance, and interactive 3D physics.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200 antialiased">
        <ThemeProvider>
          {/* Animated 3D Solar System Canvas */}
          <SolarSystemBackground />

          {/* Fixed/Sticky Navigation */}
          <Navbar />

          {/* Main Application Container */}
          <main className="flex-grow relative z-10">{children}</main>

          {/* Scientific Research Footer */}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}

