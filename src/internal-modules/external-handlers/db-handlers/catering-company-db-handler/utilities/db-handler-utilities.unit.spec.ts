import {
  $Enums,
  CompanyIntegrationAsset,
  CompanyMenu,
  IntegrationRequirement,
} from '@prisma/client';
import companyDbHandlerUtilities from './db-handler-utilities';

describe('buildCreateIntegration_AssetCreatesAndConnects', () => {
  const companyId = 'company123';
  const creatorId = 'user123';

  const createRequirement = (
    id: number,
    level: $Enums.IntegrationRequirementLevel,
    type: $Enums.IntegrationAssetType,
    system: $Enums.ExternalSystem | null,
    assets: Pick<CompanyIntegrationAsset, 'id' | 'menuId'>[] = [],
  ): IntegrationRequirement & {
    assets: Pick<CompanyIntegrationAsset, 'id' | 'menuId'>[];
  } => ({
    id,
    type,
    system,
    uiName: '',
    uiDescription: '',
    isSecret: true,
    level,
    assets,
  });

  const createMenu = (id: number): Pick<CompanyMenu, 'id'> => ({ id });

  it('should return empty arrays when requirements are empty', () => {
    const result =
      companyDbHandlerUtilities.buildCreateIntegration_AssetCreatesAndConnects(
        companyId,
        [],
        [],
        creatorId,
      );

    expect(result.creates).toEqual([]);
    expect(result.connects).toEqual([]);
    expect(result.invalidMenuRequirements).toEqual([]);
  });

  it('should create assets for company-level requirements without existing assets', () => {
    const requirements = [
      createRequirement(
        1,
        $Enums.IntegrationRequirementLevel.Company,
        $Enums.IntegrationAssetType.API_CREDENTIAL_API_KEY,
        $Enums.ExternalSystem.ezCater,
      ),
      createRequirement(
        2,
        $Enums.IntegrationRequirementLevel.Company,
        $Enums.IntegrationAssetType.API_CREDENTIAL_API_KEY,
        $Enums.ExternalSystem.Nutshell,
      ),
      createRequirement(
        3,
        $Enums.IntegrationRequirementLevel.Company,
        $Enums.IntegrationAssetType.API_CREDENTIAL_USERNAME,
        $Enums.ExternalSystem.Nutshell,
      ),
    ];

    const result =
      companyDbHandlerUtilities.buildCreateIntegration_AssetCreatesAndConnects(
        companyId,
        requirements,
        [],
        creatorId,
      );

    expect(result.creates).toHaveLength(3);
    expect(result.creates).toContainEqual({
      companyId,
      integrationRequirementId: 1,
      type: $Enums.IntegrationAssetType.API_CREDENTIAL_API_KEY,
      system: $Enums.ExternalSystem.ezCater,
      creatorId,
      menuId: undefined,
    });
    expect(result.creates).toContainEqual({
      companyId,
      integrationRequirementId: 2,
      type: $Enums.IntegrationAssetType.API_CREDENTIAL_API_KEY,
      system: $Enums.ExternalSystem.Nutshell,
      creatorId,
      menuId: undefined,
    });
    expect(result.creates).toContainEqual({
      companyId,
      integrationRequirementId: 3,
      type: $Enums.IntegrationAssetType.API_CREDENTIAL_USERNAME,
      system: $Enums.ExternalSystem.Nutshell,
      creatorId,
      menuId: undefined,
    });
    expect(result.connects).toEqual([]);
    expect(result.invalidMenuRequirements).toEqual([]);
  });

  it('should connect existing assets for company-level requirements', () => {
    const requirements = [
      createRequirement(
        1,
        $Enums.IntegrationRequirementLevel.Company,
        $Enums.IntegrationAssetType.API_CREDENTIAL_API_KEY,
        $Enums.ExternalSystem.ezCater,
        [{ id: 'asset1', menuId: null }],
      ),
      createRequirement(
        2,
        $Enums.IntegrationRequirementLevel.Company,
        $Enums.IntegrationAssetType.API_CREDENTIAL_API_KEY,
        null,
        [{ id: 'asset2', menuId: null }],
      ),
    ];

    const result =
      companyDbHandlerUtilities.buildCreateIntegration_AssetCreatesAndConnects(
        companyId,
        requirements,
        [],
        creatorId,
      );

    expect(result.creates).toEqual([]);
    expect(result.connects).toHaveLength(2);
    expect(result.connects).toContainEqual({ id: 'asset1' });
    expect(result.connects).toContainEqual({ id: 'asset2' });
    expect(result.invalidMenuRequirements).toEqual([]);
  });

  it('should add invalid menu requirements when no menus exist', () => {
    const requirements = [
      createRequirement(
        1,
        $Enums.IntegrationRequirementLevel.Menu,
        $Enums.IntegrationAssetType.DATA_MAP,
        null,
      ),
      createRequirement(
        2,
        $Enums.IntegrationRequirementLevel.Menu,
        $Enums.IntegrationAssetType.DATA_MAP,
        null,
      ),
    ];

    const result =
      companyDbHandlerUtilities.buildCreateIntegration_AssetCreatesAndConnects(
        companyId,
        requirements,
        [],
        creatorId,
      );

    expect(result.creates).toEqual([]);
    expect(result.connects).toEqual([]);
    expect(result.invalidMenuRequirements).toHaveLength(2);
    expect(result.invalidMenuRequirements).toContainEqual({
      id: 1,
      type: $Enums.IntegrationAssetType.DATA_MAP,
      system: null,
    });
    expect(result.invalidMenuRequirements).toContainEqual({
      id: 2,
      type: $Enums.IntegrationAssetType.DATA_MAP,
      system: null,
    });
  });

  it('should create assets for menu-level requirements without existing assets', () => {
    const menus = [createMenu(1), createMenu(2)];
    const requirements = [
      createRequirement(
        1,
        $Enums.IntegrationRequirementLevel.Menu,
        $Enums.IntegrationAssetType.DATA_MAP,
        null,
      ),
      createRequirement(
        2,
        $Enums.IntegrationRequirementLevel.Menu,
        $Enums.IntegrationAssetType.DATA_MAP,
        null,
      ),
    ];

    const result =
      companyDbHandlerUtilities.buildCreateIntegration_AssetCreatesAndConnects(
        companyId,
        requirements,
        menus,
        creatorId,
      );

    // Num menus x num menu requirements
    expect(result.creates).toHaveLength(4);
    expect(result.creates).toContainEqual({
      companyId,
      integrationRequirementId: 1,
      system: null,
      type: $Enums.IntegrationAssetType.DATA_MAP,
      creatorId,
      menuId: 1,
    });
    expect(result.creates).toContainEqual({
      companyId,
      integrationRequirementId: 1,
      system: null,
      type: $Enums.IntegrationAssetType.DATA_MAP,
      creatorId,
      menuId: 2,
    });
    expect(result.creates).toContainEqual({
      companyId,
      integrationRequirementId: 2,
      type: $Enums.IntegrationAssetType.DATA_MAP,
      system: null,
      creatorId,
      menuId: 1,
    });
    expect(result.creates).toContainEqual({
      companyId,
      integrationRequirementId: 2,
      type: $Enums.IntegrationAssetType.DATA_MAP,
      system: null,
      creatorId,
      menuId: 2,
    });
    expect(result.connects).toEqual([]);
    expect(result.invalidMenuRequirements).toEqual([]);
  });

  it('should connect existing assets for menu-level requirements', () => {
    const menus = [createMenu(1), createMenu(2)];
    const requirements = [
      createRequirement(
        1,
        $Enums.IntegrationRequirementLevel.Menu,
        $Enums.IntegrationAssetType.DATA_MAP,
        null,
        [{ id: 'asset1', menuId: 1 }],
      ),
      createRequirement(
        2,
        $Enums.IntegrationRequirementLevel.Menu,
        $Enums.IntegrationAssetType.DATA_MAP,
        null,
        [{ id: 'asset2', menuId: 2 }],
      ),
    ];

    const result =
      companyDbHandlerUtilities.buildCreateIntegration_AssetCreatesAndConnects(
        companyId,
        requirements,
        menus,
        creatorId,
      );

    expect(result.creates).toHaveLength(2);
    expect(result.creates).toContainEqual({
      companyId,
      integrationRequirementId: 1,
      system: null,
      type: $Enums.IntegrationAssetType.DATA_MAP,
      creatorId,
      menuId: 2,
    });
    expect(result.creates).toContainEqual({
      companyId,
      integrationRequirementId: 2,
      type: $Enums.IntegrationAssetType.DATA_MAP,
      system: null,
      creatorId,
      menuId: 1,
    });
    expect(result.connects).toHaveLength(2);
    expect(result.connects).toContainEqual({ id: 'asset1' });
    expect(result.connects).toContainEqual({ id: 'asset2' });
    expect(result.invalidMenuRequirements).toEqual([]);
  });

  it('should handle a combination of company-level and menu-level requirements', () => {
    const menus = [createMenu(1)];
    const requirements = [
      createRequirement(
        1,
        $Enums.IntegrationRequirementLevel.Company,
        $Enums.IntegrationAssetType.API_CREDENTIAL_API_KEY,
        $Enums.ExternalSystem.Nutshell,
      ),
      createRequirement(
        2,
        $Enums.IntegrationRequirementLevel.Company,
        $Enums.IntegrationAssetType.API_CREDENTIAL_USERNAME,
        $Enums.ExternalSystem.Nutshell,
        [{ id: 'asset2', menuId: 1 }],
      ),
      createRequirement(
        3,
        $Enums.IntegrationRequirementLevel.Menu,
        $Enums.IntegrationAssetType.DATA_MAP,
        null,
      ),
    ];

    const result =
      companyDbHandlerUtilities.buildCreateIntegration_AssetCreatesAndConnects(
        companyId,
        requirements,
        menus,
        creatorId,
      );

    expect(result.creates).toHaveLength(2);
    expect(result.creates).toContainEqual({
      companyId,
      integrationRequirementId: 1,
      type: $Enums.IntegrationAssetType.API_CREDENTIAL_API_KEY,
      system: $Enums.ExternalSystem.Nutshell,
      creatorId,
      menuId: undefined,
    });
    expect(result.creates).toContainEqual({
      companyId,
      integrationRequirementId: 3,
      type: $Enums.IntegrationAssetType.DATA_MAP,
      system: null,
      creatorId,
      menuId: 1,
    });
    expect(result.connects).toHaveLength(1);
    expect(result.connects).toContainEqual({ id: 'asset2' });
    expect(result.invalidMenuRequirements).toEqual([]);
  });
});
