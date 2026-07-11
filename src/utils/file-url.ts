const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? ""
).replace(/\/$/, "");

export function resolveFileUrl(
  value?: string | null
): string {
  if (!value) {
    return "";
  }

  const normalizedValue = value.trim();

  // URL Supabase hoặc URL ngoài.
  if (
    normalizedValue.startsWith("https://") ||
    normalizedValue.startsWith("http://") ||
    normalizedValue.startsWith("data:") ||
    normalizedValue.startsWith("blob:")
  ) {
    return normalizedValue;
  }

  // Hỗ trợ dữ liệu cũ dạng /uploads/...
  return `${API_BASE_URL}${
    normalizedValue.startsWith("/") ? "" : "/"
  }${normalizedValue}`;
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
];

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Chỉ hỗ trợ JPG, PNG, WEBP hoặc GIF.";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Dung lượng ảnh không được vượt quá 10 MB.";
  }

  return null;
}