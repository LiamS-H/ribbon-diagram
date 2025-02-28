import { IGraphSettings } from "@/types/graph";
import { Card, CardContent, CardHeader } from "@/components/(ui)/card";
import { Separator } from "@/components/(ui)/separator";
import { Slider } from "./(ui)/slider";
import { Label } from "./(ui)/label";

export function GraphSettings({
    settings,
    setSettings,
}: {
    settings: IGraphSettings;
    setSettings: (s: Partial<IGraphSettings>) => void;
}) {
    return (
        <>
            <ul className="py-2">
                <h1>Parsing</h1>
                <Slider
                    defaultValue={[settings.parsing.chrome_strand_count_min]}
                    max={200}
                    step={5}
                    onValueChange={(v) => {
                        setSettings({
                            parsing: {
                                ...settings.parsing,
                                chrome_strand_count_min: v[0],
                            },
                        });
                    }}
                />
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
            <ul className="py-2">
                <h1>Rendering</h1>
                <Label htmlFor="orthogroup_strand_count_min">
                    orthogroup_strand_count_min:
                    {settings.redering.orthogroup_strand_count_min}
                </Label>
                <Slider
                    id="orthogroup_strand_count_min"
                    defaultValue={[
                        settings.redering.orthogroup_strand_count_min,
                    ]}
                    max={200}
                    step={5}
                    onValueChange={(v) => {
                        setSettings({
                            redering: {
                                ...settings.redering,
                                orthogroup_strand_count_min: v[0],
                            },
                        });
                    }}
                />
                <li></li>
                <Label htmlFor="barycenter_iterations_max">
                    barycenter_iterations_max:
                    {settings.redering.barycenter_iterations_max}
                </Label>
                <Slider
                    id="barycenter_iterations_max"
                    defaultValue={[settings.redering.barycenter_iterations_max]}
                    max={200}
                    step={5}
                    onValueChange={(v) => {
                        setSettings({
                            redering: {
                                ...settings.redering,
                                barycenter_iterations_max: v[0],
                            },
                        });
                    }}
                />
                <li></li>
            </ul>
        </>
    );
}
