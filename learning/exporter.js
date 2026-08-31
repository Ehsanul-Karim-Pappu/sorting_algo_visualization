function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function traceJson(trace) {
  return JSON.stringify({
    schema: "sortscope-trace/v1",
    algorithmId: trace.algorithmId,
    source: trace.source,
    result: trace.result,
    stats: trace.stats,
    steps: trace.steps,
  }, null, 2);
}

export function stepSvg(step, algorithmName, { width = 1200, height = 675 } = {}) {
  const margin = 70;
  const chartTop = 145;
  const chartHeight = 390;
  const gap = 10;
  const barWidth = Math.max(4, (width - margin * 2 - gap * Math.max(0, step.items.length - 1)) / Math.max(1, step.items.length));
  const values = step.items.map((item) => item.value);
  const minimum = Math.min(...values, 0);
  const maximum = Math.max(...values, 1);
  const spread = Math.max(1, maximum - minimum);
  const active = new Set(step.activeIds);
  const sorted = new Set(step.sortedIds);
  const candidates = new Set(step.candidateIds);
  const bars = step.items.map((item, index) => {
    const normalized = (item.value - minimum) / spread;
    const barHeight = 50 + normalized * (chartHeight - 50);
    const x = margin + index * (barWidth + gap);
    const y = chartTop + chartHeight - barHeight;
    const fill = sorted.has(item.id) ? "#9ef26b" : candidates.has(item.id) ? "#ffd166" : active.has(item.id) ? "#14d9c4" : "#7182a6";
    return `<g><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${barHeight.toFixed(1)}" rx="${Math.min(12, barWidth / 2).toFixed(1)}" fill="${fill}"/><text x="${(x + barWidth / 2).toFixed(1)}" y="${(y - 12).toFixed(1)}" text-anchor="middle" fill="#d9deec" font-size="18">${escapeXml(item.value)}</text></g>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(algorithmName)}: ${escapeXml(step.title)}">
  <rect width="100%" height="100%" fill="#0b0f18"/>
  <text x="${margin}" y="62" fill="#ffffff" font-family="system-ui,sans-serif" font-weight="700" font-size="34">${escapeXml(algorithmName)}</text>
  <text x="${margin}" y="104" fill="#9aa5bd" font-family="system-ui,sans-serif" font-size="22">${escapeXml(step.title)} · step ${step.sequence}</text>
  ${bars}
  <text x="${margin}" y="600" fill="#ffffff" font-family="system-ui,sans-serif" font-size="23">${escapeXml(step.message)}</text>
  <text x="${margin}" y="638" fill="#9aa5bd" font-family="system-ui,sans-serif" font-size="18">Comparisons ${step.stats.comparisons} · Writes ${step.stats.writes} · Swaps ${step.stats.swaps}</text>
</svg>`;
}

export function downloadText(filename, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function recordTraceVideo(trace, algorithmName, { frameDuration = 90 } = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = 540;
  const context = canvas.getContext("2d");
  const stream = canvas.captureStream(30);
  const preferredType = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]
    .find((type) => MediaRecorder.isTypeSupported(type));
  if (!context || !preferredType) throw new Error("Video export is not supported in this browser.");

  const recorder = new MediaRecorder(stream, { mimeType: preferredType });
  const chunks = [];
  recorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  });
  const finished = new Promise((resolve) => recorder.addEventListener("stop", resolve, { once: true }));
  recorder.start();

  const sampled = trace.steps.length <= 180
    ? trace.steps
    : trace.steps.filter((_, index) => index % Math.ceil(trace.steps.length / 180) === 0 || index === trace.steps.length - 1);
  for (const step of sampled) {
    context.fillStyle = "#0b0f18";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ffffff";
    context.font = "700 26px system-ui";
    context.fillText(algorithmName, 44, 48);
    context.fillStyle = "#9aa5bd";
    context.font = "17px system-ui";
    context.fillText(step.title.slice(0, 72), 44, 78);
    const values = step.items.map((item) => item.value);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const spread = Math.max(1, max - min);
    const active = new Set(step.activeIds);
    const sorted = new Set(step.sortedIds);
    const barWidth = Math.max(3, 840 / Math.max(1, step.items.length));
    step.items.forEach((item, index) => {
      const height = 45 + ((item.value - min) / spread) * 300;
      context.fillStyle = sorted.has(item.id) ? "#9ef26b" : active.has(item.id) ? "#14d9c4" : "#7182a6";
      context.fillRect(60 + index * barWidth, 430 - height, Math.max(2, barWidth - 3), height);
    });
    context.fillStyle = "#d9deec";
    context.font = "16px system-ui";
    context.fillText(step.message.slice(0, 100), 44, 485);
    await new Promise((resolve) => window.setTimeout(resolve, frameDuration));
  }
  recorder.stop();
  await finished;
  return new Blob(chunks, { type: preferredType });
}
