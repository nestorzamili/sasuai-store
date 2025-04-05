import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { paramsToSign } = body;

    const timestamp = Math.round(new Date().getTime() / 1000);

    // Combine parameters with timestamp
    const params = {
      timestamp,
      folder: 'sasuai-store',
      ...paramsToSign,
    };

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET || '',
    );

    return Response.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error('Error generating signature:', error);
    return Response.json(
      { error: 'Failed to generate signature' },
      { status: 500 },
    );
  }
}
