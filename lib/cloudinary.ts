import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// Configure Cloudinary with environment credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

/**
 * Uploads a payment screenshot to Cloudinary under the "Turf" folder.
 *
 * @param fileData - Base64 Data URL or remote image URL
 * @param bookingId - Optional booking identifier used for filename / public_id
 * @returns Upload result containing the secure CDN URL
 */
export async function uploadPaymentScreenshot(
  fileData: string,
  bookingId?: string
): Promise<UploadApiResponse> {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary credentials are not configured in environment variables.");
  }

  // Generate clean public_id under Turf folder
  const timestamp = Date.now();
  const cleanBookingId = bookingId ? bookingId.replace(/[^a-zA-Z0-9_-]/g, "") : "booking";
  const customPublicId = `${cleanBookingId}_${timestamp}`;

  const uploadResult = await cloudinary.uploader.upload(fileData, {
    folder: "Turf",
    public_id: customPublicId,
    resource_type: "image",
    overwrite: false,
    transformation: [
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
    tags: ["turf", "booking_screenshot"],
  });

  return uploadResult;
}
