import { publicSiteOrigin } from "@/lib/site-origin";
import QRCode from "qrcode";

export function GET(request: Request) {
  const background =
    new URL(request.url).searchParams.get("surface") === "soft"
      ? "#f6f6f9"
      : "#ffffff";
  const source = new URL(request.url);
  const target = new URL("/download", publicSiteOrigin(request.url));
  for (const key of ["country", "lang"]) {
    const value = source.searchParams.get(key);
    if (value && /^[a-z]{2}$/.test(value)) target.searchParams.set(key, value);
  }
  const destination = target.href;
  const { modules } = QRCode.create(destination, {
    errorCorrectionLevel: "H",
  });
  const size = modules.size;
  const finders = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ];
  const cells: string[] = [];
  // Match the center mark's footprint, including a clear margin around it.
  const centerSize = (Math.ceil(size * 0.29) | 1) - 2;
  const centerInset = (size - centerSize) / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (
        x >= centerInset && x < centerInset + centerSize &&
        y >= centerInset && y < centerInset + centerSize
      ) continue;
      if (
        finders.some(
          ([left, top]) => x >= left && x < left + 7 && y >= top && y < top + 7,
        )
      )
        continue;
      if (modules.get(y, x))
        cells.push(`<circle cx="${x + 0.5}" cy="${y + 0.5}" r="0.5"/>`);
    }
  }
  const corners = finders
    .map(
      ([x, y]) =>
        `<rect x="${x}" y="${y}" width="7" height="7" rx="2"/>
     <rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="1.2" fill="${background}"/>
     <rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="0.65"/>`,
    )
    .join("");
  // The surrounding card supplies the quiet zone; match its surface color.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="202" height="202" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" fill="${background}"/><g fill="#ff00ff">${cells.join("")}${corners}</g></svg>`;
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
