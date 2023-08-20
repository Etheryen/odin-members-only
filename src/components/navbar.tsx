import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import {
  EnterIcon,
  ExitIcon,
  LockClosedIcon,
  Pencil2Icon,
  PersonIcon,
  StarFilledIcon,
} from "@radix-ui/react-icons";

export function Navbar() {
  const { data: sessionData } = useSession();

  return (
    <nav className="navbar flex-col gap-4 md:gap-0 lg:flex-row">
      <div className="flex-1">
        <Link
          href={"/"}
          role="button"
          className="btn-ghost btn text-2xl normal-case"
        >
          <span className="text-primary">Members</span> only club
        </Link>
      </div>
      <div className="flex flex-col gap-4 md:flex-row">
        {sessionData ? (
          <>
            <Link href={"/new-message"} role="button" className="btn-ghost btn">
              <Pencil2Icon />
              New <span className="text-secondary">message</span>
            </Link>
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
                <span className="text-accent">Admin</span> mode
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
