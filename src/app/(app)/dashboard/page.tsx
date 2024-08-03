"use client"
import {Label} from "@/components/ui/label"
import {Switch} from "@/components/ui/switch"
import {useForm} from "react-hook-form";
import {useCallback, useEffect, useState} from "react";
import {AcceptMessageSchema} from "@/schema/acceptMessageSchema";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {useSession} from "next-auth/react";
import {useToast} from "@/components/ui/use-toast";
import axios, {AxiosError} from "axios";
import {ApiResponseHandler} from "@/utils/ApiResponseHandler";
import {RiLoader3Fill} from "react-icons/ri";
import {ImCross} from "react-icons/im";
import {
  Dialog, DialogClose,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {HiMiniSpeakerXMark, HiOutlineSpeakerWave} from "react-icons/hi2";
import {IoPauseOutline} from "react-icons/io5";
import {FaPlay} from "react-icons/fa";


function Page() {
  const {toast} = useToast();
  const {data: session, status} = useSession();
  const [userUrl, setUserUrl] = useState<string>('');
  const [isSwitchLoading, setIsSwitchLoading] = useState<boolean>(false);
  const [isLoadingMessage, setIsLoadingMessage] = useState<boolean>(false);
  const [messages, setMessages] = useState<any[]>([]);
  // console.log(messages);
  const [isSpeaking, setIsSpeaking] = useState<any>({
    speaking: false,
    index: null
  });
  const [pauseAudio, setPauseAudio] = useState<boolean>(false);

  const {register, watch, setValue} = useForm({
    resolver: zodResolver(AcceptMessageSchema)
  });
  const acceptMessages = watch("acceptMessages");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userUrl);
    toast({
      title: 'URL Copied!',
      variant: "default",
      description: 'Profile URL has been copied to clipboard.',
    });
  };

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

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }
    // console.log("use effect invoked")
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

  }, [session, status, toast, setValue, fetchMessage]);


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

  const deleteMessage = async (index: number) => {
    try {

      const response = await axios.post<ApiResponseHandler>(`/api/delete-message`, {
        content: messages[index].content,
        createdAt: messages[index].createdAt
      })
      if (response.status === 200) {
        // await fetchMessage();
        setMessages((prev) => prev.filter((item, i) => prev[index] !== item));
      }

    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiResponseHandler>;

      toast({
        variant: "destructive",
        description: axiosError.response?.data.message
      })
    }
  }

  function setVoiceAndSpeak(utterance: any, index: number) {
    const voices = window.speechSynthesis.getVoices();
    // console.log('Available voices:', voices);

    const usEnglishVoice = voices.find(voice => voice.lang === 'en-US' && voice.name === 'Google US English');

    utterance.onend = () => {
      setIsSpeaking({
        speaking: false,
        index: null
      });
    }

    if (usEnglishVoice) {
      utterance.voice = usEnglishVoice;
      // console.log('Selected voice:', usEnglishVoice);
    } else {
      // console.log('US English voice not found');
    }

    // Speak the utterance
    window.speechSynthesis.speak(utterance);
    /*if (speechSynthesis.speaking) {
      setIsSpeaking({
        speaking: true,
        index
      });
    }*/
    // console.log('Utterance spoken:', utterance);
  }

  function speakAudio(index: number) {
    const text = messages[index].content;
    if (text && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance();
      utterance.text = text;
      utterance.lang = "en-US";

      // If voices are already loaded, speak immediately
      if (window.speechSynthesis.getVoices().length > 0) {
        setVoiceAndSpeak(utterance, index);
      } else {
        // Otherwise, wait for the voices to be loaded
        window.speechSynthesis.onvoiceschanged = () => setVoiceAndSpeak(utterance, index);
      }
    }
  }

  function abortAudio() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking({
        speaking: false,
        index: null
      });
    }
  }

  useEffect(() => {
    if ('speechSynthesis' in window) {
      if (pauseAudio) {
        window.speechSynthesis.pause();
      } else {
        window.speechSynthesis.resume();
      }
    }
  }, [pauseAudio]);

  useEffect(() => {
    const index = isSpeaking.index;
    if (isSpeaking.speaking === true && index !== null && index !== undefined) {
      // console.log(isSpeaking.index)
      speakAudio(index);
      if(!isSpeaking.speaking && isSpeaking.index === null){
        return;
      }
    } else if (index !== null && index !== undefined) {
      abortAudio();

      if(!isSpeaking.speaking && isSpeaking.index === null){
        return;
      }
    }

    console.log(isSpeaking);
  }, [isSpeaking]);



  return (
    <div
      className="w-full min-h-screen max-h-fit bg-secondary-foreground flex flex-col items-center pt-28">
      <div className={"flex flex-col items-center justify-center  w-9/12"}>
        <h1 className="text-4xl font-bold text-secondary self-start">User Dashboard</h1>
        <h2 className={"text-xl font-semibold text-secondary self-start py-2.5"}>Your Username</h2>
        <div className="w-full flex items-center justify-between ">
          <p className={"text-secondary"}>{userUrl}</p>
          <div className={""}>
            <Button type={"button"} className="text-white h-9 w-24" variant={"secondary"}
                    onClick={copyToClipboard}>
              Copy link
            </Button>
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
      </div>


      {messages.length === 0 ? (
        <div className="text-secondary my-5">No Message</div>
      ) : (
        <div className="text-secondary my-5 grid grid-cols-2 gap-10 place-items-center w-9/12">
          {messages.map((message, index) => {
            const isoString = `${message.createdAt}`;
            const date = new Date(isoString);

            function formatDate(date: any) {
              const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              };
              return date.toLocaleString(undefined, options);
            }

            const readableDate = formatDate(date);
            return (
              <div
                key={message._id}
                className={"w-full h-full p-5 border border-muted-foreground rounded-md shadow-md flex flex-col items-center gap-y-5 relative "}>
                <div className={"self-start flex align-middle justify-center gap-x-3.5"}>
                  <h2 className={"h-full grid place-items-center"}>{readableDate}</h2>
                  <span className={"flex items-center gap-x-3.5"}>
                    {isSpeaking.speaking ?
                      <>
                        <Button variant={"default"} className={"hover:bg-gray-100 px-1 py-0.5"} onClick={() => setIsSpeaking({
                          speaking: false,
                          index
                        })}>
                          <HiOutlineSpeakerWave/>
                        </Button>
                        <Button variant={"default"} className={"hover:bg-gray-100 px-1 py-0.5"}
                                onClick={() => setPauseAudio(prev => !prev)}>
                          {pauseAudio ? <FaPlay/> : <IoPauseOutline/>}
                        </Button>
                      </> :
                      <>
                        <Button variant={"default"} className={"hover:bg-gray-100 px-1 py-0.5"} onClick={() => setIsSpeaking({
                          speaking: true,
                          index
                        })}>
                          <HiMiniSpeakerXMark/>
                        </Button>
                      </>

                    }
                  </span>
                </div>

                <p className={"self-start w-full break-words "}>{message.content}</p>

                <Dialog>
                  <DialogTrigger asChild>
                    <button type={"button"}
                            className={"bg-red-600 p-2.5 rounded-md hover:bg-red-400 absolute top-3 right-3 h-8 w-8"}
                    >
                      <ImCross color={"white"} className={"h-full w-full"}/>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-secondary-foreground">
                    <DialogHeader>
                      <DialogTitle className={"text-muted"}>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. Are you sure you want to permanently
                        delete this file from our servers?
                      </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="sm:justify-start flex ">
                      <DialogClose asChild>
                        <Button type="button" variant="default" className={"hover:bg-gray-100"}>
                          Close
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button type="button" variant="destructive" onClick={() => deleteMessage(index)}>
                          Delete
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>)
          })}
        </div>
      )}
    </div>
  );
}

export default Page;
