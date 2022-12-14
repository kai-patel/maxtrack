import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { NavBarProps } from "../pages/index";

export function NavBar({ session, status }: NavBarProps) {
  return (
    <nav className="flex bg-gray-600 min-w-screen m-0 px-4 h-[5%] min-h-[5%] max-h-[5%] justify-between items-center shadow">
      <p className="font-bold text-gray-100 select-none text-lg">MaxTrack</p>
      <span className="flex items-center">
        <Link href="/">
          <a className="text-gray-100 select-none hover:underline p-4">
            Dashboard
          </a>
        </Link>
        <NavBarProfileButton session={session} status={status} />
      </span>
    </nav>
  );
}

function NavBarProfileButton({ session, status }: NavBarProps) {
  const buttonStyle = "text-gray-100 justify-end hover:underline";
  return (
    <div className="flex">
      {status === "authenticated" && session ? (
        <>
          <Link href="/profile">
            <a
              className={`flex items-center ${buttonStyle} [&>img]:hover:border-2 [&>img]:hover:border-emerald-500`}
            >
              <p className="text-gray-100">{session.user?.name}</p>
              <img
                className="aspect-square object-scale-down mr-4 ml-4 rounded-full "
                src={session.user?.image || ""}
                height="32"
                width="32"
                referrerPolicy="no-referrer"
              />
            </a>
          </Link>
          <button className={buttonStyle} onClick={() => signOut()}>
            Sign Out
          </button>
        </>
      ) : (
        <button className={buttonStyle} onClick={() => signIn()}>
          Login
        </button>
      )}
    </div>
  );
}
