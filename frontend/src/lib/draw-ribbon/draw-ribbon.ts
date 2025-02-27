import { IConnectionMap, IRibbonData } from "../process-files/types";
import { Chart, registerables, SankeyControllerDatasetOptions } from "chart.js";
Chart.register(...registerables);
// import { Sankey, Flow } from "../sankey-chartjs/src";
// Chart.register(Sankey, Flow);
import {
    SankeyController,
    Flow,
} from "@/lib/sankey-dist/chartjs-chart-sankey.esm";
Chart.register(SankeyController, Flow);
// import { getColor } from "./color";
import { barycenterChromosomeOrder } from "./bary-center";
import { DrawPretty } from "./draw-pretty";

export async function DrawRibbon(
    ribbonData: IRibbonData,
    canvas: HTMLCanvasElement
) {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("couldn't fetch canvas context.");
        return;
    }

    const map: IConnectionMap = {
        sources: [],
        map: {},
    };

    for (const { connections } of ribbonData.ribons) {
        let source: string | null = null;
        for (const {
            chromosome: destination,
            syntenyGroup: synteny,
        } of connections) {
            if (!source) {
                source = destination;
                continue;
            }
            if (!map.sources.includes(source)) {
                map.map[source] = { destinations: [], map: {}, total: 0 };
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
            if (!map.map[source].map[destination].syntenies.includes(synteny)) {
                map.map[source].map[destination].map[synteny] = 0;
                map.map[source].map[destination].syntenies.push(synteny);
            }
            map.map[source].map[destination].map[synteny] += 1;
            map.map[source].map[destination].total += 1;
            map.map[source].total += 1;

            if (!map.sources.includes(destination)) {
                map.map[destination] = { destinations: [], map: {}, total: 0 };
                map.sources.push(destination);
            }
            map.map[destination].total += 1;
            source = destination;
        }
    }

    const orgCount: Record<string, number> = {};

    for (const org of ribbonData.organisms) {
        orgCount[org] = 0;
        for (const chromosome of ribbonData.orgMap[org].chromosomes) {
            const m = map.map[chromosome];
            if (!m) continue;
            orgCount[org] += m.total;
        }
    }
    console.log(orgCount);

    const ordering = barycenterChromosomeOrder(ribbonData, map);
    console.log("ordering:", ordering);
    for (const org of ribbonData.organisms) {
        ribbonData.orgMap[org].chromosomes = ordering[org];
    }
    // DrawPretty(canvas, ribbonData, map);
    DrawPretty(canvas, ribbonData);

    // const min_threads = 50;
    // const data = [];
    // for (const org of ribbonData.organisms) {
    //         for (const source of ribbonData.orgMap[org].chromosomes) {
    //             const sourceMap = map.map[source];
    //             if (!sourceMap) continue;
    //             for (const destination of sourceMap.destinations) {
    //                 const destinationMap = sourceMap.map[destination];
    //                 for (const synteny of destinationMap.syntenies) {
    //                     let count = destinationMap.map[synteny];
    //                     if (count < min_threads) continue;
    //                     if (source === destination) continue;
    //                     data.push({
    //                         source,
    //                         destination,
    //                         count,
    //                         synteny,
    //                     });
    //                 }
    //             }
    //         }
    //     }
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
