import { SetMetadata } from '@nestjs/common';

export const isPublicMetadataName = 'isPublic';
export const Public = () => SetMetadata(isPublicMetadataName, true);
