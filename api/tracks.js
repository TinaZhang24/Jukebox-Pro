const express = require("express");
const router = express.Router();
module.exports = router;

const prisma = require("../prisma");

// GET /tracks sends array of all tracks
router.get("/", async (req, res, next) => {
  try {
    const tracks = await prisma.track.findMany();
    res.json(tracks);
  } catch (e) {
    next(e);
  }
});

// GET /tracks/:id sends specific track
router.get("/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    // `id` has to be converted into a number before looking for it!
    const track = await prisma.track.findUnique({
      where: { id: +id },
      include: {
        playlists: true,
      },
    });
    if (track) {
      res.json(track);
    } else {
      next({ status: 404, message: `Track with id ${id} does not exist.` });
    }
  } catch (e) {
    next(e);
  }
});
