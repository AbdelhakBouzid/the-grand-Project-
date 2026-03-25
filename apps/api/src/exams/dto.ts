import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationQueryDto } from '../feed/dto';

export class CreateExamDto {
  @IsString()
  title!: string;

  @IsString()
  subject!: string;

  @IsInt()
  @Min(1900)
  year!: number;
}

export class ExamQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsInt()
  @Min(1900)
  year?: number;
}
