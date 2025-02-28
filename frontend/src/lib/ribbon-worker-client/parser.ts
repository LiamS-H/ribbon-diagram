import { parseFiles } from "@/lib/process-files/parse-files";
import { IParseMessage, IParseResponse } from "./message-types";
import { processFiles } from "../process-files/process-files";

self.onmessage = async (event: MessageEvent<IParseMessage>) => {
    const { files: rawFiles, parsed, settings, abortBuffer } = event.data;
    Atomics.store(abortBuffer, 0, 0);
    const files = parsed || (await parseFiles(rawFiles));
    const data = processFiles(files, settings, abortBuffer);
    if (!data) return;
    const resp: IParseResponse = { type: "parse", files, data };

    self.postMessage(resp);
};
