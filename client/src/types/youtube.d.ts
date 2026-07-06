declare namespace YT {
  class Player {
    constructor(elementId: string, options: PlayerOptions)
    playVideo(): void
    pauseVideo(): void
    stopVideo(): void
    seekTo(seconds: number, allowSeekAhead: boolean): void
    getCurrentTime(): number
    getDuration(): number
    destroy(): void
  }

  interface PlayerOptions {
    videoId: string
    height?: string | number
    width?: string | number
    playerVars?: PlayerVars
    events?: Events
  }

  interface PlayerVars {
    autoplay?: number
    modestbranding?: number
    rel?: number
    controls?: number
  }

  interface Events {
    onReady?: (event: any) => void
    onStateChange?: (event: any) => void
  }
}

interface Window {
  YT: typeof YT
  onYouTubeIframeAPIReady: () => void
}
