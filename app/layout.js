import { Inter } from "next/font/google";
import ClientLayout from './ClientLayout';
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PlanMyTrip - Your AI Travel Companion",
  description: "Plan your perfect trip with Tribe, your AI travel assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </head>
      <body className={inter.className}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
