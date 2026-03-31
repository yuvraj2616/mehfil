import { Router, Request, Response } from "express";
import { createAuthClient, supabasePublic } from "../supabaseClient";
import { requireAuth } from "../middleware/auth";

const router = Router();

/**
 * POST /follows/:userId
 * Toggle follow/unfollow. Returns { following: true/false }
 */
router.post("/:userId", requireAuth, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthClient(req.token!);
    const currentUser = req.user!;
    const targetUserId = req.params.userId;

    if (currentUser.id === targetUserId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    // Check if already following
    const { data: existing } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", currentUser.id)
      .eq("following_id", targetUserId)
      .single();

    if (existing) {
      // UNFOLLOW: delete the row
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", currentUser.id)
        .eq("following_id", targetUserId);

      if (error) throw error;
      return res.json({ following: false, message: "Unfollowed successfully" });
    } else {
      // FOLLOW: insert a new row
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: currentUser.id, following_id: targetUserId });

      if (error) throw error;
      return res.json({ following: true, message: "Following successfully" });
    }
  } catch (error: any) {
    console.error("Follow toggle error:", error);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /follows/status/:userId
 * Check if current user follows the target user
 * Returns { following: boolean, followersCount: number, followingCount: number }
 */
router.get("/status/:userId", requireAuth, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthClient(req.token!);
    const currentUser = req.user!;
    const targetUserId = req.params.userId;

    const [followCheck, profileData] = await Promise.all([
      supabase
        .from("follows")
        .select("id")
        .eq("follower_id", currentUser.id)
        .eq("following_id", targetUserId)
        .single(),
      supabase
        .from("profiles")
        .select("followers_count, following_count")
        .eq("user_id", targetUserId)
        .single(),
    ]);

    return res.json({
      following: !!followCheck.data,
      followersCount: profileData.data?.followers_count || 0,
      followingCount: profileData.data?.following_count || 0,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /follows/followers/:userId
 * List all followers of a user (public)
 */
router.get("/followers/:userId", async (req: Request, res: Response) => {
  try {
    const supabase = req.token ? createAuthClient(req.token) : supabasePublic;
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("follows")
      .select("follower:profiles!follower_id(user_id, name, avatar, role), created_at")
      .eq("following_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return res.json({ followers: data?.map(f => f.follower) || [] });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * GET /follows/following/:userId
 * List all users that a given user follows (public)
 */
router.get("/following/:userId", async (req: Request, res: Response) => {
  try {
    const supabase = req.token ? createAuthClient(req.token) : supabasePublic;
    const { userId } = req.params;

    const { data, error } = await supabase
      .from("follows")
      .select("following:profiles!following_id(user_id, name, avatar, role), created_at")
      .eq("follower_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return res.json({ following: data?.map(f => f.following) || [] });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
