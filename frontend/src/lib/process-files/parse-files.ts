import { parseBedAsStream } from "./bed";
import { parseN0AsStream } from "./n0";
import { parseSyntenyAsStream } from "./synteny";
import { IFile, IParsedFiles } from "@/types/file";

export async function parseFiles({
    n0,
    beds,
    synteny,
}: {
    n0: IFile;
    beds: IFile[];
    synteny: IFile;
}): Promise<IParsedFiles> {
    const bedPromises = [];

    for (const bed of beds) {
        bedPromises.push(parseBedAsStream(bed.file));
    }

    const promises = [
        Promise.all(bedPromises),
        parseN0AsStream(n0.file),
        parseSyntenyAsStream(synteny.file),
    ] as const;
    const [orgFiles, groupsFile, syntenyFile] = await Promise.all(promises);
    return { orgFiles, groupsFile, syntenyFile };
}
