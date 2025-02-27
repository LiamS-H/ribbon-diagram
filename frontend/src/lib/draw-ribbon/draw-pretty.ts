import { IConnectionMap, IRibbonData } from "../process-files/types";
import { getColor } from "./color";
function drawHorizontalBezier(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number
): void {
    ctx.beginPath();
    ctx.moveTo(startX, startY);

    const controlPoint1X = startX + (endX - startX) / 2;
    const controlPoint1Y = startY;
    const controlPoint2X = startX + (endX - startX) / 2;
    const controlPoint2Y = endY;

    ctx.bezierCurveTo(
        controlPoint1X,
        controlPoint1Y,
        controlPoint2X,
        controlPoint2Y,
        endX,
        endY
    );

    ctx.stroke();
}
export function DrawPretty(
    canvas: HTMLCanvasElement,
    data: IRibbonData,
    map: IConnectionMap
) {
    const orgStrandCount: Record<string, number> = {};

    for (const org of data.organisms) {
        orgStrandCount[org] = 0;
        for (const chromosome of data.orgMap[org].chromosomes) {
            const m = map.map[chromosome];
            if (!m) continue;
            orgStrandCount[org] += m.total;
        }
    }
    console.log(orgStrandCount);

    canvas.height = 1000;
    canvas.width = 2000;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("couldn't get canvas context.");
        return;
    }

    const columns = data.organisms.length;

    const padding = 5;

    const width = canvas.width - 5 * 2;
    const height = canvas.height - 5 * 2;

    const label_width = 20;
    const column_node_width = 10;
    const column_width =
        (width - column_node_width - label_width) / (columns - 1);
    const column_spacing = column_width - column_node_width;
    const column_node_vspacing = 5;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const nodeYChoords: Record<string, { y: number; h: number }> = {};

    ctx.fillStyle = "black";
    for (let x = 0; x < columns; x++) {
        const orgname = data.organisms[x];
        const org = data.orgMap[orgname];
        let y = padding;
        for (let i = 0; i < org.chromosomes.length; i++) {
            const chrome = org.chromosomes[i];
            const chromeMap = map.map[chrome];
            if (!chromeMap) {
                console.log(chrome);
                continue;
            }
            const strands = chromeMap.total;
            const node_height =
                (strands / orgStrandCount[orgname]) *
                (height - org.chromosomes.length * column_node_vspacing);

            nodeYChoords[chrome] = {
                y,
                h: node_height,
            };
            y += node_height + column_node_vspacing;
        }
    }
    const chromeStrandCount: Record<string, number> = {};

    for (const orgId of data.organisms) {
        const org = data.orgMap[orgId];
        for (const chrom of org.chromosomes) {
            chromeStrandCount[chrom] = 0;
        }
    }

    for (const { connections } of data.ribons) {
        let srcPos: null | {
            x0: number;
            y0: number;
        } = null;
        let src: null | string = null;
        for (const {
            chromosome,
            organismId,
            syntenyGroup,
            startIndex,
            endIndex,
        } of connections) {
            const x = data.organisms.indexOf(organismId);
            const x1 = padding + x * column_width + column_node_width;
            const max_connections = map.map[chromosome].total ?? 0;
            const connections = (chromeStrandCount[chromosome] += 1);

            const y1 =
                nodeYChoords[chromosome].y +
                (nodeYChoords[chromosome].h * connections) / max_connections;
            if (!srcPos || !src) {
                srcPos = { x0: x1, y0: y1 };
                src = chromosome;
                continue;
            }

            const { x0, y0 } = srcPos;
            srcPos = { x0: x1, y0: y1 };
            src = chromosome;

            if (x0 === x1 && y0 === y1) continue;
            const m = map.map[chromosome]?.map[src]?.map[syntenyGroup];
            if (!m || m < 5) {
                continue;
            }
            const strokeColor = getColor(syntenyGroup);
            const r = parseInt(strokeColor.slice(1, 3), 16);
            const g = parseInt(strokeColor.slice(3, 5), 16);
            const b = parseInt(strokeColor.slice(5, 7), 16);
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.1})`;
            drawHorizontalBezier(ctx, x0, y0, x1, y1);
        }
    }

    for (let x = 0; x < columns; x++) {
        const orgname = data.organisms[x];
        const org = data.orgMap[orgname];
        for (const chrome of org.chromosomes) {
            if (!nodeYChoords[chrome]) continue;
            const { y, h } = nodeYChoords[chrome];
            const text_x = padding + x * column_width + column_node_width + 1;
            ctx.fillStyle = "white";
            const metrics = ctx.measureText(chrome);
            const text_height =
                metrics.actualBoundingBoxAscent +
                metrics.actualBoundingBoxDescent;
            const text_width =
                metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft;
            ctx.fillRect(
                text_x - 1,
                y + h / 2 - text_height,
                text_width,
                text_height
            );
            ctx.fillStyle = "black";
            ctx.fillRect(padding + x * column_width, y, column_node_width, h);
            ctx.fillText(chrome.slice(3), text_x, y + h / 2);
        }
    }
}
