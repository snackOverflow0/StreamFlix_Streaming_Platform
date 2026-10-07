import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";
import {
  Cast,
  ChevronLeft,
  Gauge,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Settings,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { Content } from "@/features/streamflix/types";

type VideoPlayerProps = {
  item: Content;
  episodeId: number | null;
  onClose: () => void;
  onBack?: () => void;
  onProgress: (percentage: number, ended?: boolean) => void;
};

type RemoteVideo = HTMLVideoElement & {
  remote?: {
    prompt?: () => Promise<void>;
  };
  webkitEnterFullscreen?: () => void;
};

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";

  const total = Math.floor(value);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getPlayableMediaUrl(url?: string | null) {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

export function VideoPlayer({
  item,
  episodeId,
  onClose,
  onProgress,
  onBack,
}: VideoPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<RemoteVideo>(null);
  const hideTimerRef = useRef<number | null>(null);
  const hideControlsLockRef = useRef(false);
  const mountedRef = useRef(true);
  const playingRef = useRef(false);
  const latestProgressRef = useRef(0);
  const latestDurationRef = useRef(0);
  const latestOnProgressRef = useRef(onProgress);
  const lastSavedPercentRef = useRef(-1);
  const lastSavedAtRef = useRef(0);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [buffering, setBuffering] = useState(false);
  const [error, setError] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [castSupported, setCastSupported] = useState(false);

  const playableUrl = useMemo(
    () => getPlayableMediaUrl(item.trailerUrl),
    [item.trailerUrl],
  );

  const progress =
    duration > 0 ? Math.min(100, Math.max(0, (current / duration) * 100)) : 0;

  useEffect(() => {
    latestOnProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    latestProgressRef.current = current;
  }, [current]);

  useEffect(() => {
    latestDurationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    clearHideTimer();

    hideTimerRef.current = window.setTimeout(() => {
      if (playingRef.current && !hideControlsLockRef.current) {
        setShowControls(false);
      }
    }, 2800);
  }, [clearHideTimer]);

  const saveProgress = useCallback(
    (percentage: number, ended = false, force = false) => {
      if (!Number.isFinite(percentage)) return;

      const safePercentage = Math.max(0, Math.min(100, percentage));
      const rounded = Math.round(safePercentage);
      const now = Date.now();

      if (!force && !ended && rounded === lastSavedPercentRef.current) {
        return;
      }

      if (!force && !ended && now - lastSavedAtRef.current < 10_000) {
        return;
      }

      lastSavedPercentRef.current = rounded;
      lastSavedAtRef.current = now;

      latestOnProgressRef.current(safePercentage, ended);
    },
    [],
  );

  const saveCurrentProgress = useCallback(
    (force = true) => {
      const video = videoRef.current;

      if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
        return;
      }

      saveProgress((video.currentTime / video.duration) * 100, false, force);
    },
    [saveProgress],
  );

  const closePlayer = useCallback(() => {
    saveCurrentProgress(true);
    clearHideTimer();

    if (document.fullscreenElement === playerRef.current) {
      void document.exitFullscreen().catch(() => undefined);
    }

    onClose();
  }, [clearHideTimer, onClose, saveCurrentProgress]);

  const backFromPlayer = useCallback(() => {
    saveCurrentProgress(true);
    clearHideTimer();

    if (document.fullscreenElement === playerRef.current) {
      void document.exitFullscreen().catch(() => undefined);
    }

    if (onBack) {
      onBack();
      return;
    }

    onClose();
  }, [clearHideTimer, onBack, onClose, saveCurrentProgress]);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;

    if (!video) return;

    if (!playableUrl) {
      setError("This title does not have a playable video source.");
      return;
    }

    resetHideTimer();

    try {
      if (video.paused || video.ended) {
        setError("");
        await video.play();
      } else {
        video.pause();
      }
    } catch {
      setPlaying(false);
      playingRef.current = false;
      setShowControls(true);
      setError("Playback could not start. Please try again.");
    }
  }, [playableUrl, resetHideTimer]);

  const seekBy = useCallback(
    (seconds: number) => {
      const video = videoRef.current;

      if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
        return;
      }

      const nextTime = Math.max(
        0,
        Math.min(video.duration, video.currentTime + seconds),
      );

      video.currentTime = nextTime;
      setCurrent(nextTime);

      saveProgress((nextTime / video.duration) * 100, false, true);
      resetHideTimer();
    },
    [resetHideTimer, saveProgress],
  );

  const handleProgressChange = useCallback(
    (value: number) => {
      const video = videoRef.current;

      if (!video || !Number.isFinite(video.duration) || video.duration <= 0) {
        return;
      }

      const nextTime = Math.max(0, Math.min(video.duration, value));
      video.currentTime = nextTime;
      setCurrent(nextTime);

      saveProgress((nextTime / video.duration) * 100, false, true);
      resetHideTimer();
    },
    [resetHideTimer, saveProgress],
  );

  const toggleMute = useCallback(() => {
    const video = videoRef.current;

    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setMuted(nextMuted);
    resetHideTimer();
  }, [resetHideTimer]);

  const changeVolume = useCallback(
    (nextVolume: number) => {
      const safeVolume = Math.max(0, Math.min(1, nextVolume));
      setVolume(safeVolume);

      const video = videoRef.current;

      if (!video) return;

      video.volume = safeVolume;

      if (safeVolume === 0) {
        video.muted = true;
        setMuted(true);
      } else {
        video.muted = false;
        setMuted(false);
      }

      resetHideTimer();
    },
    [resetHideTimer],
  );

  const changeSpeed = useCallback(
    (nextSpeed: number) => {
      const safeSpeed = Math.max(0.25, Math.min(4, nextSpeed));
      setSpeed(safeSpeed);

      const video = videoRef.current;
      if (video) {
        video.playbackRate = safeSpeed;
      }

      resetHideTimer();
    },
    [resetHideTimer],
  );

  const toggleFullscreen = useCallback(async () => {
    const player = playerRef.current;
    if (!player) return;

    try {
      if (document.fullscreenElement === player) {
        await document.exitFullscreen();
        return;
      }

      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      if (player.requestFullscreen) {
        await player.requestFullscreen({ navigationUI: "hide" });
        return;
      }

      const legacyPlayer = player as HTMLDivElement & {
        webkitRequestFullscreen?: () => void;
      };

      if (legacyPlayer.webkitRequestFullscreen) {
        legacyPlayer.webkitRequestFullscreen();
        return;
      }

      const video = videoRef.current;

      if (video?.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
        return;
      }

      setError("Fullscreen mode is not available in this browser.");
    } catch {
      setError("Fullscreen mode is not available in this browser.");
    }

    resetHideTimer();
  }, [resetHideTimer]);

  const cast = useCallback(async () => {
    const video = videoRef.current;
    const remote = video?.remote;

    if (!remote?.prompt) return;

    try {
      await remote.prompt();
    } catch {
      // User dismissed the cast picker or the browser rejected it.
    }

    resetHideTimer();
  }, [resetHideTimer]);

  const handleLoadedMetadata = useCallback(
    (event: SyntheticEvent<HTMLVideoElement>) => {
      const video = event.currentTarget;
      const nextDuration = Number.isFinite(video.duration) ? video.duration : 0;

      setDuration(nextDuration);
      latestDurationRef.current = nextDuration;

      video.volume = volume;
      video.muted = muted;
      video.playbackRate = speed;

      if (
        typeof item.progress === "number" &&
        item.progress > 0 &&
        item.progress < 100 &&
        nextDuration > 0
      ) {
        const resumePosition = (item.progress / 100) * nextDuration;

        try {
          video.currentTime = resumePosition;
          setCurrent(resumePosition);
        } catch {
          // Some streams only allow seeking after more media data is available.
        }
      }

      setBuffering(false);

      // Try autoplay. Browsers may block it; that is expected.
      void video
        .play()
        .then(() => {
          if (!mountedRef.current) return;

          setPlaying(true);
          playingRef.current = true;
          setError("");
          resetHideTimer();
        })
        .catch(() => {
          if (!mountedRef.current) return;

          setPlaying(false);
          playingRef.current = false;
          setShowControls(true);
        });
    },
    [item.progress, muted, resetHideTimer, speed, volume],
  );

  const handleTimeUpdate = useCallback(
    (event: SyntheticEvent<HTMLVideoElement>) => {
      const video = event.currentTarget;
      const nextCurrent = video.currentTime;
      const nextDuration = video.duration;

      setCurrent(nextCurrent);
      latestProgressRef.current = nextCurrent;

      if (Number.isFinite(nextDuration) && nextDuration > 0) {
        setDuration(nextDuration);
        latestDurationRef.current = nextDuration;

        saveProgress((nextCurrent / nextDuration) * 100);
      }
    },
    [saveProgress],
  );

  const handlePause = useCallback(
    (event: SyntheticEvent<HTMLVideoElement>) => {
      const video = event.currentTarget;

      setPlaying(false);
      playingRef.current = false;
      setShowControls(true);
      clearHideTimer();

      if (Number.isFinite(video.duration) && video.duration > 0) {
        saveProgress((video.currentTime / video.duration) * 100, false, true);
      }
    },
    [clearHideTimer, saveProgress],
  );

  const handleEnded = useCallback(
    (event: SyntheticEvent<HTMLVideoElement>) => {
      const video = event.currentTarget;

      setPlaying(false);
      playingRef.current = false;
      setShowControls(true);
      clearHideTimer();

      if (Number.isFinite(video.duration) && video.duration > 0) {
        setCurrent(video.duration);
        latestProgressRef.current = video.duration;
      }

      saveProgress(100, true, true);
    },
    [clearHideTimer, saveProgress],
  );

  const handleVideoError = useCallback(() => {
    setBuffering(false);
    setPlaying(false);
    playingRef.current = false;
    setShowControls(true);
    setError(
      "This title could not be played right now. Make sure the content uses a direct playable video URL.",
    );
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const video = videoRef.current;
    if (!video) return;

    clearHideTimer();
    lastSavedPercentRef.current = -1;
    lastSavedAtRef.current = 0;

    setError("");
    setBuffering(false);
    setPlaying(false);
    playingRef.current = false;
    setCurrent(0);
    setDuration(0);
    latestProgressRef.current = 0;
    latestDurationRef.current = 0;
    setShowControls(true);
    setShowSettings(false);

    if (!playableUrl) {
      setError(
        "This title does not have a playable video source. Add a direct HTTP/HTTPS video URL.",
      );

      return () => {
        mountedRef.current = false;
        clearHideTimer();
      };
    }

    video.src = playableUrl;
    video.load();

    resetHideTimer();

    return () => {
      mountedRef.current = false;
      clearHideTimer();

      try {
        video.pause();
        video.removeAttribute("src");
        video.load();
      } catch {
        // Ignore media teardown errors.
      }
    };
  }, [playableUrl, clearHideTimer, resetHideTimer]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = volume;
  }, [volume]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = muted;
  }, [muted]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === playerRef.current);
      resetHideTimer();
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [resetHideTimer]);

  useEffect(() => {
    const video = videoRef.current;
    setCastSupported(Boolean(video?.remote?.prompt));

    const timer = window.setTimeout(() => {
      setCastSupported(Boolean(videoRef.current?.remote?.prompt));
    }, 800);

    return () => window.clearTimeout(timer);
  }, [playableUrl]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;

      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = event.key.toLowerCase();

      if (event.key === "Escape") {
        return;
      }

      if (event.code === "Space" || key === "k") {
        event.preventDefault();
        void togglePlay();
        return;
      }

      if (event.key === "ArrowLeft" || key === "j") {
        event.preventDefault();
        seekBy(-10);
        return;
      }

      if (event.key === "ArrowRight" || key === "l") {
        event.preventDefault();
        seekBy(10);
        return;
      }

      if (key === "m") {
        event.preventDefault();
        toggleMute();
        return;
      }

      if (key === "f") {
        event.preventDefault();
        void toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [seekBy, toggleFullscreen, toggleMute, togglePlay]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearHideTimer();

      const video = videoRef.current;
      const mediaDuration = video?.duration ?? latestDurationRef.current;
      const mediaCurrent = video?.currentTime ?? latestProgressRef.current;

      if (video && Number.isFinite(mediaDuration) && mediaDuration > 0) {
        latestOnProgressRef.current(
          Math.max(0, Math.min(100, (mediaCurrent / mediaDuration) * 100)),
          false,
        );
      }
    };
  }, [clearHideTimer]);

  const handlePointerMove = useCallback(() => {
    hideControlsLockRef.current = false;
    resetHideTimer();
  }, [resetHideTimer]);

  const handleControlsEnter = useCallback(() => {
    hideControlsLockRef.current = true;
    clearHideTimer();
    setShowControls(true);
  }, [clearHideTimer]);

  const handleControlsLeave = useCallback(() => {
    hideControlsLockRef.current = false;
    resetHideTimer();
  }, [resetHideTimer]);

  return (
    <div
      ref={playerRef}
      className="streamflix-player-shell fixed inset-0 z-[100] h-screen w-screen overflow-hidden bg-black text-white isolate"
      onMouseMove={handlePointerMove}
      onTouchStart={handlePointerMove}
    >
      <video
        ref={videoRef}
        key={playableUrl ?? "no-media"}
        data-streamflix-player="true"
        src={playableUrl ?? undefined}
        poster={item.poster ?? undefined}
        playsInline
        preload="metadata"
        className="absolute inset-0 z-0 h-full w-full bg-black object-contain"
        onClick={() => void togglePlay()}
        onLoadStart={() => {
          setBuffering(Boolean(playableUrl));
        }}
        onLoadedMetadata={handleLoadedMetadata}
        onCanPlay={() => {
          setBuffering(false);
          setError("");
        }}
        onCanPlayThrough={() => setBuffering(false)}
        onWaiting={() => setBuffering(true)}
        onStalled={() => setBuffering(true)}
        onPlaying={() => {
          setPlaying(true);
          playingRef.current = true;
          setBuffering(false);
          setError("");
          resetHideTimer();
        }}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={(event) => {
          const nextDuration = event.currentTarget.duration;

          if (Number.isFinite(nextDuration)) {
            setDuration(nextDuration);
            latestDurationRef.current = nextDuration;
          }
        }}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleVideoError}
      />

      {/* Top cinematic gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-52 bg-gradient-to-b from-black/95 via-black/45 to-transparent" />

      {/* Bottom cinematic gradient */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-72 bg-gradient-to-t from-black via-black/80 to-transparent" />

      {/* Top header */}
      <div
        className={`absolute inset-x-0 top-0 z-30 px-4 pt-4 sm:px-8 sm:pt-6 transition-opacity duration-300 ${
          showControls
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <button
            type="button"
            onClick={backFromPlayer}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-white/15 active:scale-95"
            aria-label="Back"
          >
            <ChevronLeft className="size-6" />
          </button>

          <div className="min-w-0 pt-0.5">
            <h1 className="truncate text-base font-bold sm:text-xl">
              {item.title}
            </h1>

            <p className="mt-1 truncate text-xs text-white/65 sm:text-sm">
              {item.year}
              {item.maturity ? ` • ${item.maturity}` : ""}
              {item.duration ? ` • ${item.duration}` : ""}
              {item.genre ? ` • ${item.genre}` : ""}
              {episodeId !== null ? ` • Episode ${episodeId}` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={closePlayer}
            className="ml-auto grid size-10 shrink-0 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition hover:bg-white/15 active:scale-95"
            aria-label="Close player"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Center play button */}
      {!playing && !buffering && !error && playableUrl ? (
        <button
          type="button"
          onClick={() => void togglePlay()}
          className="absolute left-1/2 top-1/2 z-30 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-black shadow-2xl transition duration-200 hover:scale-105 hover:bg-slate-100 active:scale-95 sm:size-20"
          aria-label="Play"
        >
          <Play className="ml-1 size-7 fill-current sm:size-9" />
        </button>
      ) : null}

      {/* Buffering */}
      {buffering ? (
        <div className="pointer-events-none absolute inset-0 z-40 grid place-items-center">
          <div className="size-12 animate-spin rounded-full border-4 border-white/20 border-t-violet-500 sm:size-14" />
        </div>
      ) : null}

      {/* Error */}
      {error ? (
        <div className="absolute left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-black/90 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-white/10">
            <Play className="size-5" />
          </div>

          <h2 className="mt-4 text-lg font-bold">
            Playback unavailable
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/65">
            {error}
          </p>

          {playableUrl ? (
            <button
              type="button"
              onClick={() => {
                setError("");
                void togglePlay();
              }}
              className="mt-5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-slate-200 active:scale-95"
            >
              Try again
            </button>
          ) : null}
        </div>
      ) : null}

      {/* Bottom controls */}
      <div
        className={`absolute inset-x-0 bottom-0 z-30 px-4 pb-4 pt-24 sm:px-8 sm:pb-7 sm:pt-32 transition-opacity duration-300 ${
          showControls
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onMouseEnter={handleControlsEnter}
        onMouseLeave={handleControlsLeave}
      >
        <div className="mx-auto max-w-[1800px]">
          {/* Progress */}
          <div className="group relative">
            <div className="pointer-events-none absolute left-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-white/25 transition-all group-hover:h-1.5 w-full" />

            <div
              className="pointer-events-none absolute left-0 top-1/2 z-[1] h-1 -translate-y-1/2 rounded-full bg-violet-600 transition-all group-hover:h-1.5"
              style={{ width: `${progress}%` }}
            />

            <input
              aria-label="Playback progress"
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={Math.min(current, duration || 0)}
              disabled={!duration}
              onChange={(event) => {
                handleProgressChange(Number(event.target.value));
              }}
              className="relative z-10 block h-1.5 w-full cursor-pointer appearance-none bg-transparent accent-violet-600 group-hover:h-2"
            />
          </div>

          {/* Main controls */}
          <div className="mt-2 flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => void togglePlay()}
              className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 active:scale-95 sm:size-11"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <Pause className="size-5 fill-current" />
              ) : (
                <Play className="size-5 fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={() => seekBy(-10)}
              className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 active:scale-95 sm:size-11"
              aria-label="Skip back 10 seconds"
            >
              <RotateCcw className="size-5" />
            </button>

            <button
              type="button"
              onClick={() => seekBy(10)}
              className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 active:scale-95 sm:size-11"
              aria-label="Skip forward 10 seconds"
            >
              <RotateCw className="size-5" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1.5 sm:gap-2 sm:px-3">
              <button
                type="button"
                onClick={toggleMute}
                className="grid size-7 place-items-center rounded-full transition hover:bg-white/10"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted || volume === 0 ? (
                  <VolumeX className="size-5" />
                ) : (
                  <Volume2 className="size-5" />
                )}
              </button>

              <input
                aria-label="Volume"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(event) => {
                  changeVolume(Number(event.target.value));
                }}
                className="hidden h-1 w-20 cursor-pointer accent-violet-600 sm:block"
              />
            </div>

            {/* Time */}
            <span className="ml-2 hidden text-xs font-medium text-white/75 sm:inline sm:text-sm">
              {formatTime(current)} / {formatTime(duration)}
            </span>

            {/* Right controls */}
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
              {castSupported ? (
                <button
                  type="button"
                  onClick={() => void cast()}
                  className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 active:scale-95 sm:size-11"
                  aria-label="Cast"
                >
                  <Cast className="size-5" />
                </button>
              ) : null}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowSettings((value) => !value);
                    resetHideTimer();
                  }}
                  className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 active:scale-95 sm:size-11"
                  aria-label="Playback settings"
                  aria-expanded={showSettings}
                >
                  <Settings className="size-5" />
                </button>

                {showSettings ? (
                  <div className="absolute bottom-14 right-0 w-48 overflow-hidden rounded-2xl border border-white/10 bg-black/95 p-2 shadow-2xl backdrop-blur-xl">
                    <p className="px-3 pb-2 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                      Playback Speed
                    </p>

                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          changeSpeed(value);
                          setShowSettings(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                          speed === value
                            ? "bg-white/10 text-white"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <span>{value}×</span>
                        {speed === value ? (
                          <span className="text-xs text-violet-500">✓</span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 active:scale-95 sm:size-11"
                aria-label={
                  isFullscreen ? "Exit fullscreen" : "Fullscreen"
                }
              >
                {isFullscreen ? (
                  <Minimize className="size-5" />
                ) : (
                  <Maximize className="size-5" />
                )}
              </button>

              <button
                type="button"
                onClick={closePlayer}
                className="grid size-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 active:scale-95 sm:size-11"
                aria-label="Close player"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute left-5 top-20 z-20 text-[9px] font-semibold uppercase tracking-[0.3em] text-white/30 sm:left-8">
        STREAMFLIX
      </div>

      <div className="sr-only" aria-live="polite">
        {playing ? "Playing" : "Paused"}. Current position {formatTime(current)} of {formatTime(duration)}.
      </div>
    </div>
  );
}
