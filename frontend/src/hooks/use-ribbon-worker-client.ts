import { RibbonWorkerClient } from "@/lib/ribbon-worker-client/client";
import { IRawFiles } from "@/types/file";
import { IGraphSettings, IRibbonData } from "@/types/graph";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function useRibbonWorkerClient(
    canvas: HTMLCanvasElement | null,
    { n0File, bedFiles, synFile, colorFile }: IRawFiles,
    settings: IGraphSettings
) {
    const client = useRef<null | RibbonWorkerClient>(null);
    const [ribbonData, setRibbonData] = useState<IRibbonData | null>(null);

    useEffect(() => {
        if (!canvas) return;
        if (client.current) return;
        client.current = new RibbonWorkerClient(canvas, settings);
        client.current.callbacks.setRibbonData = setRibbonData;
    }, [canvas]); //eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!client.current) return;
        const missing_file_types = [];
        if (!n0File) {
            missing_file_types.push("N0");
        }
        if (bedFiles.length === 0) {
            missing_file_types.push("bed");
        }
        if (!synFile) {
            missing_file_types.push("synteny");
        }
        if (!colorFile) {
            missing_file_types.push("colors");
        }
        if (!n0File || !bedFiles || !synFile || !colorFile) {
            toast(`Missing files: ${missing_file_types.join(", ")}`);
            return;
        }
        client.current.parse({ n0File, bedFiles, synFile, colorFile });
    }, [n0File, bedFiles, synFile, colorFile]);

    useEffect(() => {
        if (!client.current) return;
        client.current.setSettings(settings);
        if (!client.current.ribbonData) return;
    }, [settings]);

    return {
        download: () => client.current?.download(),
        ribbonData,
    };
}
