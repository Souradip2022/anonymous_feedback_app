"use client"
import React, {useEffect, useState} from 'react';
import {useParams, useRouter} from "next/navigation";
import {zodResolver} from "@hookform/resolvers/zod";
import * as z from "zod";
import {SubmitHandler, useForm} from "react-hook-form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {toast, useToast} from "@/components/ui/use-toast";
import axios, {AxiosError} from "axios";
import {VerifyCodeSchema} from "@/schema/VerifyCodeSchema";
import {ApiResponse} from "@/types/ApiResponse";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";

function Page() {
  const params: { username: string } = useParams();
  const router = useRouter();

  const form = useForm<z.infer<typeof VerifyCodeSchema>>({
    resolver: zodResolver(VerifyCodeSchema),
    defaultValues: {
      code: ""
    }
  })

  const onSubmit: SubmitHandler<z.infer<typeof VerifyCodeSchema>> = async (data: z.infer<typeof VerifyCodeSchema>): Promise<any> => {

    try {
      const response = await axios.post<ApiResponse>("/api/verify-code/", { username: params.username, code: data.code});
      toast({
        title: "Success",
        description: response.data.message,
        variant: "default"
      });

      router.replace("/sign-in");

    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponse>;

      toast({
        title: "Failed",
        description: axiosError.response?.data.message,
        variant: "destructive",
      })
    }
    // console.log({code: data.code, username: params.username});
  }

  return (
    <div className="border-2 w-full h-screen flex items-center justify-center bg-gray-800">
      <div className="w-[410px] h-fit flex flex-col items-center justify-around p-7 bg-white text-black rounded-md">
        <p className="text-3xl font-bold text-center">Verify yourself</p>
        <p className="pt-3.5">Enter your verification code</p>
        <Form {...form} >
          <form onSubmit={form.handleSubmit(onSubmit)}
                className="bg-white flex flex-col gap-y-3 text-black w-full py-3.5">
            <FormField
              control={form.control}
              name="code"
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