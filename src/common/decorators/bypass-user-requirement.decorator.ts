import { SetMetadata } from '@nestjs/common';

export const bypassUserRequirementMetadataName = 'bypassUserRequirement';
// This should ONLY be used for Create User route
export const BypassUserRequirement = () =>
  SetMetadata(bypassUserRequirementMetadataName, true);
