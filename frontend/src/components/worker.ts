import { SolvePositioning } from "@/lib/draw-ribbon/solve-positioning";
import { IRenderingSettings, IRibbonData } from "@/types/graph";

self.onmessage = (
    event: MessageEvent<{ data: IRibbonData; settings: IRenderingSettings }>
) => {
    const { data, settings } = event.data;
    SolvePositioning(data, settings);
    self.postMessage(data);
};
