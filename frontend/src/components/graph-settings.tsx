import { IGraphSettings, IRibbonData } from "@/types/graph";
import { Separator } from "@/components/(ui)/separator";
import { Slider } from "@/components/(ui)/slider";
import { Label } from "@/components/(ui)/label";
import { Switch } from "@/components/(ui)/switch";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/(ui)/select";
import { Button } from "./(ui)/button";
import { X } from "lucide-react";

export function GraphSettings(props: {
    ribbonData: IRibbonData | null;
    settings: IGraphSettings;
    setSettings: (s: IGraphSettings) => void;
}) {
    const { ribbonData, settings, setSettings } = props;

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
                        disabled={settings.solving.lock_chromosomes}
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
                <li>
                    <Label htmlFor="min_genes_in_chromosome">
                        min_chromosome_genes:
                        {settings.parsing.min_genes_in_chromosome}
                    </Label>
                    <Slider
                        disabled={settings.solving.lock_chromosomes}
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
            <h1 className="pt-2">Detangling</h1>
            <ul className="pb-4 flex flex-col gap-2">
                <li>
                    <Label htmlFor="orthogroup_strand_count_min">
                        orthogroup_min_strands:
                        {settings.solving.orthogroup_strand_count_min}
                    </Label>
                    <Slider
                        id="orthogroup_strand_count_min"
                        defaultValue={[
                            settings.solving.orthogroup_strand_count_min,
                        ]}
                        max={200}
                        step={5}
                        onValueChange={(v) => {
                            setSettings({
                                ...settings,
                                solving: {
                                    ...settings.solving,
                                    orthogroup_strand_count_min: v[0],
                                },
                            });
                        }}
                    />
                </li>
                <li>
                    <Label htmlFor="barycenter_iterations_max">
                        solver_iterations_max:
                        {settings.solving.barycenter_iterations_max}
                    </Label>
                    <Slider
                        disabled={settings.solving.lock_chromosomes}
                        id="barycenter_iterations_max"
                        defaultValue={[
                            settings.solving.barycenter_iterations_max,
                        ]}
                        max={200}
                        step={5}
                        onValueChange={(v) => {
                            setSettings({
                                ...settings,
                                solving: {
                                    ...settings.solving,
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
                            disabled={settings.solving.lock_chromosomes}
                            id="deterministic_barycenter"
                            checked={settings.solving.deterministic_barycenter}
                            onCheckedChange={(c) => {
                                setSettings({
                                    ...settings,
                                    solving: {
                                        ...settings.solving,
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
                            checked={settings.solving.lock_chromosomes}
                            onCheckedChange={(c) => {
                                setSettings({
                                    ...settings,
                                    solving: {
                                        ...settings.solving,
                                        lock_chromosomes: c,
                                    },
                                });
                            }}
                        />
                    </div>
                </li>
            </ul>

            <Separator />
            <h1 className="pt-2">Rendering</h1>
            <ul className="pb-4 flex flex-col gap-2">
                <li>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="orientation">vertical</Label>
                        <Switch
                            id="orientation"
                            checked={settings.rendering.horizontal}
                            onCheckedChange={(c) => {
                                setSettings({
                                    ...settings,
                                    rendering: {
                                        ...settings.rendering,
                                        horizontal: c,
                                    },
                                });
                            }}
                        />
                        <Label htmlFor="orientation">horizontal</Label>
                    </div>
                </li>
                <li>
                    <Label htmlFor="thread_opacity">
                        thread_opacity:
                        {settings.rendering.thread_opacity}
                    </Label>
                    <Slider
                        id="thread_opacity"
                        defaultValue={[settings.rendering.thread_opacity]}
                        max={0.5}
                        step={0.01}
                        onValueChange={(v) => {
                            setSettings({
                                ...settings,
                                rendering: {
                                    ...settings.rendering,
                                    thread_opacity: v[0],
                                },
                            });
                        }}
                    />
                </li>
                <li className="flex gap-2">
                    <Select
                        disabled={ribbonData === null}
                        onValueChange={(v) => {
                            setSettings({
                                ...settings,
                                rendering: {
                                    ...settings.rendering,
                                    highlighted_orthgroup: v,
                                },
                            });
                        }}
                        value={settings.rendering.highlighted_orthgroup}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Highlight Orthogroup" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Orthogroups</SelectLabel>
                                {ribbonData?.syntenyGroups.map((synteny) => (
                                    <SelectItem
                                        key={synteny}
                                        value={synteny}
                                        style={{
                                            color: ribbonData?.colorMap[
                                                synteny
                                            ],
                                        }}
                                    >
                                        {synteny}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="destructive"
                        disabled={!settings.rendering.highlighted_orthgroup}
                        size="icon"
                        onClick={() => {
                            setSettings({
                                ...settings,
                                rendering: {
                                    ...settings.rendering,
                                    highlighted_orthgroup: "",
                                },
                            });
                        }}
                    >
                        <X />
                    </Button>
                </li>
            </ul>
        </>
    );
}
