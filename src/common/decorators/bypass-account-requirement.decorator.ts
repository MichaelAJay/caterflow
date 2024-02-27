import { SetMetadata } from '@nestjs/common';

export const bypassAccountRequirementMetadataName = 'bypassAccountRequirement';
export const BypassAccountRequirement = () =>
  SetMetadata(bypassAccountRequirementMetadataName, true);
