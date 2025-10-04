-- Utility script to provision the local PostgreSQL role and databases
-- expected by the Rails application. Run with:
--   psql -U postgres -f db/postgres_setup.sql
-- Adjust the command above if your PostgreSQL superuser differs.

DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'Phomhado') THEN
        CREATE ROLE "Phomhado" WITH LOGIN SUPERUSER PASSWORD 'Phomhado00';
    ELSE
        ALTER ROLE "Phomhado" WITH LOGIN SUPERUSER PASSWORD 'Phomhado00';
    END IF;
END
$$;

DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'backend_development') THEN
        CREATE DATABASE backend_development OWNER "Phomhado";
    END IF;
END
$$;

DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'backend_test') THEN
        CREATE DATABASE backend_test OWNER "Phomhado";
    END IF;
END
$$;
