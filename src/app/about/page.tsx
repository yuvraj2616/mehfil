import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Heart, Users, Globe, Music, BookOpen, Drama } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="bg-[#050505] min-h-screen text-white pb-20 pt-20">
      {/* Hero */}
      <section className="relative py-24 sm:py-32 overflow-hidden flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2000')] bg-cover bg-center opacity-10 mix-blend-screen" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
        
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs text-primary font-bold tracking-widest uppercase mb-6">
            <Heart className="h-3 w-3" /> Our Story
          </div>
          <h1 className="text-5xl sm:text-7xl font-black mb-6 uppercase tracking-tight">
            Celebrating <span className="font-cursive text-primary text-6xl sm:text-8xl lowercase block mt-2 drop-shadow-[0_0_15px_rgba(255,0,122,0.5)]">heritage</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Mehfil is the premier platform for discovering, organizing, and celebrating cultural events — from intimate poetry recitals to grand musical extravaganzas.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Sparkles className="h-6 w-6" />, title: "Our Mission", desc: "To make cultural experiences accessible to everyone, bridging the gap between artists, organizers, and audiences through technology." },
            { icon: <Users className="h-6 w-6" />, title: "Community First", desc: "We believe culture thrives in community. Mehfil connects thousands of art lovers with curated events across the globe." },
            { icon: <Globe className="h-6 w-6" />, title: "Preserving Art", desc: "From classical traditions to contemporary underground scenes — we champion every form of expression." },
          ].map((item, i) => (
            <Card key={i} className="bg-[#0A0D15] border-gray-800 hover:border-primary/50 transition-colors shadow-lg">
              <CardContent className="p-8 text-center flex flex-col items-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary mb-6 shadow-[0_0_20px_rgba(255,0,122,0.2)]">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 uppercase tracking-wider">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-24">
        <div className="text-center mb-12">
          <h4 className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-4">[Experiences]</h4>
          <h2 className="text-4xl sm:text-5xl font-black">What We Celebrate</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {[
            { icon: <Music className="h-6 w-6" />, label: "Live Music" },
            { icon: <BookOpen className="h-6 w-6" />, label: "Poetry" },
            { icon: <Drama className="h-6 w-6" />, label: "Theater" },
            { icon: <Heart className="h-6 w-6" />, label: "Comedy" },
            { icon: <Sparkles className="h-6 w-6" />, label: "Festivals" },
            { icon: <Globe className="h-6 w-6" />, label: "Galas" },
          ].map((cat, i) => (
            <div key={i} className="flex flex-col items-center gap-4 p-8 rounded-xl bg-[#0A0D15] border border-gray-800 hover:bg-[#111] transition-all group">
              <div className="text-gray-500 group-hover:text-primary transition-colors">{cat.icon}</div>
              <span className="text-sm font-bold uppercase tracking-widest text-center">{cat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <div className="bg-gradient-to-tr from-primary/20 to-purple-900/20 border border-primary/30 rounded-2xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">Ready to experience culture?</h2>
            <p className="text-gray-300 mb-10 max-w-lg mx-auto text-sm">Browse upcoming events or start organizing your own unforgettable mehfil today.</p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/events">
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 py-6 text-xs uppercase tracking-[0.2em] font-bold shadow-[0_0_20px_rgba(255,0,122,0.4)] transition-transform hover:scale-105">
                  Explore Events
                </Button>
              </Link>
              <Link href="/auth">
                <Button variant="outline" className="border-gray-700 hover:border-white text-white hover:bg-white hover:text-black rounded-full px-10 py-6 text-xs uppercase tracking-[0.2em] font-bold bg-transparent transition-transform hover:scale-105">
                  Join Platform
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
