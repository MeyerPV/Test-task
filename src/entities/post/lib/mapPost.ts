import type { PostDto } from '../api/postDto';
import type { Post, PostDetails } from '../model/types';

export const mapPost = (dto: PostDto, thumbnailUrl: string): Post => ({
  id: dto.id,
  userId: dto.userId,
  title: dto.title,
  body: dto.body,
  thumbnailUrl,
});

export const mapPostDetails = (
  dto: PostDto,
  imageUrl: string,
): PostDetails => ({
  id: dto.id,
  userId: dto.userId,
  title: dto.title,
  body: dto.body,
  imageUrl,
});
