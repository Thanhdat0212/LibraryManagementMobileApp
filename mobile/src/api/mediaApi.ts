import axiosClient from "./axiosClient";

// Khớp với Application/DTOs/Media/CloudinarySignatureDto.cs
export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

export interface PickedImage {
  uri: string;
  name: string;
  type: string;
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
  async uploadImage(image: PickedImage, folder?: string): Promise<UploadedMedia> {
    const signature = await mediaApi.getUploadSignature(folder);

    // RN FormData không còn nhận object rút gọn { uri, name, type } -> phải đọc
    // file thành Blob thật rồi mới append (kèm tên file ở tham số thứ 3). Bọc lại
    // bằng đúng mimeType vì blob đọc từ file:// đôi khi thiếu/sai "type".
    const rawBlob = await fetch(image.uri).then((res) => res.blob());
    const fileBlob = new Blob([rawBlob], { type: image.type });

    const formData = new FormData();
    formData.append("file", fileBlob, image.name);
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
