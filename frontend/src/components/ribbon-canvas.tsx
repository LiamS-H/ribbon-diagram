import { IConnectionMap, IRenderingSettings, IRibbonData } from "@/types/graph";
import { useEffect, useRef, useState } from "react";
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
    const workerRef = useRef<Worker | null>(null);

    const [optimizedData, setOptimizedData] = useState<IRibbonData | null>(
        null
    );

    useEffect(() => {
        if (!data) return;
        // if (canvas_ref.current) {
        //     DrawPretty(canvas_ref.current, data);
        // }
        if (workerRef.current) {
            workerRef.current.terminate();
        }

        workerRef.current = new Worker(new URL("./worker.ts", import.meta.url));
        workerRef.current.onmessage = (event: MessageEvent<IRibbonData>) => {
            console.log(event);
            setOptimizedData(event.data);
        };
        workerRef.current.postMessage({
            data,
            settings,
        });
        return () => {
            workerRef.current?.terminate();
        };
    }, [data, settings]);

    useEffect(() => {
        if (!optimizedData) return;
        if (!canvas_ref.current) return;
        DrawPretty(canvas_ref.current, optimizedData);
    }, [optimizedData]);

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
