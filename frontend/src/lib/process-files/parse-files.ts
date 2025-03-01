import { parseBedAsStream } from "./bed";
import { parseColorsAsStream } from "./color";
import { parseN0AsStream } from "./n0";
import { parseSyntenyAsStream } from "./synteny";
import { IParsedFiles, IProcessedFiles } from "@/types/file";

export async function parseFiles({
    n0File,
    bedFiles,
    synFile,
    colorFile,
}: IParsedFiles): Promise<IProcessedFiles> {
    const bedPromises = [];

    for (const bed of bedFiles) {
        bedPromises.push(parseBedAsStream(bed));
    }

    const promises = [
        Promise.all(bedPromises),
        parseN0AsStream(n0File),
        parseSyntenyAsStream(synFile),
        parseColorsAsStream(colorFile),
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
