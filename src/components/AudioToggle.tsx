import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import {
  destroyAudio,
  isAudioEnabled,
  subscribeAudio,
  toggleAudio,
  speakAct,
} from "@/lib/audio-engine";

/**
 * Bottom-right ambient audio switch. The synthesiser only ever starts from
 * this gesture, and the whole AudioContext is destroyed on unmount.
 */
export function AudioToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(isAudioEnabled());
    const unsub = subscribeAudio(setOn);
    return () => {
      unsub();
      destroyAudio();
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => void toggleAudio().then(() => speakAct(1))}
      aria-pressed={on}
      aria-label={on ? "Mute ambient audio" : "Unmute ambient audio"}
      className="relative flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-2 text-[0.65rem] uppercase tracking-[0.18em] text-primary/80 backdrop-blur-md transition-all duration-500 hover:border-primary/60 hover:text-primary"
    >
      <span
        className={`absolute inset-0 rounded-full bg-primary/10 transition-opacity duration-700 ${on ? "animate-pulse-ring opacity-100" : "opacity-0"}`}
      />
      {on ? <Volume2 className="relative size-4" /> : <VolumeX className="relative size-4" />}
      <span className="relative hidden sm:inline">
        {on ? "Voice & Music On" : "Voice & Music Off"}
      </span>
    </button>
  );
}
