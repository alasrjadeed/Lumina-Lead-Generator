import pkg from "whatsapp-web.js";
const { Client, LocalAuth, MessageMedia } = pkg;

class WhatsAppService {
  constructor() {
    this.client = null;
    this.status = "disconnected";
    this.io = null;
  }

  async initialize(io) {
    this.io = io;

    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: "./whatsapp-auth" }),
      puppeteer: {
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    });

    this.client.on("qr", (qr) => {
      this.status = "waiting_qr";
      console.log("[WhatsApp] QR code received");
      if (this.io) {
        this.io.emit("whatsapp:qr", qr);
      }
    });

    this.client.on("ready", () => {
      this.status = "connected";
      console.log("[WhatsApp] Client is ready");
      if (this.io) {
        this.io.emit("whatsapp:ready");
      }
    });

    this.client.on("authenticated", () => {
      console.log("[WhatsApp] Authenticated");
    });

    this.client.on("auth_failure", (msg) => {
      this.status = "auth_failure";
      console.error("[WhatsApp] Auth failure:", msg);
      if (this.io) {
        this.io.emit("whatsapp:auth_failure", msg);
      }
    });

    this.client.on("disconnected", (reason) => {
      this.status = "disconnected";
      console.log("[WhatsApp] Disconnected:", reason);
      if (this.io) {
        this.io.emit("whatsapp:disconnected", reason);
      }
    });

    this.client.on("message", (msg) => {
      this.handleIncomingMessage(msg);
    });

    await this.client.initialize();
  }

  async sendMessage(phone, message) {
    if (this.status !== "connected") {
      throw new Error("WhatsApp client is not connected");
    }

    const chatId = phone.includes("@c.us") ? phone : `${phone}@c.us`;
    const result = await this.client.sendMessage(chatId, message);
    return result;
  }

  async sendMedia(phone, mediaUrl, caption = "") {
    if (this.status !== "connected") {
      throw new Error("WhatsApp client is not connected");
    }

    const chatId = phone.includes("@c.us") ? phone : `${phone}@c.us`;
    const media = await MessageMedia.fromUrl(mediaUrl);
    const result = await this.client.sendMessage(chatId, media, { caption });
    return result;
  }

  async handleIncomingMessage(msg) {
    try {
      const phone = msg.from.replace("@c.us", "");
      const body = msg.body || "";
      const contact = await msg.getContact();
      const contactName = contact.pushname || contact.name || "Unknown";

      console.log(`[WhatsApp] Incoming from ${phone} (${contactName}): ${body}`);

      const event = {
        phone,
        from: msg.from,
        body,
        contactName,
        timestamp: msg.timestamp,
        id: msg.id._serialized,
        isGroup: msg.isGroup,
        hasMedia: msg.hasMedia,
      };

      if (this.io) {
        this.io.emit("whatsapp:message", event);
      }

      return event;
    } catch (error) {
      console.error("[WhatsApp] Error handling incoming message:", error);
    }
  }

  getStatus() {
    return {
      status: this.status,
      info: this.client?.info || null,
    };
  }
}

export default new WhatsAppService();
