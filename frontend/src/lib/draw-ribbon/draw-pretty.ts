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
export function DrawPretty(canvas: HTMLCanvasElement, data: IRibbonData) {
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
            const chromeId = org.chromosomes[i];
            const chrome = org.chromosomeMap[chromeId];
            if (!chrome) {
                console.log("couldn't find", chromeId);
                continue;
            }
            const node_height =
                (chrome.uniqueStrands / org.uniqueStrands) *
                (height - (org.chromosomes.length - 1) * column_node_vspacing);

            nodeYChoords[chromeId] = {
                y,
                h: node_height,
            };
            y += node_height + column_node_vspacing;
        }
    }
    const chromeStrandCount: Record<string, { in: number; out: number }> = {};

    for (const orgId of data.organisms) {
        const org = data.orgMap[orgId];
        for (const chrom of org.chromosomes) {
            chromeStrandCount[chrom] = { in: 0, out: 0 };
        }
    }

    for (const { connections } of data.ribons) {
        const syntenyGroup = connections[0].syntenyGroup;
        for (let i = 0; i < connections.length - 1; i++) {
            const c0 = connections[i];
            const c1 = connections[i + 1];
            if (c0.chromosome === c1.chromosome) continue;
            if (c0.organismId === c1.organismId) continue;

            const x0 =
                padding +
                data.organisms.indexOf(c0.organismId) * column_width +
                column_node_width;
            const x1 =
                padding +
                data.organisms.indexOf(c1.organismId) * column_width +
                column_node_width;

            const out_strands =
                data.orgMap[c0.organismId].chromosomeMap[c0.chromosome]
                    .outStrands;
            const out_strand = (chromeStrandCount[c0.chromosome].out += 1);
            const out_coords = nodeYChoords[c0.chromosome];

            const y0 = out_coords.y + out_coords.h * (out_strand / out_strands);

            const in_strands =
                data.orgMap[c1.organismId].chromosomeMap[c1.chromosome]
                    .inStrands;
            const in_strand = (chromeStrandCount[c1.chromosome].in += 1);
            const in_coords = nodeYChoords[c1.chromosome];

            const y1 = in_coords.y + in_coords.h * (in_strand / in_strands);
            if (in_strand >= in_strands - 5) {
                console.log(in_strand / in_strands);
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
