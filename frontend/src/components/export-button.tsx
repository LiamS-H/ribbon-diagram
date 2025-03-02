import { Button } from "@/components/(ui)/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/(ui)/dialog";
import { Input } from "@/components/(ui)/input";
import { useState } from "react";

export function ExportButton({
    download,
}: {
    download: (file?: string) => void;
}) {
    const [fileName, setFileName] = useState("ribbons.png");

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full" size="sm">
                    Export
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Export</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <Input
                    value={fileName}
                    placeholder="enter file name"
                    onChange={(e) => setFileName(e.target.value)}
                />

                <DialogFooter>
                    <DialogTrigger asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogTrigger>
                    <Button
                        onClick={() => {
                            download(fileName);
                        }}
                    >
                        Download
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
