import { NAV_LINKS } from "@/lib/constants";
import { LogoIcon } from "@/components/ui/icons";

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] bg-[#050816]/80 backdrop-blur-xl">
      {/* Top glow line */}
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" aria-hidden="true" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <LogoIcon size={32} />
            <span className="text-white font-semibold text-lg tracking-tight">
              Interview<span className="text-red-400">OS</span>
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6" aria-label="Footer navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} InterviewOS. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
