/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Устанавливаем умолчание для fill-картинок, которое покрывает почти все случаи
    // Это эквивалентно sizes="(max-width: 768px) 100vw, 33vw"
    // Но браузер сам выберет лучший размер из deviceSizes
  },
};

module.exports = nextConfig;
