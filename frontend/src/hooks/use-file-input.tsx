"use client";
import { type ChangeEvent, useState } from "react";
import { IFile } from "@/types/file";

export function useFileInput() {
    const [bedFiles, setBedFiles] = useState<IFile[]>([]);
    const [n0File, setn0File] = useState<IFile | null>(null);
    const [synFile, setSynFile] = useState<IFile | null>(null);

    function handleFileInput(e: ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) {
            return console.error("no files");
        }
        const bedFiles: IFile[] = [];
        for (const file of e.target.files) {
            if (file.name.endsWith(".bed")) {
                bedFiles.push({ file, type: "bed" });
            }
            if (!file.name.endsWith(".tsv")) {
                continue;
            }
            if (file.name.toLowerCase() == "n0.tsv") {
                setn0File({ file, type: "n0" });
            }
            if (file.name.toLowerCase() == "synteny.tsv") {
                setSynFile({ file, type: "synteny" });
            }
        }
        if (bedFiles.length === 0) {
            return;
        }
        setBedFiles(bedFiles);
    }

    return {
        handleFileInput,
        bedFiles,
        n0File,
        synFile,
    };
}
