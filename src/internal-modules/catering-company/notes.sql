SELECT "ci"."id", "it"."src_system_id", "it"."target_system_id"
FROM
    "integration_templates" it INNER JOIN "company_integrations" ci ON "ci"."template_id" = "it"."id"
WHERE
    "ci"."company_id" = 'COMPANY_ID' AND
    ("it"."src_system_id" = 'SYSTEM_ID' OR "it"."target_system_id" = 'SYSTEM_ID');