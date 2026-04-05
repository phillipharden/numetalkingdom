import { useEffect, useState } from "react";
import "../styles/backgroundvideo.css";
import Video from "../assets/videos/bg-smoke.mp4";

const BackgroundVideo = () => {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowVideo(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="video-container">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="background-video">
        <source src={Video} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="video-overlay" />
    </div>
  );
};

export default BackgroundVideo;