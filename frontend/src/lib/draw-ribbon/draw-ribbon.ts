import { IRibbonData } from "../process-files/types";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import { SankeyController, Flow } from "chartjs-chart-sankey";
Chart.register(SankeyController, Flow);
import { getColor } from "./color";

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

    const count: {
        map: {
            [key: string]: {
                map: {
                    [key: string]: {
                        map: { [key: string]: number };
                        syntenies: string[];
                    };
                };
                destinations: string[];
            };
        };
        sources: string[];
    } = {
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
            if (!count.sources.includes(source)) {
                count.map[source] = { destinations: [], map: {} };
                count.sources.push(source);
            }
            if (!count.map[source].destinations.includes(destination)) {
                count.map[source].map[destination] = { syntenies: [], map: {} };
                count.map[source].destinations.push(destination);
            }
            if (
                !count.map[source].map[destination].syntenies.includes(synteny)
            ) {
                count.map[source].map[destination].map[synteny] = 0;
                count.map[source].map[destination].syntenies.push(synteny);
            }
            count.map[source].map[destination].map[synteny] += 1;
            source = destination;
        }
    }

    for (const source of count.sources) {
        const sourceMap = count.map[source];
        for (const destination of sourceMap.destinations) {
            const destinationMap = sourceMap.map[destination];
            for (const synteny of destinationMap.syntenies) {
                const count = destinationMap.map[synteny];
                if (count < 15) continue;
                if (source === destination) continue;
                data.push({ source, destination, count, synteny });
            }
        }
    }
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
        },
    });
}
