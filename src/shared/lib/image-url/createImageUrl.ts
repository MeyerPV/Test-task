import { faker } from '@faker-js/faker/locale/en';

export const createImageUrl = (size: number): string =>
  faker.image.urlPicsumPhotos({
    width: size,
    height: size,
    grayscale: false,
    blur: 0,
  });
