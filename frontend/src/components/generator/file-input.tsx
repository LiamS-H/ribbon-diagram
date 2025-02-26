"use client";
import { type ChangeEvent, type ReactNode, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dna, FileClock, Shell } from "lucide-react";

export interface IFile {
    file: File;
    type: "bed" | "n0" | "synteny";
}

function File({ file: { file, type } }: { file: IFile }) {
    let icon: ReactNode;
    switch (type) {
        case "bed":
            icon = <Shell />;
            break;
        case "n0":
            icon = <FileClock />;
            break;
        case "synteny":
            icon = <Dna />;
            break;
    }
    return (
        <div className="flex p-2 justify-between bg-primary shadow-lg rounded-md text-primary-foreground">
            {icon}
            <span>{file.name}</span>
            <span>{`${(file.size / 1028).toFixed(1)}`} kb</span>
        </div>
    );
}

export function FileInput({
    files,
    setFiles,
}: {
    files: IFile[];
    setFiles: (files: IFile[]) => void;
}) {
    // const [bedFile, setBedFile] = useState<File | null>(null);
    // const [n0File, setn0File] = useState<File | null>(null);
    // const [syntenyFile, setSyntenyFile] = useState<File | null>(null);
    function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) {
            return console.error("no files");
        }
        const newFiles: IFile[] = [];
        for (const file of e.target.files) {
            if (file.name.endsWith(".bed")) {
                newFiles.push({ file, type: "bed" });
            }
            if (!file.name.endsWith(".tsv")) {
                continue;
            }
            if (file.name.toLowerCase() == "n0.tsv") {
                newFiles.push({ file, type: "n0" });
            }
            if (file.name.toLowerCase() == "synteny.tsv") {
                newFiles.push({ file, type: "synteny" });
            }
        }
        if (newFiles.length === 0) {
            return;
        }
        setFiles(newFiles);
    }

    return (
        <div className="flex flex-col gap-4">
            <div>
                <Label htmlFor="files">Add Files</Label>
                <Input
                    multiple
                    onChange={handleFileInput}
                    id="bed-file"
                    type="file"
                />
            </div>
            <ul className="flex flex-col gap-2">
                {files
                    ?.sort((a, b) => {
                        return a.type > b.type ? 1 : -1;
                    })
                    .map((file) => (
                        <File key={file.file.name} file={file} />
                    ))}
                {files?.length === 0 ? <li>no files</li> : null}
            </ul>
        </div>
    );
}
