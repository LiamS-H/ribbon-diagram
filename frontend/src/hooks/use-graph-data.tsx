import { parseFiles } from "@/lib/process-files/parse-files";
import { processFiles } from "@/lib/process-files/process-files";
import { IFile, IParsedFiles } from "@/types/file";
import { IParsingSettings, IRibbonData } from "@/types/graph";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function useGraphData(
    files: (IFile | null)[],
    settings: IParsingSettings
) {
    const [parsedFiles, setParsedFiles] = useState<IParsedFiles | null>(null);
    const [ribbonData, setRibbonData] = useState<IRibbonData | null>(null);

    async function parse() {
        let n0: null | File = null;
        let beds: File[] = [];
        let synteny: null | File = null;
        for (const f of files) {
            if (!f) continue;
            const { file, type } = f;
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
        const missing_file_types = [];
        if (!n0) {
            missing_file_types.push("N0");
        }
        if (!beds) {
            missing_file_types.push("bed");
        }
        if (!synteny) {
            missing_file_types.push("synteny");
        }
        if (!n0 || !beds || !synteny) {
            toast(`Missing files: ${missing_file_types.join(", ")}`);
            return;
        }
        const parsedFiles = await parseFiles({ n0, beds, synteny });
        setParsedFiles(parsedFiles);
    }

    useEffect(() => {
        if (!parsedFiles) return;
        const ribbonData = processFiles(parsedFiles, settings);
        setRibbonData(ribbonData);
    }, [parsedFiles, settings]);

    return { parse, ribbonData };
}
