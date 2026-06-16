import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { acceptFriendsRequest, getFriendRequests } from "../lib/api";
import { BellIcon, ClockIcon, MessageSquareIcon, UserCheckIcon } from "lucide-react";

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const { data: friendRequests, isLoading } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { mutate: acceptRequestMutation, isPending } = useMutation({
    mutationFn: acceptFriendsRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
  });

  const incomingReq = friendRequests?.incomingRequest || [];
  const acceptedReq = friendRequests?.acceptedRequest || [];
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">
          Notifications
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : (
          <>
            {/* Render Pending Friend Requests safely */}
            {incomingReq && incomingReq.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <UserCheckIcon className="h-5 w-5 text-primary" />
                  Friend Requests
                  <span className="badge badge-primary ml-2">
                    {incomingReq.length}
                  </span>
                </h2>

                <div className="space-y-3">
                  {incomingReq.map((request) => (
                    <div
                      key={request._id}
                      className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="avatar w-14 h-14 rounded-full bg-base-300 overflow-hidden">
                              <img
                                src={
                                  request.sender?.profilePic ||
                                  "/default-avatar.png"
                                }
                                alt={request.sender?.fullname || "User"}
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {request.sender?.fullname}
                              </h3>
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                <span className="badge badge-secondary badge-sm">
                                  Native:{" "}
                                  {request.sender?.nativeLanguage || "N/A"}
                                </span>
                                <span className="badge badge-outline badge-sm">
                                  Learning:{" "}
                                  {request.sender?.learningLanguage || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => acceptRequestMutation(request._id)}
                            disabled={isPending}>
                            accept
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Render Accepted Connections safely */}
            {acceptedReq && acceptedReq.length > 0 && (
              <section className="space-y-4 mt-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BellIcon className="h-5 w-5 text-success" />
                  New Connections
                </h2>
                <div className="space-y-3">
                  {acceptedReq.map((notification) => (
                    <div
                      key={notification._id}
                      className="card bg-base-200 shadow-sm">
                      <div className="card-body p-4">
                        <div className="flex items-start gap-3">
                          <div className="avatar mt-1 size-10 rounded-full">
                            <img
                              src={notification.recipient.profilePic}
                              alt={notification.recipient.fullname}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">
                              {notification.recipient.fullname}
                            </h3>
                            <p className="text-sm my-1">
                              {notification.recipient.fullname} accepted your
                              friend request
                            </p>
                            <p className="text-xs flex items-center opacity-70">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              Recently
                            </p>
                          </div>
                          <div className="badge badge-success">
                            <MessageSquareIcon className="h-3 w-3 mr-1" />
                            New Friend
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Empty State Fallback Screen Layout Display block */}
            {(!incomingReq || incomingReq.length === 0) &&
              (!acceptedReq || acceptedReq.length === 0) && (
                <div className="text-center py-12 text-base-content/60">
                  <p className="text-lg font-medium">No new notifications</p>
                  <p className="text-sm">You are completely caught up!</p>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
