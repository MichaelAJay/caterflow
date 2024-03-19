import { SetMetadata } from '@nestjs/common';

export const isLogInMetadataName = 'isLogIn';
export const LogIn = () => SetMetadata(isLogInMetadataName, true);
