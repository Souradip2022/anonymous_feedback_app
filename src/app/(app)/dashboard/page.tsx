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
import {copyTextToClipboard} from "react-email/src/utils";
import {useToast} from "@/components/ui/use-toast";
import {useRouter} from "next/navigation";
import axios, {AxiosError} from "axios";
import {ApiResponseHandler} from "@/utils/ApiResponseHandler";
import {ApiResponse} from "@/types/ApiResponse";


function Page() {
  const router = useRouter();
  const {toast} = useToast();
  const {data: session, status} = useSession();
  const [userUrl, setUserUrl] = useState<string>('');
  const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);

  const {register, watch, setValue, formState: {isSubmitting}} = useForm({
    resolver: zodResolver(AcceptMessageSchema)
  });
  const acceptMessages = watch("acceptMessages");

  useEffect(() => {
    if (typeof window !== 'undefined' && session?.user?.username) {
      setUserUrl(`${window.location.protocol}//${window.location.host}/u/${session.user.username}`);
    }

    ;(async function () {
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

  }, [session]);

  /*useEffect(() => {
    console.log(isSwitchLoading)
  }, [isSwitchLoading]);*/

  const acceptMessagesHandler = useCallback(async () => {

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
  }, [acceptMessages, setValue,]);


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
        <div className={" "}>
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
    </div>
  );
}

export default Page;
