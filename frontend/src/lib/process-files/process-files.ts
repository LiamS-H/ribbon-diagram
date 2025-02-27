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

    for (const { orgToGenes, orthoGroup, organisms: orthoOrgs } of groupsFile) {
        if (syntenyFile[orthoGroup].postProb < settings.post_prob) continue;
        const syntenyGroup = syntenyFile[orthoGroup].syntenyGroup;
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

            connectionMap[orgId] = connections;
            organisms.push(orgId);
        }
        ribbons.push({ connectionMap, organisms, syntenyGroup });
    }

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
    console.log(Array.from(deleted).sort());

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
    data.ribons = ribbons;

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

    for (const { organisms, connectionMap } of data.ribons) {
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
