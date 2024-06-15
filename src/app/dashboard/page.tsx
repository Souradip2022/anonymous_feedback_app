"use client"
import React from 'react';
import {useRouter} from "next/navigation";
function Page() {
  const router = useRouter();

  return (
    <div>
      <button type="button" onClick={() => router.back()}>
        Dashboard
      </button>
    </div>
  );
}

export default Page;