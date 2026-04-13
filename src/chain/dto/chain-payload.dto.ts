import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ChainMetaDto {
  @ApiPropertyOptional({ description: 'Name or URL of the previous API in the chain', example: 'client' })
  @IsOptional()
  @IsString()
  antes?: string | null;

  @ApiPropertyOptional({ description: 'Name or URL of the current API origin', example: 'api-geografia' })
  @IsOptional()
  @IsString()
  origen?: string;

  @ApiPropertyOptional({ description: 'URL of the next API to forward the payload to, or null to end the chain', example: 'https://api-soporte.example.com/api/v2/chain' })
  @IsOptional()
  @IsString()
  siguiente?: string | null;
}
