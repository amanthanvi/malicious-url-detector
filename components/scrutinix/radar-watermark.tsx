import { clsx } from "clsx";

const SIZE = 400;
const CENTER = SIZE / 2;
const RING_RADII = [60, 120, 180];

interface RadarWatermarkProps {
  className?: string;
}

/**
 * Decorative SVG radar pattern used as a background watermark.
 * Three concentric sonar rings with a slow-rotating sweep line.
 * Reuses the existing `sx-radar-sweep-line` and `sx-radar-ring` CSS animations.
 */
export function RadarWatermark({ className }: RadarWatermarkProps) {
  return (
    <div
      className={clsx(
        "pointer-events-none absolute inset-0 flex items-center justify-end overflow-hidden opacity-[0.04] dark:opacity-[0.07]",
        className,
      )}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        className="mr-[-40px] block shrink-0"
      >
        {RING_RADII.map((r) => (
          <circle
            key={r}
            cx={CENTER}
            cy={CENTER}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            className="sx-radar-ring"
          />
        ))}

        <g className="sx-radar-sweep-line">
          <line
            x1={CENTER}
            y1={CENTER}
            x2={CENTER}
            y2={CENTER - RING_RADII[2]! - 10}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}
