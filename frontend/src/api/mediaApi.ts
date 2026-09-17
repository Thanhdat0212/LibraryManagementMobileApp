import axiosClient from "./axiosClient";

// Khớp với Application/DTOs/Media/CloudinarySignatureDto.cs
export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export interface UploadedMedia {
  url: string;
  publicId: string;
}

export const mediaApi = {
  getUploadSignature: (folder?: string) =>
    axiosClient
      .get<CloudinarySignature>("/media/signature", { params: folder ? { folder } : undefined })
      .then((res) => res.data),

  /** Upload trực tiếp lên Cloudinary bằng chữ ký ký ở backend (không đi qua backend). */
  async uploadImage(file: File, folder?: string): Promise<UploadedMedia> {
    const signature = await mediaApi.getUploadSignature(folder);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signature.apiKey);
    formData.append("timestamp", String(signature.timestamp));
    formData.append("signature", signature.signature);
    formData.append("folder", signature.folder);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error?.message ?? "Upload ảnh thất bại.");
    }
    return { url: data.secure_url as string, publicId: data.public_id as string };
  },

  remove: (publicId: string) => axiosClient.delete("/media", { params: { publicId } }),
};
