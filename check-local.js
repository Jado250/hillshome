const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
(async () => {
  try {
    const tables = ["user", "serviceCategory", "service", "tour", "galleryItem",
      "serviceRequest", "quote", "siteSetting", "counter"];
    for (const t of tables) {
      const n = await p[t].count();
      console.log(t, n);
    }
  } catch (e) { console.log("ERR", e.message.split("\n")[0]); }
  await p.$disconnect();
  process.exit(0);
})();
