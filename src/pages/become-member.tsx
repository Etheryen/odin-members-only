import { zodResolver } from "@hookform/resolvers/zod";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { type z } from "zod";
import { Layout } from "~/components/layout";
import { api } from "~/utils/api";
import { membershipSchema } from "~/utils/schemas";
import { cn } from "~/utils/tailwind-merge";

type FormSchema = z.infer<typeof membershipSchema>;

export default function BecomeMember() {
  const { update } = useSession();
  const router = useRouter();
  const [customIsLoading, setCustomIsLoading] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);

  const becomeMemberMutation = api.users.becomeMember.useMutation({
    onSuccess: async () => {
      await update({ membershipStatus: "MEMBER" });
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
    resolver: zodResolver(membershipSchema),
  });

  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    setCustomIsLoading(true);
    becomeMemberMutation.mutate(data);
  };

  const toggleHint = () => {
    toast(`Github button is now ${isHintOpen ? "hidden" : "shown"}`, {
      position: "bottom-center",
      icon: "🤫",
      style: {
        backgroundColor: "hsl(var(--b2)",
        color: "hsl(var(--bc)",
      },
    });
    setIsHintOpen(!isHintOpen);
  };

  return (
    <Layout
      title="Become a member"
      description="Provide the correct passcode and become a member of the club"
    >
      <div className="container flex flex-col items-center justify-center px-4 py-16">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-primary-content">
            Become a <span className="text-primary">member</span>
          </h1>
          <p>
            Enter the correct passcode to gain{" "}
            <span className="text-primary">member</span> status
          </p>
          <p>
            Hover around and look for a{" "}
            <span className="text-secondary">hint</span>
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

            <button disabled={customIsLoading} className="btn-primary btn mt-2">
              Submit
            </button>
          </form>
        </div>
      </div>
      <button
        onClick={toggleHint}
        className="btn-ghost btn absolute bottom-8 left-8 rounded-xl text-xs normal-case text-base-100 selection:bg-transparent selection:text-base-100 hover:text-base-content"
      >
        const hint = author.github.username.toLowerCase()
      </button>
      {isHintOpen && (
        <a
          href="https://github.com/Etheryen"
          target="_blank"
          className="btn-ghost btn absolute bottom-8 right-8 rounded-xl text-xs text-base-100 selection:bg-transparent selection:text-base-100 hover:text-base-content"
        >
          <GitHubLogoIcon className="h-6 w-6" />
        </a>
      )}
    </Layout>
  );
}
