'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Slider,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  Alert,
  Tooltip,
  Grid,
  Button,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  FullscreenExit,
  Settings,
  Download,
  Speed,
  HighQuality,
} from '@mui/icons-material';
import Hls from 'hls.js';
import axios from 'axios';

interface VideoPreviewPlayerProps {
  videoId: string;
  title?: string;
  isHLS?: boolean;
  onQualityChange?: (quality: string) => void;
}

export const VideoPreviewPlayer = ({
  videoId,
  title,
  isHLS = false,
  onQualityChange,
}: VideoPreviewPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // HLS specific
  const [qualities, setQualities] = useState<any[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1);

  // Playback speed
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

  useEffect(() => {
    loadVideo();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [videoId]);

  const loadVideo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get video URLs
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/videos/${videoId}/preview-url`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
          },
        }
      );

      if (isHLS && data.hlsUrl) {
        // Load HLS stream
        if (Hls.isSupported() && videoRef.current) {
          const hls = new Hls({
            autoStartLoad: true,
            startLevel: -1, // Auto quality
          });

          hls.loadSource(data.hlsUrl);
          hls.attachMedia(videoRef.current);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setLoading(false);
            const levels = hls.levels.map((level, index) => ({
              index,
              height: level.height,
              bitrate: level.bitrate,
              label: `${level.height}p`,
            }));
            setQualities(levels);
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              setError('Failed to load video stream');
              setLoading(false);
            }
          });

          hlsRef.current = hls;
        } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari native HLS support
          videoRef.current.src = data.hlsUrl;
          setLoading(false);
        }
      } else if (data.directUrl) {
        // Load direct video URL
        setVideoUrl(data.directUrl);
        if (videoRef.current) {
          videoRef.current.src = data.directUrl;
        }
        setLoading(false);
      }

      setDownloadUrl(data.downloadUrl);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load video');
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const vol = newValue as number;
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
    }
    setMuted(vol === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const handleSeek = (event: Event, newValue: number | number[]) => {
    const time = newValue as number;
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleFullscreen = () => {
    if (!fullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setFullscreen(!fullscreen);
  };

  const changeQuality = (level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setCurrentQuality(level);
      onQualityChange?.(level === -1 ? 'auto' : qualities[level].label);
    }
  };

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = async () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    } else {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/content/videos/${videoId}/download-url`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
            },
          }
        );
        window.open(data.downloadUrl, '_blank');
      } catch (error) {
        console.error('Failed to get download URL:', error);
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
    };

    const updateDuration = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', () => setPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', () => setPlaying(false));
    };
  }, []);

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading video...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ overflow: 'hidden' }}>
      {title && (
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">{title}</Typography>
        </Box>
      )}

      <Box ref={containerRef} sx={{ position: 'relative', backgroundColor: '#000' }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '600px',
          }}
          onClick={togglePlay}
        />

        {/* Custom Controls */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
            p: 2,
            color: 'white',
          }}
        >
          {/* Progress Bar */}
          <Box sx={{ mb: 1 }}>
            <Slider
              value={currentTime}
              max={duration}
              onChange={handleSeek}
              sx={{
                color: 'primary.main',
                '& .MuiSlider-rail': {
                  opacity: 0.3,
                },
                '& .MuiSlider-track': {
                  border: 'none',
                },
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                },
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${buffered}%`,
                height: '4px',
                backgroundColor: 'grey.600',
                pointerEvents: 'none',
              }}
            />
          </Box>

          {/* Control Buttons */}
          <Grid container alignItems="center" spacing={1}>
            <Grid item>
              <IconButton
                onClick={togglePlay}
                sx={{ color: 'white' }}
              >
                {playing ? <Pause /> : <PlayArrow />}
              </IconButton>
            </Grid>

            <Grid item>
              <IconButton
                onClick={toggleMute}
                sx={{ color: 'white' }}
              >
                {muted ? <VolumeOff /> : <VolumeUp />}
              </IconButton>
            </Grid>

            <Grid item xs={2}>
              <Slider
                value={muted ? 0 : volume}
                max={1}
                step={0.1}
                onChange={handleVolumeChange}
                size="small"
                sx={{ color: 'white' }}
              />
            </Grid>

            <Grid item>
              <Typography variant="body2" sx={{ color: 'white' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Typography>
            </Grid>

            <Grid item sx={{ flex: 1 }} />

            {/* Speed Control */}
            <Grid item>
              <FormControl size="small" sx={{ minWidth: 70 }}>
                <Select
                  value={playbackSpeed}
                  onChange={(e) => changeSpeed(e.target.value as number)}
                  sx={{
                    color: 'white',
                    '& .MuiSelect-icon': { color: 'white' },
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  }}
                >
                  {speeds.map(speed => (
                    <MenuItem key={speed} value={speed}>
                      {speed}x
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Quality Selector (HLS only) */}
            {isHLS && qualities.length > 0 && (
              <Grid item>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <Select
                    value={currentQuality}
                    onChange={(e) => changeQuality(e.target.value as number)}
                    sx={{
                      color: 'white',
                      '& .MuiSelect-icon': { color: 'white' },
                      '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                    }}
                  >
                    <MenuItem value={-1}>Auto</MenuItem>
                    {qualities.map((quality, index) => (
                      <MenuItem key={index} value={index}>
                        {quality.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item>
              <Tooltip title="Download">
                <IconButton
                  onClick={handleDownload}
                  sx={{ color: 'white' }}
                >
                  <Download />
                </IconButton>
              </Tooltip>
            </Grid>

            <Grid item>
              <IconButton
                onClick={toggleFullscreen}
                sx={{ color: 'white' }}
              >
                {fullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Video Info */}
      <Box sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Format: {isHLS ? 'HLS Stream' : 'Direct Video'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
              Duration: {formatTime(duration)}
            </Typography>
          </Grid>
          {isHLS && qualities.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Available Qualities: {qualities.map(q => q.label).join(', ')}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Box>
    </Paper>
  );
};