"use client";

import { useState, useRef, DragEvent, useEffect } from "react";

type Mode = "caption" | "query" | "point" | "detect";
interface Point { x: number; y: number }
interface Box { x_min: number; x_max: number; y_min: number; y_max: number }

export default function UploadClient() {
  const [mode, setMode] = useState<Mode>("caption");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rawResult, setRawResult] = useState<any>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // for image overlay (from /points or /detect)
  const [points, setPoints] = useState<Point[]>([]);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [imgDims, setImgDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });


  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setImage(url);
      // reset overlay & result when new image chosen
      setPoints([]);
      setBoxes([]);
      setRawResult(null);
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const chooseFile = () => fileInput.current?.click();

  const run = async () => {
    if (!image) return;
    const base64 = image.split(",")[1]; // strip data: header

    const payload: Record<string, unknown> = {
      image_url: `data:image/jpeg;base64,${base64}`,
    };
    if (mode === "query") payload.question = (document.getElementById("question") as HTMLInputElement)?.value.trim();
    if (mode === "point" || mode === "detect") payload.object = (document.getElementById("object") as HTMLInputElement)?.value.trim();
    if (mode === "caption") payload.length = (document.getElementById("length") as HTMLInputElement)?.value;

    setLoading(true);
    setRawResult(null);
    setPoints([]);
    setBoxes([]);

    try {
      const res = await fetch(`/moondream/${mode}`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data: any = await res.json();
      setRawResult(data);

      // parse overlay data
      if (mode === "point" && Array.isArray(data.points)) {
        setPoints(data.points as Point[]);
      }
      if (mode === "detect" && Array.isArray(data.objects)) {
        setBoxes(data.objects as Box[]);
      }
    } catch (err: any) {
      setRawResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const onImgLoad = () => {
    if (!imgRef.current) return;
    setImgDims({ w: imgRef.current.width, h: imgRef.current.height });
  };

  return (
    // ty o3 for ur UI skills
    <div className="flex flex-col items-center w-full max-w-lg gap-4">
      {/* Drop zone */}
      <div
        className="w-full h-56 border-4 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-white hover:border-indigo-400"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={chooseFile}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInput}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <p className="text-gray-500">
          {image ? "Change image" : "Drop image here or click to upload"}
        </p>
      </div>

      {/* Image preview + overlay */}
      {image && (
        <div className="relative">
          <img
            ref={imgRef}
            src={image}
            className="rounded-xl max-w-full h-auto"
            onLoad={onImgLoad}
            alt="preview"
          />
          {/* SVG overlay */}
          <svg
            className="absolute top-0 left-0"
            width={imgDims.w}
            height={imgDims.h}
            viewBox={`0 0 ${imgDims.w} ${imgDims.h}`}
          >
            {/* Points */}
            {points.map((p, idx) => (
              <circle key={idx} cx={p.x * imgDims.w} cy={p.y * imgDims.h} r="6" fill="none" stroke="red" strokeWidth="3" />
            ))}
            {/* Bounding boxes */}
            {boxes.map((b, idx) => (
              <rect
                key={idx}
                x={b.x_min * imgDims.w}
                y={b.y_min * imgDims.h}
                width={(b.x_max - b.x_min) * imgDims.w}
                height={(b.y_max - b.y_min) * imgDims.h}
                fill="none"
                stroke="red"
                strokeWidth="3"
              />
            ))}
          </svg>
        </div>
      )}

      {/* Controls */}
      {image && (
        <>
          {/* Mode selector */}
          <div className="w-full">
            <label className="block mb-1 font-medium">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              className="w-full rounded-xl border-gray-300"
            >
              <option value="caption">Caption</option>
              <option value="query">Query</option>
              <option value="point">Point</option>
              <option value="detect">Detect</option>
            </select>
          </div>

          {/* Dynamic extra fields */}
          {mode === "caption" && (
            <select id="length" className="w-full rounded-xl border-gray-300 p-2">
              <option value="short">Short</option>
              <option value="normal" defaultValue="normal">
                Normal
              </option>
              <option value="long">Long</option>
            </select>
          )}

          {mode === "query" && (
            <input
              id="question"
              type="text"
              placeholder="Ask a question…"
              className="w-full rounded-xl border-gray-300 p-2"
            />
          )}

          {(mode === "point" || mode === "detect") && (
            <input
              id="object"
              type="text"
              placeholder="Object (e.g. cat)…"
              className="w-full rounded-xl border-gray-300 p-2"
            />
          )}

          {/* Run button */}
          <button
            onClick={run}
            disabled={loading}
            className="w-full py-2 px-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Running…" : "Run"}
          </button>
        </>
      )}

      {/* Raw JSON output */}
      {rawResult && (
        <pre className="bg-gray-100 p-4 rounded-xl w-full overflow-auto whitespace-pre-wrap max-h-72">
          {JSON.stringify(rawResult, null, 2)}
        </pre>
      )}
    </div>
  );
}
