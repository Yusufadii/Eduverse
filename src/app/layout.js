import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/footer/page";
import ConditionalNavbar from "@/components/navbar/page";

export const metadata = {
  title: "Eduverse",
  description: "Education Universe",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ConditionalNavbar />
        {children}
        <Footer/>
      </body>
    </html>
  );
}
