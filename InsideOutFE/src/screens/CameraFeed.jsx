import React, { useEffect, useRef, useState } from "react";
import Spinner from "../components/Spinner";
function CameraFeed() {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setLoading(false);
      } catch (err) {
        console.error("Camera access error:", err);
        setError(true);
        setLoading(false);
      }
    }

    initCamera();

    // Cleanup on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">No camera detected</div>
    );
  }

  return (
    <div className="flex justify-center items-center p-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="border rounded-lg shadow-lg max-w-full h-auto"
      />
    </div>
  );
}

export default CameraFeed;
