import "./globals.css";

export const metadata = {
  title: "Eduverse",
  description: "Education Universe",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
