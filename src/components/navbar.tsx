import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  EnterIcon,
  ExitIcon,
  LockClosedIcon,
  PersonIcon,
  StarFilledIcon,
} from "@radix-ui/react-icons";

export function Navbar() {
  const { data: sessionData } = useSession();

  return (
    <nav className="navbar flex-col gap-4 sm:gap-0 lg:flex-row">
      <div className="flex-1">
        <Link
          href={"/"}
          role="button"
          className="btn-ghost btn text-2xl normal-case"
        >
          <span className="text-primary">Members</span> only club
        </Link>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row">
        {sessionData ? (
          <>
            {sessionData.user.membershipStatus === "NOT_MEMBER" && (
              <Link
                href={"/become-member"}
                role="button"
                className="btn-ghost btn"
              >
                <StarFilledIcon />
                Become a <span className="text-primary">member</span>
              </Link>
            )}
            {sessionData.user.adminStatus === "NOT_ADMIN" && (
              <Link
                href={"/become-admin"}
                role="button"
                className="btn-ghost btn"
              >
                <LockClosedIcon />
                Admin mode
              </Link>
            )}
          </>
        ) : (
          <Link href={"/signup"} role="button" className="btn-ghost btn">
            <PersonIcon />
            Sign up
          </Link>
        )}
        {sessionData ? (
          <button className="btn-ghost btn" onClick={() => void signOut()}>
            <ExitIcon />
            Log out
          </button>
        ) : (
          <Link href={"/login"} className="btn-ghost btn">
            <EnterIcon />
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
}
