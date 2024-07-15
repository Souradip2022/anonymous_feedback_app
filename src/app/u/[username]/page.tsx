"use client"
import {MessageSchema} from "@/schema/MessageSchema";
import {SubmitHandler, useForm} from "react-hook-form";
import * as z from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast, useToast} from "@/components/ui/use-toast";
import axios, {Axios, AxiosError} from "axios";
import {Textarea} from "@/components/ui/textarea";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data"
import {ApiResponseHandler} from "@/utils/ApiResponseHandler";
import Image from "next/image";
import {useChat} from 'ai/react';
import {Input} from "@/components/ui/input";
import {useRouter} from "next/navigation";
import {FaLongArrowAltUp} from "react-icons/fa";
import {BiSolidCheckbox} from "react-icons/bi";

const promptSchema = z.object({
  prompt: z.string().min(1, {message: "Prompt cannot be empty"})
});

function Page({params}: { params: { username: string } }) {
  const router = useRouter();
  const {messages, input, handleInputChange, handleSubmit: handleUserPrompt, stop} = useChat();

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

  const {
    register: registerPrompt,
    handleSubmit: handleSubmitPrompt, formState: {isSubmitting: isSubmittingPrompt, errors: errorsPrompt}
  } = useForm<z.infer<typeof promptSchema>>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      prompt: ""
    }
  });

  const onSubmitPrompt: SubmitHandler<z.infer<typeof promptSchema>> = async (data: z.infer<typeof promptSchema>): Promise<void> => {
    console.log(data, input);

  }

  return (
    <div className="w-full h-screen bg-primary p-10">
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
        <div className={"w-2/3 border border-muted-foreground rounded-lg shadow-xl h-fit"}>
          <form className={"w-full flex p-2 gap-3"} onSubmit={handleSubmitPrompt(onSubmitPrompt)}>
            <div className={"w-full h-fit"}>
              <Input {...registerPrompt("prompt")} type={"text"}
                     placeholder={"Enter your prompt to generate custom messages"}
                     className={"border-none"} value={input} onChange={handleInputChange}/>
              {errorsPrompt && <span className={"text-red-500 text-xs"}>{errorsPrompt.prompt?.message}</span>}
            </div>
            <Button type={"submit"} variant={"secondary"}>
              {isSubmittingPrompt ? <BiSolidCheckbox size={15}/>: <FaLongArrowAltUp size={15}/> }
            </Button>
          </form>
          <div className={"w-full border border-black h-36 p-2"}>

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
