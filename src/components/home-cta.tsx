import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const CHARS = ".:-=+*#%/\\\\|";

function pseudoRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function buildAscii(rows: number, cols: number) {
  const rand = pseudoRandom(1337);
  let out = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out += CHARS[Math.floor(rand() * CHARS.length)];
    }
    if (r < rows - 1) out += "\n";
  }
  return out;
}

const ASCII_ART = buildAscii(18, 520);

export default function HomeCTA() {
  return (
    <section className="relative bg-background-400/20 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 overflow-hidden text-foreground-100/[0.12] pointer-events-none"
        style={{
          maskImage:
            "radial-gradient(ellipse 120% 140% at 50% 50%, transparent 20%, rgba(0,0,0,0.15) 40%, black 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 120% 140% at 50% 50%, transparent 20%, rgba(0,0,0,0.15) 40%, black 75%)",
        }}
      >
        <pre className="bottom-0 left-1/2 absolute px-4 w-max min-w-full font-mono text-sm text-center leading-[1.15] whitespace-pre -translate-x-1/2 select-none">
          {ASCII_ART}
        </pre>
      </div>

      <div className="relative px-4 sm:px-6 md:px-[8vw] lg:px-[15vw] py-16 sm:py-20 md:py-24">
        <div className="justify-items-center gap-6 grid mx-auto max-w-3xl text-center">
          <p className="font-mono text-background-200/70 text-xs uppercase tracking-[0.2em]">
            Got something in mind?
          </p>
          <h2 className="font-semibold text-4xl sm:text-5xl md:text-6xl tracking-tight">
            Why not say hello?
          </h2>
          <p className="max-w-[42ch] text-background-200">
            Whether it’s a project, a question, or just a random thought - my
            inbox is open.
          </p>
          <Link href="/contact" className="!gap-1 mt-2 text-sm primary-button icon-label">
            Start a conversation
            <ArrowUpRight className="text-foreground-100/50" size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
