// server/routes/webhook.ts
import express from "express";

const router = express.Router();

router.post("/webhooks/xendit", express.json(), (req, res) => {
  const event = req.body;
  console.log("Xendit webhook:", event);

  if (event.status === "PAID") {
    // ✅ update order in DB
  }

  res.sendStatus(200);
});

export default router;
