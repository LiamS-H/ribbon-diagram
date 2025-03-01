import { parseAsStream } from "./parse-stream";

export async function parseColorsAsStream(
    file: File
): Promise<Record<string, string>> {
    const result: Record<string, string> = {};

    await parseAsStream(file, (line) => processLine(line, result));
    console.log(result);

    return result;
}

function processLine(line: string, result: Record<string, string>): void {
    const regex = /\s*(\w+):\s*"([^"]+)"/;

    const match = line.match(regex);
    console.log(line, match);

    if (match) {
        const [, id, color] = match;
        result[id.toUpperCase()] = color;
    }
}
