type Chromosome = string;

interface IGraphSettings {
    e_cutoff: number;
    gene_count_max: number;
    post_prob: number;
    strand_count_min: number;
    min_genes_in_chromosome: number;
}

interface IOrganism {
    id: string;
    chromosomes: string[];
    ribbonCount: { [key: Chromosome]: number };
}

interface IConnection {
    startIndex: number;
    endIndex: number;
    organismId: string;
    chromosome: string;
    syntenyGroup: string;
}

interface IRibbon {
    connections: IConnection[];
}

interface IRibbonData {
    organisms: { [key: string]: IOrganism };
    ribons: IRibbon[];
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
    IRibbon,
    IRibbonData,
    OrgFile,
    GroupsFile,
    SyntenyFile,
};
