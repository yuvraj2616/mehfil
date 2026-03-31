import { Router, Request, Response } from "express";
import { createAuthClient } from "../supabaseClient";
import { requireAuth } from "../middleware/auth";

const router = Router();

// GET /profiles/me — get the current user's profile
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthClient(req.token!);
    const user = req.user!;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error || !profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    return res.json({ profile });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /profiles/me — update the current user's profile
router.put("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const supabase = createAuthClient(req.token!);
    const user = req.user!;

    const { name, phone, bio, city, state, country, avatar } = req.body;

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(country !== undefined && { country }),
        ...(avatar !== undefined && { avatar }),
      })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({ profile });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
