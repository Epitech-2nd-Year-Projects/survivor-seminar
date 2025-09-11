"use client";

import React from "react";
import { createRoot } from "react-dom/client";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import type { Startup } from "./api/contracts/startups";

type PdfOptions = {
  fileName?: string;
  logoUrl?: string;
  jpegQuality?: number;
  pixelRatio?: number;
  orientation?: "portrait" | "landscape";
  format?: "a4" | "letter";
  contentWidthPx?: number;
};

const PDF_CSS = `
  .pdf {
    box-sizing: border-box;
    font: 13.5px/1.5 Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, Helvetica, sans-serif;
    color: #0f172a; /* slate-900 */
    background: #ffffff;
    width: 100%;
    padding: 0; /* full-bleed sections */
  }
  .pdf * { box-sizing: inherit; font: inherit; }

  /* Header */
  .pdf-hero {
    position: relative;
    padding: 28px 32px 24px 32px;
    background: linear-gradient(135deg, #5b21b6 0%, #2563eb 60%, #06b6d4 100%);
    color: #ffffff;
    overflow: hidden;
  }
  .pdf-hero::after {
    content: "";
    position: absolute; inset: -40px -40px auto auto; width: 320px; height: 320px;
    background: radial-gradient(closest-side, rgba(255,255,255,0.25), transparent 70%);
    transform: rotate(25deg);
    filter: blur(12px);
    pointer-events: none;
  }
  .pdf-hero-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
  .pdf-title { margin: 0; font-weight: 800; letter-spacing: -0.01em; font-size: 28px; }
  .pdf-subtle { opacity: 0.9; font-weight: 400; margin-top: 6px; }
  .pdf-logo-wrap { flex-shrink: 0; width: 72px; height: 72px; border-radius: 16px; overflow: hidden; border: 2px solid rgba(255,255,255,0.35); box-shadow: 0 10px 30px rgba(0,0,0,0.25) inset; background: rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; }
  .pdf-logo { max-height: 64px; max-width: 64px; width: auto; height: auto; object-fit: contain; }
  .pdf-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .pdf-chip { display:inline-flex; align-items:center; gap:8px; padding: 6px 10px; border-radius: 999px; background: rgba(255,255,255,0.16); color: #fff; font-size: 12px; font-weight: 600; }

  .pdf-body-wrap { padding: 24px 32px 32px 32px; }
  .pdf-columns { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; }
  .pdf-card { border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; background: #ffffff; box-shadow: 0 1px 0 rgba(0,0,0,0.02); }
  .pdf-section { padding: 18px 20px; }
  .pdf-section + .pdf-section { border-top: 1px solid #e5e7eb; }
  .pdf-section-title { margin: 0 0 10px 0; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; color: #64748b; font-weight: 700; }

  .pdf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 18px; }
  .pdf-row { display: flex; justify-content: space-between; gap: 12px; min-width: 0; }
  .pdf-label { font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: #6b7280; white-space: nowrap; flex-shrink: 0; }
  .pdf-value { font-size: 14px; text-align: right; word-break: break-word; flex: 1; }

  .pdf-text { font-size: 14px; color: #111827; white-space: pre-wrap; }
  .pdf-link { color: #1d4ed8; text-decoration: none; border-bottom: 1px solid rgba(29,78,216,0.25); }

  /* Footer note */
  .pdf-footer { margin-top: 12px; color: #94a3b8; font-size: 11px; text-align: right; }
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

  const chips: string[] = [
    s.sector || "",
    s.maturity || "",
    s.projectStatus || "",
  ].filter(Boolean);

  return (
    <div id="pdf-root" className="pdf">
      <style>{PDF_CSS}</style>

      <div className="pdf-hero">
        <div className="pdf-hero-row">
          <div style={{ minWidth: 0 }}>
            <h1 className="pdf-title">{s.name}</h1>
            {s.description ? (
              <p className="pdf-subtle" style={{ maxWidth: 560 }}>{s.description}</p>
            ) : null}
            {chips.length ? (
              <div className="pdf-chips">
                {chips.map((c, i) => (
                  <span key={i} className="pdf-chip">{c}</span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="pdf-logo-wrap">
            <img
              src={logoUrl || "/LoginImage.png"}
              alt="Logo"
              className="pdf-logo"
              crossOrigin="anonymous"
            />
          </div>
        </div>
      </div>

      <div className="pdf-body-wrap">
        <div className="pdf-columns">
          <div className="pdf-card">
            <div className="pdf-section">
              <h3 className="pdf-section-title">Company Details</h3>
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
              <div className="pdf-section">
                <h3 className="pdf-section-title">Needs</h3>
                <p className="pdf-text">{s.needs}</p>
              </div>
            ) : null}
          </div>

          <div className="pdf-card">
            <div className="pdf-section">
              <h3 className="pdf-section-title">Summary</h3>
              <p className="pdf-text">
                {s.description || "No description provided."}
              </p>
            </div>
            {(website || social) ? (
              <div className="pdf-section">
                <h3 className="pdf-section-title">Links</h3>
                <div style={{ display: "grid", gap: 8 }}>
                  {website ? (
                    <a href={website.href} className="pdf-link" target="_blank" rel="noreferrer">{website.text}</a>
                  ) : null}
                  {social ? (
                    <a href={social.href} className="pdf-link" target="_blank" rel="noreferrer">{social.text}</a>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="pdf-footer">Generated via Survivor incubator portal</div>
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
  pageWidthPt: number,
  pageHeightPt: number,
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
  const pxToPt = 0.75;
  const format = opts.format ?? "a4";
  const orientation = opts.orientation ?? "landscape";
  const a4 = { w: 595.28, h: 841.89 };
  const letter = { w: 612, h: 792 };
  const base = format === "letter" ? letter : a4;
  const pageWidthPt = orientation === "landscape" ? base.h : base.w;
  const pageHeightPt = orientation === "landscape" ? base.w : base.h;
  const contentWidthPx = opts.contentWidthPx ?? Math.round(pageWidthPt / pxToPt);

  const fileName =
    opts.fileName ?? `${safeFileName(startup.name || "startup")}-profile.pdf`;

  const host = document.createElement("div");
  Object.assign(host.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    width: `${contentWidthPx}px`,
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

  const pixelRatio = Math.min(opts.pixelRatio ?? 3, 4);
  const dataUrl = await toPng(content, {
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
    pageWidthPt,
    pageHeightPt,
  );

  const pdf = new jsPDF({ unit: "pt", format, orientation });

  canvases.forEach((canvas, idx) => {
    const url = canvas.toDataURL("image/jpeg", opts.jpegQuality ?? 0.98);
    if (idx > 0) pdf.addPage();
    pdf.addImage(url, "JPEG", 0, 0, pageWidthPt, pageHeightPt);
  });

  pdf.save(fileName);
  root.unmount();
  host.remove();
}
