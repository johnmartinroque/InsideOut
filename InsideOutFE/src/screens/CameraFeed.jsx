import React, { useEffect, useState } from "react";
import Spinner from "../components/Spinner";

function CameraFeed() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString(),
  );
  const [currentDate, setCurrentDate] = useState(
    new Date().toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
      setCurrentDate(
        now.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // check backend stream availability
  useEffect(() => {
    const img = new Image();
    img.src = "http://127.0.0.1:5002/video_feed";

    img.onload = () => {
      setLoading(false);
      setError(false);
    };

    img.onerror = () => {
      setLoading(false);
      setError(true);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <h3 className="text-xl font-semibold text-gray-800">No Input Signal</h3>
        <p className="text-gray-500 text-sm mt-2">
          Cannot connect to Python camera server.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4 pt-24 md:pt-10 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-4 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Camera Monitoring Station
          </h1>
          <p className="text-sm text-gray-500 uppercase mt-1">Primary Feed</p>
        </div>

        <div className="text-right">
          <p className="text-xl font-mono font-bold text-gray-700">
            {currentTime}
          </p>
          <p className="text-xs text-gray-400 uppercase">{currentDate}</p>
        </div>
      </div>

      {/* Camera View */}
      <div className="relative rounded-2xl bg-black shadow-2xl overflow-hidden border border-gray-200">
        <img
          src="http://127.0.0.1:5000/video_feed"
          alt="Camera Feed"
          className="w-full h-auto object-cover"
        />

        {/* Live indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          <span className="text-white text-xs font-bold uppercase">Live</span>
        </div>
      </div>
    </div>
  );
}

export default CameraFeed;
