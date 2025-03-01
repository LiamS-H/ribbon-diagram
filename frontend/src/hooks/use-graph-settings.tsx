import { IGraphSettings } from "@/types/graph";
import { useState } from "react";

export function useGraphSettings() {
    return useState<IGraphSettings>(() => ({
        rendering: {
            orthogroup_strand_count_min: 50,
            barycenter_iterations_max: 50,
            deterministic_barycenter: false,
            lock_chromosomes: false,
            horizontal: false,
        },
        parsing: {
            e_cutoff: 0,
            gene_count_max: 20,
            post_prob: 0.99,
            chrome_strand_count_min: 20,
            min_genes_in_chromosome: 10,
        },
    }));
}
