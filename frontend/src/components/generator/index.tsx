"use client";
import { useEffect, useRef, useState } from "react";
import { FileInput, type IFile } from "./file-input";
import { Button } from "../ui/button";
import { parseFiles } from "@/lib/process-files/parse-files";
import {
    IGraphSettings,
    IParsedFiles,
    IRibbonData,
} from "@/lib/process-files/types";
import { processFiles } from "@/lib/process-files/process-files";
import { DrawRibbon } from "@/lib/draw-ribbon/draw-ribbon";

export function Generator() {
    const [files, setFiles] = useState<IFile[]>([]);
    const [parsedFiles, setParsedFiles] = useState<IParsedFiles | null>(null);
    const [ribbonData, setRibbonData] = useState<IRibbonData | null>(null);

    const [settings, setSettings] = useState<IGraphSettings>(() => ({
        e_cutoff: 0,
        gene_count_max: 20,
        post_prob: 0.99,
        strand_count_min: 20,
        min_genes_in_chromosome: 10,
    }));

    const canvas_ref = useRef<HTMLCanvasElement | null>(null);

    async function process() {
        let n0: null | File = null;
        let beds: File[] = [];
        let synteny: null | File = null;
        for (const { file, type } of files) {
            switch (type) {
                case "bed":
                    beds.push(file);
                    continue;
                case "n0":
                    if (n0 === null) n0 = file;
                    continue;
                case "synteny":
                    if (synteny === null) synteny = file;
                    continue;
            }
        }
        if (!n0 || !beds || !synteny) {
            console.error("missing files");
            return;
        }
        const parsedFiles = await parseFiles({ n0, beds, synteny });
        setParsedFiles(parsedFiles);
    }

    useEffect(() => {
        if (!parsedFiles) return;
        if (!canvas_ref.current) return;
        const ribbonData = processFiles(parsedFiles, settings);
        console.log(ribbonData);
        DrawRibbon(ribbonData, canvas_ref.current);
    }, [parsedFiles, settings]);

    return (
        <div className="w-full h-full flex flex-col gap-2 items-center">
            <canvas
                ref={canvas_ref}
                className="w-3/4 h-3/4 m-4 border-2 border-primary rounded-lg"
            />
            <div className="max-w-4xl flex flex-col gap-2">
                <Button className="w-full" onClick={process}>
                    Process
                </Button>
                <FileInput files={files} setFiles={setFiles} />
            </div>
        </div>
    );
}
