// Compresión de imágenes en el navegador con Canvas.
// Sin dependencias externas. Devuelve un Blob JPEG.

export async function compressImage(
  file: File,
  { maxSize = 1280, quality = 0.8 }: { maxSize?: number; quality?: number } = {},
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)

  let { width, height } = bitmap
  if (width > maxSize || height > maxSize) {
    const ratio = Math.min(maxSize / width, maxSize / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D | null
    if (!ctx) throw new Error('No se pudo obtener contexto 2D')
    ctx.drawImage(bitmap, 0, 0, width, height)
    return canvas.convertToBlob({ type: 'image/jpeg', quality })
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo obtener contexto 2D')
  ctx.drawImage(bitmap, 0, 0, width, height)
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob falló'))),
      'image/jpeg',
      quality,
    )
  })
}
