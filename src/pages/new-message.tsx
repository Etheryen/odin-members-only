import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { type z } from "zod";
import { Layout } from "~/components/layout";
import { api } from "~/utils/api";
import { newMessageSchema } from "~/utils/schemas";
import { cn } from "~/utils/tailwind-merge";

type FormSchema = z.infer<typeof newMessageSchema>;

export default function NewMessage() {
  const router = useRouter();

  const { data: sessionData, status: sessionStatus } = useSession();

  useEffect(() => {
    if (sessionStatus === "unauthenticated") void router.push("/");
  }, [router, sessionStatus]);

  const [customIsLoading, setCustomIsLoading] = useState(false);

  const addMessageMutation = api.messages.addMessage.useMutation({
    onSuccess: async () => {
      await router.push("/");
    },
    onError: () => {
      setCustomIsLoading(false);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(newMessageSchema),
  });

  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    setCustomIsLoading(true);
    addMessageMutation.mutate(data);
  };

  if (!sessionData) return null;

  return (
    <Layout title="New message" description="Add a new message">
      <div className="container flex flex-col items-center justify-center px-4 py-16 ">
        <div className="space-y-4">
          <h1 className="w-[80vw] text-4xl font-bold dark:text-primary-content sm:w-96">
            New <span className="text-secondary">message</span>
          </h1>
          <p className="flex w-[80vw] sm:w-96">
            <span className="pr-1">Hi,</span>
            <span className="block overflow-hidden text-ellipsis text-secondary">
              {sessionData.user.firstName}
            </span>
          </p>
          <p>
            What&apos;s on <span className="text-secondary">your</span> mind?
          </p>
          <form
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-2"
          >
            <div className="flex flex-col">
              <label htmlFor="title" className="label label-text">
                Title
              </label>
              <input
                type="text"
                id="title"
                {...register("title")}
                disabled={customIsLoading}
                className={cn("input-bordered input", {
                  "input-error text-error": errors.title,
                })}
              />
              {errors.title && (
                <div className="label label-text-alt text-error">
                  {errors.title.message}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="text" className="label label-text">
                Text
              </label>
              <textarea
                id="text"
                rows={4}
                {...register("text")}
                disabled={customIsLoading}
                className={cn(
                  "textarea-bordered textarea textarea-md resize-none text-base",
                  {
                    "textarea-error text-error": errors.text,
                  }
                )}
              />
              {errors.text && (
                <div className="label label-text-alt text-error">
                  {errors.text.message}
                </div>
              )}
            </div>

            <button
              disabled={customIsLoading}
              className="btn-secondary btn mt-2"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
