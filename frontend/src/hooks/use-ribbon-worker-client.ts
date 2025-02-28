import { RibbonWorkerClient } from "@/lib/ribbon-worker-client/client";
import { IRawFiles } from "@/types/file";
import { IGraphSettings } from "@/types/graph";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export function useRibbonWorkerClient(
    canvas: HTMLCanvasElement | null,
    { n0File, bedFiles, synFile }: IRawFiles,
    settings: IGraphSettings
) {
    const client = useRef<null | RibbonWorkerClient>(null);

    useEffect(() => {
        if (!canvas) return;
        if (client.current) return;
        client.current = new RibbonWorkerClient(canvas, settings);
    }, [canvas]); //eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!client.current) return;
        const missing_file_types = [];
        if (!n0File) {
            missing_file_types.push("N0");
        }
        if (!bedFiles) {
            missing_file_types.push("bed");
        }
        if (!synFile) {
            missing_file_types.push("synteny");
        }
        if (!n0File || !bedFiles || !synFile) {
            toast(`Missing files: ${missing_file_types.join(", ")}`);
            return;
        }
        client.current.parse({ n0: n0File, beds: bedFiles, synteny: synFile });
    }, [n0File, bedFiles, synFile]);

    useEffect(() => {
        if (!client.current) return;
        client.current.setSettings(settings);
    }, [settings]);
}
