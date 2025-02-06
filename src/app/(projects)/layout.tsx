export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <header>
        <h1>Projects</h1>
      </header>
      <main>{children}</main>
    </div>
  );
}
