"use client"
import React from 'react';
import {useRouter} from "next/navigation";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {SubmitHandler, useForm} from "react-hook-form";
import {signUpSchema} from "@/schema/signUpSchema";
import {Input} from "@/components/ui/input";
import {useDebounceCallback} from 'usehooks-ts';
import {Button} from "@/components/ui/button";
import {useToast} from "@/components/ui/use-toast";
import axios, {Axios, AxiosError} from "axios";
import {ApiResponse} from "@/types/ApiResponse";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";

function Page() {
  const {toast} = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: ""
    }
  });

  const onSubmit: SubmitHandler<z.infer<typeof signUpSchema>> = async (data: z.infer<typeof signUpSchema>) => {
    try {
      const response = await axios.post<ApiResponse>("api/sign-up", data);

      toast({
        title: "Success",
        description: response.data.message,
        variant: "default"
      })
    } catch (error: any) {
      console.log("Error signing up", data);
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Failed",
        description: axiosError.response?.data.message,
        variant: "destructive"
      })
      form.setError("root", {
        message: axiosError.response?.data.message
      })
    }
  }

  return (
    <div className="border-2 w-full h-screen flex items-center justify-center bg-gray-800">
      <div className="w-[410px] h-fit flex flex-col items-center justify-around p-7 bg-white text-black rounded-md">
        <p className="text-3xl font-bold text-center">Join Anonymous Message App</p>
        <p className="pt-3.5">Send message secretly</p>
        <Form {...form} >
          <form onSubmit={form.handleSubmit(onSubmit)}
                className="bg-white flex flex-col gap-y-3 text-black w-full py-3.5">
            <FormField
              control={form.control}
              name="username"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
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
              name="email"
              render={({field}) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe@gmail.com" type={"email"} className="bg-blue-50" {...field}/>
                  </FormControl>
                  <FormDescription>
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
            <Button type="submit"
                    className="bg-black text-white hover:bg-gray-700"
            disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Loading..." : "Submit"}
            </Button>
            <p className="w-full text-center">Not signed in yet? <span
              className="text-blue-800 hover:text-blue-600 cursor-default">Sign Up</span></p>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default Page;