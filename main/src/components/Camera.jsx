import React, { useRef, useState } from "react";

function Camera() {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);

  const handleToggleCamera = async () => {
    if (!cameraOn) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setCameraOn(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Unable to access camera");
      }
    } else {
      // Turn off camera
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setStream(null);
      setCameraOn(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <button
        onClick={handleToggleCamera}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
      >
        {cameraOn ? "Turn Off Camera" : "Turn On Camera"}
      </button>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-64 h-48 rounded-lg border border-gray-300"
      />
    </div>
  );
}

export default Camera;
