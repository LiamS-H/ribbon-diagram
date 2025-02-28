export interface IFile {
    file: File;
    type: "bed" | "n0" | "synteny";
}
export interface IParsedFiles {
    orgFiles: OrgFile[];
    groupsFile: GroupsFile;
    syntenyFile: SyntenyFile;
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
