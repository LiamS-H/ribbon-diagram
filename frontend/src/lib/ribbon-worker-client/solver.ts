import { barycenterChromosomeOrder } from "../draw-ribbon/bary-center";
import { SolvePositioning } from "../draw-ribbon/solve-positioning";
import { ISolveMessage, ISolveResponse } from "./message-types";

let stored_ordering: Record<string, string[]>;

self.onmessage = async (event: MessageEvent<ISolveMessage>) => {
    const { abortBuffer, data: dataInp, settings } = event.data;

    Atomics.store(abortBuffer, 0, 0);

    const data = SolvePositioning(dataInp, settings, abortBuffer);
    if (!data) return;
    const { connectionMap, ribbonData } = data;
    if (!settings.lock_chromosomes || !stored_ordering) {
        const ordering = barycenterChromosomeOrder(
            ribbonData,
            connectionMap,
            settings,
            abortBuffer
        );
        if (ordering === null) {
            return null;
        }
        stored_ordering = ordering;
    }

    for (const org of ribbonData.organisms) {
        ribbonData.orgMap[org].chromosomes = stored_ordering[org];
    }

    const resp: ISolveResponse = { type: "solve", data: ribbonData };

    self.postMessage(resp);
};
