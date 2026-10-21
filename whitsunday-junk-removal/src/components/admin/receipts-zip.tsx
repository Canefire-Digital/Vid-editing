"use client";

import { useState } from "react";
import { Archive } from "lucide-react";
import { zipSync } from "fflate";

type Item = { url: string; name: string };

/** Downloads every receipt in the browser and zips it — avoids server size limits. */
export function ReceiptsZip({ items, filename }: { items: Item[]; filename: string }) {
  const [progress, setProgress] = useState<string | null>(null);

  async function run() {
    const files: Record<string, Uint8Array> = {};
    let failed = 0;
    for (let i = 0; i < items.length; i++) {
      setProgress(`Fetching ${i + 1} of ${items.length}…`);
      try {
        const res = await fetch(items[i].url);
        if (!res.ok) throw new Error();
        files[items[i].name] = new Uint8Array(await res.arrayBuffer());
      } catch {
        failed++;
      }
    }
    setProgress("Zipping…");
    const zipped = zipSync(files, { level: 0 });
    const blob = new Blob([zipped.buffer as ArrayBuffer], { type: "application/zip" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    setProgress(failed ? `Done — ${failed} file(s) couldn't be fetched. Refresh the page and try again.` : null);
  }

  if (!items.length) return <span className="text-sm text-white/50">No receipts uploaded for this year.</span>;
  return (
    <div>
      <button type="button" className="btn btn-ghost" onClick={run} disabled={!!progress && progress !== null && !progress.startsWith("Done")}>
        <Archive size={18} /> {progress && !progress.startsWith("Done") ? progress : `Download all ${items.length} receipts (.zip)`}
      </button>
      {progress?.startsWith("Done") && <p className="mt-1 text-xs text-amber-300">{progress}</p>}
    </div>
  );
}
