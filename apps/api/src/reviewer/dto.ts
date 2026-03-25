import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ReviewAction } from '@prisma/client';

export class ReviewVerificationDto {
  @IsEnum(ReviewAction)
  action!: ReviewAction;

  @IsOptional()
  @IsString()
  reason?: string;
}
