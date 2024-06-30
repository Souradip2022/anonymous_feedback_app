import React from 'react';
import Navbar from "@/components/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <div>
    <Navbar/>
      {children}
    </div>)
}