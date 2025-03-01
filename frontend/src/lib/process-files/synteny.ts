import { parseAsStream } from "./parse-stream";
import { IFile, SyntenyFile } from "@/types/file";

export async function parseSyntenyAsStream(file: IFile): Promise<SyntenyFile> {
    const result: SyntenyFile = {};
    let isFirstLine = true;

    await parseAsStream(file, (line: string) => {
        if (!line.trim()) return;

        if (isFirstLine) {
            isFirstLine = false;
            return;
        }

        const fields = line.split("\t");
        const orthoGroup = fields[0];

        result[orthoGroup] = {
            orthoGroup,
            syntenyGroup: fields[1],
            postProb: parseFloat(fields[2]),
        };
    });

    return result;
}
