import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { Layout } from "~/components/layout";
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

export default function SignUp() {
  const router = useRouter();

  const signUpMutation = api.auth.signUp.useMutation({
    // TODO: actually log in the user
    onSuccess: async (data) => {
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl: "/",
      });
    },
    onError: (error) => {
      if (error.data?.code === "CONFLICT") {
        setError("email", { type: "server", message: error.message });
        return;
      }

      throw error;
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormSchema> = (data) => {
    signUpMutation.mutate(data);
  };

  return (
    <Layout title="Sign up" description="Sign up for the members-only club">
      <div className="container flex flex-col items-center justify-center px-4 py-16 ">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-primary-content">Sign up</h1>
          <form
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-2"
          >
            <div className="flex gap-4">
              <div className="flex flex-col">
                <label htmlFor="firstName" className="label label-text">
                  First name
                </label>
                <input
                  type="text"
                  id="firstName"
                  {...register("firstName")}
                  disabled={signUpMutation.isLoading}
                  className={cn("input-bordered input", {
                    "input-error text-error": errors.firstName,
                  })}
                />
                {errors.firstName && (
                  <div className="label label-text-alt">
                    {errors.firstName.message}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <label htmlFor="firstName" className="label label-text">
                  Last name
                </label>
                <input
                  type="text"
                  id="lastName"
                  {...register("lastName")}
                  disabled={signUpMutation.isLoading}
                  className={cn("input-bordered input", {
                    "input-error text-error": errors.lastName,
                  })}
                />
                {errors.lastName && (
                  <div className="label label-text-alt">
                    {errors.lastName.message}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col">
              <label htmlFor="firstName" className="label label-text">
                Email
              </label>
              <input
                type="text"
                id="email"
                {...register("email")}
                disabled={signUpMutation.isLoading}
                className={cn("input-bordered input", {
                  "input-error text-error": errors.email,
                })}
              />
              {errors.email && (
                <div className="label label-text-alt">
                  {errors.email.message}
                </div>
              )}
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col">
                <label htmlFor="firstName" className="label label-text">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  {...register("password")}
                  disabled={signUpMutation.isLoading}
                  className={cn("input-bordered input", {
                    "input-error text-error": errors.password,
                  })}
                />
                {errors.password && (
                  <div className="label label-text-alt">
                    {errors.password.message}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <label htmlFor="firstName" className="label label-text">
                  Confirm password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  {...register("confirmPassword")}
                  disabled={signUpMutation.isLoading}
                  className={cn("input-bordered input", {
                    "input-error text-error": errors.confirmPassword,
                  })}
                />
                {errors.confirmPassword && (
                  <div className="label label-text-alt">
                    {errors.confirmPassword.message}
                  </div>
                )}
              </div>
            </div>
            <button
              disabled={signUpMutation.isLoading}
              className="btn-primary btn mt-2"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
