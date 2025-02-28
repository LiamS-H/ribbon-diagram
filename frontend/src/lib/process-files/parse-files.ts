import { parseBedAsStream } from "./bed";
import { parseN0AsStream } from "./n0";
import { parseSyntenyAsStream } from "./synteny";
import { IParsedFiles } from "@/types/file";

export async function parseFiles({
    n0,
    beds,
    synteny,
}: {
    n0: File;
    beds: File[];
    synteny: File;
}): Promise<IParsedFiles> {
    const bedPromises = [];

    for (const bed of beds) {
        bedPromises.push(parseBedAsStream(bed));
    }

    const promises = [
        Promise.all(bedPromises),
        parseN0AsStream(n0),
        parseSyntenyAsStream(synteny),
    ] as const;
    const [orgFiles, groupsFile, syntenyFile] = await Promise.all(promises);
    return { orgFiles, groupsFile, syntenyFile };
}
