export interface IParsingSettings {
    e_cutoff: number; //idk
    gene_count_max: number; //idk
    post_prob: number;
    chrome_strand_count_min: number;
    min_genes_in_chromosome: number;
}

export interface ISolverSettings {
    orthogroup_strand_count_min: number;
    barycenter_iterations_max: number;
    deterministic_barycenter: boolean;
    lock_chromosomes: boolean;
}

export interface IRenderingSettings {
    horizontal: boolean;
    thread_opacity: number;
    highlighted_orthgroup: string | null;
}

export interface IGraphSettings {
    parsing: IParsingSettings;
    rendering: IRenderingSettings;
    solving: ISolverSettings;
}

export interface IChromosome {
    inStrands: number;
    outStrands: number;
    uniqueStrands: number;
}

export interface IOrganism {
    id: string;
    chromosomes: string[];
    chromosomeMap: { [key: string]: IChromosome };
    inStrands: number;
    outStrands: number;
    uniqueStrands: number;
}

export interface IConnection {
    startIndex: number;
    endIndex: number;
    organismId: string;
    chromosome: string;
    syntenyGroup: string;
    isStart: boolean;
    isEnd: boolean;
}

export interface IRibbon {
    connectionMap: { [key: string]: IConnection[] };
    organisms: string[];
    syntenyGroup: string;
}

export interface IRibbonData {
    orgMap: { [key: string]: IOrganism };
    organisms: string[];
    ribbons: IRibbon[];
    colorMap: Record<string, string>;
}

export interface IConnectionMap {
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
