import { v2 as cloudinary } from 'cloudinary';
import { NextRequest } from 'next/server';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // Get the form data with the file
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'sasuai-store/uploads';

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json(
        { error: 'File too large (max 5MB)' },
        { status: 400 },
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return Response.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 },
      );
    }

    // Convert file to base64 for Cloudinary upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = `data:${file.type};base64,${buffer.toString(
      'base64',
    )}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(base64String, {
      folder,
      resource_type: 'image',
    });

    let optimizedUrl = uploadResult.secure_url;
    if (optimizedUrl && optimizedUrl.includes('/upload/')) {
      optimizedUrl = optimizedUrl.replace('/upload/', '/upload/f_auto,q_auto/');
    }

    // Return success with the image URL
    return Response.json({
      success: true,
      url: optimizedUrl,
      publicId: uploadResult.public_id,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return Response.json(
      { error: error.message || 'Upload failed' },
      { status: 500 },
    );
  }
}

// Handle OPTIONS requests (for CORS preflight)
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
