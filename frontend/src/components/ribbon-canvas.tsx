import { useGraphSettings } from "@/hooks/use-graph-settings";
import { Card, CardContent } from "@/components/(ui)/card";
import { GraphSettings } from "@/components/graph-settings";
import { useRef, useState } from "react";
import { AspectRatio } from "@/components/(ui)/aspect-ratio";
import { IRawFiles } from "@/types/file";
import { useRibbonWorkerClient } from "@/hooks/use-ribbon-worker-client";
import { Button } from "@/components/(ui)/button";
import { toast } from "sonner";
import { Separator } from "@/components/(ui)/separator";
import { ExportButton } from "./export-button";

export function RibbonCanvas({ files }: { files: IRawFiles }) {
    const canvas_ref = useRef<HTMLCanvasElement | null>(null);
    const [settings, setSettings] = useGraphSettings();
    const { download, ribbonData } = useRibbonWorkerClient(
        canvas_ref.current,
        files,
        settings
    );

    return (
        <div className="flex flex-col lg:flex-row gap-4 px-16 pt-4">
            <div className="w-full relative">
                <AspectRatio
                    ratio={16 / 9}
                    className="border-2 border-primary rounded-xl shadow-xl"
                >
                    <canvas ref={canvas_ref} className="w-full h-full" />
                </AspectRatio>
            </div>
            <Card className="min-w-72">
                <CardContent>
                    <GraphSettings
                        setSettings={setSettings}
                        settings={settings}
                        ribbonData={ribbonData}
                    />
                    <Separator className="mb-4" />
                    <ExportButton download={download} />
                </CardContent>
            </Card>
        </div>
    );
}
