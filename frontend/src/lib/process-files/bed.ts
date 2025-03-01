import { parseAsStream } from "./parse-stream";
import { IFile, OrgFile } from "@/types/file";

export async function parseBedAsStream(file: IFile): Promise<OrgFile> {
    const result: OrgFile = {
        genes: [],
        name: "_",
    };
    result.name = result.name === "_" ? file.name : result.name;

    await parseAsStream(file, (line) => processLine(line, result));

    return result;
}

function processLine(line: string, result: OrgFile): void {
    const regex = /^(\S+)\t(\d+)\t(\d+)\t(\S+)\t/;
    if (!line.trim()) return;

    const match = line.match(regex);

    if (match) {
        const [, chromosome, startIndexStr, endIndexStr, gene] = match;
        if (result.name === "_" && /^\w*\|[0-9]+\.[0-9]+$/.test(gene)) {
            result.name = gene.split("|")[0];
        }

        const startIndex = parseInt(startIndexStr, 10);
        const endIndex = parseInt(endIndexStr, 10);

        result.genes.push({
            chromosome,
            startIndex,
            endIndex,
            gene,
        });
    }
}
