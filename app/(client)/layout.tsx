import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ClerkProvider } from "@clerk/nextjs";
import SyncUserToSanity from "@/components/SyncUserToSanity";

export const metadata: Metadata = {
  title: {
    template: "%s - Leure Luxe Online Store",
    default: "Leure Luxe Online Store",
  },
  description: "Leure Luxe Online Store, Your one stop shop for all your needs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <div className="flex flex-col min-h-screen">
        <SyncUserToSanity /> 
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </ClerkProvider>
  );
}
