import { IConnectionMap, IRibbonData } from "../process-files/types";

export function barycenterChromosomeOrder(
    ribbonData: IRibbonData,
    connectionMap: IConnectionMap,
    maxIterations: number = 100
): { [key: string]: string[] } {
    const result: { [key: string]: string[] } = {};

    for (const org of ribbonData.organisms) {
        result[org] = [...ribbonData.orgMap[org].chromosomes];
    }

    let hasChanges = true;
    let iteration = 0;
    let mutate;

    while (hasChanges && iteration < maxIterations) {
        if (!hasChanges && mutate) {
            break;
        }
        if (!hasChanges) {
            mutate = true;
        } else {
            mutate = false;
        }
        hasChanges = false;
        iteration++;
        ribbonData.organisms.reverse();

        for (const currentOrg of ribbonData.organisms) {
            if (result[currentOrg].length <= 1) continue;

            const barycenters: { chromosome: string; value: number }[] = [];

            for (const chromosome of result[currentOrg]) {
                let weightedConnections = 0;
                let totalConnections = 0;
                const curPosition = result[currentOrg].indexOf(chromosome);

                if (connectionMap.sources.includes(chromosome)) {
                    const connections = connectionMap.map[chromosome];

                    for (const destChromosome of connections.destinations) {
                        const targetOrganism = getOrganismForChromosome(
                            destChromosome,
                            ribbonData
                        );

                        const weight = connections.map[destChromosome].total;
                        const position =
                            result[targetOrganism].indexOf(destChromosome);

                        if (position !== -1) {
                            weightedConnections +=
                                (position - curPosition) * weight;
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
                                .total;
                        const position =
                            result[sourceOrganism].indexOf(sourceChromosome);

                        if (position !== -1) {
                            weightedConnections +=
                                (position - curPosition) * weight;
                            totalConnections += weight;
                        }
                    }
                }

                let baryValue = weightedConnections / totalConnections;
                if (mutate) {
                    baryValue += Math.random() - 0.5;
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

/**
 * Helper function to find which organism a chromosome belongs to
 */
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

/**
 * Helper function to check if two arrays have the same elements in the same order
 */
function areArraysEqual(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}
