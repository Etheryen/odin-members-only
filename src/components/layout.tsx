import Head from "next/head";
import { type PropsWithChildren } from "react";
import { Navbar } from "./navbar";
import { Toaster } from "react-hot-toast";
import { cn } from "~/utils/tailwind-merge";

export interface LayoutProps extends PropsWithChildren {
  title: string;
  description: string;
  centeredVertically?: boolean;
}

export function Layout({
  title,
  description,
  children,
  centeredVertically = true,
}: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col p-8">
        <Navbar />
        <main
          className={cn("flex flex-1 flex-col items-center", {
            "justify-center": centeredVertically,
          })}
        >
          {children}
        </main>
      </div>
      <Toaster />
    </>
  );
}
