export type CloudinaryUploadResult = {
  event: string;
  info: {
    public_id: string;
    secure_url: string;
    resource_type: string;
    type: string;
    format: string;
    bytes: number;
    width: number;
    height: number;
  };
};

export type CloudinaryWidgetOptions = {
  cloudName: string;
  uploadSignature: (callback: Function, paramsToSign: any) => void;
  apiKey: string;
  uploadPreset?: string;
  folder?: string;
  multiple?: boolean;
  maxFiles?: number;
  sources?: string[];
  resourceType?: string;
  clientAllowedFormats?: string[];
  maxFileSize?: number;
  maxImageWidth?: number;
  maxImageHeight?: number;
};

export type CloudinaryImage = {
  publicId: string;
  url: string;
  width?: number;
  height?: number;
  format?: string;
  alt?: string;
};
