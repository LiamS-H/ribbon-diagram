import type { ReactNode } from "react";
import { Dna, FileClock, Shell } from "lucide-react";
import { IFile } from "@/types/file";

export function FileThumbnail({ file: { file, type } }: { file: IFile }) {
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
