import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { type z } from "zod";
import { Layout } from "~/components/layout";
import { loginSchema } from "~/utils/schemas";
import { cn } from "~/utils/tailwind-merge";

type FormSchema = z.infer<typeof loginSchema>;

export default function LogIn() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors,
    watch,
  } = useForm<FormSchema>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<FormSchema> = async (data) => {
    setCustomIsLoading(true);

    const result = await signIn("credentials", { ...data, redirect: false });
    if (!result) return;
    if (result.ok) {
      await router.push("/");
      return;
    }
    if (result.error) {
      setError("email", { type: "server", message: "Invalid credentials" });
      setError("password", { type: "server", message: "Invalid credentials" });
      setCustomIsLoading(false);
    }
  };

  watch(() => {
    if (
      errors.email?.message === "Invalid credentials" ||
      errors.password?.message === "Invalid credentials"
    ) {
      clearErrors();
    }
  });

  const [customIsLoading, setCustomIsLoading] = useState(false);

  return (
    <Layout title="Log in" description="Log in for the members-only club">
      <div className="container flex flex-col items-center justify-center px-4 py-16 ">
        <div className="space-y-4">
          <h1 className="w-[80vw] text-4xl font-bold dark:text-primary-content sm:w-96">
            Log in
          </h1>

          <form
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-2"
          >
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

            <button disabled={customIsLoading} className="btn-primary btn mt-2">
              Log in
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
