"use client";
import { useState } from "react";
import { Button } from "@/components/(ui)/button";
import { FileThumbnail } from "@/components/file-thumbnail";
import { useFileInput } from "@/hooks/use-file-input";
import { Separator } from "@/components/(ui)/separator";
import { FileInput } from "@/components/file-input";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/(ui)/sheet";
import { File } from "lucide-react";
import { RibbonCanvas } from "@/components/ribbon-canvas";
import { useGraphSettings } from "@/hooks/use-graph-settings";
import { Card, CardContent } from "@/components/(ui)/card";
import { GraphSettings } from "@/components/graph-settings";

export default function Page() {
    const { handleFileInput, bedFiles, n0File, synFile } = useFileInput();
    const [settings, setSettings] = useGraphSettings();
    // const { parse, ribbonData } = useGraphData(
    //     [...bedFiles, n0File, synFile],
    //     parsingSettings
    // );

    const [filesOpen, setFilesOpen] = useState(true);

    return (
        <>
            <Sheet open={filesOpen} onOpenChange={setFilesOpen}>
                <SheetContent side="left" className="px-2">
                    <SheetHeader className="flex flex-col gap4">
                        <SheetTitle className="text-3xl">
                            Upload Files
                        </SheetTitle>
                        <SheetDescription></SheetDescription>
                    </SheetHeader>
                    <Separator />
                    <FileInput onChange={handleFileInput} />
                    <Separator />
                    <ul className="flex flex-col gap-2">
                        {synFile && (
                            <FileThumbnail
                                key={synFile.file.name}
                                file={synFile}
                            />
                        )}
                        {n0File && (
                            <FileThumbnail
                                key={n0File.file.name}
                                file={n0File}
                            />
                        )}

                        {!n0File && !synFile ? (
                            <span>no hmm files</span>
                        ) : (
                            <>
                                {!n0File ? <span>no n0 file</span> : null}
                                {!synFile ? <p>no synteny file</p> : null}
                            </>
                        )}
                    </ul>
                    <Separator />
                    <ul className="flex flex-col gap-2">
                        {bedFiles.map((file) => (
                            <FileThumbnail key={file.file.name} file={file} />
                        ))}
                        {bedFiles.length === 0 ? <li>no .bed files</li> : null}
                    </ul>
                </SheetContent>
            </Sheet>
            <Button
                className="absolute left-4 top-4"
                variant="outline"
                size="icon"
                onClick={() => setFilesOpen(true)}
            >
                <File />
            </Button>
            <div className="flex flex-col lg:flex-row gap-4 px-16 pt-4">
                <RibbonCanvas
                    files={{ bedFiles, n0File, synFile }}
                    settings={settings}
                />

                <Card className="min-w-64">
                    <CardContent>
                        <GraphSettings
                            setSettings={setSettings}
                            settings={settings}
                        />
                        <Separator />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
