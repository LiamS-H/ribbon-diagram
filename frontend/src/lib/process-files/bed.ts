import { parseAsStream } from "./parse-stream";
import { OrgFile } from "./types";

export async function parseBedAsStream(file: File): Promise<OrgFile> {
    const result: OrgFile = {
        genes: [],
        name: file.name.replace(".bed", ""),
    };

    await parseAsStream(file, (line) => processLine(line, result));

    return result;
}

function processLine(line: string, result: OrgFile): void {
    const regex = /^(\S+)\t(\d+)\t(\d+)\t(\S+)\t/;
    if (!line.trim()) return;

    const match = line.match(regex);

    if (match) {
        const [, chromosome, startIndexStr, endIndexStr, gene] = match;

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
