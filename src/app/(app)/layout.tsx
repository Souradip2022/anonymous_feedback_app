import React from 'react';
import Navbar from "@/components/navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <div className="w-full h-fit">
    <Navbar/>
      {children}
    </div>
  )
}