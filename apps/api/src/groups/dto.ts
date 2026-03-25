import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../feed/dto';

export class CreateGroupDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}

export class GroupsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  q?: string;
}
