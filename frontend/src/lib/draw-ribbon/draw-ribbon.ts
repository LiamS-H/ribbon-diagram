import { IConnectionMap, IRibbonData } from "../process-files/types";
import { barycenterChromosomeOrder } from "./bary-center";
import { DrawPretty } from "./draw-pretty";
import { calcStrandCounts } from "../process-files/process-files";

export async function DrawRibbon(
    ribbonData: IRibbonData,
    canvas: HTMLCanvasElement
) {
    const min_threads = 60;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("couldn't fetch canvas context.");
        return;
    }

    const map: IConnectionMap = {
        sources: [],
        map: {},
    };

    for (const {
        organisms,
        connectionMap,
        syntenyGroup: synteny,
    } of ribbonData.ribons) {
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

                    // if (!map.sources.includes(destination)) {
                    //     map.map[destination] = {
                    //         destinations: [],
                    //         map: {},
                    //         total: 0,
                    //     };
                    //     map.sources.push(destination);
                    // }
                    // map.map[destination].total += 1;
                }
            }
        }
    }

    for (let i = 0; i < ribbonData.ribons.length; i++) {
        const { connectionMap, organisms } = ribbonData.ribons[i];
        for (let j = 0; j < organisms.length - 1; j++) {
            const org0 = organisms[j];
            const org1 = organisms[j + 1];

            for (const { chromosome: src } of connectionMap[org0]) {
                ribbonData.ribons[i].connectionMap[org1] = connectionMap[
                    org1
                ].filter(({ chromosome: dest, syntenyGroup }) => {
                    const destMap = map.map[src].map[dest];
                    const count = destMap.map[syntenyGroup];
                    return count > min_threads;
                });
            }
            if (j !== 0) {
                continue;
            }
            for (const { chromosome: dest } of connectionMap[org1]) {
                ribbonData.ribons[i].connectionMap[org0] = connectionMap[
                    org0
                ].filter(({ chromosome: src, syntenyGroup }) => {
                    const destMap = map.map[src].map[dest];
                    const count = destMap.map[syntenyGroup];
                    return count > min_threads;
                });
            }
        }
    }

    calcStrandCounts(ribbonData);
    console.log(ribbonData);

    const ordering = barycenterChromosomeOrder(ribbonData, map);
    for (const org of ribbonData.organisms.reverse()) {
        ribbonData.orgMap[org].chromosomes = ordering[org];
    }
    DrawPretty(canvas, ribbonData);

    // const data = [];
    // for (const org of ribbonData.organisms) {
    //     for (const source of ribbonData.orgMap[org].chromosomes) {
    //         const sourceMap = map.map[source];
    //         if (!sourceMap) continue;
    //         for (const destination of sourceMap.destinations) {
    //             const destinationMap = sourceMap.map[destination];
    //             for (const synteny of destinationMap.syntenies) {
    //                 let count = destinationMap.map[synteny];
    //                 if (count < min_threads) continue;
    //                 if (source === destination) continue;
    //                 data.push({
    //                     source,
    //                     destination,
    //                     count,
    //                     synteny,
    //                 });
    //             }
    //         }
    //     }
    // }
    // const column: Record<string, number> = {};
    // const priority: Record<string, number> = {};

    // for (let i = 0; i < ribbonData.organisms.length; i++) {
    //     const org = ribbonData.organisms[i];
    //     for (let j = 0; j < ordering[org].length; j++) {
    //         const chromosome = ordering[org][j];
    //         column[chromosome] = i;
    //         priority[chromosome] = j;
    //     }
    // }
    // function title(
    //     tooltipItems: [{ dataset: { data: any }; dataIndex: number }]
    // ) {
    //     const test = tooltipItems[0];
    //     return test.dataset.data[test.dataIndex].synteny;
    // }

    // const options: SankeyControllerDatasetOptions = {
    //     parsing: {
    //         from: "source",
    //         to: "destination",
    //         flow: "count",
    //         group: "synteny",
    //     },
    //     column,
    //     priority,
    //     scales: {
    //         // y: {
    //         //     type: "linear",
    //         //     reverse: true,
    //         //     offset: true,
    //         //     min: 0,
    //         //     max: 5200,
    //         // },
    //         x: {
    //             type: "linear",
    //             offset: true,
    //             min: 0,
    //             max: ribbonData.organisms.length,
    //         },
    //     },
    //     plugins: {
    //         tooltip: {
    //             callbacks: {
    //                 title,
    //             },
    //         },
    //     },
    // };

    // new Chart(ctx, {
    //     type: "sankey",
    //     data: {
    //         datasets: [
    //             {
    //                 label: "Test",
    //                 data,
    //                 size: "max",
    //                 colorFrom: (c) =>
    //                     getColor(c.dataset.data[c.dataIndex].synteny),
    //                 colorTo: (c) =>
    //                     getColor(c.dataset.data[c.dataIndex].synteny),
    //                 hoverColorFrom: (c) =>
    //                     getColor(c.dataset.data[c.dataIndex].synteny),
    //                 hoverColorTo: (c) =>
    //                     getColor(c.dataset.data[c.dataIndex].synteny),
    //                 colorMode: "gradient",
    //             },
    //         ],
    //     },
    //     options,
    // });
}
