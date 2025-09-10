"use client";

import React from "react";
import { createRoot } from "react-dom/client";
import { toJpeg } from "html-to-image";
import jsPDF from "jspdf";
import type { Startup } from "./api/contracts/startups";

type PdfOptions = {
  fileName?: string;
  logoUrl?: string;
  jpegQuality?: number;
  pixelRatio?: number;
};

const PDF_CSS = `
  .pdf {
    box-sizing: border-box;
    font: 14px/1.45 Arial, Helvetica, sans-serif;
    line-height: 1.45;
    color: #111827;
    background: #ffffff;
    width: 794px; /* ~A4 @96dpi */
    padding: 32px;
  }
  .pdf * { box-sizing: inherit; font: inherit; }

  .pdf-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    gap: 16px; margin-bottom: 24px;
  }
  .pdf-title { margin: 0; font-size: 24px; font-weight: 700; }
  .pdf-subtle { color: #6b7280; font-size: 14px; }
  .pdf-logo { height: 56px; width: auto; object-fit: contain; }

  .pdf-card { border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
  .pdf-section { padding: 20px 24px; }
  .pdf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; }

  .pdf-row { display: flex; justify-content: space-between; gap: 12px; min-width: 0; }
  .pdf-label {
    font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
    color: #6b7280; white-space: nowrap; flex-shrink: 0;
  }
  .pdf-value { font-size: 14px; text-align: right; word-break: break-word; flex: 1; }
  .pdf-heading {
    margin: 0 0 8px 0; font-size: 12px; font-weight: 600;
    letter-spacing: 0.04em; text-transform: uppercase; color: #6b7280;
  }
  .pdf-body { font-size: 14px; white-space: pre-wrap; }
  .pdf-link { color: #2563eb; text-decoration: underline; }
`;

function toDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d);
}

function formatDate(d: Date | string) {
  const date = toDate(d);
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function safeFileName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9\-_.]/g, "");
}

function prettyUrl(url?: string | null) {
  if (!url) return null;
  try {
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    const u = new URL(normalized);
    return { href: u.toString(), text: u.hostname + u.pathname };
  } catch {
    return { href: url, text: url };
  }
}

function StartupPdfTemplate(props: { s: Startup; logoUrl?: string }) {
  const { s, logoUrl } = props;
  const website = prettyUrl(s.websiteUrl);
  const social = prettyUrl(s.socialMediaUrl);

  const rows: Array<{ label: string; value: React.ReactNode }> = [
    { label: "ID", value: s.id },
    { label: "Name", value: s.name },
    { label: "Created", value: formatDate(s.createdAt) },
    ...(s.legalStatus ? [{ label: "Legal status", value: s.legalStatus }] : []),
    ...(s.projectStatus
      ? [{ label: "Project status", value: s.projectStatus }]
      : []),
    ...(s.sector ? [{ label: "Sector", value: s.sector }] : []),
    ...(s.maturity ? [{ label: "Maturity", value: s.maturity }] : []),
    ...(s.email ? [{ label: "Email", value: s.email }] : []),
    ...(s.phone ? [{ label: "Phone", value: s.phone }] : []),
    ...(s.address ? [{ label: "Address", value: s.address }] : []),
    ...(website
      ? [
          {
            label: "Website",
            value: (
              <a
                href={website.href}
                className="pdf-link"
                target="_blank"
                rel="noreferrer"
              >
                {website.text}
              </a>
            ),
          },
        ]
      : []),
    ...(social
      ? [
          {
            label: "Social",
            value: (
              <a
                href={social.href}
                className="pdf-link"
                target="_blank"
                rel="noreferrer"
              >
                {social.text}
              </a>
            ),
          },
        ]
      : []),
  ];

  return (
    <div id="pdf-root" className="pdf">
      <style>{PDF_CSS}</style>

      <div className="pdf-header">
        <div>
          <h1 className="pdf-title">{s.name}</h1>
          {s.description ? <p className="pdf-subtle">{s.description}</p> : null}
        </div>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo"
            className="pdf-logo"
            crossOrigin="anonymous"
          />
        ) : null}
      </div>

      <div className="pdf-card">
        <div className="pdf-section">
          <div className="pdf-grid">
            {rows.map((r, i) => (
              <div className="pdf-row" key={i}>
                <div className="pdf-label">{r.label}</div>
                <div className="pdf-value">{r.value}</div>
              </div>
            ))}
          </div>
        </div>

        {s.needs ? (
          <div
            className="pdf-section"
            style={{ borderTop: "1px solid #e5e7eb" }}
          >
            <h3 className="pdf-heading">Needs</h3>
            <p className="pdf-body">{s.needs}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function nextFrame() {
  return new Promise<void>((r) =>
    requestAnimationFrame(() => requestAnimationFrame(() => r())),
  );
}

async function waitForFonts(): Promise<FontFaceSet> {
  return document.fonts.ready;
}

async function waitForImages(root: HTMLElement) {
  const imgs = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    imgs.map(async (img) => {
      const el = img;
      if ("decode" in el && typeof el.decode === "function") {
        try {
          await el.decode();
          return;
        } catch {}
      }
      if (el.complete && el.naturalWidth) return;
      await new Promise<void>((res) => {
        el.addEventListener("load", () => res(), { once: true });
        el.addEventListener("error", () => res(), { once: true });
      });
    }),
  );
}

function dataUrlToImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => rej(new Error(`Failed to load image from data URL`));
    img.src = dataUrl;
  });
}

function sliceToPages(
  img: HTMLImageElement,
  contentWidthPx: number,
  contentHeightPx: number,
  pageWidthPt = 595.28,
  pageHeightPt = 841.89,
) {
  const pxToPt = 0.75;
  const scale = pageWidthPt / (contentWidthPx * pxToPt);
  const pageHeightPx = Math.floor(pageHeightPt / pxToPt / scale);

  const canvases: HTMLCanvasElement[] = [];
  let y = 0;
  while (y < contentHeightPx) {
    const sliceHeightPx = Math.min(pageHeightPx, contentHeightPx - y);
    const canvas = document.createElement("canvas");
    canvas.width = contentWidthPx;
    canvas.height = sliceHeightPx;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(
      img,
      0,
      y,
      contentWidthPx,
      sliceHeightPx,
      0,
      0,
      contentWidthPx,
      sliceHeightPx,
    );
    canvases.push(canvas);
    y += sliceHeightPx;
  }

  return { canvases, scale };
}

export async function generateStartupPdf(
  startup: Startup,
  opts: PdfOptions = {},
) {
  const fileName =
    opts.fileName ?? `${safeFileName(startup.name || "startup")}-profile.pdf`;

  const host = document.createElement("div");
  Object.assign(host.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: "794px",
    background: "#ffffff",
    color: "#000000",
    zIndex: "-1",
  });
  document.body.appendChild(host);

  const root = createRoot(host);
  root.render(<StartupPdfTemplate s={startup} logoUrl={opts.logoUrl} />);

  await nextFrame();
  await waitForFonts();
  await waitForImages(host);

  const content = host.querySelector<HTMLElement>("#pdf-root");
  if (!content) {
    throw new Error("Element #pdf-root not found");
  }
  const widthPx = content.offsetWidth;
  const heightPx = content.offsetHeight;

  const pixelRatio = opts.pixelRatio ?? (window.devicePixelRatio > 1 ? 2 : 1);
  const dataUrl = await toJpeg(content, {
    pixelRatio,
    backgroundColor: "#ffffff",
    cacheBust: true,
    skipFonts: true,
    style: {
      font: "14px/1.45 Arial, Helvetica, sans-serif",
    },
  });

  const img = await dataUrlToImage(dataUrl);
  const { canvases } = sliceToPages(
    img,
    widthPx * pixelRatio,
    heightPx * pixelRatio,
  );

  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait" });
  const pageWidthPt = pdf.internal.pageSize.getWidth();
  const pageHeightPt = pdf.internal.pageSize.getHeight();

  canvases.forEach((canvas, idx) => {
    const url = canvas.toDataURL("image/jpeg", opts.jpegQuality ?? 0.92);
    if (idx > 0) pdf.addPage();
    pdf.addImage(url, "JPEG", 0, 0, pageWidthPt, pageHeightPt);
  });

  pdf.save(fileName);
  root.unmount();
  host.remove();
}
