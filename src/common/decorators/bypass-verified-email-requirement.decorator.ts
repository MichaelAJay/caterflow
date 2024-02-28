import { SetMetadata } from '@nestjs/common';

export const bypassVerifiedEmailRequirementMetadataName =
  'bypassVerifiedEmailRequirement';
export const BypassVerifiedEmailRequirement = () =>
  SetMetadata(bypassVerifiedEmailRequirementMetadataName, true);
