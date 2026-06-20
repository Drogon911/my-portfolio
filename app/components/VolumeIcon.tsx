type VolumeLevel = "off" | "low" | "high";

interface VolumeIconProps {
  level: VolumeLevel;
  className?: string;
}

export default function VolumeIcon({ level, className = "w-5 h-5" }: VolumeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {level === "off" ? (
        <>
          <path d="M3 8v8h4l5 4V4L7 8H3z" />
          <line x1="21" y1="3" x2="3" y2="21" />
        </>
      ) : level === "low" ? (
        <>
          <path d="M3 8v8h4l5 4V4L7 8H3z" />
          <path d="M17 8c1.5 1.5 1.5 6 0 7.5" />
        </>
      ) : (
        <>
          <path d="M3 8v8h4l5 4V4L7 8H3z" />
          <path d="M17 8c1.5 1.5 1.5 6 0 7.5" />
          <path d="M20 5c2.5 2.5 2.5 11 0 13.5" />
        </>
      )}
    </svg>
  );
}
