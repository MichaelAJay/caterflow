import { SetMetadata } from '@nestjs/common';

export const bypassCateringCompanyRequirementMetadataName =
  'bypassCateringCompanyRequirement';
export const BypassCateringCompanyRequirement = () =>
  SetMetadata(bypassCateringCompanyRequirementMetadataName, true);
