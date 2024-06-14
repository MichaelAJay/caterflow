SELECT *
FROM "external_systems" as "es"
INNER JOIN "external_system_connection_requirements" as "escr" ON "escr"."external_system_id" = "es"."id"
INNER JOIN "external_system_connection_webhook_requirements" as "escwr" ON "escwr"."external_system_id" = "es"."id"
WHERE "es"."id" = '1';
