"use client"
import React from 'react';
import {useRouter} from "next/navigation";
import {signIn} from "next-auth/react";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {useForm} from "react-hook-form";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {signInSchema} from "@/schema/signInSchema";
import {Input} from "@/components/ui/input";
import {useDebounceCallback} from 'usehooks-ts';
import {Button} from "@/components/ui/button";
import {toast} from "@/components/ui/use-toast";


function SignInForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof signInSchema>>({
      resolver: zodResolver(signInSchema),
      defaultValues: {
        identifier: "",
        password: "",
      }
    }
  );

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });

    if (result) {
      if (result.error === "CredentialsSignin") {
        toast({
          title: "Login failed",
          description: "Failed to login user",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive"
        })
      }

      if (result?.url) {
        router.replace("/dashboard");
      }
    }
  }

  return (
    <div className="border-2 w-full h-screen flex items-center justify-center bg-gray-800">
      <div className="w-96 h-fit flex flex-col items-center justify-around p-7 bg-white text-black ">
        <p className="text-4xl font-bold text-center">Welcome to Anonymous Feedback App</p>
        <Form {...form} >
          <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white text-black w-full py-3.5">
            <FormField
              control={form.control}
              name="identifier"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" className="bg-gray-200" {...field} />
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
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="password" className="bg-gray-200" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public display name.
                  </FormDescription>
                  <FormMessage/>
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default SignInForm;
