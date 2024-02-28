import { SetMetadata } from '@nestjs/common';

/**
 * **** README ****
 * This decorator should be used VERY judiciously
 * At time of writing, I can't think of any reason to use it other than
 * during user creation
 */

export const bypassVerifiedEmailRequirementMetadataName =
  'bypassVerifiedEmailRequirement';
export const BypassVerifiedEmailRequirement = () =>
  SetMetadata(bypassVerifiedEmailRequirementMetadataName, true);
