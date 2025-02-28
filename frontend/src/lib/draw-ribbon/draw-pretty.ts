import { IConnectionMap, IRibbonData } from "../../types/graph";
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

    for (const orgId of data.organisms) {
        const org = data.orgMap[orgId];
        let total = 0;
        for (const chromeId of org.chromosomes) {
            const chrome = org.chromosomeMap[chromeId];
            total += chrome.uniqueStrands;
        }
        console.log(orgId, org.uniqueStrands, total);
    }

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

    for (const { organisms, connectionMap, syntenyGroup } of data.ribons) {
        for (let i = 0; i < organisms.length - 1; i++) {
            const orgId0 = organisms[i];
            const orgId1 = organisms[i + 1];
            const c0 = connectionMap[orgId0];
            const c1 = connectionMap[orgId1];
            for (const { chromosome: ch0 } of c0) {
                for (const { chromosome: ch1 } of c1) {
                    const x0 =
                        padding +
                        data.organisms.indexOf(orgId0) * column_width +
                        column_node_width;
                    const x1 =
                        padding +
                        data.organisms.indexOf(orgId1) * column_width +
                        column_node_width;

                    const out_strands =
                        data.orgMap[orgId0].chromosomeMap[ch0].outStrands;
                    const out_strand = (chromeStrandCount[ch0].out += 1);
                    const out_coords = nodeYChoords[ch0];

                    const y0 =
                        out_coords.y +
                        out_coords.h * (out_strand / out_strands);

                    const in_strands =
                        data.orgMap[orgId1].chromosomeMap[ch1].inStrands;
                    const in_strand = (chromeStrandCount[ch1].in += 1);
                    const in_coords = nodeYChoords[ch1];

                    const y1 =
                        in_coords.y + in_coords.h * (in_strand / in_strands);

                    const strokeColor = getColor(syntenyGroup);
                    const r = parseInt(strokeColor.slice(1, 3), 16);
                    const g = parseInt(strokeColor.slice(3, 5), 16);
                    const b = parseInt(strokeColor.slice(5, 7), 16);
                    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.1})`;
                    drawHorizontalBezier(ctx, x0, y0, x1, y1);
                }
            }
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
