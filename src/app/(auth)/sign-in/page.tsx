"use client"
import {useSession, signIn, signOut} from "next-auth/react";

import React from 'react';

function Page() {

  const {data: session} = useSession();

  if (session) {
    return (
      <div>
        Signed in as {session.user.email}
        <br/>
        <button onClick={() => signOut()}>
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div>
      <button onClick={() => signIn()}>
        Sign in
      </button>
    </div>
  );
}

export default Page;