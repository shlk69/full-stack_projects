import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageList,
  MessageComposer,
  Thread,
  Window
} from 'stream-chat-react'

import { StreamChat } from "stream-chat";
import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";


const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

  const { data:tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser
  });

  useEffect(() => {
    const intializeConnectChat = async () => {
      if (!tokenData?.token || !authUser) return
      try {
        console.log('Intiallizing stream chat')
        const client = StreamChat.getInstance(STREAM_API_KEY)
        await client.connectUser({
          id: authUser._id,
          name: authUser.fullname,
          image:authUser.profilePic
        }, tokenData.token)
        
        const channelId = [authUser._id, targetUserId].sort().join('-')
        
        const currChannel = client.channel('messaging', channelId, {
          members: [authUser._id,targetUserId]
        })

        await currChannel.watch()
        setChatClient(client)
        setChannel(currChannel)
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");

      } finally {
        setLoading(false)
      }
    }

    intializeConnectChat()
  }, [tokenData, authUser, targetUserId])
  
  const handleVideoCall = () => {
    
  }
  
  if(loading || !chatClient || !channel) return <ChatLoader/>

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={ handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageComposer focus />
            </Window>
          </div>
          <Thread/>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
