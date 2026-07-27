import { v2 as cloudinary } from "cloudinary";

class MediaService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async upload(file, folder = "uploads") {
    return new Promise((resolve, reject) => {
      const options = {
        folder,
        resource_type: "auto",
      };

      if (Buffer.isBuffer(file)) {
        const stream = cloudinary.uploader.upload_stream(
          options,
          (error, result) => {
            if (error) return reject(error);
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              bytes: result.bytes,
              width: result.width,
              height: result.height,
            });
          }
        );
        stream.end(file);
      } else if (typeof file === "string") {
        cloudinary.uploader.upload(file, options, (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
          });
        });
      } else {
        reject(new Error("File must be a Buffer or file path string"));
      }
    });
  }

  async uploadAvatar(file) {
    return new Promise((resolve, reject) => {
      const options = {
        folder: "avatars",
        resource_type: "image",
        transformation: [
          { width: 256, height: 256, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
      };

      if (Buffer.isBuffer(file)) {
        const stream = cloudinary.uploader.upload_stream(
          options,
          (error, result) => {
            if (error) return reject(error);
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              bytes: result.bytes,
              width: result.width,
              height: result.height,
            });
          }
        );
        stream.end(file);
      } else if (typeof file === "string") {
        cloudinary.uploader.upload(file, options, (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
          });
        });
      } else {
        reject(new Error("File must be a Buffer or file path string"));
      }
    });
  }

  async deleteAsset(publicId) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve({
          result: result.result,
          publicId,
        });
      });
    });
  }

  async generateThumbnail(publicId) {
    const url = cloudinary.url(publicId, {
      transformation: [
        { width: 150, height: 150, crop: "thumb", gravity: "auto" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    return { thumbnailUrl: url, publicId };
  }
}

export default new MediaService();
