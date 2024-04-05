export type IGetIntegrationQueryRequest = {
  pg?: string; // must be parseable to int
  per_page?: string; // must be parseable to int
  template_src?: 'ezCater';
  template_target?: 'ezCater' | 'Nutshell';
};

export type IGetCompanyIntegrationsQueryRequest =
  IGetIntegrationQueryRequest & {
    filter_configured?: string; // 'true' | 'false'
    filter_active?: string; // 'true' | 'false'
    created_since?: 'last_week' | 'last_month' | 'last_year';
    sort?: 'created_asc' | 'created_desc';
  };
