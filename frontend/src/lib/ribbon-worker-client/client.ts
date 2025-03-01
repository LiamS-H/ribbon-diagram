import { IProcessedFiles } from "@/types/file";
import {
    IGraphSettings,
    IParsingSettings,
    IRenderingSettings,
    IRibbonData,
} from "@/types/graph";
import {
    IParseMessage,
    IParseResponse,
    IRenderMessage,
    IRenderResponse,
    IResponse,
    ISolveMessage,
    ISolveResponse,
} from "./message-types";

export class RibbonWorkerClient {
    private files: IParseMessage["files"] | null;
    private parsedFiles: IProcessedFiles | null;
    private ribbonData: IRibbonData | null;
    private fullRibbonData: IRibbonData | null;
    private settings: IGraphSettings;
    private canvas: OffscreenCanvas | undefined;
    private solver: Worker;
    private renderer: Worker;
    private parser: Worker;
    private arbortBuffer: Int32Array<SharedArrayBuffer>;
    constructor(canvas: HTMLCanvasElement, settings: IGraphSettings) {
        this.parsedFiles = null;
        this.files = null;
        this.ribbonData = null;
        this.fullRibbonData = null;
        this.canvas = canvas.transferControlToOffscreen();
        this.settings = settings;
        this.solver = new Worker(new URL("./solver.ts", import.meta.url));
        this.solver.onmessage = (e) => this.onSolve(e);
        this.renderer = new Worker(new URL("./renderer.ts", import.meta.url));
        this.renderer.onmessage = (e) => this.onRender(e);
        this.parser = new Worker(new URL("./parser.ts", import.meta.url));
        this.parser.onmessage = (e) => this.onParse(e);

        const sharedBuffer = new SharedArrayBuffer(
            Int32Array.BYTES_PER_ELEMENT
        );
        this.arbortBuffer = new Int32Array(sharedBuffer);
    }
    onMessage(ev: MessageEvent<IResponse>) {
        console.log(ev);
    }

    private onSolve(ev: MessageEvent<ISolveResponse>) {
        const { data } = ev;
        this.onMessage(ev);
        this.ribbonData = data.data;
        this.render();
    }

    private solve() {
        Atomics.store(this.arbortBuffer, 0, 1);

        if (!this.fullRibbonData) return;

        const message: ISolveMessage = {
            type: "solve",
            abortBuffer: this.arbortBuffer,
            data: this.fullRibbonData,
            settings: this.settings.rendering,
        };

        this.solver.postMessage(message);
    }

    private onRender(ev: MessageEvent<IRenderResponse>) {
        this.onMessage(ev);
    }
    private render() {
        if (!this.ribbonData) return;
        Atomics.store(this.arbortBuffer, 0, 1);

        const message: IRenderMessage = {
            type: "render",
            canvas: this.canvas,
            abortBuffer: this.arbortBuffer,
            data: this.ribbonData,
            settings: this.settings.rendering,
        };
        if (this.canvas) {
            this.renderer.postMessage(message, [this.canvas]);
            this.canvas = undefined;
        } else {
            this.renderer.postMessage(message);
        }
    }

    private onParse(ev: MessageEvent<IParseResponse>) {
        const { data } = ev;
        this.onMessage(ev);
        this.parsedFiles = data.files;
        this.fullRibbonData = data.data;
        this.solve();
    }
    public parse(files: IParseMessage["files"]) {
        Atomics.store(this.arbortBuffer, 0, 1);
        this.fullRibbonData = null;
        this.ribbonData = null;
        if (this.files !== files) this.parsedFiles = null;
        this.files = files;

        const message: IParseMessage = {
            type: "parse",
            files,
            parsed: this.parsedFiles,
            settings: this.settings.parsing,
            abortBuffer: this.arbortBuffer,
        };

        this.parser.postMessage(message);
    }

    public setSettings(new_settings: IGraphSettings) {
        const old_settings = { ...this.settings };
        this.settings = new_settings;
        if (new_settings.parsing.post_prob !== old_settings.parsing.post_prob) {
            if (this.files) {
                this.parsedFiles = null;
                this.parse(this.files);
                return;
            }
        }

        const old_parsing = old_settings.parsing;
        const new_parsing = new_settings.parsing;

        for (const key of Object.keys(
            old_parsing
        ) as (keyof IParsingSettings)[]) {
            if (old_parsing[key] !== new_parsing[key] && this.files) {
                this.parse(this.files);
                return;
            }
        }
        const old_rendering = old_settings.rendering;
        const new_rendering = new_settings.rendering;

        for (const key of Object.keys(
            old_rendering
        ) as (keyof IRenderingSettings)[]) {
            if (old_rendering[key] !== new_rendering[key]) {
                if (new_rendering.deterministic_barycenter && this.files) {
                    this.parse(this.files);
                } else {
                    this.solve();
                }
                return;
            }
        }
    }
}
