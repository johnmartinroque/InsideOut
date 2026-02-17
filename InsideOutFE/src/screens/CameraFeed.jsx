import React, { useEffect, useRef, useState } from "react";
import Spinner from "../components/Spinner";

function CameraFeed() {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString(undefined, { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
      setCurrentDate(now.toLocaleDateString(undefined, { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    }
    initCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
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
      /* Removed border and background for a cleaner, transparent error look */
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center">
        <div className="text-gray-300 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 00-2 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" stroke="#EF4444" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800">No Input Signal</h3>
        <p className="text-gray-500 text-sm mt-2 max-w-xs">
          The camera could not be accessed. Please check your browser permissions or hardware connection.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4 pt-24 md:pt-10 pb-10">
      
      {/* Header with Title and Real-time Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 pb-4 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
            Camera Monitoring Station
          </h1>
          <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mt-1">
            Primary Feed
          </p>
        </div>
        
        <div className="text-center md:text-right">
          <p className="text-xl font-mono font-bold text-gray-700 tracking-tighter">
            {currentTime}
          </p>
          <p className="text-[10px] md:text-xs text-gray-400 uppercase font-bold tracking-widest">
            {currentDate}
          </p>
        </div>
      </div>

      {/* Camera Viewport */}
      <div className="relative rounded-2xl bg-black shadow-2xl overflow-hidden border border-gray-200 group">
        
        {/* The Live Video */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-auto object-cover brightness-[0.95] contrast-[1.05]"
        />

        {/* Minimalist Overlay */}
        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          <span className="text-white text-[10px] font-bold tracking-widest uppercase">Live</span>
        </div>

        {/* Subtle Decorative Brackets */}
        <div className="absolute inset-0 pointer-events-none border-[1px] border-white/10 m-3 md:m-6 rounded-xl"></div>
      </div>
    </div>
  );
}

export default CameraFeed;