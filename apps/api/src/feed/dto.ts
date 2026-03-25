import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}

export class FeedQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;
}

export class CreatePostDto {
  @IsString()
  body!: string;
}

export class CreateCommentDto {
  @IsString()
  body!: string;
}

export class CreateReactionDto {
  @IsString()
  @IsIn(['like', 'love', 'helpful'])
  type!: string;
}
