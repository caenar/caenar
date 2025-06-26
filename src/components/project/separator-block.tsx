type SeparatorProps = {
  direction: "x" | "y";
  spacing?: number;
  className?: string;
};

export default function Separator({
  direction,
  spacing,
  className = "",
}: SeparatorProps) {
  const invert = direction === "x" ? "y" : "x";
  const margin = spacing ? `m${invert}-${spacing}` : `m${invert}-8`;
  const style =
    direction === "x"
      ? "h-px w-full bg-background-400"
      : "w-px h-full bg-background-400";

  return (
    <div className={`${margin} ${className}`}>
      <div className={style}></div>
    </div>
  );
}
