"use client"
import React, {useEffect, useState} from 'react';
import {useRouter} from "next/navigation";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {SubmitHandler, useForm} from "react-hook-form";
import {signUpSchema} from "@/schema/signUpSchema";
import {Input} from "@/components/ui/input";
import {useDebounceCallback} from 'usehooks-ts';
import {Button} from "@/components/ui/button";
import {toast, useToast} from "@/components/ui/use-toast";
import axios, {AxiosError} from "axios";
import {ApiResponse} from "@/types/ApiResponse";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {LuLoader2} from "react-icons/lu";
import Link from "next/link";
import {FaGoogle} from "react-icons/fa";
import {signIn} from "next-auth/react";

function Page() {

  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean>(false);
  const [userMessage, setUserMessage] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const debounceUsername = useDebounceCallback(setUsername, 700);
  const [confirmPassword, setConfirmPassword] = useState<string>("")

  useEffect(() => {
    ;(async () => {
      if (username) {
        setIsCheckingUsername(true);
        setUserMessage("");
        try {
          const response = await axios.get<ApiResponse>(`api/check-username-unique?username=${username}`);

          setUserMessage(response.data?.message);
        } catch (error: any) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUserMessage(axiosError.response?.data.message ?? "Error checking username");

        } finally {
          setIsCheckingUsername(false);
        }
      }
    })()

  }, [username]);

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
      if(data.password !== confirmPassword){
        form.setError("password", {
          message: "Password does not match"
        })
      } else {
        const response = await axios.post<ApiResponse>("api/sign-up", data);

        toast({
          title: "Success",
          description: response.data.message,
          variant: "default"
        });

        router.replace(`/verify-user/${username}`);
      }
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponse>;
      // console.log(axiosError.response?.data.message)
      if (axiosError.response?.data.message === "Username already exists" || "User already exists with this mail") {
        router.replace("/sign-in");
      }
      toast({
        title: "Failed",
        description: axiosError.response?.data.message,
        variant: "destructive"
      })
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
        <p className="text-3xl font-bold text-center">Join Mystery Message App</p>
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
                    <Input
                      placeholder="username" className="bg-blue-50" {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        debounceUsername(e.target.value);
                      }}/>
                  </FormControl>
                  <FormDescription>
                    {isCheckingUsername && <LuLoader2 size={"20"} className="animate-spin"/>}
                    {!isCheckingUsername && userMessage && (
                      <p
                        className={`text-sm ${
                          userMessage === 'Username is unique'
                            ? 'text-green-500'
                            : 'text-red-500'
                        }`}
                      >
                        {userMessage}
                      </p>
                    )}
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

            <Input type={"password"} placeholder={"Confirm password"} required={true} className="bg-blue-50"
                   onChange={(e) => setConfirmPassword(e.target.value)}></Input>
            <Button type="submit"
                    className="bg-black text-white hover:bg-gray-700"
                    disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Submitting..." : "Submit"}
            </Button>
            <p className="w-full text-center">Already signed up?
              <Link href={"/sign-in"}>
                <span className="text-blue-800 hover:text-blue-600 cursor-default"> Sign In</span>
              </Link>
            </p>
          </form>
        </Form>

        <div className="w-full mt-4">
          <Button
            className="w-full bg-secondary-foreground text-muted hover:bg-gray-200 flex items-center justify-between px-16"
            onClick={handleGoogleSignIn}>
            <span className={""}>Join with Google</span>
            <p className={""}>
              <FaGoogle color={"red"} size={20}/>
            </p>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Page;