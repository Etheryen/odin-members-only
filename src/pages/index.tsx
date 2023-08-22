import { type Message, type User } from "@prisma/client";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Layout } from "~/components/layout";
import { api } from "~/utils/api";
import { cn } from "~/utils/tailwind-merge";
import { atom, useAtom } from "jotai";
import { type QueryObserverResult } from "@tanstack/react-query";

const messageRefetchAtom = atom<(() => Promise<QueryObserverResult>) | null>(
  null
);

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
    refetch,
  } = api.messages.getAllForMembers.useQuery();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setRefetch] = useAtom(messageRefetchAtom);
  setRefetch(() => refetch);

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
        <div className="flex justify-between">
          <h2
            className={cn(
              "overflow-hidden text-ellipsis text-2xl font-semibold"
            )}
          >
            {message.title}
          </h2>
          {isUserMember && (
            <span className="whitespace-nowrap text-right text-sm italic">
              {dayjs(message.createdAt).fromNow()}
            </span>
          )}
        </div>
        {isUserMember && (
          <p className="overflow-hidden text-ellipsis text-sm italic">
            by{" "}
            <span
              className={cn("font-bold", {
                "text-primary":
                  message.author.membershipStatus === "MEMBER" &&
                  message.author.adminStatus === "NOT_ADMIN",
                "text-accent": message.author.adminStatus === "ADMIN",
              })}
            >
              {author}
            </span>
          </p>
        )}
        <p className="overflow-hidden text-ellipsis text-lg">{message.text}</p>
        {sessionData && sessionData.user.adminStatus === "ADMIN" && (
          <div className="card-actions mt-2 justify-end">
            <MessageDeleteButton messageId={message.id} />
          </div>
        )}
      </div>
    </div>
  );
}

function MessageDeleteButton({ messageId }: { messageId: string }) {
  const [mutationToastId, setMutationToastId] = useState<string | null>(null);
  const [customIsLoading, setCustomIsLoading] = useState(false);

  const [refetchAtom] = useAtom(messageRefetchAtom);

  const deleteMessageMutation = api.messages.delete.useMutation({
    onSuccess: async () => {
      if (!mutationToastId) return;

      toast.success("Deleted successfully", {
        position: "bottom-center",
        style: {
          backgroundColor: "hsl(var(--b3)",
          color: "hsl(var(--bc)",
        },
        id: mutationToastId,
      });

      await refetchAtom?.();
    },
    onError: (error) => {
      setCustomIsLoading(false);

      if (!mutationToastId) return;

      toast.error(`Error deleting: ${error.message}`, {
        position: "bottom-center",
        style: {
          backgroundColor: "hsl(var(--b3)",
          color: "hsl(var(--bc)",
        },
        id: mutationToastId,
      });
    },
  });

  const handleDeleteMessage = () => {
    setCustomIsLoading(true);
    const toastId = toast.loading("Deleting...", {
      position: "bottom-center",
      style: {
        backgroundColor: "hsl(var(--b3)",
        color: "hsl(var(--bc)",
      },
    });
    setMutationToastId(toastId);
    deleteMessageMutation.mutate({ id: messageId });
  };

  return (
    <button
      onClick={handleDeleteMessage}
      disabled={customIsLoading}
      className="btn-error btn"
    >
      Delete
    </button>
  );
}
