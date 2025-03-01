import { DrawOffscreen } from "../draw-ribbon/draw-offscreen";
import { IRenderMessage, IRenderResponse } from "./message-types";

let stored_canvas: OffscreenCanvas;

self.onmessage = async (event: MessageEvent<IRenderMessage>) => {
    const { abortBuffer, canvas, data, settings, download } = event.data;
    if (canvas) {
        stored_canvas = canvas;
    }
    if (!stored_canvas) {
        return;
    }

    Atomics.store(abortBuffer, 0, 0);

    DrawOffscreen(stored_canvas, data, settings, abortBuffer);
    if (!download) return;
    const file = await stored_canvas.convertToBlob();

    const resp: IRenderResponse = { type: "render", file };

    self.postMessage(resp);
};
