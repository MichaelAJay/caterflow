INSERT INTO "roles" ("id", "name", "description","company_id","creator_id","is_editable")
VALUES('a2fadd0c-9ced-4123-b943-4bd05a58ec76','Owner','Owner of company account - has all permissions','88939475-710c-4e6c-b7c5-347f941bbc81','6e5fc9bd-cb45-48c1-8f08-00fffc38aa64',false);

INSERT INTO "user_company_roles" ("role_id","user_id","company_id","creator_id")
VALUES('a2fadd0c-9ced-4123-b943-4bd05a58ec76','6e5fc9bd-cb45-48c1-8f08-00fffc38aa64','88939475-710c-4e6c-b7c5-347f941bbc81','6e5fc9bd-cb45-48c1-8f08-00fffc38aa64');

INSERT INTO "_role_permissions"("A","B")
VALUES
    (1,'a2fadd0c-9ced-4123-b943-4bd05a58ec76'),
    (2,'a2fadd0c-9ced-4123-b943-4bd05a58ec76'),
    (3,'a2fadd0c-9ced-4123-b943-4bd05a58ec76'),
    (4,'a2fadd0c-9ced-4123-b943-4bd05a58ec76'),
    (5,'a2fadd0c-9ced-4123-b943-4bd05a58ec76'),
    (6,'a2fadd0c-9ced-4123-b943-4bd05a58ec76');