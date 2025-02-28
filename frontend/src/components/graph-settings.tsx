import { IGraphSettings } from "@/types/graph";
import { Card, CardContent, CardHeader } from "@/components/(ui)/card";
import { Separator } from "@/components/(ui)/separator";

export function GraphSettings({
    settings,
    setSettings,
}: {
    settings: IGraphSettings;
    setSettings: (s: IGraphSettings) => void;
}) {
    return (
        <Card>
            <CardHeader>Settings</CardHeader>
            <CardContent>
                <h1>Parsing</h1>
                <ul className="py-2">
                    <li>
                        chrome_strand_count_min:
                        {settings.parsing.chrome_strand_count_min}
                    </li>
                    {/* <li>e_cutoff:{settings.parsing.e_cutoff}</li> */}
                    {/* <li>gene_count_max:{settings.parsing.gene_count_max}</li> */}
                    <li>
                        min_genes_in_chromosome:
                        {settings.parsing.min_genes_in_chromosome}
                    </li>
                    <li>min_post_prob:{settings.parsing.post_prob}</li>
                </ul>
                <Separator />
                <h1>Rendering</h1>
                <ul className="py-2">
                    <li>
                        orthogroup_strand_count_min:
                        {settings.redering.orthogroup_strand_count_min}
                    </li>
                </ul>
            </CardContent>
        </Card>
    );
}
