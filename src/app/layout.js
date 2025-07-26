import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/navbar/page";
import Footer from "@/components/footer/page";

export const metadata = {
  title: "Eduverse",
  description: "Education Universe",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}
