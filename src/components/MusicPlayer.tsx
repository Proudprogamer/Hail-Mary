import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

const TRACKS = [
  {
    id: 1,
    title: 'SYS.REQ.01',
    artist: 'AI_SYNTH_CORE',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'CYBER_PULSE',
    artist: 'NEURAL_NET',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'VOID_HORIZON',
    artist: 'ALGO_BEATS',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2670&auto=format&fit=crop',
  },
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(currentTrack.url);
      audioRef.current.volume = volume;
    } else {
      audioRef.current.src = currentTrack.url;
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    const handleEnded = () => {
      handleNext();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    if (isPlaying) {
      audio.play().catch((e) => console.error('Audio play failed:', e));
    }

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrackIndex]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((e) => console.error('Audio play failed:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlayPause = () => setIsPlaying(!isPlaying);

  const handleNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) setIsMuted(false);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
      setProgress(newProgress);
    }
  };

  return (
    <div className="w-full lg:w-96 bg-[#050505] border-4 border-[#FF00FF] shadow-[0_0_20px_rgba(255,0,255,0.3),inset_0_0_20px_rgba(255,0,255,0.3)] p-6 z-10 font-pixel relative flex flex-col gap-8 mt-8 lg:mt-14">
      <div className="absolute -top-3 left-4 bg-[#FF00FF] text-black text-[10px] px-2 py-1 tracking-widest">
        AUDIO_SYS.EXE
      </div>
      
      {/* Track Info */}
      <div className="flex items-center gap-4 w-full">
        <div className="w-16 h-16 overflow-hidden border-2 border-[#00FFFF] flex-shrink-0 relative">
          <div className="absolute inset-0 bg-[#FF00FF] mix-blend-overlay opacity-50 z-10 pointer-events-none"></div>
          <img 
            src={currentTrack.cover} 
            alt={currentTrack.title} 
            className="w-full h-full object-cover grayscale contrast-150"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col overflow-hidden w-full gap-2">
          <div className="relative overflow-hidden whitespace-nowrap">
            <span className="text-[#00FFFF] text-xs md:text-sm tracking-widest block animate-[marquee_5s_linear_infinite] glitch-text" data-text={currentTrack.title}>
              {currentTrack.title}
            </span>
          </div>
          <span className="text-[#FF00FF] text-[10px] truncate opacity-80">{currentTrack.artist}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center w-full gap-5">
        <div className="flex items-center gap-6">
          <button 
            onClick={handlePrev}
            className="text-[#00FFFF] hover:text-[#FF00FF] transition-colors"
          >
            <SkipBack size={20} />
          </button>
          <button 
            onClick={togglePlayPause}
            className="w-12 h-12 border-2 border-[#FF00FF] bg-transparent flex items-center justify-center text-[#FF00FF] hover:bg-[#FF00FF] hover:text-black transition-all shadow-[0_0_10px_#FF00FF]"
          >
            {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
          </button>
          <button 
            onClick={handleNext}
            className="text-[#00FFFF] hover:text-[#FF00FF] transition-colors"
          >
            <SkipForward size={20} />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full flex items-center gap-2">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={progress || 0} 
            onChange={handleProgressChange}
            className="w-full h-2 bg-[#111] border border-[#00FFFF] appearance-none cursor-pointer accent-[#FF00FF]"
            style={{
              background: `linear-gradient(to right, #FF00FF ${progress}%, #111 ${progress}%)`
            }}
          />
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center justify-between w-full gap-4">
        <button onClick={toggleMute} className="text-[#00FFFF] hover:text-[#FF00FF] transition-colors">
          {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.01" 
          value={isMuted ? 0 : volume} 
          onChange={handleVolumeChange}
          className="w-full h-2 bg-[#111] border border-[#00FFFF] appearance-none cursor-pointer accent-[#FF00FF]"
          style={{
            background: `linear-gradient(to right, #FF00FF ${(isMuted ? 0 : volume) * 100}%, #111 ${(isMuted ? 0 : volume) * 100}%)`
          }}
        />
      </div>
    </div>
  );
}
