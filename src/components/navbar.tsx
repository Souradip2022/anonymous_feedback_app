"use client"
import React from 'react';
import {useSession, signOut} from "next-auth/react"
import Link from "next/link";

function Navbar() {
  const {data: User, status} = useSession();
  console.log(User, status)
  return (
    <div className="w-full h-16 bg-gray-800 flex items-center justify-around gap-4 ">
      <h1 className="text-xl font-semibold font-serif">Mystry message app</h1>
      {status === "authenticated" ?
        <>
          <p className="font-bold">Welcome! {User?.user.username}</p>
          <button
            type={"button"} className="w-fit h-fit py-1.5 px-3 bg-white text-black rounded-md hover:bg-gray-200 "
            onClick={() => signOut()}>Logout
          </button>
        </> :
        <>
          <div className="flex gap-3">
            <button
              type={"button"} className="w-fit h-fit py-1.5 px-3 bg-white text-black rounded-md hover:bg-gray-200 ">
              <Link href={"/sign-up"}>
                Signup
              </Link>
            </button>

          <button
            type={"button"} className="w-fit h-fit py-1.5 px-3 bg-white text-black rounded-md hover:bg-gray-200 ">
            <Link href={"/sign-in"}>
              Login
            </Link>
          </button>
          </div>
        </>
      }

    </div>
  );
}

export default Navbar;