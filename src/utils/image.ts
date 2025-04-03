import { getCldImageUrl } from 'next-cloudinary';

// Transform Cloudinary public_id to full URL with transformations
export const getImageUrl = (publicId: string | null | undefined) => {
  if (!publicId) return '';

  try {
    return getCldImageUrl({
      src: publicId,
      format: 'auto',
      quality: 'auto',
    });
  } catch (error) {
    console.error('Error generating image URL:', error);
    return publicId;
  }
};

// Extract Cloudinary public_id from image response
export const extractPublicId = (result: any): string => {
  if (!result || !result.info || !result.info.public_id) {
    return '';
  }
  return result.info.public_id;
};

// Extract image URL from upload result
export const extractImageUrl = (result: any): string => {
  if (!result || !result.info || !result.info.secure_url) {
    return '';
  }
  return result.info.secure_url;
};
