import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { api } from "~/utils/api";
import { signUpSchema } from "~/utils/schemas";
import { cn } from "~/utils/tailwind-merge";

const formSchema = signUpSchema
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

type FormSchema = z.infer<typeof formSchema>;

export function getServerSideProps() {
  return {
    props: {
      layout: {
        title: "Sign up",
        description: "Sign up for the members-only club",
      },
    },
  };
}

export default function SignUp() {
  const router = useRouter();

  const [customIsLoading, setCustomIsLoading] = useState(false);

  const signUpMutation = api.users.signUp.useMutation({
    onSuccess: async (data) => {
      const result = await signIn("credentials", {
        email: data.email,
        password: getValues("password"),
        redirect: false,
      });

      if (!result) return;
      if (result.ok) {
        await router.push("/");
        return;
      }
      if (result.error) {
        console.error({ ERROR: result.error });
        setCustomIsLoading(false);
      }
    },
    onError: (error) => {
      if (error.data?.code === "CONFLICT") {
        setError("email", { type: "server", message: error.message });
        setCustomIsLoading(false);
        return;
      }

      throw error;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setError,
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    setCustomIsLoading(true);
    signUpMutation.mutate(data);
  };

  return (
    <div className="container flex flex-col items-center justify-center px-4 py-16 ">
      <div className="space-y-4">
        <h1 className="w-[80vw] text-4xl font-bold dark:text-primary-content sm:w-96">
          Sign up
        </h1>
        <form
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-2"
        >
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-col">
              <label htmlFor="firstName" className="label label-text">
                First name
              </label>
              <input
                type="text"
                id="firstName"
                {...register("firstName")}
                disabled={customIsLoading}
                className={cn("input-bordered input", {
                  "input-error text-error": errors.firstName,
                })}
              />
              {errors.firstName && (
                <div className="label label-text-alt text-error">
                  {errors.firstName.message}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="lastName" className="label label-text">
                Last name
              </label>
              <input
                type="text"
                id="lastName"
                {...register("lastName")}
                disabled={customIsLoading}
                className={cn("input-bordered input", {
                  "input-error text-error": errors.lastName,
                })}
              />
              {errors.lastName && (
                <div className="label label-text-alt text-error">
                  {errors.lastName.message}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <label htmlFor="email" className="label label-text">
              Email
            </label>
            <input
              type="text"
              id="email"
              {...register("email")}
              disabled={customIsLoading}
              className={cn("input-bordered input", {
                "input-error text-error": errors.email,
              })}
            />
            {errors.email && (
              <div className="label label-text-alt text-error">
                {errors.email.message}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-col">
              <label htmlFor="password" className="label label-text">
                Password
              </label>
              <input
                type="password"
                id="password"
                {...register("password")}
                disabled={customIsLoading}
                className={cn("input-bordered input", {
                  "input-error text-error": errors.password,
                })}
              />
              {errors.password && (
                <div className="label label-text-alt text-error">
                  {errors.password.message}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <label htmlFor="confirmPassword" className="label label-text">
                Confirm password
              </label>
              <input
                type="password"
                id="confirmPassword"
                {...register("confirmPassword")}
                disabled={customIsLoading}
                className={cn("input-bordered input", {
                  "input-error text-error": errors.confirmPassword,
                })}
              />
              {errors.confirmPassword && (
                <div className="label label-text-alt text-error">
                  {errors.confirmPassword.message}
                </div>
              )}
            </div>
          </div>
          <button disabled={customIsLoading} className="btn-primary btn mt-2">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
