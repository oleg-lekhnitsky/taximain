// Run with Node and ffmpeg installed. Reuses the website's existing car artwork.
import sharp from "sharp";
import { spawn } from "node:child_process";
import { once } from "node:events";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

async function main() {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const output = path.join(root, "public/assets/social");
  await fs.mkdir(output, { recursive: true });
  const width = 1200,
    height = 800,
    fps = 30,
    seconds = 6;
  // Close-up composition: the rear wheel and door fill the frame,
  // with the front of the car continuing beyond the right edge.
  const carWidth = 2000,
    carHeight = Math.round((carWidth * 1632) / 4096),
    carTop = 10,
    restingLeft = 90;
  const wheelSize = Math.round(carWidth * 0.085);
  const car = await sharp(path.join(root, "public/assets/coverage/taxi.png"))
    .resize(carWidth, carHeight)
    .png()
    .toBuffer();
  const wheel = await sharp(path.join(root, "public/assets/coverage/wheel.png"))
    .resize(wheelSize, wheelSize)
    .png()
    .toBuffer();
  const cells = Array.from({ length: 6 }, (_, i) => {
    const x = (i % 3) * 400,
      y = Math.floor(i / 3) * 400;
    return `<rect x="${x}" y="${y}" width="400" height="400" fill="${((i % 3) + Math.floor(i / 3)) % 2 ? "#661aff" : "#ff00ff"}"/>`;
  }).join("");
  const background = await sharp(
    Buffer.from(`<svg width="1200" height="800">${cells}</svg>`),
  )
    .png()
    .toBuffer();
  const video = spawn(
    "ffmpeg",
    [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-f",
      "rawvideo",
      "-pixel_format",
      "rgb24",
      "-video_size",
      `${width}x${height}`,
      "-framerate",
      String(fps),
      "-i",
      "pipe:0",
      "-an",
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "20",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      path.join(output, "taxi-checkerboard.mp4"),
    ],
    { stdio: ["pipe", "ignore", "inherit"] },
  );
  const completion = once(video, "close");
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  for (let frame = 0; frame < fps * seconds; frame++) {
    const time = frame / fps;
    const left =
      time < 1.8
        ? -carWidth + (carWidth + restingLeft) * ease(time / 1.8)
        : time < 3.6
          ? restingLeft
          : restingLeft +
            (width - restingLeft) *
              Math.pow(Math.min(1, (time - 3.6) / 1.8), 2);
    const rotation = ((left - restingLeft) / (Math.PI * wheelSize)) * 360;
    const rotated = await sharp(wheel)
      .rotate(rotation, { background: "#00000000" })
      .png()
      .toBuffer();
    const m = await sharp(rotated).metadata();
    const rim = await sharp(rotated)
      .extract({
        left: Math.floor((m.width - wheelSize) / 2),
        top: Math.floor((m.height - wheelSize) / 2),
        width: wheelSize,
        height: wheelSize,
      })
      .png()
      .toBuffer();
    const vehicle = await sharp(car)
      .composite(
        [0.2803, 0.7451].map((x) => ({
          input: rim,
          left: Math.round(carWidth * x - wheelSize / 2),
          top: Math.round(carHeight * 0.6936 - wheelSize / 2),
        })),
      )
      .png()
      .toBuffer();
    const x = Math.round(left),
      visibleLeft = Math.max(0, x),
      visibleRight = Math.min(width, x + carWidth);
    const overlays =
      visibleRight > visibleLeft
        ? [
            {
              input: await sharp(vehicle)
                .extract({
                  left: Math.max(0, -x),
                  top: 0,
                  width: visibleRight - visibleLeft,
                  height: Math.min(carHeight, height - carTop),
                })
                .png()
                .toBuffer(),
              left: visibleLeft,
              top: carTop,
            },
          ]
        : [];
    const rendered = sharp(background).composite(overlays);
    if (frame === 75)
      await rendered
        .clone()
        .jpeg({ quality: 90 })
        .toFile(path.join(output, "taxi-checkerboard.jpg"));
    const raw = await rendered.removeAlpha().raw().toBuffer();
    if (!video.stdin.write(raw)) await once(video.stdin, "drain");
  }
  video.stdin.end();
  const [code] = await completion;
  if (code !== 0) throw new Error(`ffmpeg exited with ${code}`);
  console.log(
    "Created 6-second 1200×800 MP4 and JPEG preview in public/assets/social",
  );
}
main().catch((error) => {
  console.error(error);
  process.exit(1);
});
