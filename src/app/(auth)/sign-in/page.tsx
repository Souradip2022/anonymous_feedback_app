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

    // console.log(data);

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
      <div className="w-[410px] h-fit flex flex-col items-center justify-around p-7 bg-white text-black rounded-md">
        <p className="text-3xl font-bold text-center">Welcome to Anonymous Message App</p>
        <p className="pt-3.5">Send message secretly</p>
        <Form {...form} >
          <form onSubmit={form.handleSubmit(onSubmit)}
                className="bg-white flex flex-col gap-y-3 text-black w-full py-3.5">
            <FormField
              control={form.control}
              name="username"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Username/Email</FormLabel>
                  <FormControl>
                    <Input placeholder="username" className="bg-blue-50" {...field}/>
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
                    <Input placeholder="password" type={"password"} className="bg-blue-50" {...field}/>
                  </FormControl>
                  <FormDescription>
                  </FormDescription>
                  <FormMessage/>
                </FormItem>
              )}
            />

            <Button type="submit" className="bg-black text-white hover:bg-gray-700">Submit</Button>
            <p className="w-full text-center">Not signed in yet? <span className="text-blue-800 hover:text-blue-600 cursor-default">Sign Up</span></p>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default SignInForm;
