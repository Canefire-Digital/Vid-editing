import { getSettings, getTeam } from "@/lib/auth";
import { fyStartYear } from "@/lib/format";
import { renderReportPdf } from "@/lib/pdf/report";
import { buildFyReport } from "@/lib/report";

export async function GET(request: Request) {
  const fyParam = Number(new URL(request.url).searchParams.get("fy"));
  const startYear = Number.isInteger(fyParam) && fyParam > 2000 ? fyParam : fyStartYear();
  const { supabase, team } = await getTeam();
  const settings = await getSettings();
  const report = await buildFyReport(supabase, team, settings, startYear);
  const pdf = await renderReportPdf(report, settings, team);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="wjr-fy${startYear}-${String(startYear + 1).slice(2)}-report.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
