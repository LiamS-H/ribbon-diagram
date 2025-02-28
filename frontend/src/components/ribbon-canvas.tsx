import { IGraphSettings } from "@/types/graph";
import { useRef } from "react";
import { AspectRatio } from "@/components/(ui)/aspect-ratio";
import { IRawFiles } from "@/types/file";
import { useRibbonWorkerClient } from "@/hooks/use-ribbon-worker-client";

export function RibbonCanvas({
    files,
    settings,
}: {
    files: IRawFiles;
    settings: IGraphSettings;
}) {
    const canvas_ref = useRef<HTMLCanvasElement | null>(null);
    useRibbonWorkerClient(canvas_ref.current, files, settings);

    return (
        <div className="w-full">
            <AspectRatio
                ratio={16 / 9}
                className="border-2 border-primary rounded-xl shadow-xl"
            >
                <canvas ref={canvas_ref} className="w-full h-full" />
            </AspectRatio>
        </div>
    );
}
