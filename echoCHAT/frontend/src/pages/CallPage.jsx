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

  // Debug logging
  useEffect(() => {
    console.log("CallPage Debug:", {
      authUserLoading: isLoading,
      authUserExists: !!authUser,
      tokenLoading: isTokenLoading,
      tokenError,
      tokenExists: !!tokenData?.token,
      callId,
      userId,
      callType,
      isConnecting,
    });
  }, [
    isLoading,
    authUser,
    isTokenLoading,
    tokenError,
    tokenData,
    callId,
    userId,
    callType,
    isConnecting,
  ]);

  useEffect(() => {
    let videoClient;
    let timeoutId;
    let isMounted = true;

    const initCall = async () => {
      // Only proceed if all prerequisites are met
      if (!tokenData?.token) {
        console.log("Waiting for token...", { token: !!tokenData?.token });
        return;
      }

      if (!authUser) {
        console.log("Waiting for authUser...");
        return;
      }

      if (!callId) {
        console.log("No callId provided");
        setIsConnecting(false);
        setError("Missing call ID");
        return;
      }

      if (!userId) {
        console.log("No userId provided in query params");
        setIsConnecting(false);
        setError("Missing user ID. Please start the call from chat.");
        return;
      }

      try {
        console.log("Starting call initialization...", { callId, userId });
        setError(null);

        // Set a timeout to prevent infinite buffering (30 seconds)
        timeoutId = setTimeout(() => {
          if (isMounted) {
            setIsConnecting(false);
            setError("Call connection timeout. Please try again.");
            toast.error("Connection timeout");
            console.error("Call initialization timeout");
          }
        }, 30000);

        const user = {
          id: authUser._id,
          name: authUser.fullname || authUser.fullName || "User",
          image: authUser.profilePic,
        };

        console.log("Creating StreamVideoClient...");
        videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        console.log("Getting call instance...");
        const callInstance = videoClient.call("default", callId);

        console.log("Joining call...");
        await callInstance.join({
          create: true,
          audio: true,
          video: callType === "video",
        });

        // Make sure audio is actually enabled for audio-only calls.
        try {
          await callInstance.microphone.enable();
          console.log("Microphone enabled successfully");
        } catch (micError) {
          console.error("Could not enable microphone:", micError);
        }

        // Disable camera for audio calls
        if (callType === "audio") {
          console.log("Disabling camera for audio call...");
          try {
            await callInstance.camera.disable();
          } catch (cameraError) {
            console.error("Could not disable camera:", cameraError);
          }
        }

        console.log("Call joined successfully!");
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
      if (call) {
        call.leave().catch(console.error);
      }

      if (videoClient) {
        videoClient.disconnectUser().catch(console.error);
      }
    };
  }, [tokenData?.token, authUser?._id, callId, userId, callType]);

  // Handle token fetch error
  useEffect(() => {
    if (tokenError) {
      setIsConnecting(false);
      setError("Failed to get access token");
      toast.error("Authentication failed");
      console.error("Token fetch error");
    }
  }, [tokenError]);

  if (isLoading || isTokenLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2 text-error">Error</h2>
          <p className="text-base-content/60 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return <PageLoader />;
  }

  if (!client || !call) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Failed to initialize call</h2>
          <p className="text-base-content/60 mb-4">Please try again</p>
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
          <CallContent callType={callType} userId={userId} />
        </StreamCall>
      </StreamVideo>
    </div>
  );
};

const CallContent = ({ callType, userId }) => {
  const navigate = useNavigate();
  const call = useCall();

  const { useCallCallingState, useRemoteParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const remoteParticipants = useRemoteParticipants();
  const hasSeenRemoteParticipant = useRef(false);
  const isLeavingRef = useRef(false);

  // Get remote participants from the call state
  const participants = remoteParticipants || [];

  const redirectToChat = useCallback(() => {
    if (!userId) return;
    window.location.replace(`${window.location.origin}/chat/${userId}`);
  }, [userId]);

  // Auto-redirect when current user leaves or call ends for everyone
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
    if (participants.length > 0) {
      hasSeenRemoteParticipant.current = true;
    }
  }, [participants.length]);

  // Auto-redirect when the other participant leaves (2-person call)
  const handleLeave = useCallback(async () => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;

    try {
      if (call) {
        // Stop all media tracks first so the mic/camera are fully released.
        try {
          await call.camera.disable();
        } catch (error) {
          console.error("Error disabling camera:", error);
        }

        try {
          await call.microphone.disable();
        } catch (error) {
          console.error("Error disabling microphone:", error);
        }

        // Leave the call and allow SDK to fully teardown the session.
        await call.leave();
      }

      // Redirect to chat
      redirectToChat();
    } catch (error) {
      console.error("Error ending call:", error);
      toast.error("Error ending call, redirecting...");
      // Still navigate even if there's an error
      redirectToChat();
    }
  }, [call, redirectToChat]);

  useEffect(() => {
    if (!call) return;

    const handleRemoteCallEnd = () => {
      if (!isLeavingRef.current) {
        handleLeave();
      }
    };

    const unsubscribeEnded = call.on?.("call.ended", handleRemoteCallEnd);
    const unsubscribeLeft = call.on?.("call.left", handleRemoteCallEnd);

    return () => {
      unsubscribeEnded?.();
      unsubscribeLeft?.();
    };
  }, [call, handleLeave]);

  useEffect(() => {
    if (
      hasSeenRemoteParticipant.current &&
      participants.length === 0 &&
      call &&
      (callingState === CallingState.JOINED ||
        callingState === CallingState.CONNECTING)
    ) {
      toast("Other participant left the call", {
        icon: "ℹ️",
      });
      handleLeave();
    }
  }, [participants.length, call, callingState, handleLeave]);

  useEffect(() => {
    if (
      call &&
      callingState === CallingState.JOINED &&
      participants.length === 0
    ) {
      const timeout = setTimeout(() => {
        if (call && callingState === CallingState.JOINED) {
          handleLeave();
        }
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [call, callingState, participants.length, handleLeave]);

  return (
    <StreamTheme>
      <div className="h-screen flex flex-col bg-base-200">
        <div className="flex-1">
          {callType === "video" ? (
            <SpeakerLayout />
          ) : (
            // Audio call layout
            <div className="h-full flex items-center justify-center">
              <div className="flex gap-20">
                {participants.length > 0 ? (
                  participants.map((participant) => (
                    <div
                      key={
                        participant.session_id ||
                        participant.user_id ||
                        participant.id
                      }
                      className="flex flex-col items-center">
                      <img
                        src={
                          participant.image ||
                          participant.user?.image ||
                          "/default-avatar.png"
                        }
                        alt={
                          participant.name ||
                          participant.user?.name ||
                          "Participant"
                        }
                        className="w-40 h-40 rounded-full object-cover border-4 border-primary"
                      />
                      <h2 className="mt-4 text-2xl font-bold">
                        {participant.name ||
                          participant.user?.name ||
                          "Participant"}
                      </h2>
                      <p className="text-base-content/60">In call...</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center">
                    <p className="text-lg text-base-content/60">
                      {callingState === CallingState.JOINED
                        ? "Connecting to participant..."
                        : "Waiting for participant..."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="pb-8 flex justify-center">
          <CallControls onLeave={handleLeave} />
        </div>
      </div>
    </StreamTheme>
  );
};

export default CallPage;
