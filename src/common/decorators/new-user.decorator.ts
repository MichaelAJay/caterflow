import { SetMetadata } from '@nestjs/common';

export const isNewUserMetadataName = 'isNewUser';
export const NewUser = () => SetMetadata(isNewUserMetadataName, true);
