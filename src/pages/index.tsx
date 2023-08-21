import { type Message, type User } from "@prisma/client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSession } from "next-auth/react";
import { Layout } from "~/components/layout";
import { api } from "~/utils/api";
import { cn } from "~/utils/tailwind-merge";

export default function Home() {
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
            Everybody can send <span className="text-secondary">messages</span>
          </p>
          <p className="text-2xl">
            Non-<span className="text-primary">members</span> can only see
            titles and contents
          </p>
          <p className="text-2xl">
            Only <span className="text-primary">members</span> can see the
            author and date
          </p>
        </div>
        <MessageFeed />
      </div>
    </Layout>
  );
}

function MessageFeed() {
  const { data: sessionData } = useSession();

  if (!sessionData || sessionData.user.membershipStatus === "NOT_MEMBER")
    return <NonMemberFeed />;
  return <MemberFeed />;
}

function NonMemberFeed() {
  const {
    data: messages,
    isLoading,
    error,
  } = api.messages.getAllForNonMembers.useQuery();

  if (isLoading)
    return <span className="loading loading-dots loading-lg mt-6" />;

  if (error)
    return (
      <div className="alert alert-error max-w-fit text-4xl">
        Error: {error.message}
      </div>
    );

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <Message key={message.id} message={message} isUserMember={false} />
      ))}
    </div>
  );
}

function MemberFeed() {
  const {
    data: messages,
    isLoading,
    error,
  } = api.messages.getAllForMembers.useQuery();

  if (isLoading)
    return <span className="loading loading-dots loading-lg mt-6" />;

  if (error)
    return (
      <div className="alert alert-error max-w-fit text-4xl">
        Error: {error.message}
      </div>
    );

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <Message key={message.id} message={message} isUserMember={true} />
      ))}
    </div>
  );
}

type MessageProps =
  | {
      isUserMember: true;
      message: Message & {
        author: Pick<
          User,
          "id" | "lastName" | "firstName" | "membershipStatus" | "adminStatus"
        >;
      };
    }
  | {
      isUserMember: false;
      message: Pick<Message, "id" | "title" | "text">;
    };

dayjs.extend(relativeTime);

function Message({ message, isUserMember }: MessageProps) {
  const { data: sessionData } = useSession();

  const author = isUserMember
    ? `${message.author.firstName} ${message.author.lastName}`
    : "?????";

  return (
    <div className="card max-w-lg bg-base-300">
      <div className="card-body">
        <h2 className="overflow-hidden text-ellipsis text-2xl font-semibold">
          {message.title}
        </h2>
        {isUserMember && (
          <p className="overflow-hidden text-ellipsis text-sm italic">
            by{" "}
            <span
              className={cn({
                "text-primary":
                  message.author.membershipStatus === "MEMBER" &&
                  message.author.adminStatus === "NOT_ADMIN",
                "text-accent": message.author.adminStatus === "ADMIN",
              })}
            >
              {author}
            </span>{" "}
            - {dayjs(message.createdAt).fromNow()}
          </p>
        )}
        <p className="overflow-hidden text-ellipsis text-lg">{message.text}</p>
        {sessionData && sessionData.user.adminStatus === "ADMIN" && (
          <div className="card-actions mt-2 justify-end">
            <button className="btn-error btn">Delete</button>
          </div>
        )}
      </div>
    </div>
  );
}
