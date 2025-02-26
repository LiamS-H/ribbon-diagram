import { parseAsStream } from "./parse-stream";
import { GroupsFile } from "./types";

export async function parseN0AsStream(file: File): Promise<GroupsFile> {
    const result: GroupsFile = [];
    let headers: string[] = [];
    let isFirstLine = true;

    await parseAsStream(file, (line: string) => {
        if (!line.trim()) return;

        if (isFirstLine) {
            headers = line.split("\t");
            isFirstLine = false;
            return;
        }

        const fields = line.split("\t");
        const orthoGroup = fields[0];

        const orgToGenes: { [key: string]: string[] } = {};

        for (let i = 1; i < headers.length; i++) {
            const orgName = headers[i];
            const genesStr = fields[i]?.trim();

            orgToGenes[orgName] = [];

            if (!genesStr) continue;

            const genes = genesStr
                .split(",")
                .map((gene) => gene.trim())
                .filter((gene) => gene.length > 0);

            orgToGenes[orgName] = genes;
        }

        result.push({
            orthoGroup,
            orgToGenes,
        });
    });

    return result;
}
