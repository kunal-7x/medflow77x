import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { getIsMuted, setIsMuted, playSound } from "@/hooks/useSoundSystem";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function SoundToggle() {
  const [muted, setMuted] = useState(getIsMuted());

  const toggle = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    setIsMuted(newMuted);
    if (!newMuted) playSound('toggle');
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={toggle}>
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{muted ? 'Unmute sounds' : 'Mute sounds'}</p>
      </TooltipContent>
    </Tooltip>
  );
}
