import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { Play, Calendar, MapPin, IndianRupee } from "lucide-react";

/* ============================================================ */
/* DATA FOR STATIC SECTIONS                                     */
/* ============================================================ */

const platformMetrics = [
  { value: "2.1M", label: "TICKETS SOLD" },
  { value: "4,500+", label: "LIVE EVENTS" },
  { value: "850K", label: "HAPPY ATTENDEES" },
  { value: "12K", label: "ORGANIZERS" },
];

const organizerBenefits = [
  { price: "0", title: "Starter", features: ["Free for free events", "Basic ticketing", "Standard analytics", "24hr Payouts"], featured: false },
  { price: "29", title: "Pro", features: ["Custom branding", "Targeted marketing", "Priority support", "Instant Payouts"], featured: true },
  { price: "Custom", title: "Enterprise", features: ["Dedicated manager", "White-label solution", "API Access", "Custom contracts"], featured: false },
];

/* ============================================================ */
/* PAGE COMPONENT                                                */
/* ============================================================ */

export default async function HomePage() {
  const supabase = await createClient();
  
  // Fetch real events for the attendee discovery section
  const { data: popularEvents } = await supabase
    .from("events")
    .select("*, organizer:profiles!organizer_id(user_id, name)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(4);

  const events = popularEvents || [];
  
  return (
    <div className="bg-[#050505] min-h-screen text-white overflow-hidden pb-0">
      
      {/* ============================================================ */}
      {/* 1. HERO SECTION (Dual Marketplace Focus)                     */}
      {/* ============================================================ */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2000&auto=format&fit=crop" 
            alt="Crowd" 
            className="w-full h-full object-cover opacity-20 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/90 to-[#050505]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center mt-12">
          {/* Massive "M" and overlapping cursive font */}
          <div className="relative w-full flex justify-center mt-10 mb-8">
            <span className="text-[250px] leading-none font-black text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-90 tracking-tighter mix-blend-lighten">
              M
            </span>
            <h1 className="text-7xl sm:text-9xl md:text-[140px] font-cursive relative z-10 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] leading-[0.8] tracking-wider text-white rotate-[-2deg] mt-4">
              Mehfil
            </h1>
          </div>
          
          <p className="text-xl sm:text-2xl font-bold tracking-[0.2em] mb-12 uppercase text-gray-300">
            [Discover, Attend, Host]
          </p>

          <p className="max-w-2xl mx-auto text-sm text-gray-400 mb-10 leading-relaxed font-semibold">
            Your ultimate cultural passport. Find the most underground gigs, epic theater productions, and vibrant workshops in your city.
            Are you a creator? We give you the tools to sell tickets and scale your audience.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* CTA for Attendees */}
            <Link href="/events">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 py-6 text-xs uppercase tracking-[0.2em] font-bold shadow-[0_0_20px_rgba(255,0,122,0.4)] transition-all hover:-translate-y-1">
                EXPLORE EVENTS
              </Button>
            </Link>
            {/* CTA for Organizers */}
            <Link href="/dashboard/organizer/events/new">
              <Button variant="outline" className="border-gray-700 hover:border-white text-white hover:bg-white hover:text-black rounded-full px-10 py-6 text-xs uppercase tracking-[0.2em] font-bold bg-transparent transition-all">
                HOST AN EVENT
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. FOR ATTENDEES: TRENDING EVENTS                            */}
      {/* ============================================================ */}
      <section className="py-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 bg-[#050505]">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-4 border-b border-gray-800 pb-8">
          <div>
            <h4 className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-4">[Curated For You]</h4>
            <h2 className="text-4xl sm:text-5xl font-black">Trending This Week</h2>
          </div>
          <p className="text-gray-400 max-w-sm text-sm leading-relaxed mb-1 md:text-right">
            Grab your tickets before they sell out. From intimate poetry readings to massive techno raves, find your next unforgettable experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {events.length > 0 ? (
            events.map((event) => (
              <div key={event.id} className="group cursor-pointer bg-[#0A0D15] rounded-xl overflow-hidden border border-gray-800 hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 shadow-lg">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={event.media?.banner || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819"} 
                    alt={event.title} 
                    className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-gray-700">
                    <IndianRupee className="w-3 h-3 inline mr-1" />
                    {event.price > 0 ? event.price : 'FREE'}
                  </div>
                  <div className="absolute bottom-4 left-4 bg-primary text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-full shadow-lg">
                    {event.category || "EVENT"}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-gray-400">
                      <Calendar className="w-4 h-4 mr-3 text-primary" />
                      {new Date(event.start_date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center text-sm text-gray-400">
                      <MapPin className="w-4 h-4 mr-3 text-primary" />
                      <span className="truncate">{event.location?.venue_name || "Online Event"}</span>
                    </div>
                  </div>

                  <Link href={`/events/${event.id}`}>
                    <Button className="w-full bg-white text-black hover:bg-gray-200 uppercase tracking-widest text-xs font-bold rounded-full py-5">
                      GET TICKETS
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          ) : (
             <div className="col-span-full py-12 text-center text-gray-500 font-mono text-sm uppercase tracking-widest border border-dashed border-gray-800 rounded-lg">
               No events found right now. Check back later!
             </div>
          )}
        </div>
        
        <div className="mt-12 flex justify-center">
          <Link href="/events">
             <Button variant="outline" className="border-gray-700 hover:border-white text-white hover:bg-white hover:text-black rounded-full px-12 py-6 text-xs uppercase tracking-[0.2em] font-bold bg-transparent">
               VIEW ALL EVENTS
             </Button>
          </Link>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. PLATFORM PULSE & COMMUNITY                                */}
      {/* ============================================================ */}
      <section className="py-20 bg-[#0A0A10]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
          {/* Stats Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 gap-8">
            <h2 className="text-2xl sm:text-3xl font-bold max-w-md">
              A Massive Community of <span className="text-primary">Culture Seekers</span>
            </h2>
            <div className="flex items-center gap-6 sm:gap-10 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto">
              {platformMetrics.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center flex-shrink-0">
                  <span className="text-4xl lg:text-5xl font-black mb-2">{stat.value}</span>
                  <span className="text-[10px] md:text-xs text-primary font-bold tracking-widest uppercase text-center">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Huge Tinted Showcase Block */}
          <div className="relative w-full h-[500px] md:h-[600px] rounded-sm overflow-hidden group">
            <img 
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2" 
              alt="Audience Crowd" 
              className="w-full h-full object-cover mix-blend-overlay opacity-60 group-hover:scale-105 transition-transform duration-1000"
            />
            {/* The signature magenta/purple tint */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/80 to-purple-800/80 mix-blend-multiply" />
            <div className="absolute inset-0 bg-black/30" />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <h3 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-xl font-heading">
                Find Your Tribe
              </h3>
              <p className="text-sm font-semibold tracking-widest uppercase text-white/90 mb-10 max-w-2xl mx-auto px-4 shadow-black drop-shadow-md">
                MEHFIL CONNECTS PASSIONATE CREATORS WITH EAGER AUDIENCES ACROSS THE COUNTRY
              </p>
              
              <Link href="/about">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center cursor-pointer shadow-[0_0_30px_rgba(255,0,122,0.8)] hover:scale-110 transition-transform">
                  <Play className="h-8 w-8 text-white ml-2 fill-current" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. CREATOR SHOWCASE                                          */}
      {/* ============================================================ */}
      <section className="py-24 bg-[#0A0D15] relative overflow-hidden text-center z-10 border-y border-gray-900">
        {/* Faint word behind title */}
        <h2 className="absolute top-10 left-1/2 -translate-x-1/2 text-[150px] font-black text-white/5 uppercase select-none tracking-tighter">
          CREATORS
        </h2>
        
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h4 className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-4">[Meet the Makers]</h4>
          <h2 className="text-4xl sm:text-5xl font-black mb-6">Top Event Organizers</h2>
          <p className="text-gray-400 mb-20 max-w-md mx-auto text-sm leading-relaxed">
            Follow your favorite creators to get notified the second they drop new tickets. Meet the industry leaders revolutionizing events globally.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {events.slice(0, 4).map((e, idx) => {
              const placeholderImages = [
                "https://images.unsplash.com/photo-1520694478166-daaaaaec74b4",
                "https://images.unsplash.com/photo-1516280440502-12fc06d860e3",
                "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e",
                "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7"
              ];
              
              return (
                <div key={e.id} className="group cursor-pointer">
                  <div className="w-32 h-32 md:w-48 md:h-48 mx-auto rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors p-1">
                    <div className="w-full h-full rounded-full overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500">
                      <img src={placeholderImages[idx % 4]} alt="Organizer" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <h3 className="mt-6 text-lg font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{e.organizer?.name || "Acme Productions"}</h3>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-mono">15 Events Hosted</p>
                </div>
              );
            })}
          </div>
          
           <div className="pt-16 flex justify-center">
             <Button variant="outline" className="border-gray-700 hover:border-white text-white hover:bg-white hover:text-black rounded-full px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold bg-transparent">
               DISCOVER ALL ORGANIZERS
             </Button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. FOR ORGANIZERS: PLATFORM TOOLS                            */}
      {/* ============================================================ */}
      <section className="py-24 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center bg-[#050505] relative z-20">
        <h4 className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-4">Are you a creator?</h4>
        <h2 className="text-4xl sm:text-5xl font-black mb-6">Host on Mehfil</h2>
        <p className="text-gray-400 mb-16 max-w-lg mx-auto text-sm leading-relaxed">
          Stop struggling with outdated forms and payment gateways. We provide end-to-end tools to build your audience, sell tickets effortlessly, and manage RSVPs via mobile app.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {organizerBenefits.map((t) => (
            <div 
              key={t.title} 
              className={`p-8 flex flex-col items-center border rounded-xl ${t.featured ? 'bg-gradient-to-b from-[#111] to-[#9D50BB]/20 border-primary/50 shadow-[0_10px_40px_rgba(255,0,122,0.15)] transform -translate-y-2' : 'bg-[#0A0D15] border-gray-800 text-gray-300'} transition-transform duration-300 relative`}
            >
              <h3 className="text-3xl font-black mb-1">
                {t.title}
              </h3>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-6 ${t.featured ? 'text-primary' : 'text-gray-500'}`}>
                {t.price === "0" ? "[Free Forever]" : t.price === "Custom" ? "[Tailored]" : `[$${t.price} / MO]`}
              </p>
              
              <ul className="space-y-4 mb-10 w-full text-xs font-medium border-t border-b border-gray-800/50 py-6">
                {t.features.map((f, i) => (
                  <li key={i} className={`pb-4 border-b border-gray-800/50 last:border-0 last:pb-0 text-left flex items-start gap-2 ${t.featured ? 'text-white' : 'text-gray-400'}`}>
                    <span className="text-secondary mt-0.5">▪</span> {f}
                  </li>
                ))}
              </ul>
              
              <Button 
                variant={t.featured ? "default" : "outline"}
                className={`w-full mt-auto rounded-full py-6 text-xs font-bold uppercase tracking-widest ${t.featured ? 'bg-primary text-white shadow-[0_0_15px_rgba(255,0,122,0.4)] hover:bg-primary/80' : 'border-gray-700 bg-transparent hover:bg-gray-800'}`}
              >
                START CREATING
              </Button>
            </div>
          ))}
        </div>
      </section>
      
    </div>
  );
}
