export async function parseAsStream(
    file: File,
    parseLine: (line: string) => void
): Promise<void> {
    const stream = file.stream();
    const reader = stream.getReader();

    const decoder = new TextDecoder();

    let buffer = "";

    try {
        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                if (buffer) {
                    parseLine(buffer);
                }
                break;
            }

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            const lines = buffer.split("\n");

            for (let i = 0; i < lines.length - 1; i++) {
                parseLine(lines[i]);
            }

            buffer = lines[lines.length - 1];
        }
    } finally {
        reader.releaseLock();
    }
}
