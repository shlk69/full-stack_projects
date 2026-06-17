import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";

import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
  CallingState,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [searchParams] = useSearchParams();

  const { authUser, isLoading } = useAuthUser();

  const userId = searchParams.get("userId") || authUser?._id;
  const callType = searchParams.get("type") || "video";

  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState(null);

  const {
    data: tokenData,
    isError: tokenError,
    isLoading: isTokenLoading,
  } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
    retry: 2,
    retryDelay: 1000,
  });

  useEffect(() => {
    let videoClient;
    let timeoutId;
    let isMounted = true;

    const initCall = async () => {
      if (!tokenData?.token || !authUser || !callId || !userId) {
        return;
      }

      try {
        setError(null);

        timeoutId = setTimeout(() => {
          if (isMounted) {
            setIsConnecting(false);
            setError("Call connection timeout. Please try again.");
            toast.error("Connection timeout");
          }
        }, 30000);

        const user = {
          id: authUser._id,
          name: authUser.fullname || authUser.fullName || "User",
          image: authUser.profilePic,
        };

        videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);

        // FIX 1: Pass initial states directly inside join settings rather than editing tracks sequentially
        await callInstance.join({
          create: true,
          audio: true,
          video: callType === "video",
        });

        clearTimeout(timeoutId);

        if (isMounted) {
          setClient(videoClient);
          setCall(callInstance);
          setIsConnecting(false);
        }
      } catch (error) {
        console.error("Call initialization error:", error);
        clearTimeout(timeoutId);

        if (isMounted) {
          setIsConnecting(false);
          setError(error.message || "Failed to join call");
          toast.error("Could not join call: " + error.message);
        }
      }
    };

    initCall();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [tokenData?.token, authUser?._id, callId, userId, callType]);

  useEffect(() => {
    if (tokenError) {
      setIsConnecting(false);
      setError("Failed to get access token");
      toast.error("Authentication failed");
    }
  }, [tokenError]);

  if (isLoading || isTokenLoading || isConnecting) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-error">Error</h2>
          <p className="text-base-content/60 mb-4">{error}</p>
          <button
            onClick={() => window.location.replace("/")}
            className="btn btn-primary">
            Back Home
          </button>
        </div>
      </div>
    );
  }

  if (!client || !call) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Failed to initialize call</h2>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary">
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <CallContent callType={callType} authUser={authUser} />
        </StreamCall>
      </StreamVideo>
    </div>
  );
};

const CallContent = ({ callType, authUser }) => {
  const call = useCall();
  const { useCallCallingState, useRemoteParticipants, useLocalParticipant } =
    useCallStateHooks();

  const callingState = useCallCallingState();
  const remoteParticipants = useRemoteParticipants() || [];
  const localParticipant = useLocalParticipant();

  const hasConnectedRef = useRef(false);
  const isLeavingRef = useRef(false);
  const targetUserRef = useRef(null);

  // Track dynamic participant identity to prevent broken redirection targets
  useEffect(() => {
    if (remoteParticipants.length > 0) {
      const peer = remoteParticipants[0];
      targetUserRef.current = peer.user_id || peer.id;
      hasConnectedRef.current = true;
    }
  }, [remoteParticipants]);

  const redirectToChat = useCallback(() => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;

    const searchParams = new URLSearchParams(window.location.search);
    const urlUserId = searchParams.get("userId");
    let chatTargetId = targetUserRef.current || urlUserId;

    if (!chatTargetId || chatTargetId === authUser?._id) {
      if (call?.id) {
        const parts = call.id.split("-");
        const peerId = parts.find((id) => id !== authUser?._id);
        if (peerId) chatTargetId = peerId;
      }
    }

    if (!chatTargetId) {
      window.location.replace(`${window.location.origin}/`);
      return;
    }

    window.location.replace(`${window.location.origin}/chat/${chatTargetId}`);
  }, [call?.id, authUser?._id]);

  const handleLeave = useCallback(async () => {
    try {
      if (call) {
        await call.camera.disable().catch(() => {});
        await call.microphone.disable().catch(() => {});

        // Terminate call cleanly across both sides if active peer exists
        if (remoteParticipants.length > 0) {
          await call.endCall();
        } else {
          await call.leave();
        }
      }
    } catch (error) {
      console.error("Error leaving call:", error);
    } finally {
      redirectToChat();
    }
  }, [call, remoteParticipants.length, redirectToChat]);

  useEffect(() => {
    if (
      callingState === CallingState.LEFT ||
      callingState === CallingState.ENDED ||
      callingState === CallingState.FAILED
    ) {
      redirectToChat();
    }
  }, [callingState, redirectToChat]);

  useEffect(() => {
    if (
      hasConnectedRef.current &&
      callingState === CallingState.JOINED &&
      remoteParticipants.length === 0
    ) {
      toast("Other participant left the call", { icon: "ℹ️" });
      handleLeave();
    }
  }, [remoteParticipants.length, callingState, handleLeave]);

  return (
    <StreamTheme>
      <div className="h-screen flex flex-col bg-base-200 text-slate-800">
        <div className="flex-1">
          {callType === "video" ? (
            <SpeakerLayout />
          ) : (
            /* FIX 2: Enhanced Audio Grid explicitly rendering Local & Remote user profiles to bind tracks */
            <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-base-300 to-base-100">
              <div className="flex flex-wrap items-center justify-center gap-16 md:gap-32 p-4">
                {/* Local User Element */}
                {localParticipant && (
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <img
                        src={authUser?.profilePic || "/default-avatar.png"}
                        alt="You"
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-slate-400 shadow-xl"
                      />
                      <span className="absolute bottom-2 right-2 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
                      </span>
                    </div>
                    <h2 className="mt-4 text-xl md:text-2xl font-bold text-base-content">
                      {localParticipant.name || "You"}
                    </h2>
                    <p className="text-sm text-base-content/60 font-medium">
                      Speaking
                    </p>
                  </div>
                )}

                {/* Remote User Element */}
                {remoteParticipants.length > 0 ? (
                  remoteParticipants.map((participant) => (
                    <div
                      key={participant.session_id || participant.id}
                      className="flex flex-col items-center">
                      <img
                        src={participant.image || "/default-avatar.png"}
                        alt={participant.name || "Participant"}
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-primary shadow-xl"
                      />
                      <h2 className="mt-4 text-xl md:text-2xl font-bold text-base-content">
                        {participant.name || "Participant"}
                      </h2>
                      <p className="text-sm text-primary/80 font-medium">
                        In call
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center opacity-70">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-dashed border-base-content/30 flex items-center justify-center animate-pulse">
                      <span className="text-3xl text-base-content/40">📞</span>
                    </div>
                    <h2 className="mt-4 text-xl font-semibold text-base-content/60">
                      Connecting...
                    </h2>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="pb-12 flex justify-center">
          <CallControls onLeave={handleLeave} />
        </div>
      </div>
    </StreamTheme>
  );
};

export default CallPage;
