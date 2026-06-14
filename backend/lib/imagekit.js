import ImageKit from 'imagekit';
import env from '../config/env.js';

let imagekit = null;

if (env.IMAGEKIT_PUBLIC_KEY && env.IMAGEKIT_PRIVATE_KEY && env.IMAGEKIT_URL_ENDPOINT) {
  imagekit = new ImageKit({
    publicKey: env.IMAGEKIT_PUBLIC_KEY,
    privateKey: env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: env.IMAGEKIT_URL_ENDPOINT
  });
  console.log('[ImageKit] Service initialized successfully.');
} else {
  console.warn('[ImageKit] Credentials missing in environment. Local storage fallback will be active.');
}

export default imagekit;
