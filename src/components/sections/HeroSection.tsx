import { useEffect, useRef } from "react";

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    const playVideo = () => {
      video.muted = true;
      video.defaultMuted = true;
      void video.play().catch(() => {
        // Browser autoplay policies can still reject in some profiles.
      });
    };

    video.muted = true;
    video.defaultMuted = true;
    video.load();
    playVideo();

    video.addEventListener("canplay", playVideo);
    video.addEventListener("loadeddata", playVideo);
    document.addEventListener("visibilitychange", playVideo);
    document.addEventListener("pointerdown", playVideo, { once: true });

    return () => {
      video.removeEventListener("canplay", playVideo);
      video.removeEventListener("loadeddata", playVideo);
      document.removeEventListener("visibilitychange", playVideo);
      document.removeEventListener("pointerdown", playVideo);
    };
  }, []);

  return (
    <section className="hero">
      <div className="hero-bg">
        <video
          ref={videoRef}
          src="https://origam.ge/video/origami.mp4?v=20260815"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/assets/hero_bg_2.png"
          className="hero-video"
        />
      </div>
    </section>
  );
}
