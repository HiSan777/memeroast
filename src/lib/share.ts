export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}

export async function copyImageToClipboard(imageUrl: string) {
  if (!("ClipboardItem" in window) || !navigator.clipboard.write) {
    throw new Error("Image clipboard is not supported in this browser.");
  }

  const blob = await imageUrlToPngBlob(imageUrl);

  await navigator.clipboard.write([
    new ClipboardItem({
      "image/png": blob,
    }),
  ]);
}

export async function downloadImageAsPng(imageUrl: string, fileName: string) {
  const blob = await imageUrlToPngBlob(imageUrl);
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.download = `${fileName}.png`;
  anchor.href = objectUrl;
  anchor.click();

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 500);
}

export async function prepareXShare({
  caption,
  imageUrl,
  fileName,
}: {
  caption: string;
  imageUrl?: string;
  fileName: string;
}) {
  const result = {
    copiedCaption: false,
    copiedImage: false,
    downloadedImage: false,
  };

  if (imageUrl) {
    try {
      await copyImageToClipboard(imageUrl);
      result.copiedImage = true;
    } catch {
      await downloadImageAsPng(imageUrl, fileName);
      result.downloadedImage = true;
    }
  }

  try {
    await copyText(caption);
    result.copiedCaption = true;
  } catch {
    result.copiedCaption = false;
  }

  window.open(
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`,
    "_blank",
  );

  return result;
}

async function imageUrlToPngBlob(imageUrl: string) {
  if (!imageUrl.startsWith("data:image/svg+xml")) {
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    if (blob.type === "image/png") {
      return blob;
    }

    return rasterizeImage(imageUrl);
  }

  return rasterizeImage(imageUrl);
}

function rasterizeImage(imageUrl: string) {
  return new Promise<Blob>((resolve, reject) => {
    const image = new window.Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.height = 1080;
      canvas.width = 1080;

      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Canvas context unavailable."));
        return;
      }

      context.fillStyle = "#09090b";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Could not create PNG blob."));
        }
      }, "image/png");
    };

    image.onerror = () => reject(new Error("Could not load generated image."));
    image.src = imageUrl;
  });
}
