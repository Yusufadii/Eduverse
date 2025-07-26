import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/navbar/page";
import Footer from "@/components/footer/page";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Eduverse",
  description: "Education Universe",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} >
        <Header/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}
