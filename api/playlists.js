const express = require("express");
const router = express.Router();
module.exports = router;

const prisma = require("../prisma");
// Notice we use {} when importing `authenticate` because it is not the only export
const { authenticate } = require("./auth");

// GET /playlists sends array of all playlists owned by the logged in user
router.get("/", authenticate, async (req, res, next) => {
  try {
    const playlists = await prisma.playlist.findMany({
      where: { ownerId: req.user.id },
    });
    res.json(playlists);
  } catch (e) {
    next(e);
  }
});

// POST /playlists creates a new playlist owned by the logged in user
router.post("/", authenticate, async (req, res, next) => {
  const { name, description, trackIds } = req.body;
  try {
    // How do we get the below line "mapping"?
    const tracks = trackIds.map((id) => ({ id }));
    const playlist = await prisma.playlist.create({
      data: {
        name,
        description,
        ownerId: req.user.id,
        // from parameter but not new posted, have to connect to foreigh module
        // Need further understanding for below line
        tracks: { connect: tracks },
      },
    });
    res.status(201).json(playlist);
  } catch (e) {
    next(e);
  }
});

// GET /playlists/:id sends specific playlist, including all tracks
router.get("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;
  try {
    const playlist = await prisma.playlist.findUniqueOrThrow({
      where: { id: +id },
      include: { tracks: true },
    });
    if (playlist) {
      res.json(playlist);
    } else {
      next({ status: 403, message: "Your requested playlist is forbidden." });
    }
  } catch (e) {
    next(e);
  }
});
