export interface IFile {
    name: string;
    file: File;
    type: "bed" | "n0" | "synteny" | "color";
}

export interface IRawFiles {
    bedFiles: IFile[];
    n0File: IFile | null;
    synFile: IFile | null;
    colorFile: IFile | null;
}
export interface IParsedFiles {
    bedFiles: IFile[];
    n0File: IFile;
    synFile: IFile;
    colorFile: IFile;
}

export interface IProcessedFiles {
    orgFiles: OrgFile[];
    groupsFile: GroupsFile;
    syntenyFile: SyntenyFile;
    colorMap: Record<string, string>;
}
export type SyntenyFile = {
    [key: string]: {
        orthoGroup: string;
        syntenyGroup: string;
        postProb: number;
    };
};
export type GroupsFile = {
    orthoGroup: string;
    orgToGenes: {
        [key: string]: string[];
    };
    organisms: string[];
}[];
export interface OrgFile {
    genes: {
        chromosome: string; // blah1
        startIndex: number;
        endIndex: number;
        gene: string; // blah1|1.1
    }[];
    name: string;
}
