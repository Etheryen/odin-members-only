import Head from "next/head";
import { type PropsWithChildren } from "react";
import { Navbar } from "./navbar";
import { Toaster } from "react-hot-toast";

interface LayoutProps extends PropsWithChildren {
  title: string;
  description: string;
}

export function Layout({ title, description, children }: LayoutProps) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col p-8">
        <Navbar />
        <main className="flex flex-grow flex-col items-center justify-center">
          {children}
        </main>
      </div>
      <Toaster />
    </>
  );
}
