import { IGraphSettings } from "@/types/graph";
import { Separator } from "@/components/(ui)/separator";
import { Slider } from "./(ui)/slider";
import { Label } from "./(ui)/label";
import { Switch } from "./(ui)/switch";

export function GraphSettings({
    settings,
    setSettings,
}: {
    settings: IGraphSettings;
    setSettings: (s: IGraphSettings) => void;
}) {
    return (
        <>
            <h1 className="pt-2">Parsing</h1>
            <ul className="pb-4 flex flex-col gap-2">
                <li>
                    <Label htmlFor="chrome_strand_count_min">
                        chrome_strand_min:
                        {settings.parsing.chrome_strand_count_min}
                    </Label>
                    <Slider
                        disabled={settings.rendering.lock_chromosomes}
                        id="chrome_strand_count_min"
                        defaultValue={[
                            settings.parsing.chrome_strand_count_min,
                        ]}
                        max={200}
                        min={5}
                        step={5}
                        onValueChange={(v) => {
                            setSettings({
                                ...settings,
                                parsing: {
                                    ...settings.parsing,
                                    chrome_strand_count_min: v[0],
                                },
                            });
                        }}
                    />
                </li>
                <li></li>
                {/* <li>e_cutoff:{settings.parsing.e_cutoff}</li> */}
                {/* <li>gene_count_max:{settings.parsing.gene_count_max}</li> */}
                <li>
                    <Label htmlFor="min_genes_in_chromosome">
                        min_chromosome_genes:
                        {settings.parsing.min_genes_in_chromosome}
                    </Label>
                    <Slider
                        disabled={settings.rendering.lock_chromosomes}
                        id="min_genes_in_chromosome"
                        defaultValue={[
                            settings.parsing.min_genes_in_chromosome,
                        ]}
                        max={200}
                        step={5}
                        onValueChange={(v) => {
                            setSettings({
                                ...settings,
                                parsing: {
                                    ...settings.parsing,
                                    min_genes_in_chromosome: v[0],
                                },
                            });
                        }}
                    />
                </li>

                <li>
                    <Label htmlFor="min_post_prob">
                        min_post_prob:{settings.parsing.post_prob}
                    </Label>
                    <Slider
                        id="min_post_prob"
                        defaultValue={[settings.parsing.post_prob]}
                        max={0.999}
                        step={0.01}
                        onValueChange={(v) => {
                            setSettings({
                                ...settings,
                                parsing: {
                                    ...settings.parsing,
                                    post_prob: v[0],
                                },
                            });
                        }}
                    />
                </li>
            </ul>
            <Separator />
            <h1 className="pt-2">Rendering</h1>
            <ul className="pb-4 flex flex-col gap-2">
                <li>
                    <Label htmlFor="orthogroup_strand_count_min">
                        orthogroup_min_strands:
                        {settings.rendering.orthogroup_strand_count_min}
                    </Label>
                    <Slider
                        id="orthogroup_strand_count_min"
                        defaultValue={[
                            settings.rendering.orthogroup_strand_count_min,
                        ]}
                        max={200}
                        step={5}
                        onValueChange={(v) => {
                            setSettings({
                                ...settings,
                                rendering: {
                                    ...settings.rendering,
                                    orthogroup_strand_count_min: v[0],
                                },
                            });
                        }}
                    />
                </li>
                <li>
                    <Label htmlFor="barycenter_iterations_max">
                        solver_iterations_max:
                        {settings.rendering.barycenter_iterations_max}
                    </Label>
                    <Slider
                        disabled={settings.rendering.lock_chromosomes}
                        id="barycenter_iterations_max"
                        defaultValue={[
                            settings.rendering.barycenter_iterations_max,
                        ]}
                        max={200}
                        step={5}
                        onValueChange={(v) => {
                            setSettings({
                                ...settings,
                                rendering: {
                                    ...settings.rendering,
                                    barycenter_iterations_max: v[0],
                                },
                            });
                        }}
                    />
                </li>
                <li>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="deterministic_barycenter">
                            deterministic_solver
                        </Label>
                        <Switch
                            disabled={settings.rendering.lock_chromosomes}
                            id="deterministic_barycenter"
                            checked={
                                settings.rendering.deterministic_barycenter
                            }
                            onCheckedChange={(c) => {
                                setSettings({
                                    ...settings,
                                    rendering: {
                                        ...settings.rendering,
                                        deterministic_barycenter: c,
                                    },
                                });
                            }}
                        />
                    </div>
                </li>
                <li>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="lock_chromosomes">
                            lock_chromosomes
                        </Label>
                        <Switch
                            id="lock_chromosomes"
                            checked={settings.rendering.lock_chromosomes}
                            onCheckedChange={(c) => {
                                setSettings({
                                    ...settings,
                                    rendering: {
                                        ...settings.rendering,
                                        lock_chromosomes: c,
                                    },
                                });
                            }}
                        />
                    </div>
                </li>
            </ul>
        </>
    );
}
