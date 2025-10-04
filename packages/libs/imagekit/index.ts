import ImageKit from "imagekit";

export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,

  privateKey: process.env.IMAGEKIT_SECRET_KEY!, // only server


  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});


