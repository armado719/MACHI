import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const MAX_FILE_SIZE_MB = Number(process.env.MAX_FILE_SIZE_MB || 5)
const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads'

export class UploadError extends Error {}

/** Decodifica un data URL de imagen y lo guarda en /uploads/registros/[registroId]/. */
export async function saveEvidenceImage(
  dataUrl: string,
  registroId: string,
  equipoId: string
): Promise<string> {
  const match = /^data:(image\/(png|jpe?g|webp));base64,(.+)$/.exec(dataUrl)
  if (!match) {
    throw new UploadError('Formato de imagen no soportado')
  }

  const ext = match[2] === 'jpeg' ? 'jpg' : match[2]
  const base64 = match[3]
  const buffer = Buffer.from(base64, 'base64')

  if (buffer.byteLength > MAX_FILE_SIZE_MB * 1024 * 1024) {
    throw new UploadError(`La imagen no puede superar ${MAX_FILE_SIZE_MB}MB`)
  }

  const dir = path.join(process.cwd(), UPLOAD_DIR.replace('./', ''), 'registros', registroId)
  await mkdir(dir, { recursive: true })

  const filename = `${equipoId}-${Date.now()}.${ext}`
  await writeFile(path.join(dir, filename), buffer)

  return `/uploads/registros/${registroId}/${filename}`
}
