import { useSession } from "next-auth/react";
import { Layout } from "~/components/layout";
import { api } from "~/utils/api";

export default function Home() {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <Layout title="Members only club" description="A club only for members">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
        <h1 className="text-center text-6xl font-black text-primary-content">
          Special club for <span className="text-primary">members</span> only
        </h1>
        <p className="text-2xl">
          {hello.data ? hello.data.greeting : "Loading tRPC query..."}
        </p>
        <AuthShowcase />
      </div>
    </Layout>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && (
          <span>
            Logged in as {sessionData.user.firstName}{" "}
            {sessionData.user.lastName}
          </span>
        )}
        {secretMessage && <span> - {secretMessage}</span>}
        {sessionData && (
          <>
            <br />
            <span>
              You{" "}
              {sessionData.user.membershipStatus === "MEMBER"
                ? "ARE"
                : "are NOT"}{" "}
              a member
            </span>
          </>
        )}
      </p>
    </div>
  );
}
