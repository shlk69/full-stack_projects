import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import { toast } from "react-hot-toast";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageList,
  MessageComposer,
  Thread,
  Window,
} from "stream-chat-react";

import { StreamChat } from "stream-chat";
import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";

const ChatPage = () => {
  const navigate = useNavigate();
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const intializeConnectChat = async () => {
      if (!tokenData?.token || !authUser) return;
      try {
        console.log("Intiallizing stream chat");
        const client = StreamChat.getInstance(STREAM_API_KEY);
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullname,
            image: authUser.profilePic,
          },
          tokenData.token,
        );

        const channelId = [authUser._id, targetUserId].sort().join("-");

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();
        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    intializeConnectChat();
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = async () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}?userId=${targetUserId}`;

      try {
        await channel.sendMessage({
          text: "🎥 Click here to join the video call",
          attachments: [
            {
              type: "video_call",
              title: "Join Call Room",
              title_link: callUrl,
            },
          ],
        });

        toast.success("Video call room created!");
        navigate(`/call/${channel.id}?userId=${targetUserId}`);
      } catch (error) {
        console.error("Failed to send call invitation:", error);
        toast.error("Could not start call. Try again.");
      }
    }
  };

  // Added Audio Call Handler
  const handleAudioCall = async () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}?type=audio&userId=${targetUserId}`;

      try {
        await channel.sendMessage({
          text: "📞 Click here to join the audio call",
          attachments: [
            {
              type: "audio_call",
              title: "Join Voice Room",
              title_link: callUrl,
            },
          ],
        });

        toast.success("Voice call room created!");
        navigate(`/call/${channel.id}?type=audio&userId=${targetUserId}`);
      } catch (error) {
        console.error("Failed to send audio invitation:", error);
        toast.error("Could not start audio call. Try again.");
      }
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <Window>
            <div className="flex items-center justify-between border-b p-3 bg-white">
              <ChannelHeader />
              {/* Added both handlers to the component props */}
              <CallButton
                handleVideoCall={handleVideoCall}
                handleAudioCall={handleAudioCall}
              />
            </div>

            <MessageList />
            <MessageComposer focus />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
