import { VideoIcon, PhoneIcon } from "lucide-react";

function CallButton({ handleVideoCall, handleAudioCall }) {
  return (
    <div className="flex items-center justify-end gap-2 px-2">
      {/* Audio Call Button */}
      <button
        onClick={handleAudioCall}
        className="btn btn-info btn-sm text-white flex items-center justify-center p-2 rounded-md"
        title="Start Audio Call">
        <PhoneIcon className="size-5" />
      </button>

      {/* Video Call Button */}
      <button
        onClick={handleVideoCall}
        className="btn btn-success btn-sm text-white flex items-center justify-center p-2 rounded-md"
        title="Start Video Call">
        <VideoIcon className="size-5" />
      </button>
    </div>
  );
}

export default CallButton;
