import { IParsedFiles, IProcessedFiles } from "@/types/file";
import {
    IParsingSettings,
    IRenderingSettings,
    IRibbonData,
} from "@/types/graph";

export interface IParseMessage {
    type: "parse";
    files: IParsedFiles;
    parsed: IProcessedFiles | null;
    abortBuffer: Int32Array<SharedArrayBuffer>;
    settings: IParsingSettings;
}

export interface IParseResponse {
    type: "parse";
    files: IProcessedFiles;
    data: IRibbonData;
}

export interface ISolveMessage {
    type: "solve";
    data: IRibbonData;
    abortBuffer: Int32Array<SharedArrayBuffer>;
    settings: IRenderingSettings;
}

export interface ISolveResponse {
    type: "solve";
    data: IRibbonData;
}

export interface IRenderMessage {
    type: "render";
    canvas?: OffscreenCanvas;
    data: IRibbonData;
    abortBuffer: Int32Array<SharedArrayBuffer>;
    settings: IRenderingSettings;
}

export interface IRenderResponse {
    type: "render";
}

export type IMessage = IParseMessage | ISolveMessage | IRenderMessage;
export type IResponse = IParseResponse | ISolveResponse | IRenderResponse;
