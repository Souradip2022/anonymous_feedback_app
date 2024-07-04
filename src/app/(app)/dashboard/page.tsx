"use client"
import {Label} from "@/components/ui/label"
import {Switch} from "@/components/ui/switch"
import {useForm} from "react-hook-form";
import {useCallback, useEffect, useMemo, useState} from "react";
import {AcceptMessageSchema} from "@/schema/acceptMessageSchema";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {useSession} from "next-auth/react";
import {useToast} from "@/components/ui/use-toast";
import {useRouter} from "next/navigation";
import axios, {AxiosError} from "axios";
import {ApiResponseHandler} from "@/utils/ApiResponseHandler";
import {RiLoader3Fill} from "react-icons/ri";

function Page() {
  const router = useRouter();
  const {toast} = useToast();
  const {data: session, status} = useSession();
  const [userUrl, setUserUrl] = useState<string>('');
  const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);
  const [isLoadingMessage, setIsLoadingMessage] = useState<boolean>(false)
  const [messages, setMessages] = useState<any[]>([]);

  const {register, watch, setValue} = useForm({
    resolver: zodResolver(AcceptMessageSchema)
  });
  const acceptMessages = watch("acceptMessages");

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    if (typeof window !== 'undefined' && session?.user?.username) {
      setUserUrl(`${window.location.protocol}//${window.location.host}/u/${session.user.username}`);
    }

    (async function () {
      try {
        const response = await axios.get(`/api/accept-message`);

        setValue("acceptMessages", response.data.data.userAcceptingMessage);
        // console.log(response.data.data.userAcceptingMessage);
      } catch (error: any) {
        const axiosError = error as AxiosError<ApiResponseHandler>;
        toast({
          title: "Failed to fetch user message status",
          description: axiosError.response?.data.message,
          variant: "destructive"
        })
      }
    })()

    fetchMessage();

  }, [session, status, toast, setValue]);

  const acceptMessagesHandler = useCallback(async () => {
    if (status !== "authenticated") {
      return;
    }

    try {
      setIsSwitchLoading(true);
      const response = await axios.post<ApiResponseHandler>(`/api/accept-message`, {
        acceptMessages: !acceptMessages
      });

      toast({
        description: response.data.message
      });
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponseHandler>;

      toast({
        title: axiosError.response?.data.message,
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
      setValue("acceptMessages", !acceptMessages);
    }
  }, [acceptMessages, setValue, toast, status]);

  const fetchMessage = useCallback(async () => {
    if (status !== "authenticated") {
      return;
    }

    try {
      setIsLoadingMessage(true);
      const response = await axios.get<ApiResponseHandler>(`/api/get-message`);

      if (response.status === 204) {
        toast({
          variant: "default",
          title: "No message yet"
        })
        setMessages([]);
      } else {
        setMessages(response.data.data.messages);

        toast({
          description: "Message fetched successfully"
        })
      }
    } catch (error: any) {
      const axiosError = error as AxiosError<ApiResponseHandler>;
      toast({
        description: axiosError.response?.data.message,
        variant: "destructive"
      })
    } finally {
      setIsLoadingMessage(false);
    }

  }, [status, toast]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userUrl);
    toast({
      title: 'URL Copied!',
      variant: "default",
      description: 'Profile URL has been copied to clipboard.',
    });
  };

  return (
    <div className="w-full h-screen bg-secondary-foreground flex flex-col items-center justify-center px-40">
      <h1 className="text-4xl font-bold text-secondary self-start">User Dashboard</h1>
      <h2 className={"text-xl font-semibold text-secondary self-start py-2.5"}>Your Username</h2>
      <div className="w-full flex items-center justify-between ">
        <p className={"text-secondary"}>{userUrl}</p>
        <div className={""}>
          <Button type={"button"} className="text-white h-9 mr-4" variant={"secondary"}
                  onClick={() => router.replace(userUrl)}>Send message</Button>
          <Button type={"button"} className="text-white h-9 w-24" variant={"secondary"}
                  onClick={copyToClipboard}>Copy link</Button>
        </div>
      </div>
      <Separator className={"w-full  my-5"}/>
      <div className="w-full flex items-center justify-between gap-3  ">
        <div className="flex items-center gap-5">
          <Switch id="airplane-mode"
                  checked={acceptMessages}
                  onCheckedChange={acceptMessagesHandler}
                  {...register("acceptMessages")}
                  disabled={isSwitchLoading}
          />
          <Label htmlFor="airplane-mode" className="text-secondary text-lg">
            Accept message: {acceptMessages ? 'On' : 'Off'}
          </Label>
        </div>
      </div>
      <button className="h-8 w-8 border border-muted-foreground self-start my-5 rounded-md grid place-items-center"
              onClick={fetchMessage}>
        <RiLoader3Fill color={"gray"} className={`w-[90%] h-[90%] ${isLoadingMessage && "animate-spin"}`}/>
      </button>

      {messages.length === 0 ? (
        <div className="text-secondary my-5">No Message</div>
      ) : (
        <div className="text-secondary my-5">
          {messages.map((message) => (
            <div key={message._id}>{message.content}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Page;
