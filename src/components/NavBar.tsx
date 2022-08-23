import { signIn, signOut } from "next-auth/react";
import React from "react";
import { NavBarProps } from "../pages/index";

export function NavBar({ session, status }: NavBarProps) {
  return (
    <nav className="flex bg-gray-600 min-w-screen m-0 p-4 h-[5%] justify-between items-center shadow">
      <p className="font-bold text-gray-100 select-none text-lg">MaxTrack</p>
      <NavBarProfileButton session={session} status={status} />
    </nav>
  );
}

function NavBarProfileButton({ session, status }: NavBarProps) {
  return (
    <div className="flex">
      {status === "authenticated" && session ? (
        <>
          <button className="flex text-gray-100 justify-end items-center hover:underline">
            <p className="text-gray-100">{session.user?.name}</p>
            <img
              className="aspect-square object-scale-down mr-4 ml-4 rounded-full"
              src={session.user?.image || ""}
              height="32"
              width="32"
              referrerPolicy="no-referrer"
            />
          </button>
          <button
            className="text-gray-100 justify-end hover:underline"
            onClick={() => signOut()}
          >
            Sign Out
          </button>
        </>
      ) : (
        <button
          className="text-gray-100 justify-end hover:underline"
          onClick={() => signIn()}
        >
          Login
        </button>
      )}
    </div>
  );
}
