"use client";
import { type ChangeEvent, useState } from "react";
import { IFile, IRawFiles } from "@/types/file";

export function useFileInput(): IRawFiles & {
    handleFileInput: (e: ChangeEvent<HTMLInputElement>) => void;
} {
    const [bedFiles, setBedFiles] = useState<IFile[]>([]);
    const [n0File, setn0File] = useState<IFile | null>(null);
    const [synFile, setSynFile] = useState<IFile | null>(null);
    const [colorFile, setColorFile] = useState<IFile | null>(null);

    function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) {
            return console.error("no files");
        }
        const bedFiles: IFile[] = [];
        for (const file of e.target.files) {
            if (file.name.endsWith(".bed")) {
                bedFiles.push({
                    file,
                    type: "bed",
                    name: file.name.slice(0, -4),
                });
                continue;
            }
            if (file.name.endsWith(".txt")) {
                setColorFile({
                    file,
                    type: "color",
                    name: file.name.slice(0, -4),
                });
                continue;
            }
            if (!file.name.endsWith(".tsv")) {
                continue;
            }
            if (file.name.toLowerCase() == "n0.tsv") {
                setn0File({ file, type: "n0", name: file.name.slice(0, -4) });
                continue;
            }
            if (file.name.toLowerCase() == "synteny.tsv") {
                setSynFile({
                    file,
                    type: "synteny",
                    name: file.name.slice(0, -4),
                });
                continue;
            }
        }
        if (bedFiles.length === 0) {
            return;
        }
        setBedFiles(bedFiles);
    }

    return {
        handleFileInput,
        colorFile,
        bedFiles,
        n0File,
        synFile,
    };
}
