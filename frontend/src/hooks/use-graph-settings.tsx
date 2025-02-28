import { GraphSettings } from "@/components/graph-settings";
import {
    IGraphSettings,
    IParsingSettings,
    IRenderingSettings,
} from "@/types/graph";
import { useState } from "react";

export function useGraphSettings() {
    const [renderSettings, setRenderSettings] = useState<IRenderingSettings>(
        () => ({
            orthogroup_strand_count_min: 50,
            barycenter_iterations_max: 50,
        })
    );
    const [parsingSettings, seParsingSettings] = useState<IParsingSettings>(
        () => ({
            e_cutoff: 0,
            gene_count_max: 20,
            post_prob: 0.99,
            chrome_strand_count_min: 20,
            min_genes_in_chromosome: 10,
        })
    );
    function setSettings(s: IGraphSettings) {}

    const SettingsComp = () => {
        return (
            <GraphSettings
                settings={{
                    parsing: parsingSettings,
                    redering: renderSettings,
                }}
                setSettings={setSettings}
            />
        );
    };

    return { renderSettings, parsingSettings, SettingsComp };
}
