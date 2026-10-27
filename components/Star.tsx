// A single SVG star. "filled" controls the colour: brand red vs. quiet grey.
export default function Star({
  filled,
  className = "h-4 w-4",
}: {
  filled: boolean;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2.6l2.87 6.1 6.73.83-4.96 4.6 1.3 6.67L12 17.44 6.06 20.8l1.3-6.67L2.4 9.53l6.73-.83L12 2.6z"
        className={filled ? "fill-current" : "fill-star-off"}
      />
    </svg>
  );
}
