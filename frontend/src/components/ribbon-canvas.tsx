import { IConnectionMap, IRenderingSettings, IRibbonData } from "@/types/graph";
import { useEffect, useRef } from "react";
import { AspectRatio } from "@/components/(ui)/aspect-ratio";
import { DrawPretty } from "@/lib/draw-ribbon/draw-pretty";
import { SolvePositioning } from "@/lib/draw-ribbon/solve-positioning";

export function RibbonCanvas({
    data,
    settings,
}: {
    data: IRibbonData | null;
    settings: IRenderingSettings;
}) {
    const canvas_ref = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!data) return;
        if (!canvas_ref.current) return;
        SolvePositioning(data, settings);
        DrawPretty(canvas_ref.current, data);
    }, [data]);

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
