"use client"
import React, {useEffect, useState} from 'react';
import {useRouter} from "next/navigation";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {SubmitHandler, useForm} from "react-hook-form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useToast} from "@/components/ui/use-toast";
import axios, {AxiosError} from "axios";
import {VerifyCodeSchema} from "@/schema/VerifyCodeSchema";
import {ApiResponse} from "@/types/ApiResponse";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {LuLoader2} from "react-icons/lu";

function Page() {
  const router = useRouter();
  const form = useForm<z.infer<typeof VerifyCodeSchema>>({
    resolver: zodResolver(VerifyCodeSchema),
    defaultValues: {
      code: ""
    }
  })

  const onSubmit: SubmitHandler<z.infer<typeof VerifyCodeSchema>> = async (data: z.infer<typeof VerifyCodeSchema>) => {
    console.log(data);
  }

  return (
    <div className="border-2 w-full h-screen flex items-center justify-center bg-gray-800">
      <div className="w-[410px] h-fit flex flex-col items-center justify-around p-7 bg-white text-black rounded-md">
        <p className="text-3xl font-bold text-center">Join Anonymous Message App</p>
        <p className="pt-3.5">Enter your verification code</p>
        <Form {...form} >
          <form onSubmit={form.handleSubmit(onSubmit)}
                className="bg-white flex flex-col gap-y-3 text-black w-full py-3.5">
            <FormField
              control={form.control}
              name="verify-code"
              render={({field}) => (
                <FormItem>
                  <FormLabel>6 digit Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="" type={"text"} className="bg-blue-50" {...field}/>
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
              {form.formState.isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default Page;