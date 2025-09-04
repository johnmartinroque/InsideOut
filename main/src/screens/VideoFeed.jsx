import React, { useState } from "react";
import Webcam from "react-webcam";

const VideoFeed = () => {
  return (
    <div>
      <h1>Live Video</h1>
      <Webcam
        audio={false}
        screenshotFormat="image/jpeg"
        width="100%"
        height={480} // optional fixed height
        videoConstraints={{
          facingMode: "user", // or "environment" for rear camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }}
      />
      {/*
      {isWebcamOn && (
        <Webcam
          audio={false}
          screenshotFormat="image/jpeg"
          width="100%"
          videoConstraints={{
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }}
        />
      )} */}
      {/* 
      
        <button onClick={() => setIsWebcamOn(!isWebcamOn)}>
        {isWebcamOn ? "Stop Webcam" : "Start Webcam"}
      </button>
      */}
    </div>
  );
};

export default VideoFeed;
