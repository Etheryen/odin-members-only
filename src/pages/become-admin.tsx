import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { type z } from "zod";
import { api } from "~/utils/api";
import { adminStatusSchema } from "~/utils/schemas";
import { cn } from "~/utils/tailwind-merge";

type FormSchema = z.infer<typeof adminStatusSchema>;

export function getServerSideProps() {
  return {
    props: {
      layout: {
        title: "Become an admin",
        description:
          "Provide the correct passcode and become an admin of the club",
      },
    },
  };
}

export default function BecomeAdmin() {
  const { update, status: sessionStatus } = useSession();
  const router = useRouter();
  const [customIsLoading, setCustomIsLoading] = useState(false);

  useEffect(() => {
    if (sessionStatus === "unauthenticated") void router.push("/");
  }, [router, sessionStatus]);

  const becomeAdminMutation = api.users.becomeAdmin.useMutation({
    onSuccess: async () => {
      await update({ membershipStatus: "MEMBER", adminStatus: "ADMIN" });
      await router.push("/");
    },
    onError: (error) => {
      const message =
        error.message === "UNAUTHORIZED"
          ? "You need to log in first"
          : error.message;
      setError("passcode", { type: "server", message: message });
      setCustomIsLoading(false);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormSchema>({
    resolver: zodResolver(adminStatusSchema),
  });

  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    setCustomIsLoading(true);
    becomeAdminMutation.mutate(data);
  };

  if (sessionStatus !== "authenticated") return null;

  return (
    <div className="container flex flex-col items-center justify-center px-4 py-16">
      <div className="space-y-4">
        <h1 className="w-[80vw] text-4xl font-bold dark:text-primary-content sm:w-96">
          Become an <span className="text-accent">admin</span>
        </h1>
        <p>
          Enter the correct passcode to gain{" "}
          <span className="text-accent">admin</span> status
        </p>
        <p>
          This time there are <span className="text-accent">no</span> hints
        </p>

        <form
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-2"
        >
          <div className="flex flex-col">
            <label htmlFor="passcode" className="label label-text">
              Passcode
            </label>
            <input
              type="text"
              id="passcode"
              {...register("passcode")}
              disabled={customIsLoading}
              className={cn("input-bordered input", {
                "input-error text-error": errors.passcode,
              })}
            />
            {errors.passcode && (
              <div className="label label-text-alt text-error">
                {errors.passcode.message}
              </div>
            )}
          </div>

          <button disabled={customIsLoading} className="btn-accent btn mt-2">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
