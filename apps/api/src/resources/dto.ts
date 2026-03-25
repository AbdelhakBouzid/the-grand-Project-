import { IsArray, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../feed/dto';

export class CreateResourceDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fileUrls?: string[];
}

export class ResourceQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;
}
