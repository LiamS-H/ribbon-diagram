import {
    IRibbon,
    IConnection,
    IRibbonData,
    OrgFile,
    GroupsFile,
    SyntenyFile,
    IGraphSettings,
    IChromosome,
} from "./types";

export function processFiles(
    {
        orgFiles,
        groupsFile,
        syntenyFile,
    }: {
        orgFiles: OrgFile[];
        groupsFile: GroupsFile;
        syntenyFile: SyntenyFile;
    },
    settings: IGraphSettings = {
        e_cutoff: 0,
        gene_count_max: 20,
        post_prob: 0.99,
        strand_count_min: 20,
        min_genes_in_chromosome: 10,
    }
): IRibbonData {
    const data: IRibbonData = {
        orgMap: {},
        ribons: [],
        organisms: [],
    };
    const geneToChromosome: {
        [key: string]: {
            orgId: string;
            chromosome: string;
            startIndex: number;
            endIndex: number;
        };
    } = {};

    const count = new Map<string, number>();

    for (const orgFile of orgFiles) {
        const chromosomes = new Set<string>();
        const chromosomeMap: { [key: string]: IChromosome } = {};
        for (const {
            chromosome,
            gene,
            startIndex,
            endIndex,
        } of orgFile.genes) {
            geneToChromosome[gene] = {
                chromosome,
                orgId: orgFile.name,
                startIndex,
                endIndex,
            };
            count.set(chromosome, count.get(chromosome) || 0 + 1);
            if (chromosomes.has(chromosome)) continue;
            chromosomeMap[chromosome] = {
                inStrands: 0,
                outStrands: 0,
                uniqueStrands: 0,
            };
            chromosomes.add(chromosome);
        }
        data.orgMap[orgFile.name] = {
            chromosomes: Array.from(chromosomes).filter(
                (c) => count.get(c) || 0 >= settings.min_genes_in_chromosome
            ),
            id: orgFile.name,
            chromosomeMap,
            inStrands: 0,
            outStrands: 0,
            uniqueStrands: 0,
        };
        data.organisms.push(orgFile.name);
    }

    let ribbons: IRibbon[] = [];

    for (const { orgToGenes, orthoGroup, organisms } of groupsFile) {
        if (syntenyFile[orthoGroup].postProb < settings.post_prob) continue;
        const syntenyGroup = syntenyFile[orthoGroup].syntenyGroup;
        const connections: IConnection[] = [];
        for (let i = 0; i < organisms.length; i++) {
            const orgId = organisms[i];
            const isStart = i === 0;
            const isEnd = i === organisms.length - 1;
            // const doesContinue: boolean = data.organisms[i + 1] in orgToGenes;
            // const hasContinued: boolean = data.organisms[i - 1] in orgToGenes;

            for (const gene of orgToGenes[orgId] ?? []) {
                const { chromosome, startIndex, endIndex } =
                    geneToChromosome[gene];
                connections.push({
                    syntenyGroup,
                    chromosome,
                    organismId: orgId,
                    startIndex,
                    endIndex,
                    isEnd,
                    isStart,
                });
                if (!isEnd) {
                    data.orgMap[orgId].chromosomeMap[
                        chromosome
                    ].outStrands += 1;
                    data.orgMap[orgId].outStrands += 1;
                }
                if (!isStart) {
                    data.orgMap[orgId].chromosomeMap[chromosome].inStrands += 1;
                    data.orgMap[orgId].inStrands += 1;
                }
                data.orgMap[orgId].chromosomeMap[chromosome].uniqueStrands += 1;
                data.orgMap[orgId].uniqueStrands += 1;
            }
        }
        ribbons.push({ connections });
    }

    ribbons = ribbons.filter(({ connections }) => {
        return connections.every(({ organismId, chromosome }) => {
            const strands =
                data.orgMap[organismId].chromosomeMap[chromosome].uniqueStrands;
            return strands >= settings.strand_count_min;
        });
    });

    const deleted = new Set<string>();

    for (const orgId of data.organisms) {
        for (const chromosome of data.orgMap[orgId].chromosomes) {
            if (deleted.has(chromosome)) continue;
            const org = data.orgMap[orgId];
            if (
                org.chromosomeMap[chromosome].uniqueStrands >=
                settings.strand_count_min
            ) {
                continue;
            }

            delete data.orgMap[orgId].chromosomeMap[chromosome];
            deleted.add(chromosome);
        }
    }
    for (const orgId of data.organisms) {
        data.orgMap[orgId].chromosomes = data.orgMap[orgId].chromosomes.filter(
            (c) => !deleted.has(c)
        );
    }

    // reset and recalc strand counts
    for (const orgFile of orgFiles) {
        const chromosomes = new Set<string>();
        const chromosomeMap: { [key: string]: IChromosome } = {};
        for (const { chromosome } of orgFile.genes) {
            if (chromosomes.has(chromosome)) continue;
            if (deleted.has(chromosome)) continue;
            chromosomes.add(chromosome);
            chromosomeMap[chromosome] = {
                inStrands: 0,
                outStrands: 0,
                uniqueStrands: 0,
            };
        }
        data.orgMap[orgFile.name].chromosomeMap = chromosomeMap;
        data.orgMap[orgFile.name].inStrands = 0;
    }
    for (const { connections } of ribbons) {
        for (const {
            chromosome,
            organismId: orgId,
            isEnd,
            isStart,
        } of connections) {
            if (!isEnd) {
                data.orgMap[orgId].chromosomeMap[chromosome].outStrands += 1;
                data.orgMap[orgId].outStrands += 1;
            }
            if (!isStart) {
                data.orgMap[orgId].chromosomeMap[chromosome].inStrands += 1;
                data.orgMap[orgId].inStrands += 1;
            }
            data.orgMap[orgId].chromosomeMap[chromosome].uniqueStrands += 1;
            data.orgMap[orgId].uniqueStrands += 1;
        }
    }

    data.ribons = ribbons;
    return data;
}
