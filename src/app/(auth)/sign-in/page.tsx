"use client"
import React from 'react';
import {redirect, useRouter} from "next/navigation";
import {signIn} from "next-auth/react";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {SubmitHandler, useForm} from "react-hook-form";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {signInSchema} from "@/schema/signInSchema";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {toast} from "@/components/ui/use-toast";
import Link from "next/link";
import {FaGoogle} from "react-icons/fa";

function SignInForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    }
  });

  const onSubmit: SubmitHandler<z.infer<typeof signInSchema>> = async (data) => {
    const result = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });

    if (result) {
      if (result.error) {
        toast({
          title: "Login failed",
          description: result.error === "CredentialsSignin" ? "Failed to login user" : result.error,
          variant: "destructive"
        });
      }

      if (result.url) {
        router.replace("/dashboard");
      }
    }
  }

  const handleGoogleSignIn = async (): Promise<void> => {
    const result = await signIn("google", {redirect: false});
    if(result){
      if(result.error){
        toast({
          title: "Login failed",
          description: result.error,
          variant: "destructive"
        });
      }
    }
  }

  return (
    <div className="border-2 w-full h-screen flex items-center justify-center bg-gray-800">
      <div className="w-[410px] h-fit flex flex-col items-center justify-around p-7 bg-white text-black rounded-md">
        <p className="text-3xl font-bold text-center">Welcome to Anonymous Message App</p>
        <p className="pt-3.5">Send message secretly</p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}
                className="bg-white flex flex-col gap-y-3 text-black w-full py-3.5">
            <FormField
              control={form.control}
              name="identifier"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Email or Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Email or Username" type="text" className="bg-blue-50" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Password" type="password" className="bg-blue-50" {...field} />
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )}
            />

            <Button type="submit"
                    className="bg-black text-white hover:bg-gray-700"
                    disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Submitting..." : "Submit"}</Button>

          </form>
        </Form>
        <div className="w-full mt-4">
          <Button
            className="w-full bg-secondary-foreground text-muted hover:bg-gray-200 flex items-center justify-between px-16"
            onClick={handleGoogleSignIn}>
            <span className={""}>Sign in with Google</span>
            <p className={""}>
              <FaGoogle color={"red"} size={20}/>
            </p>
          </Button>
        </div>
        <p className="w-full text-center pt-3">Not signed in yet?
          <Link href={"/sign-up"}>
            <span className="text-blue-800 hover:text-blue-600 cursor-pointer"> Sign Up</span>
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignInForm;
