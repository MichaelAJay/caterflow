import {
  $Enums,
  CompanyIntegrationAsset,
  CompanyMenu,
  IntegrationRequirement,
  Prisma,
} from '@prisma/client';
import { InvalidMenuRequirement } from '../types/return/create-company-integration.return.type';

type RequirementWithCompanyAssets = IntegrationRequirement & {
  assets: Pick<CompanyIntegrationAsset, 'id' | 'menuId'>[];
};

const buildCreateIntegration_AssetCreatesAndConnects = (
  companyId: string,
  requirements: RequirementWithCompanyAssets[],
  menus: Pick<CompanyMenu, 'id'>[],
  creatorId: string,
): {
  creates: Prisma.CompanyIntegrationAssetUncheckedCreateWithoutIntegrationsInput[];
  connects: Prisma.CompanyIntegrationAssetWhereUniqueInput[];
  invalidMenuRequirements: InvalidMenuRequirement[];
} => {
  // invalidMenuRequirement will contain each requirement with level "menu" only if menus (below) length is 0
  const invalidMenuRequirements: InvalidMenuRequirement[] = [];
  const creates: Prisma.CompanyIntegrationAssetUncheckedCreateWithoutIntegrationsInput[] =
    [];
  const connects: Prisma.CompanyIntegrationAssetWhereUniqueInput[] = [];

  for (const requirement of requirements) {
    const {
      assets,
      level,
      id: integrationRequirementId,
      type,
      system,
    } = requirement;

    switch (level) {
      case $Enums.IntegrationRequirementLevel.Company:
        // If the asset exists, connect it. Otherwise create it.
        // Note: It should be impossible to have more than 1 company asset per requirement.
        // Prisma would throw a uniqueness constraint if it happens

        // Will be undefined if assets array is empty
        const asset: { id: string; menuId: number | null } | undefined =
          assets[0];
        if (asset) {
          connects.push({ id: asset.id });
        } else {
          creates.push(
            buildCreateCompanyIntegrationAssetCreate(
              companyId,
              integrationRequirementId,
              type,
              system,
              creatorId,
            ),
          );
        }
        break;

      case $Enums.IntegrationRequirementLevel.Menu:
        // If company doesn't have menus, then it can't create valid menu-level requirements (it has no menu ids)
        if (menus.length === 0) {
          invalidMenuRequirements.push({
            id: integrationRequirementId,
            type,
            system,
          });
          // If it does have menus, for each menu:
          // - If the menu asset is found, connect it. Otherwise create it.
        } else {
          menus.forEach((menu) => {
            const matchingAsset = assets.find(
              (asset) => asset.menuId === menu.id,
            );
            if (matchingAsset) {
              connects.push({ id: matchingAsset.id });
            } else {
              creates.push(
                buildCreateCompanyIntegrationAssetCreate(
                  companyId,
                  integrationRequirementId,
                  type,
                  system,
                  creatorId,
                  menu.id,
                ),
              );
            }
          });
        }
        break;
    }
  }

  return { creates, connects, invalidMenuRequirements };
};

// Not for export
const buildCreateCompanyIntegrationAssetCreate = (
  companyId: string,
  integrationRequirementId: number,
  type: $Enums.IntegrationAssetType,
  system: $Enums.ExternalSystem | null,
  creatorId: string,
  menuId?: number,
): Prisma.CompanyIntegrationAssetUncheckedCreateWithoutIntegrationsInput => {
  return {
    companyId,
    integrationRequirementId,
    type,
    system,
    creatorId,
    menuId,
  };
};

const companyDbHandlerUtilities = {
  buildCreateIntegration_AssetCreatesAndConnects,
};

export default companyDbHandlerUtilities;
