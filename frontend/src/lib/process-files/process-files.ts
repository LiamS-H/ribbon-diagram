import {
    IRibbon,
    IConnection,
    IRibbonData,
    IParsingSettings,
    IChromosome,
} from "../../types/graph";
import { IProcessedFiles } from "@/types/file";

export function processFiles(
    { orgFiles, groupsFile, syntenyFile, colorMap }: IProcessedFiles,
    settings: IParsingSettings,
    abortBuffer: Int32Array<SharedArrayBuffer>
): IRibbonData | null {
    const data: IRibbonData = {
        orgMap: {},
        ribbons: [],
        organisms: [],
        colorMap,
        syntenyGroups: [],
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
    console.log(orgFiles);

    for (const orgFile of orgFiles) {
        if (Atomics.load(abortBuffer, 0) === 1) {
            return null;
        }
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

    const ribbons: IRibbon[] = [];
    const syntenySet = new Set<string>();

    for (const { orgToGenes, orthoGroup, organisms: orthoOrgs } of groupsFile) {
        if (Atomics.load(abortBuffer, 0) === 1) {
            return null;
        }
        if (!syntenyFile[orthoGroup]) {
            console.error("couldn't find orthogroup", orthoGroup);
            continue;
        }
        if (syntenyFile[orthoGroup].postProb < settings.post_prob) continue;
        const syntenyGroup = syntenyFile[orthoGroup].syntenyGroup;
        syntenySet.add(syntenyGroup);
        const organisms: string[] = [];
        const connectionMap: Record<string, IConnection[]> = {};
        for (let i = 0; i < orthoOrgs.length; i++) {
            const orgId = orthoOrgs[i];
            const genes = orgToGenes[orgId];
            if (!genes) continue;
            const connections: IConnection[] = [];
            const isStart = i === 0;
            const isEnd = i === orthoOrgs.length - 1;

            for (const gene of genes) {
                if (!geneToChromosome[gene]) {
                    console.error(`couldn't map gene:${gene} to a chromosome.`);
                    continue;
                }
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
                if (!data.orgMap[orgId].chromosomeMap[chromosome]) {
                    console.error(
                        `A connection in N0 mapped ${gene} to ${chromosome} to, but ${chromosome} is missing from ${orgId}.`
                    );
                    continue;
                }
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

            connectionMap[orgId] = connections;
            organisms.push(orgId);
        }
        ribbons.push({ connectionMap, organisms, syntenyGroup });
    }
    data.syntenyGroups = Array.from(syntenySet);

    const deleted = new Set<string>();

    for (const orgId of data.organisms) {
        for (const chromosome of data.orgMap[orgId].chromosomes) {
            if (deleted.has(chromosome)) continue;
            const org = data.orgMap[orgId];
            if (
                org.chromosomeMap[chromosome].uniqueStrands >=
                settings.chrome_strand_count_min
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
    for (let i = 0; i < ribbons.length; i++) {
        const { organisms } = ribbons[i];
        for (const orgId of organisms) {
            ribbons[i].connectionMap[orgId] = ribbons[i].connectionMap[
                orgId
            ].filter(({ chromosome: c }) => !deleted.has(c));
        }
    }
    data.ribbons = ribbons;

    calcStrandCounts(data);

    return data;
}

export function calcStrandCounts(data: IRibbonData) {
    for (const orgId of data.organisms) {
        const chromosomes = new Set<string>();
        const chromosomeMap: { [key: string]: IChromosome } = {};
        const org = data.orgMap[orgId];
        for (const chromosome of org.chromosomes) {
            if (chromosomes.has(chromosome)) continue;
            chromosomes.add(chromosome);
            chromosomeMap[chromosome] = {
                inStrands: 0,
                outStrands: 0,
                uniqueStrands: 0,
            };
        }
        data.orgMap[orgId].chromosomeMap = chromosomeMap;
        data.orgMap[orgId].inStrands = 0;
        data.orgMap[orgId].uniqueStrands = 0;
        data.orgMap[orgId].outStrands = 0;
    }

    for (const { organisms, connectionMap } of data.ribbons) {
        for (let i = 0; i < organisms.length - 1; i++) {
            const orgId0 = organisms[i];
            const orgId1 = organisms[i + 1];
            const c0 = connectionMap[orgId0];
            const c1 = connectionMap[orgId1];
            for (const { chromosome: ch0 } of c0) {
                data.orgMap[orgId0].chromosomeMap[ch0].outStrands += c1.length;
                data.orgMap[orgId0].outStrands += c1.length;
                if (i == 0) {
                    data.orgMap[orgId0].chromosomeMap[ch0].uniqueStrands +=
                        c1.length;
                    data.orgMap[orgId0].uniqueStrands += c1.length;
                }
            }
            for (const { chromosome: ch1 } of c1) {
                data.orgMap[orgId1].chromosomeMap[ch1].inStrands += c0.length;
                data.orgMap[orgId1].inStrands += c0.length;
                data.orgMap[orgId1].chromosomeMap[ch1].uniqueStrands +=
                    c0.length;
                data.orgMap[orgId1].uniqueStrands += c0.length;
            }
        }
    }
}
