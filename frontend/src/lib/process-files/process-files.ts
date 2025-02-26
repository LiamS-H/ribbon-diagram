import {
    IRibbon,
    IConnection,
    IRibbonData,
    OrgFile,
    GroupsFile,
    SyntenyFile,
    IGraphSettings,
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
        organisms: {},
        ribons: [],
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
        const ribbonCount: { [key: string]: number } = {};
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
            ribbonCount[chromosome] = 0;
            chromosomes.add(chromosome);
        }
        data.organisms[orgFile.name] = {
            chromosomes: Array.from(chromosomes).filter(
                (c) => count.get(c) || 0 >= settings.min_genes_in_chromosome
            ),
            id: orgFile.name,
            ribbonCount: ribbonCount,
        };
    }

    let ribbons: IRibbon[] = [];

    for (const { orgToGenes, orthoGroup } of groupsFile) {
        if (syntenyFile[orthoGroup].postProb < settings.post_prob) continue;
        const syntenyGroup = syntenyFile[orthoGroup].syntenyGroup;
        const connections: IConnection[] = [];
        for (const orgId of Object.keys(data.organisms)) {
            for (const gene of orgToGenes[orgId]) {
                try {
                    const { chromosome, startIndex, endIndex } =
                        geneToChromosome[gene];
                    connections.push({
                        syntenyGroup,
                        chromosome,
                        organismId: orgId,
                        startIndex,
                        endIndex,
                    });
                    data.organisms[orgId].ribbonCount[chromosome] += 1;
                } catch {
                    console.log("couldnot find:", { gene, orgId });
                }
            }
        }
        ribbons.push({ connections });
    }
    const deleted = new Set<string>();

    ribbons = ribbons.filter(({ connections }) =>
        connections.every(({ organismId, chromosome }) => {
            const strand_count =
                data.organisms[organismId].ribbonCount[chromosome];
            return strand_count >= settings.strand_count_min;
        })
    );

    for (const orgId of Object.keys(data.organisms)) {
        for (const chromosome of data.organisms[orgId].chromosomes) {
            if (deleted.has(chromosome)) continue;
            const org = data.organisms[orgId];
            if (org.ribbonCount[chromosome] >= settings.strand_count_min) {
                continue;
            }
            data.organisms[orgId].chromosomes = org.chromosomes.filter(
                (c) => c !== chromosome
            );
            deleted.add(chromosome);
        }
    }

    // reset and recalc ribbonCount
    for (const orgFile of orgFiles) {
        const chromosomes = new Set<string>();
        const ribbonCount: { [key: string]: number } = {};
        for (const { chromosome } of orgFile.genes) {
            if (chromosomes.has(chromosome)) continue;
            if (deleted.has(chromosome)) continue;
            chromosomes.add(chromosome);
            ribbonCount[chromosome] = 0;
        }
        data.organisms[orgFile.name].ribbonCount = ribbonCount;
    }
    for (const { connections } of ribbons) {
        for (const { chromosome, organismId } of connections) {
            data.organisms[organismId].ribbonCount[chromosome] += 1;
        }
    }

    data.ribons = ribbons;
    return data;
}
