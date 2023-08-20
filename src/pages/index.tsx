import { useSession } from "next-auth/react";
import { Layout } from "~/components/layout";
import { api } from "~/utils/api";

export default function Home() {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <Layout
      centeredVertically={false}
      title="Members only club"
      description="A club only for members"
    >
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-center text-6xl font-black text-primary-content">
          Special club for <span className="text-primary">members</span> only
        </h1>
        <div className="space-y-4 text-center">
          <p className="text-2xl">
            Non-<span className="text-primary">members</span> only see titles
            and contents of <span className="text-secondary">messages</span>
          </p>
          <p className="text-2xl">
            Only <span className="text-primary">members</span> can see the
            author and date
          </p>
        </div>
        <p className="text-2xl">
          {hello.data ? hello.data.greeting : "Loading tRPC query..."}
        </p>
        <MessageFeed />
      </div>
    </Layout>
  );
}

function MessageFeed() {
  return <div></div>;
}

function Message() {
  return <div></div>;
}
