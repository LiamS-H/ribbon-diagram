import { parseAsStream } from "./parse-stream";
import { GroupsFile } from "@/types/file";

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
        const organisms: string[] = [];

        for (let i = 1; i < headers.length; i++) {
            const genesStr = fields[i]?.trim();

            if (!genesStr) continue;

            const genes = genesStr
                .split(",")
                .map((gene) => gene.trim())
                .filter((gene) => gene.length > 0);

            const orgName = headers[i];
            orgToGenes[orgName] = [];

            orgToGenes[orgName] = genes;
            organisms.push(orgName);
        }

        result.push({
            orthoGroup,
            orgToGenes,
            organisms,
        });
    });

    return result;
}
