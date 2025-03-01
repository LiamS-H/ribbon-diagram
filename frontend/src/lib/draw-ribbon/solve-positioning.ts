import { IConnectionMap, IRibbonData, ISolverSettings } from "@/types/graph";
import { calcStrandCounts } from "../process-files/process-files";

export function SolvePositioning(
    ribbonData: IRibbonData,
    settings: ISolverSettings,
    abortBuffer: Int32Array<SharedArrayBuffer>
) {
    const map: IConnectionMap = {
        sources: [],
        map: {},
    };

    for (const {
        organisms,
        connectionMap,
        syntenyGroup: synteny,
    } of ribbonData.ribbons) {
        for (let i = 0; i < organisms.length - 1; i++) {
            const orgId0 = organisms[i];
            const orgId1 = organisms[i + 1];
            const c0 = connectionMap[orgId0];
            const c1 = connectionMap[orgId1];
            for (const { chromosome: source } of c0) {
                for (const { chromosome: destination } of c1) {
                    if (!map.sources.includes(source)) {
                        map.map[source] = {
                            destinations: [],
                            map: {},
                            total: 0,
                        };
                        map.sources.push(source);
                    }
                    if (!map.map[source].destinations.includes(destination)) {
                        map.map[source].map[destination] = {
                            syntenies: [],
                            map: {},
                            total: 0,
                        };
                        map.map[source].destinations.push(destination);
                    }
                    if (
                        !map.map[source].map[destination].syntenies.includes(
                            synteny
                        )
                    ) {
                        map.map[source].map[destination].map[synteny] = 0;
                        map.map[source].map[destination].syntenies.push(
                            synteny
                        );
                    }
                    map.map[source].map[destination].map[synteny] += 1;
                    map.map[source].map[destination].total += 1;
                    map.map[source].total += 1;
                }
            }
        }
        if (Atomics.load(abortBuffer, 0) === 1) {
            return null;
        }
    }

    for (let i = 0; i < ribbonData.ribbons.length; i++) {
        const { connectionMap, organisms } = ribbonData.ribbons[i];
        for (let j = 0; j < organisms.length - 1; j++) {
            const org0 = organisms[j];
            const org1 = organisms[j + 1];

            for (const { chromosome: src } of connectionMap[org0]) {
                ribbonData.ribbons[i].connectionMap[org1] = connectionMap[
                    org1
                ].filter(({ chromosome: dest, syntenyGroup }) => {
                    const destMap = map.map[src].map[dest];
                    const count = destMap.map[syntenyGroup];
                    return count > settings.orthogroup_strand_count_min;
                });
            }
            if (j !== 0) {
                continue;
            }
            for (const { chromosome: dest } of connectionMap[org1]) {
                ribbonData.ribbons[i].connectionMap[org0] = connectionMap[
                    org0
                ].filter(({ chromosome: src, syntenyGroup }) => {
                    const destMap = map.map[src].map[dest];
                    const count = destMap.map[syntenyGroup];
                    return count > settings.orthogroup_strand_count_min;
                });
            }
        }
    }

    calcStrandCounts(ribbonData);

    return { ribbonData, connectionMap: map };
}
