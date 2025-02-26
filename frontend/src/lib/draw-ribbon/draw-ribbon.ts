import { IConnectionMap, IRibbonData } from "../process-files/types";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import { SankeyController, Flow } from "chartjs-chart-sankey";
Chart.register(SankeyController, Flow);
import { getColor } from "./color";
import { barycenterChromosomeOrder } from "./bary-center";

export async function DrawRibbon(
    ribbonData: IRibbonData,
    canvas: HTMLCanvasElement
) {
    const data = [];
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
                map.map[source] = { destinations: [], map: {} };
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
            source = destination;
        }
    }

    const ordering = barycenterChromosomeOrder(ribbonData, map);
    console.log(ordering);

    for (const org of ribbonData.organisms) {
        ribbonData.orgMap[org].chromosomes = ordering[org];
    }

    const min_threads = 11;

    const rendered = new Set<string>();

    for (let i = 0; i < 100; i++) {
        for (const org1 of ribbonData.organisms) {
            for (const org2 of ribbonData.organisms) {
                if (i >= ordering[org1].length) continue;
                const source = ordering[org1][i];
                const sourceMap = map.map[source];
                if (!sourceMap) continue;

                if (i >= ordering[org2].length) continue;
                const destination = ordering[org2][i];
                const destinationMap = sourceMap.map[destination];
                if (!destinationMap) continue;
                rendered.add(`${destination}${source}`);

                for (const synteny of destinationMap.syntenies) {
                    const count = destinationMap.map[synteny];
                    if (count < min_threads) continue;
                    if (source === destination) continue;
                    data.push({
                        source: source,
                        destination,
                        count,
                        synteny,
                    });
                }
            }
        }
    }
    for (const org1 of ribbonData.organisms) {
        for (const source of ordering[org1]) {
            const sourceMap = map.map[source];
            if (!sourceMap) continue;
            for (const org2 of ribbonData.organisms) {
                for (const destination of ordering[org2]) {
                    if (rendered.has(`${destination}${source}`)) continue;
                    const destinationMap = sourceMap.map[destination];
                    if (!destinationMap) continue;
                    for (const synteny of destinationMap.syntenies) {
                        const count = destinationMap.map[synteny];
                        if (count < min_threads) continue;
                        if (source === destination) continue;
                        data.push({
                            source: source,
                            destination,
                            count,
                            synteny,
                        });
                    }
                }
            }
        }
    }

    // for (const source of map.sources) {
    //     const sourceMap = map.map[source];
    //     for (const destination of sourceMap.destinations) {
    //         const destinationMap = sourceMap.map[destination];
    //         if (rendered.has(`${destination}${source}`)) continue;
    //         for (const synteny of destinationMap.syntenies) {
    //             const count = destinationMap.map[synteny];
    //             if (count < min_threads) continue;
    //             if (source === destination) continue;
    //             data.push({ source, destination, count, synteny });
    //         }
    //     }
    // }
    console.log(data);

    new Chart(ctx, {
        type: "sankey",
        data: {
            datasets: [
                {
                    label: "Test",
                    data,
                    size: "max",
                    colorFrom: (c) =>
                        getColor(c.dataset.data[c.dataIndex].synteny),
                    colorTo: (c) =>
                        getColor(c.dataset.data[c.dataIndex].synteny),
                    hoverColorFrom: (c) =>
                        getColor(c.dataset.data[c.dataIndex].synteny),
                    hoverColorTo: (c) =>
                        getColor(c.dataset.data[c.dataIndex].synteny),
                    colorMode: "gradient",
                },
            ],
        },
        options: {
            parsing: {
                from: "source",
                to: "destination",
                flow: "count",
                group: "synteny",
            },
            scales: {
                // y: {
                //     type: "linear",
                //     reverse: true,
                //     offset: true,
                //     min: 0,
                //     max: 5200,
                // },
                x: {
                    type: "linear",
                    offset: true,
                    min: 0,
                    max: ribbonData.organisms.length,
                },
            },
        },
    });
}
