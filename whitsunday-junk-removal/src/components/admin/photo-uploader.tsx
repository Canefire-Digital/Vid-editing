"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { compressImage, extFor } from "@/lib/image";

export function PhotoUploader({
  jobId,
  kind,
  onUploaded,
}: {
  jobId: string;
  kind: "before" | "after";
  onUploaded: (jobId: string, kind: "before" | "after", path: string) => Promise<void>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function upload(files: FileList) {
    setError(null);
    const supabase = createClient();
    const list = Array.from(files);
    for (let i = 0; i < list.length; i++) {
      setBusy(`Uploading ${i + 1} of ${list.length}…`);
      const blob = await compressImage(list[i]);
      const path = `${jobId}/${kind}-${crypto.randomUUID()}.${extFor(blob, list[i].name)}`;
      const { error: upErr } = await supabase.storage.from("job-photos").upload(path, blob, {
        contentType: blob.type || list[i].type,
      });
      if (upErr) {
        setError(upErr.message);
        break;
      }
      await onUploaded(jobId, kind, path);
    }
    setBusy(null);
    if (input.current) input.current.value = "";
    router.refresh();
  }

  return (
    <div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files?.length && upload(e.target.files)}
      />
      <button type="button" className="btn btn-ghost btn-sm" disabled={!!busy} onClick={() => input.current?.click()}>
        <Camera size={16} /> {busy ?? `Add ${kind} photos`}
      </button>
      {error && <p className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
