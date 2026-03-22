import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, Phone, MessageSquare, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="bg-[#050505] min-h-screen text-white pb-20 pt-20">
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
          <h4 className="text-primary text-xs font-bold tracking-[0.3em] uppercase mb-4">[Communication]</h4>
          <h1 className="text-5xl sm:text-7xl font-black mb-4 uppercase tracking-tighter">
            Get in <span className="font-cursive text-primary text-6xl sm:text-8xl lowercase align-middle drop-shadow-[0_0_15px_rgba(255,0,122,0.5)]">touch</span>
          </h1>
          <p className="text-sm text-gray-400 max-w-xl mx-auto font-medium mt-6">
            Have questions, feedback, or want to partner with us? We&apos;d love to hear from you. Drop us a line below.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            {[
              { icon: <Mail className="h-5 w-5" />, label: "Email", value: "hello@mehfil.in", href: "mailto:hello@mehfil.in" },
              { icon: <Phone className="h-5 w-5" />, label: "Phone", value: "+91 98765 43210", href: "tel:+919876543210" },
              { icon: <MapPin className="h-5 w-5" />, label: "Address", value: "Mumbai, Maharashtra, India" },
              { icon: <Clock className="h-5 w-5" />, label: "Hours", value: "Mon – Sat, 10am – 7pm IST" },
            ].map((item, i) => (
              <Card key={i} className="bg-[#0A0D15] border-gray-800 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 flex items-center gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="font-bold text-sm text-white hover:text-primary transition-colors">{item.value}</a>
                    ) : (
                      <p className="font-bold text-sm text-white">{item.value}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3 bg-[#0A0D15] border border-gray-800 rounded-xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-8">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-black uppercase tracking-wider">Send a message</h2>
            </div>
            
            <form className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2 block">Your Name</label>
                  <input type="text" placeholder="e.g. Aisha Sharma" className="w-full rounded bg-[#050505] border border-gray-800 px-4 py-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600" />
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2 block">Email</label>
                  <input type="email" placeholder="aisha@example.com" className="w-full rounded bg-[#050505] border border-gray-800 px-4 py-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2 block">Subject</label>
                <input type="text" placeholder="What is this regarding?" className="w-full rounded bg-[#050505] border border-gray-800 px-4 py-4 text-sm focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600" />
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 mb-2 block">Message</label>
                <textarea rows={5} placeholder="Tell us more..." className="w-full rounded bg-[#050505] border border-gray-800 px-4 py-4 text-sm resize-none focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600" />
              </div>
              
              <Button type="button" className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 text-xs uppercase tracking-[0.2em] font-bold shadow-[0_0_20px_rgba(255,0,122,0.3)] mt-4">
                Send Message
              </Button>
              <p className="text-[10px] font-bold tracking-widest uppercase text-center text-gray-600 mt-4">We typically respond within 24 hours.</p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
