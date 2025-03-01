import { IRenderingSettings, IRibbonData } from "@/types/graph";

// Bezier curve drawing functions for both orientations
function drawHorizontalBezier(
    ctx: OffscreenCanvasRenderingContext2D,
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

function drawVerticalBezier(
    ctx: OffscreenCanvasRenderingContext2D,
    startX: number,
    startY: number,
    endX: number,
    endY: number
): void {
    ctx.beginPath();
    ctx.moveTo(startX, startY);

    const controlPoint1X = startX;
    const controlPoint1Y = startY + (endY - startY) / 2;
    const controlPoint2X = endX;
    const controlPoint2Y = startY + (endY - startY) / 2;

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

export function DrawOffscreen(
    canvas: OffscreenCanvas,
    data: IRibbonData,
    settings: IRenderingSettings,
    abortBuffer: Int32Array
) {
    // Default canvas dimensions
    canvas.height = 1000;
    canvas.width = 2000;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
        console.error("couldn't get canvas context.");
        return;
    }

    // Get orientation from settings
    const isHorizontal = settings.horizontal;

    const columns = data.organisms.length;
    const padding = 5;

    // Add space for organism labels
    const organismLabelSize = 30; // Space for organism names
    const label_width = 20; // Chromosome label width
    const node_size = 10; // Size of chromosome node

    // Calculate dimensions based on orientation
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;

    // Calculate layout measurements based on orientation
    let contentWidth, contentHeight, elementSpacing, nodeSpacing;

    if (isHorizontal) {
        contentWidth = width - node_size - label_width;
        contentHeight = height - organismLabelSize;
        elementSpacing = contentWidth / (columns - 1);
        nodeSpacing = 5; // Vertical spacing between nodes
    } else {
        contentWidth = width - organismLabelSize;
        contentHeight = height - node_size - label_width;
        elementSpacing = contentHeight / (columns - 1);
        nodeSpacing = 5; // Horizontal spacing between nodes
    }

    function clear() {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
    clear();

    // Coordinate storage for nodes
    const nodeCoords: Record<
        string,
        { x: number; y: number; w: number; h: number }
    > = {};

    // Calculate node positions and dimensions
    ctx.fillStyle = "black";
    for (let i = 0; i < columns; i++) {
        const orgname = data.organisms[i];
        const org = data.orgMap[orgname];

        if (isHorizontal) {
            // Horizontal layout (columns)
            let y = padding + organismLabelSize;
            for (let j = 0; j < org.chromosomes.length; j++) {
                const chromeId = org.chromosomes[j];
                const chrome = org.chromosomeMap[chromeId];
                if (!chrome) continue;

                const node_height =
                    (chrome.uniqueStrands / org.uniqueStrands) *
                    (contentHeight -
                        (org.chromosomes.length - 1) * nodeSpacing);

                nodeCoords[chromeId] = {
                    x: padding + i * elementSpacing,
                    y,
                    w: node_size,
                    h: node_height,
                };

                y += node_height + nodeSpacing;
            }
        } else {
            // Vertical layout (rows)
            let x = padding + organismLabelSize;
            for (let j = 0; j < org.chromosomes.length; j++) {
                const chromeId = org.chromosomes[j];
                const chrome = org.chromosomeMap[chromeId];
                if (!chrome) continue;

                const node_width =
                    (chrome.uniqueStrands / org.uniqueStrands) *
                    (contentWidth - (org.chromosomes.length - 1) * nodeSpacing);

                nodeCoords[chromeId] = {
                    x,
                    y: padding + i * elementSpacing,
                    w: node_width,
                    h: node_size,
                };

                x += node_width + nodeSpacing;
            }
        }
    }

    // Initialize strand counters
    const chromeStrandCount: Record<string, { in: number; out: number }> = {};
    for (const orgId of data.organisms) {
        const org = data.orgMap[orgId];
        for (const chrom of org.chromosomes) {
            chromeStrandCount[chrom] = { in: 0, out: 0 };
        }
    }

    // Draw ribbons
    for (const { organisms, connectionMap, syntenyGroup } of data.ribbons) {
        for (let i = 0; i < organisms.length - 1; i++) {
            if (Atomics.load(abortBuffer, 0) === 1) {
                return;
            }

            const orgId0 = organisms[i];
            const orgId1 = organisms[i + 1];
            const c0 = connectionMap[orgId0];
            const c1 = connectionMap[orgId1];

            for (const { chromosome: ch0 } of c0) {
                for (const { chromosome: ch1 } of c1) {
                    if (!nodeCoords[ch0] || !nodeCoords[ch1]) continue;

                    // Get strand information
                    const out_strands =
                        data.orgMap[orgId0].chromosomeMap[ch0].outStrands;
                    const out_strand = (chromeStrandCount[ch0].out += 1);
                    const in_strands =
                        data.orgMap[orgId1].chromosomeMap[ch1].inStrands;
                    const in_strand = (chromeStrandCount[ch1].in += 1);

                    // Calculate starting and ending points
                    let startX, startY, endX, endY;

                    if (isHorizontal) {
                        // Horizontal layout
                        startX = nodeCoords[ch0].x + nodeCoords[ch0].w;
                        startY =
                            nodeCoords[ch0].y +
                            nodeCoords[ch0].h * (out_strand / out_strands);

                        endX = nodeCoords[ch1].x;
                        endY =
                            nodeCoords[ch1].y +
                            nodeCoords[ch1].h * (in_strand / in_strands);

                        // Draw horizontal bezier
                        const strokeColor =
                            data.colorMap[syntenyGroup.toUpperCase()] ||
                            "#333333";
                        const r = parseInt(strokeColor.slice(1, 3), 16);
                        const g = parseInt(strokeColor.slice(3, 5), 16);
                        const b = parseInt(strokeColor.slice(5, 7), 16);
                        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.1})`;
                        drawHorizontalBezier(ctx, startX, startY, endX, endY);
                    } else {
                        // Vertical layout
                        startX =
                            nodeCoords[ch0].x +
                            nodeCoords[ch0].w * (out_strand / out_strands);
                        startY = nodeCoords[ch0].y + nodeCoords[ch0].h;

                        endX =
                            nodeCoords[ch1].x +
                            nodeCoords[ch1].w * (in_strand / in_strands);
                        endY = nodeCoords[ch1].y;

                        // Draw vertical bezier
                        const strokeColor =
                            data.colorMap[syntenyGroup.toUpperCase()] ||
                            "#333333";
                        const r = parseInt(strokeColor.slice(1, 3), 16);
                        const g = parseInt(strokeColor.slice(3, 5), 16);
                        const b = parseInt(strokeColor.slice(5, 7), 16);
                        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.1})`;
                        drawVerticalBezier(ctx, startX, startY, endX, endY);
                    }
                }
            }
        }
    }

    // Draw nodes and labels
    ctx.font = "12px Arial";
    for (let i = 0; i < columns; i++) {
        const orgname = data.organisms[i];
        const org = data.orgMap[orgname];

        // Draw organism labels
        ctx.fillStyle = "black";
        if (isHorizontal) {
            // Horizontal layout - organism labels at top
            const x = padding + i * elementSpacing;
            ctx.textAlign = "center";
            ctx.fillText(
                orgname,
                x + node_size / 2,
                padding + organismLabelSize / 2
            );
        } else {
            // Vertical layout - organism labels at left
            const y = padding + i * elementSpacing;
            ctx.textAlign = "right";
            ctx.fillText(
                orgname,
                padding + organismLabelSize - 5,
                y + node_size / 2 + 4
            );
        }

        // Draw chromosome nodes and labels
        for (const chrome of org.chromosomes) {
            if (!nodeCoords[chrome]) continue;

            const { x, y, w, h } = nodeCoords[chrome];
            const labelText = chrome.slice(3); // Remove "chr" prefix

            // Draw node
            ctx.fillStyle = "black";
            ctx.fillRect(x, y, w, h);

            // Draw label
            if (isHorizontal) {
                // Horizontal layout - labels to the right of nodes
                const textX = x + w + 3;
                const textY = y + h / 2 + 4;
                ctx.textAlign = "left";

                // Add background for text readability
                const metrics = ctx.measureText(labelText);
                ctx.fillStyle = "white";
                ctx.fillRect(
                    textX - 1,
                    textY - metrics.actualBoundingBoxAscent - 1,
                    metrics.width + 2,
                    metrics.actualBoundingBoxAscent +
                        metrics.actualBoundingBoxDescent +
                        2
                );

                ctx.fillStyle = "black";
                ctx.fillText(labelText, textX, textY);
            } else {
                // Vertical layout - labels below nodes
                const textX = x + w / 2;
                const textY = y + h + 13;
                ctx.textAlign = "center";

                // Add background for text readability
                const metrics = ctx.measureText(labelText);
                ctx.fillStyle = "white";
                ctx.fillRect(
                    textX - metrics.width / 2 - 1,
                    textY - metrics.actualBoundingBoxAscent - 1,
                    metrics.width + 2,
                    metrics.actualBoundingBoxAscent +
                        metrics.actualBoundingBoxDescent +
                        2
                );

                ctx.fillStyle = "black";
                ctx.fillText(labelText, textX, textY);
            }
        }
    }
}
