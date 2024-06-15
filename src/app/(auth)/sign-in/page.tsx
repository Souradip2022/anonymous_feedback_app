"use client"
import React from 'react';
import {useRouter} from "next/navigation";
import {signIn} from "next-auth/react";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {useForm} from "react-hook-form";
import {Form} from "@/components/ui/form";
import {signInSchema} from "@/schema/signInSchema";
import { Input } from "@/components/ui/input";
import { useDebounceCallback } from 'usehooks-ts';
import { Button } from "@/components/ui/button";
import {toast} from "@/components/ui/use-toast";


function SignInForm() {
  const router = useRouter();
  const {control, handleSubmit} = useForm<z.infer<typeof signInSchema>>({
      resolver: zodResolver(signInSchema),
      defaultValues: {
        identifier: "",
        password: "",
      }
    }
  );

  const onSubmit = async(data: z.infer<typeof signInSchema>) => {
    const result = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });

    if(result){
      if(result.error === "CredentialsSignin"){
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

      if(result?.url){
        router.replace("/dashboard");
      }
    }
  }

  return (
    <div>sign-in</div>
  );
}

export default SignInForm;
