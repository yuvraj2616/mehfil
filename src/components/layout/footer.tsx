import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  Workshops: [
    { href: "/events", label: "Design System, Great Night" },
    { href: "/events", label: "Our Journey Starts In peace" },
    { href: "/events", label: "Learn Music In Our Way" },
    { href: "/events", label: "Using Jobs To Be Done For Speed" },
    { href: "/events", label: "Product Strategy" },
  ],
  Events: [
    { href: "/events", label: "Edmonton - Canada" },
    { href: "/events", label: "NYC - Hong Kong" },
    { href: "/events", label: "Pennsylvania - Seattle" },
    { href: "/events", label: "Talk Action - New York" },
  ],
  Newsletter: [
    { href: "#", label: "Your Email Address" },
  ],
};

const socialLinks = [
  { label: "𝕏", href: "#" },
  { label: "IG", href: "#" },
  { label: "FB", href: "#" },
  { label: "YT", href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-[#050505] pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="inline-block group">
              <span className="text-3xl font-cursive text-white tracking-wider group-hover:text-primary transition-colors">
                Mehfil
                <span className="text-primary text-4xl leading-none">.</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed pr-8">
              Join the greatest events. Make your dream big. We connect humans, 
              superheroes, and those who know how to party.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex items-center justify-center h-8 w-8 rounded-full border border-gray-800 hover:border-primary hover:text-primary text-gray-500 transition-all text-xs font-semibold"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* Links: Workshops */}
          <div>
            <h3 className="text-sm font-bold mb-6 text-white uppercase tracking-wider">Workshops</h3>
            <ul className="space-y-4">
              {footerLinks.Workshops.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links: Events */}
          <div>
            <h3 className="text-sm font-bold mb-6 text-white uppercase tracking-wider">Events</h3>
            <ul className="space-y-4">
              {footerLinks.Events.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-bold mb-6 text-white uppercase tracking-wider">Newsletter</h3>
            <div className="flex flex-col space-y-4">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="bg-transparent border-b border-gray-800 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-primary transition-colors"
              />
              <button className="bg-primary hover:bg-primary/90 text-white rounded-full py-3 px-6 text-xs font-bold uppercase tracking-widest transition-all w-max shadow-[0_0_15px_rgba(255,0,122,0.3)]">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <Separator className="my-12 bg-gray-900" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600 font-medium">
          <p>Copyright © {new Date().getFullYear()} Mehfil. All rights reserved.</p>
          <div className="flex gap-8 uppercase tracking-wider">
            <Link href="/" className="hover:text-primary transition-colors">
              www.mehfil.com
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
