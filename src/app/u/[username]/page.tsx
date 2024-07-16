"use client"
import {MessageSchema} from "@/schema/MessageSchema";
import {SubmitHandler, useForm} from "react-hook-form";
import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast, useToast} from "@/components/ui/use-toast";
import axios, {Axios, AxiosError} from "axios";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {Fragment, useEffect, useState} from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data"
import {ApiResponseHandler} from "@/utils/ApiResponseHandler";
import Image from "next/image";
import {useChat} from 'ai/react';
import {Input} from "@/components/ui/input";
import {useRouter} from "next/navigation";
import {FaLongArrowAltUp} from "react-icons/fa";
import {BiSolidCheckbox} from "react-icons/bi";


function Page({params}: { params: { username: string } }) {
  const router = useRouter();

  const {toast} = useToast();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: {isSubmitting, errors}
  } = useForm<z.infer<typeof MessageSchema>>({
    resolver: zodResolver(MessageSchema),
    defaultValues: {
      content: ""
    }
  });
  const content = watch("content");

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fetchAcceptingMessageStatus = async (username: string, data: z.infer<typeof MessageSchema>) => {
    try {
      const response = await axios.post<ApiResponseHandler>(`/api/send-message`, {username, content: data.content});
      toast({
        variant: "default",
        description: response.data.message
      })
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponseHandler>;
      // console.log(axiosError);
      toast({
        variant: "destructive",
        description: axiosError.response?.data.message
      })
    }
  }

  const onSubmit: SubmitHandler<z.infer<typeof MessageSchema>> = async (data: z.infer<typeof MessageSchema>) => {
    await fetchAcceptingMessageStatus(params.username, data);
    console.log(data.content);
  };

  const {messages, input, handleInputChange, handleSubmit: handleUserPromptSubmit, stop, isLoading} = useChat();
  const [promptResult, setPromptResult] = useState<Array<any>>([]);

  useEffect(() => {
    const filteredPrompt = messages.filter((m) => m.role === "assistant" || m.role === "user");
    setPromptResult(filteredPrompt.slice(-2));
    console.log(promptResult)
  }, [messages]);

  return (
    <div className="w-full min-h-screen bg-primary p-10">
      <div className={"text-secondary flex flex-col items-center justify-center gap-10"}>
        <p className={"text-2xl font-bold "}>Public Profile Link</p>
        <form className={"w-2/3 h-fit grid place-items-center"} onSubmit={handleSubmit(onSubmit)}>
          <p className={"place-self-start mb-1.5"}> Message {params.username} anonymously </p>
          <div className="w-full relative">
            <Textarea
              className={"w-full min-h-32 border-muted-foreground resize-none shadow-lg"}
              placeholder={"Enter your message"}
              {...register("content")}
              value={content}
              onChange={(e) => setValue("content", e.target.value)}
            />
            <Button
              type="button"
              className="absolute left-0 -bottom-1 mb-3 ml-3 p-2 hover:bg-gray-100"
              onClick={() => setShowEmojiPicker(prev => !prev)}
            >
              <Image src={"/emoji_logo.png"} alt={"emoji"} width={15} height={15} className={"w-full h-full"}/>
            </Button>
            {showEmojiPicker && (
              <div className="absolute top-[100%]">
                <Picker data={data} theme={"light"}
                        onClickOutside={() => setShowEmojiPicker(false)}
                        onEmojiSelect={(e: any) => setValue("content", content + e.native)}
                />
              </div>
            )}
          </div>
          <p
            className={"self-start text-red-500 place-self-start text-sm mt-1.5"}>{errors && errors.content?.message}</p>
          <Button
            className={"my-3"}
            variant={"secondary"}
            type={"submit"}
            disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"} </Button>
        </form>
        <div className={"w-full flex flex-col items-center gap-y-2 "}>
          <span className={"text-black relative right-60 text-sm"}>You can generate custom anonymous messages as par your requirements</span>
          <div className={"w-2/3 border border-muted-foreground rounded-lg shadow-xl h-fit"}>
            <form className={"w-full flex p-2 gap-3"} onSubmit={handleUserPromptSubmit}>
              <div className={"w-full h-fit"}>
                <Input
                  placeholder={"Enter your prompt to generate custom messages"}
                  className={"border-none"} value={input} onChange={handleInputChange}/>
              </div>

              {isLoading ?
                <Button type={"submit"} variant={"secondary"} onClick={() => stop()}>
                  <BiSolidCheckbox size={15}/>
                </Button> :
                <Button type={"submit"} variant={"secondary"}>
                  <FaLongArrowAltUp size={15}/>
                </Button>
              }
            </form>
            <div className={"w-full h-fit p-4"}>
              {promptResult.map((m) => (
                <Fragment key={m.id}>
                  {m.role === "user" && <p>
                    User:
                    {m.content}
                  </p>}
                  {m.role === "assistant" && <p>
                    Assistant:
                    {m.content.split("**").join("  ").split("*").join(" ")}
                  </p>}
                </Fragment>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-y-2">
          <p className={"text-black"}>Create your own account</p>
          <Button type={"submit"} variant={"secondary"} onClick={() => router.push("/sign-up")}>
            Join now
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Page;
