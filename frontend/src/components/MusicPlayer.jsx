import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  VolumeX,
  Maximize2,
  Heart
} from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';

const MusicPlayer = ({ currentSong, isPlaying, setIsPlaying }) => {
  const [volume, setVolume] = useState([75]);
  const [progress, setProgress] = useState([0]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
  const [isLiked, setIsLiked] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    if (currentSong && audioRef.current) {
      // For demo purposes, we'll simulate audio playback without actual audio files
      setDuration(parseDuration(currentSong.duration));
      setCurrentTime(0);
      setProgress([0]);
    }
  }, [currentSong]);

  useEffect(() => {
    let interval;
    if (isPlaying && currentSong && duration > 0) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          const newTime = prev + 1;
          setProgress([(newTime / duration) * 100]);
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSong, duration, setIsPlaying]);

  const parseDuration = (durationStr) => {
    const [minutes, seconds] = durationStr.split(':').map(Number);
    return minutes * 60 + seconds;
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (value) => {
    const newTime = (value[0] / 100) * duration;
    setCurrentTime(newTime);
    setProgress(value);
  };

  const handleVolumeChange = (value) => {
    setVolume(value);
    setIsMuted(value[0] === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume([75]);
      setIsMuted(false);
    } else {
      setVolume([0]);
      setIsMuted(true);
    }
  };

  const toggleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  if (!currentSong) {
    return null;
  }

  return (
    <div className="bg-black border-t border-gray-800 px-4 py-3 flex items-center justify-between">
      {/* Current Song Info */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <img
          src={currentSong.image}
          alt={currentSong.title}
          className="w-14 h-14 rounded object-cover"
        />
        <div className="min-w-0 flex-1">
          <h4 className="text-white text-sm font-medium truncate">{currentSong.title}</h4>
          <p className="text-gray-400 text-xs truncate">{currentSong.artist}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsLiked(!isLiked)}
          className={`${isLiked ? 'text-green-500' : 'text-gray-400'} hover:text-green-400`}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </Button>
      </div>

      {/* Player Controls */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsShuffled(!isShuffled)}
            className={`${isShuffled ? 'text-green-500' : 'text-gray-400'} hover:text-white`}
          >
            <Shuffle className="w-4 h-4" />
          </Button>
          
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <SkipBack className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={handlePlayPause}
            className="bg-white hover:bg-gray-200 text-black rounded-full w-8 h-8 flex items-center justify-center"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black ml-0.5" />
            )}
          </Button>
          
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <SkipForward className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleRepeat}
            className={`${repeatMode !== 'off' ? 'text-green-500' : 'text-gray-400'} hover:text-white relative`}
          >
            <Repeat className="w-4 h-4" />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 text-xs font-bold">1</span>
            )}
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-gray-400 text-xs min-w-[40px]">
            {formatTime(currentTime)}
          </span>
          <Slider
            value={progress}
            onValueChange={handleProgressChange}
            max={100}
            step={1}
            className="flex-1"
          />
          <span className="text-gray-400 text-xs min-w-[40px]">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume Controls */}
      <div className="flex items-center gap-2 flex-1 justify-end">
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          <Maximize2 className="w-4 h-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          className="text-gray-400 hover:text-white"
        >
          {isMuted || volume[0] === 0 ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
        </Button>
        
        <div className="w-24">
          <Slider
            value={volume}
            onValueChange={handleVolumeChange}
            max={100}
            step={1}
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;