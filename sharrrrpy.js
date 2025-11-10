import sharp from "sharp";

async function resize() {
  try {
    await sharp("./assets/adaptive-icon.png")
      .resize(1024, 1024)
      .toFile("./assets/adaptive-icon-1024.png");

    console.log("✅ Icon resized to 1024x1024 and saved as icon-1024.png");
  } catch (err) {
    console.error("❌ Error resizing image:", err);
  }
}

resize();
