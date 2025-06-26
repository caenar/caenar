type LinkProps = {
  label: string;
  href: string;
  className?: string;
};
export default function Link({ label, href, className = "" }: LinkProps) {
  const style = "text-blue-600 underline";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${style} ${className}`}
    >
      {label}
    </a>
  );
}
