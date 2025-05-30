import UploadClient from "./UploadClient";

export default function MoondreamPlayground() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6 gap-8">
      <h1 className="text-3xl font-bold mb-2">Moondream Vision Playground</h1>
      <p className="text-gray-600 text-sm">
        Drag and drop or upload an image, choose a mode, tweak the inputs and fire away.
      </p>
      <UploadClient />
    </div>
  );
}