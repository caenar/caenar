type TextProps = {
  content: string;
  className?: string;
};
export default function Text({ content, className = "" }: TextProps) {
  const style = "opacity-70 leading-relaxed";

  return <p className={`${style} ${className}`}>{content}</p>;
}
