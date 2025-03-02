"use client";
import { useState, useEffect, useMemo } from "react";
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
import {
    DragDropContext,
    Droppable,
    Draggable,
    OnDragEndResponder,
} from "@hello-pangea/dnd";

export default function Page() {
    const { handleFileInput, bedFiles, n0File, synFile, colorFile } =
        useFileInput();
    const [filesOpen, setFilesOpen] = useState(true);

    const [bedFilesOrder, setBedFilesOrder] = useState<number[]>([]);

    useEffect(() => {
        setBedFilesOrder(bedFiles.map((_, index) => index));
    }, [bedFiles, bedFiles.length]);

    const handleDragEnd: OnDragEndResponder = (result) => {
        if (!result.destination) return;

        const newOrder = Array.from(bedFilesOrder);
        const [movedItem] = newOrder.splice(result.source.index, 1);
        newOrder.splice(result.destination.index, 0, movedItem);

        setBedFilesOrder(newOrder);
    };

    const orderedBedFiles = useMemo(
        () => bedFilesOrder.map((index) => bedFiles[index]),
        [bedFilesOrder, bedFiles]
    );

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
                                {!n0File ? <p>no n0 file</p> : null}
                                {!synFile ? <p>no synteny file</p> : null}
                            </>
                        )}
                    </ul>
                    <Separator />
                    {colorFile && (
                        <FileThumbnail key={colorFile.name} file={colorFile} />
                    )}
                    {!colorFile && <p>no color file</p>}
                    <Separator />

                    {/* Drag and drop for bed files */}
                    {bedFiles.length === 0 ? (
                        <p>no .bed files</p>
                    ) : (
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="bedFilesList">
                                {(provided) => (
                                    <ul
                                        className="flex flex-col"
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                    >
                                        {orderedBedFiles.map((file, index) => {
                                            if (!file) return null;
                                            return (
                                                <Draggable
                                                    key={file.file.name}
                                                    draggableId={file.file.name}
                                                    index={index}
                                                >
                                                    {(provided) => (
                                                        <li
                                                            className="my-2"
                                                            ref={
                                                                provided.innerRef
                                                            }
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <FileThumbnail
                                                                file={file}
                                                            />
                                                        </li>
                                                    )}
                                                </Draggable>
                                            );
                                        })}
                                        {provided.placeholder}
                                    </ul>
                                )}
                            </Droppable>
                        </DragDropContext>
                    )}
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

            <RibbonCanvas
                files={{
                    bedFiles: orderedBedFiles,
                    n0File,
                    synFile,
                    colorFile,
                }}
            />
        </>
    );
}
