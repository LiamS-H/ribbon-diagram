import { parseBedAsStream } from "./bed";
import { parseColorsAsStream } from "./color";
import { parseN0AsStream } from "./n0";
import { parseSyntenyAsStream } from "./synteny";
import { IParsedFiles, IProcessedFiles } from "@/types/file";

export async function parseFiles({
    n0File: n0,
    bedFiles: beds,
    synFile: synteny,
    colorFile,
}: IParsedFiles): Promise<IProcessedFiles> {
    const bedPromises = [];

    for (const bed of beds) {
        bedPromises.push(parseBedAsStream(bed.file));
    }

    const promises = [
        Promise.all(bedPromises),
        parseN0AsStream(n0.file),
        parseSyntenyAsStream(synteny.file),
        parseColorsAsStream(colorFile.file),
    ] as const;
    const [orgFiles, groupsFile, syntenyFile, colorMap] = await Promise.all(
        promises
    );
    const files: IProcessedFiles = {
        orgFiles,
        groupsFile,
        syntenyFile,
        colorMap,
    };
    return files;
}
