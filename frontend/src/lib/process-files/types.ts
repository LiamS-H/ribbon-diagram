interface IGraphSettings {
    e_cutoff: number;
    gene_count_max: number;
    post_prob: number;
    strand_count_min: number;
    min_genes_in_chromosome: number;
}

interface IChromosome {
    inStrands: number;
    outStrands: number;
    uniqueStrands: number;
}

interface IOrganism {
    id: string;
    chromosomes: string[];
    chromosomeMap: { [key: string]: IChromosome };
    inStrands: number;
    outStrands: number;
    uniqueStrands: number;
}

interface IConnection {
    startIndex: number;
    endIndex: number;
    organismId: string;
    chromosome: string;
    syntenyGroup: string;
    isStart: boolean;
    isEnd: boolean;
}

interface IRibbon {
    connections: IConnection[];
}

interface IRibbonData {
    orgMap: { [key: string]: IOrganism };
    organisms: string[];
    ribons: IRibbon[];
}

interface IConnectionMap {
    map: {
        [key: string]: {
            map: {
                [key: string]: {
                    map: { [key: string]: number };
                    syntenies: string[];
                    total: number;
                };
            };
            destinations: string[];
            total: number;
        };
    };
    sources: string[];
}

interface OrgFile {
    genes: {
        chromosome: string; // blah1
        startIndex: number;
        endIndex: number;
        gene: string; // blah1|1.1
    }[];
    name: string;
}

type GroupsFile = {
    orthoGroup: string;
    orgToGenes: {
        [key: string]: string[];
    };
    organisms: string[];
}[];

type SyntenyFile = {
    [key: string]: {
        orthoGroup: string;
        syntenyGroup: string;
        postProb: number;
    };
};

interface IParsedFiles {
    orgFiles: OrgFile[];
    groupsFile: GroupsFile;
    syntenyFile: SyntenyFile;
}

export type {
    IGraphSettings,
    IParsedFiles,
    IConnection,
    IOrganism,
    IChromosome,
    IRibbon,
    IRibbonData,
    IConnectionMap,
    OrgFile,
    GroupsFile,
    SyntenyFile,
};
