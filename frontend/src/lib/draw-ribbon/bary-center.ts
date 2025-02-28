import {
    IConnectionMap,
    IRenderingSettings,
    IRibbonData,
} from "../../types/graph";

export function barycenterChromosomeOrder(
    ribbonData: IRibbonData,
    connectionMap: IConnectionMap,
    settings: IRenderingSettings,
    abortBuffer: Int32Array<SharedArrayBuffer>
): { [key: string]: string[] } | null {
    const result: { [key: string]: string[] } = {};

    for (const org of ribbonData.organisms) {
        result[org] = [...ribbonData.orgMap[org].chromosomes];
    }

    let hasChanges = true;
    let iteration = 0;
    let mutate;

    const organisms = [...ribbonData.organisms];

    while (iteration < settings.barycenter_iterations_max) {
        if (!hasChanges && (mutate || settings.deterministic_barycenter)) {
            break;
        }
        if (hasChanges) {
            mutate = false;
        } else {
            mutate = true;
        }
        hasChanges = false;
        iteration++;
        organisms.reverse();

        for (const currentOrg of organisms) {
            if (result[currentOrg].length <= 1) continue;

            const barycenters: { chromosome: string; value: number }[] = [];

            for (const chromosome of result[currentOrg]) {
                let weightedConnections = 0;
                let totalConnections = 0;

                if (connectionMap.sources.includes(chromosome)) {
                    const connections = connectionMap.map[chromosome];

                    for (const destChromosome of connections.destinations) {
                        const targetOrganism = getOrganismForChromosome(
                            destChromosome,
                            ribbonData
                        );

                        const weight =
                            connections.map[destChromosome].total ** 2;
                        const position =
                            result[targetOrganism].indexOf(destChromosome) /
                            result[targetOrganism].length;

                        if (position !== -1) {
                            weightedConnections += position * weight;
                            totalConnections += weight;
                        }
                    }
                }

                for (const sourceChromosome of connectionMap.sources) {
                    if (
                        connectionMap.map[
                            sourceChromosome
                        ].destinations.includes(chromosome)
                    ) {
                        const sourceOrganism = getOrganismForChromosome(
                            sourceChromosome,
                            ribbonData
                        );

                        const weight =
                            connectionMap.map[sourceChromosome].map[chromosome]
                                .total ** 2;
                        const position =
                            result[sourceOrganism].indexOf(sourceChromosome) /
                            result[sourceOrganism].length;

                        if (position !== -1) {
                            weightedConnections += position * weight;
                            totalConnections += weight;
                        }
                    }
                }
                if (Atomics.load(abortBuffer, 0) === 1) {
                    return null;
                }

                let baryValue = weightedConnections / totalConnections;
                if (mutate && !settings.deterministic_barycenter) {
                    baryValue += Math.random() * 0.1;
                }

                barycenters.push({ chromosome, value: baryValue });
            }

            barycenters.sort((a, b) => a.value - b.value);

            const newOrder = barycenters.map((item) => item.chromosome);
            if (!areArraysEqual(newOrder, result[currentOrg])) {
                hasChanges = true;
                result[currentOrg] = newOrder;
            }
        }
    }

    return result;
}

function getOrganismForChromosome(
    chromosome: string,
    ribbonData: IRibbonData
): string {
    for (const org of ribbonData.organisms) {
        if (ribbonData.orgMap[org].chromosomes.includes(chromosome)) {
            return org;
        }
    }
    return "";
}

function areArraysEqual(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}
