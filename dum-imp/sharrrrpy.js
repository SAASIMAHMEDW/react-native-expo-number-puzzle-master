import sharp from "sharp";

async function resize(
  filePath = undefined,
  outputPath = undefined,
  options = {
    width: 1024,
    height: 1024,
    fit: "cover",
  }
) {
  if (!filePath || !outputPath) {
    console.error("❌ Missing file path or output path");
    return;
  }
  try {
    await sharp(filePath).resize(options).toFile(outputPath);

    console.log(`✅ Image resized to ${options.width}x${options.height}px`);
  } catch (err) {
    console.error("❌ Error resizing image:", err);
  }
}

resize("./assets/adaptive-icon.png", "./assets/adaptive-icon-1024.png", {
  width: 1024,
  height: 1024,
});
