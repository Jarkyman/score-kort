import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type FullScorecardData } from "../api";
import React from "react";

interface Props {
    courseId: number;
}

const TEE_COLORS: Record<string, string> = {
    "hvid": "#ffffff", "white": "#ffffff",
    "gul": "#fbbf24", "yellow": "#fbbf24",
    "blå": "#3b82f6", "blue": "#3b82f6",
    "rød": "#ef4444", "red": "#ef4444",
    "orange": "#f97316",
    "sort": "#000000", "black": "#000000",
    "grøn": "#22c55e", "green": "#22c55e",
    "sølv": "#94a3b8", "silver": "#94a3b8",
    "lilla": "#a855f7", "purple": "#a855f7"
};

function getTeeColor(color: string | null): string {
    if (!color) return "#cbd5e1";
    const c = color.toLowerCase().trim();
    if (c.startsWith("#")) return c;
    return TEE_COLORS[c] || "#cbd5e1";
}

function isNumericTee(name: string | null): boolean {
    if (!name) return false;
    return /^\d+$/.test(name.trim());
}

export default function ScorecardView({ courseId }: Props) {
    const [data, setData] = useState<FullScorecardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.getFullScorecard(courseId)
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, [courseId]);

    if (loading) return (
        <div className="py-12 flex justify-center min-h-[600px] items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
    );

    if (!data) return <div className="p-8 text-center text-text-muted">Kunne ikke hente scorekort data.</div>;
    if (!data.tees || !data.holes || !data.course) return <div className="p-8 text-center text-text-muted">Ufuldstændig scorekort data.</div>;

    const { course, tees, holes: rawHoles } = data;
    let holes = [...rawHoles];

    // 1. Expand 9 holes to 18
    try {
        if (holes.length === 9) {
            const back9 = holes.map(h => ({
                ...h,
                hole_no: h.hole_no + 9,
                hcp: ((h.hcp || 0) % 18) + 1
            }));
            holes = [...holes, ...back9];
        }
        // 2. Expand 6 holes to 18
        else if (holes.length === 6) {
            // Create empty hole helper
            const createEmptyHole = (no: number) => ({
                hole_no: no, par: null, lengths: {}, hcp: null, match_index: null
            } as any);

            const front6 = holes;
            const frontEmpty = [7, 8, 9].map(createEmptyHole);
            const back6 = holes.map(h => ({
                ...h,
                hole_no: h.hole_no + 9,
                hcp: ((h.hcp || 0) % 18) + 1
            }));
            const backEmpty = [16, 17, 18].map(createEmptyHole);

            holes = [...front6, ...frontEmpty, ...back6, ...backEmpty];
        }
    } catch (e) {
        console.error("Error processing scorecard holes:", e);
        return <div className="p-8 text-center text-red-500">Fejl i scorekort data format.</div>;
    }

    // Help to render columns
    const numScoreCols = 16 + tees.length;
    const renderColGroup = () => (
        <colgroup>
            <col className="w-10" /> {/* Hul */}
            <col className="w-10" /> {/* Tid */}
            {tees.map(t => (
                <col key={t.tee_key} className="w-10" />
            ))}
            <col className="w-10" /> {/* Par */}
            <col className="w-10" /> {/* HCP */}
            {[...Array(12)].map((_, i) => (
                <col key={i} className="w-10" />
            ))}
        </colgroup>
    );

    const render9 = (start: number, end: number, label: string) => {
        const chunkHoles = holes.filter(h => h.hole_no >= start && h.hole_no <= end);
        if (chunkHoles.length === 0) return null;

        const sumPar = chunkHoles.reduce((acc, h) => acc + (h.par || 0), 0);
        const sumLengths: Record<string, number> = {};
        tees.forEach(t => {
            sumLengths[t.tee_key] = chunkHoles.reduce((acc, h) => acc + (h.lengths[t.tee_key] || 0), 0);
        });

        return (
            <>
                {chunkHoles.map(h => (
                    <tr key={h.hole_no} className="hover:bg-brand-50/50">
                        <td className="col-hole font-bold">{h.hole_no}</td>
                        <td></td>
                        {tees.map(t => (
                            <td key={t.tee_key} className="font-mono text-xs">
                                {h.lengths[t.tee_key] || "-"}
                            </td>
                        ))}
                        <td className="col-par bg-brand-50">{h.par}</td>
                        <td className="col-index">{h.hcp}</td>
                        {[1, 2, 3, 4].map(p => (
                            <React.Fragment key={p}>
                                <td className="cell-score bg-white"></td>
                                <td className="cell-score bg-white"></td>
                                <td className="cell-score bg-white"></td>
                            </React.Fragment>
                        ))}
                    </tr>
                ))}
                <tr className={label === "UD" ? "row-out" : (label === "IND" ? "row-in" : "row-total")}>
                    <td className="font-black text-right pr-2" colSpan={2}>{label}</td>
                    {tees.map(t => (
                        <td key={t.tee_key} className="font-bold text-xs">{sumLengths[t.tee_key]}</td>
                    ))}
                    <td className="font-bold">{sumPar}</td>
                    <td></td>
                    {[1, 2, 3, 4].map(p => (
                        <React.Fragment key={p}>
                            <td className="bg-gray-200"></td>
                            <td className="bg-gray-200"></td>
                            <td className="bg-gray-200"></td>
                        </React.Fragment>
                    ))}
                </tr>
            </>
        );
    };

    // Total sums
    const totalPar = holes.reduce((acc, h) => acc + (h.par || 0), 0);
    const totalLengths: Record<string, number> = {};
    tees.forEach(t => {
        totalLengths[t.tee_key] = holes.reduce((acc, h) => acc + (h.lengths[t.tee_key] || 0), 0);
    });

    return (
        <div className="animate-in bg-white print:block">
            {/* Top Toolbar */}
            <div className="mb-6 flex justify-end items-center print:hidden">
                <div className="flex gap-2">
                    <button onClick={() => window.print()} className="btn-primary flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                        Print Scorekort
                    </button>
                    <Link
                        to={`/indberetning?clubId=${course.club_id}&courseId=${course.course_id}`}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-border text-text-secondary hover:bg-surface-header"
                    >
                        Fejl i data?
                    </Link>
                </div>
            </div>

            <div id="scorecard-print-wrapper" className="mx-auto max-w-[1000px] border-2 border-black p-1 shadow-2xl bg-white text-black print:border-none print:shadow-none print:w-full print:max-w-none print:mx-0 print:p-0">
                {/* Header Information Section */}
                <div className="border border-black mb-4 p-1 grid grid-cols-6 gap-0.5 text-[9px] font-bold uppercase tracking-tight">
                    <div className="border border-black p-1 h-10 flex flex-col justify-between">Dato<div className="border-b border-black/20 w-full mt-1"></div></div>
                    <div className="border border-black p-1 h-10 flex flex-col justify-between col-span-2">Klub / Bane: {course.club_name} / {course.course_name}<div className="border-b border-black/20 w-full mt-1"></div></div>
                    <div className="border border-black p-1 h-10 flex flex-col justify-between">Tid<div className="border-b border-black/20 w-full mt-1"></div></div>
                    <div className="border border-black p-1 h-10 flex flex-col justify-between">Række<div className="border-b border-black/20 w-full mt-1"></div></div>
                    <div className="border border-black p-1 h-10 flex flex-col justify-between">Match<div className="border-b border-black/20 w-full mt-1"></div></div>

                    <div className="border border-black p-1 h-10 flex flex-col justify-between col-span-2 bg-gray-50">Spiller: Navn / Nummer<div className="border-b border-black/20 w-full mt-1"></div></div>
                    <div className="border border-black p-1 h-10 flex flex-col justify-between bg-gray-50">Medlemsnr.<div className="border-b border-black/20 w-full mt-1"></div></div>
                    <div className="border border-black p-1 h-10 flex flex-col justify-between bg-gray-50">Tee<div className="border-b border-black/20 w-full mt-1"></div></div>
                    <div className="border border-black p-1 h-10 flex flex-col justify-between bg-gray-50">Hcp<div className="border-b border-black/20 w-full mt-1"></div></div>
                    <div className="border border-black p-1 h-10 flex flex-col justify-between bg-emerald-50 text-emerald-900">SPH Spiller<div className="border-b border-emerald-900/20 w-full mt-1"></div></div>
                </div>

                <div className="scorecard-container border border-black">
                    <table className="sc-table table-fixed w-full">
                        {renderColGroup()}
                        <thead>
                            <tr>
                                <th colSpan={4 + tees.length} className="text-left bg-white border-none p-2 text-xs uppercase truncate">
                                    Bane: {course.course_name}
                                </th>
                                {[1, 2, 3].map(p => (
                                    <th key={p} colSpan={3} className="bg-white text-left p-1 border-l-2 border-black text-[10px] truncate">
                                        Spiller {p}
                                    </th>
                                ))}
                                <th colSpan={3} className="bg-white text-left p-1 border-l-2 border-black text-[10px]">Markør</th>
                            </tr>
                            <tr>
                                <th className="bg-white">Hul</th>
                                <th className="bg-white">Tid</th>
                                {tees.map(t => (
                                    <th key={t.tee_key} className="align-middle">
                                        {isNumericTee(t.tee_name) ? (
                                            <span className="text-[9px] font-bold leading-none" title={t.tee_name}>{t.tee_name}</span>
                                        ) : (
                                            <div
                                                className="tee-dot mx-auto"
                                                style={{ backgroundColor: getTeeColor(t.tee_color || t.tee_name) }}
                                                title={t.tee_name}
                                            />
                                        )}
                                    </th>
                                ))}
                                <th>Par</th>
                                <th>HCP</th>
                                {[1, 2, 3, 4].map(p => (
                                    <React.Fragment key={p}>
                                        <th className={`${p > 1 ? 'border-l-2 border-black' : ''}`}>SPH</th>
                                        <th>Slag</th>
                                        <th>P</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {render9(1, 9, "UD")}
                            {holes.length > 9 && (
                                <tr className="h-4 border-none border-x-black"><td colSpan={numScoreCols}></td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {holes.length > 9 && (
                    <div className="scorecard-container border border-black mt-6 print:mt-1 print:border-t-0">
                        <table className="sc-table table-fixed w-full">
                            {renderColGroup()}
                            <thead>
                                <tr>
                                    <th colSpan={4 + tees.length} className="text-left bg-white border-none p-2 text-xs uppercase truncate">
                                        Bane: {course.course_name}
                                    </th>
                                    {[1, 2, 3].map(p => (
                                        <th key={p} colSpan={3} className="bg-white text-left p-1 border-l-2 border-black text-[10px] truncate">
                                            Spiller {p}
                                        </th>
                                    ))}
                                    <th colSpan={3} className="bg-white text-left p-1 border-l-2 border-black text-[10px]">Markør</th>
                                </tr>
                                <tr>
                                    <th className="bg-white">Hul</th>
                                    <th className="bg-white">Tid</th>
                                    {tees.map(t => (
                                        <th key={t.tee_key} className="align-middle">
                                            {isNumericTee(t.tee_name) ? (
                                                <span className="text-[9px] font-bold leading-none" title={t.tee_name}>{t.tee_name}</span>
                                            ) : (
                                                <div
                                                    className="tee-dot mx-auto"
                                                    style={{ backgroundColor: getTeeColor(t.tee_color || t.tee_name) }}
                                                    title={t.tee_name}
                                                />
                                            )}
                                        </th>
                                    ))}
                                     <th>Par</th>
                                     <th>HCP</th>
                                    {[1, 2, 3, 4].map(p => (
                                        <React.Fragment key={p}>
                                            <th className={`${p > 1 ? 'border-l-2 border-black' : ''}`}>SPH</th>
                                            <th>Slag</th>
                                            <th>P</th>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {render9(10, 18, "IND")}

                                <tr className="row-total border-t-2 border-black">
                                    <td colSpan={2} className="text-right pr-2">TOTAL</td>
                                    {tees.map(t => (
                                        <td key={t.tee_key}>{totalLengths[t.tee_key]}</td>
                                    ))}
                                    <td>{totalPar}</td>
                                    <td></td>
                                    {[1, 2, 3, 4].map(p => (
                                        <React.Fragment key={p}>
                                            <td className="bg-gray-300"></td>
                                            <td className="bg-gray-300"></td>
                                            <td className="bg-gray-300"></td>
                                        </React.Fragment>
                                    ))}
                                </tr>

                                <tr>
                                    <td rowSpan={2} className="font-bold">D</td>
                                    <td className="font-bold text-xs">CR</td>
                                    {tees.map(t => <td key={t.tee_key} className="text-xs">{t.cr_women || "-"}</td>)}
                                    <td colSpan={2} className="font-bold text-[10px] bg-gray-100 uppercase">Brutto</td>
                                    {[...Array(12)].map((_, i) => (
                                        <td key={i} className="border border-black bg-white"></td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="font-bold text-xs">Slope</td>
                                    {tees.map(t => <td key={t.tee_key} className="text-xs">{t.slope_women || "-"}</td>)}
                                    <td colSpan={2} className="font-bold text-[10px] bg-gray-100 uppercase">Netto</td>
                                    {[...Array(12)].map((_, i) => (
                                        <td key={i} className="border border-black bg-white"></td>
                                    ))}
                                </tr>
                                <tr>
                                    <td rowSpan={2} className="font-bold">H</td>
                                    <td className="font-bold text-xs">CR</td>
                                    {tees.map(t => <td key={t.tee_key} className="text-xs">{t.cr || "-"}</td>)}
                                    <td colSpan={2} className="bg-gray-200"></td>
                                    <td colSpan={12} className="text-left text-xs p-2 align-top h-16">UNDERSKRIFT SPILLER</td>
                                </tr>
                                <tr>
                                    <td className="font-bold text-xs">Slope</td>
                                    {tees.map(t => <td key={t.tee_key} className="text-xs">{t.slope || "-"}</td>)}
                                    <td colSpan={2} className="bg-gray-200"></td>
                                    <td colSpan={12} className="text-left text-xs p-2 align-top h-16 border-l border-black">UNDERSKRIFT MARKØR & MEDLEMSNUMMER</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="hidden print:block mt-8 text-center text-[10px] text-gray-500 font-mono">
                    Hentet fra score-kort.dk
                </div>
            </div>
        </div>
    );
}
