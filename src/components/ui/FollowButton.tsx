"use client";

/**
 * FollowButton Component
 * 
 * A smart toggle button that shows follow/unfollow state for any user.
 * Automatically fetches current follow status on mount and toggles on click.
 * 
 * Usage:
 *   <FollowButton targetUserId="some-uuid" targetName="DJ Arjun" />
 */

import { useState, useEffect } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import clientApi from "@/lib/client-api";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

interface FollowButtonProps {
  targetUserId: string;
  targetName?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  showCount?: boolean;
}

export function FollowButton({
  targetUserId,
  targetName = "them",
  className = "",
  variant = "outline",
  showCount = false,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if current user is logged in + fetch follow status
  useEffect(() => {
    async function initialize() {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);

      try {
        const data = await clientApi.get(`/follows/status/${targetUserId}`);
        setIsFollowing(data.following);
        setFollowersCount(data.followersCount);
      } catch {
        // User might not be logged in or this is a public view
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, [targetUserId]);

  async function handleToggle() {
    if (!isLoggedIn) {
      toast.error("Please sign in to follow artists and organizers");
      return;
    }

    setToggling(true);
    try {
      const data = await clientApi.post(`/follows/${targetUserId}`);
      setIsFollowing(data.following);
      setFollowersCount((prev) => data.following ? prev + 1 : Math.max(0, prev - 1));
      toast.success(data.following ? `Following ${targetName}!` : `Unfollowed ${targetName}`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update follow status");
    } finally {
      setToggling(false);
    }
  }

  if (loading) {
    return (
      <Button variant={variant} disabled className={`rounded-full ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleToggle}
        disabled={toggling}
        variant={isFollowing ? "default" : variant}
        className={`rounded-full transition-all duration-300 ${
          isFollowing
            ? "bg-white text-black hover:bg-red-500 hover:text-white hover:border-red-500 group"
            : "border-[#FF007A] text-[#FF007A] hover:bg-[#FF007A] hover:text-black"
        } ${className}`}
      >
        {toggling ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : isFollowing ? (
          <UserCheck className="h-4 w-4 mr-2 group-hover:hidden" />
        ) : (
          <UserPlus className="h-4 w-4 mr-2" />
        )}
        <span className="text-[10px] font-black uppercase tracking-[0.15em]">
          {toggling ? "..." : isFollowing ? "Following" : "Follow"}
        </span>
      </Button>

      {showCount && (
        <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">
          {followersCount.toLocaleString()} Followers
        </span>
      )}
    </div>
  );
}
