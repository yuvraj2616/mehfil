"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/hooks/use-user";
import clientApi from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Sparkles,
  FileText,
  MapPin,
  Ticket,
  Image,
  Eye,
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Save,
  Loader2,
} from "lucide-react";
import Link from "next/link";

const steps = [
  { id: 0, label: "INFO", icon: <FileText className="h-4 w-4" /> },
  { id: 1, label: "VENUE", icon: <MapPin className="h-4 w-4" /> },
  { id: 2, label: "TICKETS", icon: <Ticket className="h-4 w-4" /> },
  { id: 3, label: "MEDIA", icon: <Image className="h-4 w-4" /> },
  { id: 4, label: "REVIEW", icon: <Eye className="h-4 w-4" /> },
];

const categories = [
  "poetry", "music", "dance", "theater", "comedy", "literary", "cultural",
];

interface TicketTier {
  name: string;
  price: number;
  quantity: number;
}

interface Artist {
  name: string;
  role: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useUser();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("cultural");
  const [tags, setTags] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [venueCity, setVenueCity] = useState("");
  const [venueCapacity, setVenueCapacity] = useState("");

  const [tickets, setTickets] = useState<TicketTier[]>([
    { name: "General", price: 0, quantity: 100 },
  ]);

  const [artists, setArtists] = useState<Artist[]>([]);
  const [bannerUrl, setBannerUrl] = useState("");
  const [publishStatus, setPublishStatus] = useState("draft");

  function addTicketTier() {
    setTickets([...tickets, { name: "", price: 0, quantity: 50 }]);
  }

  function removeTicketTier(index: number) {
    setTickets(tickets.filter((_, i) => i !== index));
  }

  function updateTicket(index: number, field: keyof TicketTier, value: string | number) {
    const updated = [...tickets];
    if (field === "price" || field === "quantity") {
      updated[index][field] = Number(value);
    } else {
      updated[index][field] = value as string;
    }
    setTickets(updated);
  }

  function addArtist() {
    setArtists([...artists, { name: "", role: "" }]);
  }

  function removeArtist(index: number) {
    setArtists(artists.filter((_, i) => i !== index));
  }

  function updateArtist(index: number, field: keyof Artist, value: string) {
    const updated = [...artists];
    updated[index][field] = value;
    setArtists(updated);
  }

  async function handleSubmit() {
    if (!title.trim()) {
      toast.error("Please add an event title");
      setStep(0);
      return;
    }

    setSaving(true);
    try {
      const body = {
        title,
        description,
        category,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        date_time: {
          start: startDate || null,
          end: endDate || null,
        },
        venue: {
          name: venueName,
          address: venueAddress,
          city: venueCity,
          capacity: venueCapacity ? parseInt(venueCapacity) : null,
        },
        ticketing: tickets.filter((t) => t.name.trim()),
        artists: artists.filter((a) => a.name.trim()),
        media: {
          banner: bannerUrl || null,
        },
        status: publishStatus,
      };

      const data = await clientApi.post("/events", body);

      if (!data?.event) {
        throw new Error("Failed to create event");
      }

      toast.success(
        publishStatus === "published"
          ? "Event published successfully!"
          : "Event saved as draft!"
      );
      router.push(`/events/${data.event.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
    setSaving(false);
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !["organizer", "admin"].includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-8 border border-primary/20">
          <Sparkles className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-wider mb-4">Access Restricted</h2>
        <p className="text-gray-400 mb-8 font-medium">
          Only mapped organizers and admins can host events on the network.
        </p>
        <Link href="/events">
          <Button variant="outline" className="border-gray-800 text-white hover:bg-white hover:text-black rounded-full px-8 py-6 text-xs uppercase tracking-widest font-bold">Browse Events</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white py-24 px-4 relative">
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/dashboard/organizer"
            className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.2em] text-gray-500 hover:text-white mb-6 transition-colors border border-gray-800 px-4 py-2 rounded-full"
          >
            <ArrowLeft className="h-3 w-3" />
            Dashboard
          </Link>
          <h1 className="text-5xl font-black uppercase tracking-tighter">
            Build <span className="text-primary font-cursive text-6xl lowercase align-middle">experience</span>
          </h1>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-4 scrollbar-hide">
          {steps.map((s) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-full text-[10px] font-bold tracking-[0.2em] transition-all shadow-lg ${
                step === s.id
                  ? "bg-primary text-black shadow-[0_0_20px_rgba(255,0,122,0.4)] border border-primary"
                  : s.id < step
                  ? "bg-[#111] text-primary border border-primary/30"
                  : "bg-[#0A0D15] text-gray-500 hover:text-white hover:bg-[#151515] border border-gray-800"
              }`}
            >
              {s.icon}
              <span className="hidden sm:inline whitespace-nowrap">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Step Content */}
        <Card className="bg-[#0A0D15] border-gray-800 rounded-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-600 to-primary" />
          <CardContent className="p-8 sm:p-12">
            {/* Step 0: Basic Info */}
            {step === 0 && (
              <div className="space-y-8 animate-fade-in">
                <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 flex items-center gap-2 pb-6 border-b border-gray-800">
                  <FileText className="h-4 w-4 text-primary" />
                  [ Primary Config ]
                </h2>

                <div className="space-y-3">
                  <Label htmlFor="title" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Event Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Neon Nights - Underground"
                    className="bg-[#050505] border-gray-800 focus-visible:ring-primary/50 text-white h-14 font-bold text-lg px-4"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Set the stage. Tell them why they must attend."
                    className="bg-[#050505] border-gray-800 focus-visible:ring-primary/50 text-white min-h-[200px] resize-none px-4 py-4"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Category</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v ?? "cultural")}>
                      <SelectTrigger className="bg-[#050505] border-gray-800 h-14 px-4 font-bold uppercase tracking-wider">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A0D15] border-gray-800 text-white">
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat} className="font-bold uppercase tracking-wider focus:bg-primary focus:text-black cursor-pointer py-3">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="tags" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Tags (csv)</Label>
                    <Input
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="rave, 18+, techno"
                      className="bg-[#050505] border-gray-800 focus-visible:ring-primary/50 text-white h-14 px-4 font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Date & Venue */}
            {step === 1 && (
              <div className="space-y-8 animate-fade-in">
                <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 flex items-center gap-2 pb-6 border-b border-gray-800">
                  <MapPin className="h-4 w-4 text-primary" />
                  [ Coordinates ]
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="startDate" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Time Zero (Start)</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-[#050505] border-gray-800 focus-visible:ring-primary/50 text-white h-14 px-4"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="endDate" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Time End</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-[#050505] border-gray-800 focus-visible:ring-primary/50 text-white h-14 px-4"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="venueName" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Venue Core Name</Label>
                  <Input
                    id="venueName"
                    value={venueName}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="e.g. The Warehouse"
                    className="bg-[#050505] border-gray-800 focus-visible:ring-primary/50 text-white h-14 px-4 font-bold"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="venueAddress" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Full Address Array</Label>
                  <Input
                    id="venueAddress"
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    placeholder="Street logic"
                    className="bg-[#050505] border-gray-800 focus-visible:ring-primary/50 text-white h-14 px-4"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="venueCity" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">City</Label>
                    <Input
                      id="venueCity"
                      value={venueCity}
                      onChange={(e) => setVenueCity(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="bg-[#050505] border-gray-800 focus-visible:ring-primary/50 text-white h-14 px-4 font-bold uppercase"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="venueCapacity" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Maximum Capacity</Label>
                    <Input
                      id="venueCapacity"
                      type="number"
                      value={venueCapacity}
                      onChange={(e) => setVenueCapacity(e.target.value)}
                      placeholder="e.g. 500"
                      className="bg-[#050505] border-gray-800 focus-visible:ring-primary/50 text-white h-14 px-4"
                    />
                  </div>
                </div>

                {/* Artists */}
                <div className="pt-8 border-t border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <Label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Lineup / Entities</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addArtist}
                      className="border-primary text-primary hover:bg-primary hover:text-black rounded-full px-4 py-2 text-[10px] uppercase font-bold tracking-widest gap-2"
                    >
                      <Plus className="h-3 w-3" />
                      Add Entity
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {artists.map((artist, i) => (
                      <div key={i} className="flex gap-4 items-center bg-[#050505] p-2 rounded-lg border border-gray-800">
                        <Input
                          value={artist.name}
                          onChange={(e) => updateArtist(i, "name", e.target.value)}
                          placeholder="Name"
                          className="bg-transparent border-none focus-visible:ring-0 text-white font-bold"
                        />
                        <div className="w-px h-6 bg-gray-800" />
                        <Input
                          value={artist.role}
                          onChange={(e) => updateArtist(i, "role", e.target.value)}
                          placeholder="Role (e.g. DJ)"
                          className="bg-transparent border-none focus-visible:ring-0 text-primary text-xs uppercase tracking-widest"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeArtist(i)}
                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-full w-10 h-10 shrink-0 mr-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {artists.length === 0 && (
                      <div className="text-center py-6 bg-[#050505] border border-gray-800 border-dashed rounded-xl">
                        <p className="text-[10px] font-bold tracking-widest uppercase text-gray-600">No entities drafted.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Tickets */}
            {step === 2 && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex items-center justify-between pb-6 border-b border-gray-800">
                  <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-primary" />
                    [ Access Tiers ]
                  </h2>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTicketTier}
                    className="border-primary text-primary hover:bg-primary hover:text-black rounded-full px-4 py-2 text-[10px] uppercase font-bold tracking-widest gap-2"
                  >
                    <Plus className="h-3 w-3" />
                    New Tier
                  </Button>
                </div>

                <div className="space-y-6">
                  {tickets.map((tier, i) => (
                    <div
                      key={i}
                      className="p-6 rounded-2xl bg-[#050505] border border-gray-800 relative group transition-colors hover:border-primary/50"
                    >
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
                        <Badge variant="outline" className="text-[10px] font-black tracking-widest uppercase text-white border-primary/50 bg-primary/10 px-3 py-1">
                          Phase {i + 1}
                        </Badge>
                        {tickets.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeTicketTier(i)}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 text-[10px] uppercase tracking-widest font-bold h-8 flex items-center gap-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Purge
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2.5">
                          <Label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Class Name</Label>
                          <Input
                            value={tier.name}
                            onChange={(e) => updateTicket(i, "name", e.target.value)}
                            placeholder="e.g. VIP / Standard"
                            className="bg-[#111] border-gray-800 focus-visible:ring-primary/50 text-white h-12 font-bold uppercase tracking-wider"
                          />
                        </div>
                        <div className="space-y-2.5">
                          <Label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Price (INR)</Label>
                          <Input
                            type="number"
                            value={tier.price}
                            onChange={(e) => updateTicket(i, "price", e.target.value)}
                            min={0}
                            className="bg-[#111] border-gray-800 focus-visible:ring-primary/50 text-white h-12"
                          />
                        </div>
                        <div className="space-y-2.5">
                          <Label className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Inventory</Label>
                          <Input
                            type="number"
                            value={tier.quantity}
                            onChange={(e) => updateTicket(i, "quantity", e.target.value)}
                            min={1}
                            className="bg-[#111] border-gray-800 focus-visible:ring-primary/50 text-white h-12"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {tickets.length === 0 && (
                    <div className="text-center py-12 bg-[#050505] border border-gray-800 border-dashed rounded-2xl">
                      <p className="text-[10px] font-bold tracking-widest uppercase text-gray-600">No access parameters set.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Media */}
            {step === 3 && (
              <div className="space-y-8 animate-fade-in">
                <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 flex items-center gap-2 pb-6 border-b border-gray-800">
                  <Image className="h-4 w-4 text-primary" />
                  [ Visual Identity ]
                </h2>

                <div className="space-y-3">
                  <Label htmlFor="bannerUrl" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Remote Banner URL</Label>
                  <Input
                    id="bannerUrl"
                    value={bannerUrl}
                    onChange={(e) => setBannerUrl(e.target.value)}
                    placeholder="https://content.com/image.jpg"
                    className="bg-[#050505] border-gray-800 focus-visible:ring-primary/50 text-white h-14 px-4 font-mono text-xs"
                  />
                  <p className="text-[9px] uppercase tracking-widest text-primary font-bold mt-2">
                    Paste an image URL to act as the primary key art for this event.
                  </p>
                </div>

                {bannerUrl && (
                  <div className="rounded-2xl overflow-hidden border border-gray-800 bg-[#050505] p-2 mt-8">
                    <img
                      src={bannerUrl}
                      alt="Banner preview"
                      className="w-full h-64 object-cover rounded-xl filter grayscale contrast-125"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-12 animate-fade-in">
                <h2 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 flex items-center gap-2 pb-6 border-b border-gray-800">
                  <Eye className="h-4 w-4 text-primary" />
                  [ Final Initialization ]
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 text-sm bg-[#050505] p-8 rounded-2xl border border-gray-800">
                  <div className="space-y-8">
                    <div>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mb-2">Title Id</p>
                      <p className="font-black text-2xl uppercase tracking-tighter">{title || "[ NULL ]"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mb-2">Category Vector</p>
                      <Badge className="bg-primary/20 text-primary border-primary/30 uppercase text-[9px] font-black tracking-widest px-3 py-1">{category}</Badge>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mb-2">T-Zero</p>
                      <p className="font-bold text-gray-300">
                        {startDate
                          ? new Date(startDate).toLocaleString("en-IN")
                          : "[ NULL ]"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mb-2">Location Node</p>
                      <p className="font-bold text-gray-300 uppercase tracking-wider">
                        {venueName ? `${venueName}, ${venueCity}` : "[ NULL ]"}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mb-4">Access Protocol</p>
                      <div className="space-y-3">
                        {tickets.filter(t => t.name).map((t, i) => (
                          <div key={i} className="flex justify-between items-center bg-[#111] px-4 py-2 rounded border border-gray-800">
                            <span className="font-black uppercase text-xs tracking-wider">{t.name}</span>
                            <span className="text-primary font-bold">₹{t.price} <span className="text-gray-500 font-normal ml-1">× {t.quantity}</span></span>
                          </div>
                        ))}
                        {!tickets.some(t => t.name) && <p className="text-gray-600 font-bold uppercase text-xs tracking-widest">[ NULL ]</p>}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mb-4">Entities</p>
                      <div className="flex flex-wrap gap-2">
                        {artists.filter(a => a.name).map((a, i) => (
                          <Badge key={i} variant="outline" className="border-gray-700 bg-[#111] text-gray-300 uppercase text-[9px] font-bold tracking-widest px-3 py-1">
                            {a.name} {a.role && <span className="text-primary ml-1 capitalize"> /{a.role}</span>}
                          </Badge>
                        ))}
                        {!artists.some(a => a.name) && <p className="text-gray-600 font-bold uppercase text-xs tracking-widest">[ NULL ]</p>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-800">
                  <Label className="text-[10px] text-gray-400 font-bold tracking-[0.3em] uppercase mb-4 block">State Assignment</Label>
                  <div className="flex flex-wrap gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPublishStatus("draft")}
                      className={`h-14 px-8 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                        publishStatus === "draft" 
                          ? "bg-gray-100 text-black border-transparent shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
                          : "bg-[#050505] text-gray-400 border-gray-800 hover:text-white"
                      }`}
                    >
                      Hold in Draft
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setPublishStatus("published")}
                      className={`h-14 px-8 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                        publishStatus === "published"
                          ? "bg-primary text-black shadow-[0_0_30px_rgba(255,0,122,0.4)] hover:bg-primary/90 hover:scale-105"
                          : "bg-[#050505] text-primary border border-primary/30 hover:border-primary"
                      }`}
                    >
                      Deploy Live
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-800">
              <Button
                variant="outline"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
                className="bg-[#050505] border-gray-800 text-white rounded-full px-6 h-12 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
              >
                <ArrowLeft className="mr-3 h-4 w-4" />
                Reverse
              </Button>

              {step < 4 ? (
                <Button
                  onClick={() => setStep((s) => Math.min(4, s + 1))}
                  className="bg-primary hover:bg-primary/90 text-black rounded-full px-8 h-12 text-[10px] uppercase tracking-[0.2em] font-black shadow-[0_0_20px_rgba(255,0,122,0.3)]"
                >
                  Proceed
                  <ArrowRight className="ml-3 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-white hover:bg-gray-200 text-black rounded-full px-10 h-12 text-[10px] uppercase tracking-[0.2em] font-black shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-transform hover:scale-105"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-3 h-4 w-4 animate-spin text-primary" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Save className="mr-3 h-4 w-4 text-primary" />
                      {publishStatus === "published" ? "Commit to Live" : "Save Offline"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
