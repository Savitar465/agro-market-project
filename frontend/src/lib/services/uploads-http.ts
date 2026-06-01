import { apiRequest } from "@/lib/services/http-client";

const UPLOADS_PATH = "/uploads";

export type UploadedImage = {
  url: string;
  objectName: string;
};

/** Upload a single image file to the backend (stored in MinIO). */
export async function uploadProductImage(file: File): Promise<UploadedImage> {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest<UploadedImage>(`${UPLOADS_PATH}/image`, {
    method: "POST",
    body: formData,
  });
}

/** Delete a previously uploaded image by its object name. */
export async function deleteProductImage(objectName: string): Promise<void> {
  await apiRequest<void>(`${UPLOADS_PATH}/image`, {
    method: "DELETE",
    query: { objectName },
  });
}
