import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import {
  destroyAudio,
  isAudioEnabled,
  subscribeAudio,
  toggleAudio,
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
      onClick={() => void toggleAudio()}
      aria-pressed={on}
      aria-label={on ? "Mute ambient audio" : "Unmute ambient audio"}
      className="fixed bottom-5 right-5 z-50 grid size-11 place-items-center rounded-full border border-primary/25 bg-background/40 text-primary/80 backdrop-blur-md transition-all duration-500 hover:border-primary/60 hover:text-primary sm:bottom-7 sm:right-7"
    >
      <span
        className={`absolute inset-0 rounded-full bg-primary/10 transition-opacity duration-700 ${on ? "animate-pulse-ring opacity-100" : "opacity-0"}`}
      />
      {on ? <Volume2 className="relative size-4" /> : <VolumeX className="relative size-4" />}
    </button>
  );
}
