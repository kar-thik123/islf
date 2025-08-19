--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-08-19 11:21:17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 275 (class 1255 OID 25324)
-- Name: clean_old_logs(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.clean_old_logs(days_to_keep integer DEFAULT 90) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM settings_logs 
    WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;


ALTER FUNCTION public.clean_old_logs(days_to_keep integer) OWNER TO postgres;

--
-- TOC entry 276 (class 1255 OID 33154)
-- Name: update_incharge_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_incharge_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_incharge_updated_at() OWNER TO postgres;

--
-- TOC entry 274 (class 1255 OID 24910)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 271 (class 1259 OID 33118)
-- Name: account_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_details (
    id integer NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_code character varying(100) NOT NULL,
    beneficiary text,
    bank_address text,
    bank_name character varying(255),
    account_number character varying(50),
    bank_branch_code character varying(20),
    rtgs_neft_code character varying(20),
    account_type character varying(50),
    swift_code character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_primary boolean DEFAULT false
);


ALTER TABLE public.account_details OWNER TO postgres;

--
-- TOC entry 270 (class 1259 OID 33117)
-- Name: account_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.account_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.account_details_id_seq OWNER TO postgres;

--
-- TOC entry 5369 (class 0 OID 0)
-- Dependencies: 270
-- Name: account_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.account_details_id_seq OWNED BY public.account_details.id;


--
-- TOC entry 220 (class 1259 OID 16414)
-- Name: auth_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_logs (
    id integer NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    username character varying(255) NOT NULL,
    action character varying(100) NOT NULL,
    details text,
    company_code character varying(10),
    branch_code text,
    department_code text
);


ALTER TABLE public.auth_logs OWNER TO postgres;

--
-- TOC entry 5370 (class 0 OID 0)
-- Dependencies: 220
-- Name: COLUMN auth_logs.company_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.auth_logs.company_code IS 'Company code reference for multi-company support';


--
-- TOC entry 5371 (class 0 OID 0)
-- Dependencies: 220
-- Name: COLUMN auth_logs.branch_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.auth_logs.branch_code IS 'Branch code reference for multi-branch support';


--
-- TOC entry 5372 (class 0 OID 0)
-- Dependencies: 220
-- Name: COLUMN auth_logs.department_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.auth_logs.department_code IS 'Department code reference for multi-department support';


--
-- TOC entry 219 (class 1259 OID 16413)
-- Name: auth_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auth_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auth_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5373 (class 0 OID 0)
-- Dependencies: 219
-- Name: auth_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auth_logs_id_seq OWNED BY public.auth_logs.id;


--
-- TOC entry 226 (class 1259 OID 16525)
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    code text NOT NULL,
    company_code text NOT NULL,
    name text NOT NULL,
    description text,
    address text,
    gst text,
    incharge_name text,
    incharge_from date,
    status text,
    start_date date,
    close_date date,
    remarks text
);


ALTER TABLE public.branches OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 24610)
-- Name: branch_dropdown; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.branch_dropdown AS
 SELECT code,
    name,
    ((code || ' - '::text) || name) AS label
   FROM public.branches;


ALTER VIEW public.branch_dropdown OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16518)
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    code character varying(10) NOT NULL,
    name text NOT NULL,
    name2 text,
    gst text,
    phone text,
    landline text,
    email text,
    website text,
    logo text,
    pan_number text,
    register_number text,
    register_address text,
    head_office_address text
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 24850)
-- Name: container_code; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.container_code (
    id integer NOT NULL,
    code character varying(10) NOT NULL,
    description character varying(100),
    status character varying(20) DEFAULT 'Active'::character varying,
    company_code character varying(10),
    branch_code text,
    department_code text,
    service_type_code text
);


ALTER TABLE public.container_code OWNER TO postgres;

--
-- TOC entry 5374 (class 0 OID 0)
-- Dependencies: 249
-- Name: COLUMN container_code.company_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.container_code.company_code IS 'Company code reference for multi-company support';


--
-- TOC entry 5375 (class 0 OID 0)
-- Dependencies: 249
-- Name: COLUMN container_code.branch_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.container_code.branch_code IS 'Branch code reference for multi-branch support';


--
-- TOC entry 5376 (class 0 OID 0)
-- Dependencies: 249
-- Name: COLUMN container_code.department_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.container_code.department_code IS 'Department code reference for multi-department support';


--
-- TOC entry 248 (class 1259 OID 24849)
-- Name: container_code_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.container_code_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.container_code_id_seq OWNER TO postgres;

--
-- TOC entry 5377 (class 0 OID 0)
-- Dependencies: 248
-- Name: container_code_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.container_code_id_seq OWNED BY public.container_code.id;


--
-- TOC entry 247 (class 1259 OID 24840)
-- Name: currency_code; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.currency_code (
    id integer NOT NULL,
    code character varying(10) NOT NULL,
    description character varying(100),
    status character varying(20) DEFAULT 'Active'::character varying,
    company_code character varying(10),
    branch_code text,
    department_code text,
    service_type_code text
);


ALTER TABLE public.currency_code OWNER TO postgres;

--
-- TOC entry 5378 (class 0 OID 0)
-- Dependencies: 247
-- Name: COLUMN currency_code.company_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.currency_code.company_code IS 'Company code reference for multi-company support';


--
-- TOC entry 5379 (class 0 OID 0)
-- Dependencies: 247
-- Name: COLUMN currency_code.branch_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.currency_code.branch_code IS 'Branch code reference for multi-branch support';


--
-- TOC entry 5380 (class 0 OID 0)
-- Dependencies: 247
-- Name: COLUMN currency_code.department_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.currency_code.department_code IS 'Department code reference for multi-department support';


--
-- TOC entry 246 (class 1259 OID 24839)
-- Name: currency_code_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.currency_code_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.currency_code_id_seq OWNER TO postgres;

--
-- TOC entry 5381 (class 0 OID 0)
-- Dependencies: 246
-- Name: currency_code_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.currency_code_id_seq OWNED BY public.currency_code.id;


--
-- TOC entry 243 (class 1259 OID 24813)
-- Name: customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer (
    id integer NOT NULL,
    customer_no character varying(50) NOT NULL,
    type character varying(50),
    name character varying(255),
    name2 character varying(255),
    address text,
    address1 text,
    country character varying(100),
    state character varying(100),
    city character varying(100),
    postal_code character varying(20),
    website character varying(255),
    bill_to_customer_name character varying(255),
    vat_gst_no character varying(50),
    place_of_supply character varying(100),
    pan_no character varying(20),
    tan_no character varying(20),
    contacts jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_code character varying(10),
    branch_code text,
    department_code text,
    service_type_code text,
    blocked character varying(50)
);


ALTER TABLE public.customer OWNER TO postgres;

--
-- TOC entry 5382 (class 0 OID 0)
-- Dependencies: 243
-- Name: COLUMN customer.company_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.customer.company_code IS 'Company code reference for multi-company support';


--
-- TOC entry 5383 (class 0 OID 0)
-- Dependencies: 243
-- Name: COLUMN customer.branch_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.customer.branch_code IS 'Branch code reference for multi-branch support';


--
-- TOC entry 5384 (class 0 OID 0)
-- Dependencies: 243
-- Name: COLUMN customer.department_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.customer.department_code IS 'Department code reference for multi-department support';


--
-- TOC entry 242 (class 1259 OID 24812)
-- Name: customer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customer_id_seq OWNER TO postgres;

--
-- TOC entry 5385 (class 0 OID 0)
-- Dependencies: 242
-- Name: customer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customer_id_seq OWNED BY public.customer.id;


--
-- TOC entry 227 (class 1259 OID 16537)
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    code text NOT NULL,
    company_code text NOT NULL,
    branch_code text NOT NULL,
    name text NOT NULL,
    description text,
    incharge_name text,
    incharge_from date,
    status text,
    start_date date,
    close_date date,
    remarks text
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 24614)
-- Name: department_dropdown; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.department_dropdown AS
 SELECT code,
    name,
    ((code || ' - '::text) || name) AS label
   FROM public.departments;


ALTER VIEW public.department_dropdown OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 24897)
-- Name: entity_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.entity_documents (
    id integer NOT NULL,
    entity_type character varying(50) NOT NULL,
    entity_code character varying(100) NOT NULL,
    doc_type character varying(255) NOT NULL,
    document_number character varying(100),
    valid_from date,
    valid_till date,
    file_path text NOT NULL,
    file_name character varying(255) NOT NULL,
    file_size integer NOT NULL,
    mime_type character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_code character varying(10),
    branch_code text,
    department_code text,
    service_type_code text
);


ALTER TABLE public.entity_documents OWNER TO postgres;

--
-- TOC entry 5386 (class 0 OID 0)
-- Dependencies: 255
-- Name: COLUMN entity_documents.company_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.entity_documents.company_code IS 'Company code reference for multi-company support';


--
-- TOC entry 5387 (class 0 OID 0)
-- Dependencies: 255
-- Name: COLUMN entity_documents.branch_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.entity_documents.branch_code IS 'Branch code reference for multi-branch support';


--
-- TOC entry 5388 (class 0 OID 0)
-- Dependencies: 255
-- Name: COLUMN entity_documents.department_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.entity_documents.department_code IS 'Department code reference for multi-department support';


--
-- TOC entry 254 (class 1259 OID 24896)
-- Name: entity_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.entity_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.entity_documents_id_seq OWNER TO postgres;

--
-- TOC entry 5389 (class 0 OID 0)
-- Dependencies: 254
-- Name: entity_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.entity_documents_id_seq OWNED BY public.entity_documents.id;


--
-- TOC entry 251 (class 1259 OID 24860)
-- Name: gst_setup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gst_setup (
    id integer NOT NULL,
    "from" character varying(100) NOT NULL,
    "to" character varying(100) NOT NULL,
    sgst boolean DEFAULT false,
    cgst boolean DEFAULT false,
    igst boolean DEFAULT false,
    company_code character varying(10),
    branch_code text,
    department_code text,
    service_type_code text
);


ALTER TABLE public.gst_setup OWNER TO postgres;

--
-- TOC entry 5390 (class 0 OID 0)
-- Dependencies: 251
-- Name: COLUMN gst_setup.company_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.gst_setup.company_code IS 'Company code reference for multi-company support';


--
-- TOC entry 5391 (class 0 OID 0)
-- Dependencies: 251
-- Name: COLUMN gst_setup.branch_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.gst_setup.branch_code IS 'Branch code reference for multi-branch support';


--
-- TOC entry 5392 (class 0 OID 0)
-- Dependencies: 251
-- Name: COLUMN gst_setup.department_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.gst_setup.department_code IS 'Department code reference for multi-department support';


--
-- TOC entry 250 (class 1259 OID 24859)
-- Name: gst_setup_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.gst_setup_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.gst_setup_id_seq OWNER TO postgres;

--
-- TOC entry 5393 (class 0 OID 0)
-- Dependencies: 250
-- Name: gst_setup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gst_setup_id_seq OWNED BY public.gst_setup.id;


--
-- TOC entry 273 (class 1259 OID 33137)
-- Name: incharge; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.incharge (
    id integer NOT NULL,
    entity_type text NOT NULL,
    entity_code text NOT NULL,
    incharge_name text NOT NULL,
    phone_number text,
    email text,
    status text DEFAULT 'active'::text NOT NULL,
    from_date date DEFAULT CURRENT_DATE NOT NULL,
    to_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT incharge_entity_type_check CHECK ((entity_type = ANY (ARRAY['company'::text, 'branch'::text, 'department'::text, 'service_type'::text]))),
    CONSTRAINT incharge_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text])))
);


ALTER TABLE public.incharge OWNER TO postgres;

--
-- TOC entry 5394 (class 0 OID 0)
-- Dependencies: 273
-- Name: TABLE incharge; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.incharge IS 'Table to manage incharge personnel for different entity types';


--
-- TOC entry 5395 (class 0 OID 0)
-- Dependencies: 273
-- Name: COLUMN incharge.entity_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.incharge.entity_type IS 'Type of entity (company, branch, department, service_type)';


--
-- TOC entry 5396 (class 0 OID 0)
-- Dependencies: 273
-- Name: COLUMN incharge.entity_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.incharge.entity_code IS 'Code of the entity';


--
-- TOC entry 5397 (class 0 OID 0)
-- Dependencies: 273
-- Name: COLUMN incharge.incharge_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.incharge.incharge_name IS 'Name of the incharge person';


--
-- TOC entry 5398 (class 0 OID 0)
-- Dependencies: 273
-- Name: COLUMN incharge.phone_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.incharge.phone_number IS 'Contact phone number';


--
-- TOC entry 5399 (class 0 OID 0)
-- Dependencies: 273
-- Name: COLUMN incharge.email; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.incharge.email IS 'Email address';


--
-- TOC entry 5400 (class 0 OID 0)
-- Dependencies: 273
-- Name: COLUMN incharge.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.incharge.status IS 'Status of the incharge (active/inactive)';


--
-- TOC entry 5401 (class 0 OID 0)
-- Dependencies: 273
-- Name: COLUMN incharge.from_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.incharge.from_date IS 'Start date of incharge responsibility';


--
-- TOC entry 5402 (class 0 OID 0)
-- Dependencies: 273
-- Name: COLUMN incharge.to_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.incharge.to_date IS 'End date of incharge responsibility';


--
-- TOC entry 272 (class 1259 OID 33136)
-- Name: incharge_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.incharge_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.incharge_id_seq OWNER TO postgres;

--
-- TOC entry 5403 (class 0 OID 0)
-- Dependencies: 272
-- Name: incharge_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.incharge_id_seq OWNED BY public.incharge.id;


--
-- TOC entry 269 (class 1259 OID 25422)
-- Name: mapping_relations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mapping_relations (
    id integer NOT NULL,
    code_type character varying(100) NOT NULL,
    mapping character varying(255) NOT NULL,
    company_code character varying(50),
    branch_code character varying(50),
    department_code character varying(50),
    service_type_code character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.mapping_relations OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 25421)
-- Name: mapping_relations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mapping_relations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mapping_relations_id_seq OWNER TO postgres;

--
-- TOC entry 5404 (class 0 OID 0)
-- Dependencies: 268
-- Name: mapping_relations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mapping_relations_id_seq OWNED BY public.mapping_relations.id;


--
-- TOC entry 231 (class 1259 OID 24644)
-- Name: master_code; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.master_code (
    id integer NOT NULL,
    code character varying(100) NOT NULL,
    description text,
    status character varying(10) DEFAULT 'Active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    reference text,
    company_code character varying(10),
    branch_code text,
    department_code text,
    service_type_code text,
    CONSTRAINT master_code_status_check CHECK (((status)::text = ANY ((ARRAY['Active'::character varying, 'Inactive'::character varying])::text[])))
);


ALTER TABLE public.master_code OWNER TO postgres;

--
-- TOC entry 5405 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN master_code.company_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_code.company_code IS 'Company code reference for multi-company support';


--
-- TOC entry 5406 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN master_code.branch_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_code.branch_code IS 'Branch code reference for multi-branch support';


--
-- TOC entry 5407 (class 0 OID 0)
-- Dependencies: 231
-- Name: COLUMN master_code.department_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_code.department_code IS 'Department code reference for multi-department support';


--
-- TOC entry 230 (class 1259 OID 24643)
-- Name: master_code_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.master_code_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.master_code_id_seq OWNER TO postgres;

--
-- TOC entry 5408 (class 0 OID 0)
-- Dependencies: 230
-- Name: master_code_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.master_code_id_seq OWNED BY public.master_code.id;


--
-- TOC entry 237 (class 1259 OID 24746)
-- Name: master_item; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.master_item (
    id integer NOT NULL,
    item_type character varying(100) NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    hs_code character varying(50),
    active boolean DEFAULT true,
    company_code character varying(10),
    branch_code text,
    department_code text,
    service_type_code text
);


ALTER TABLE public.master_item OWNER TO postgres;

--
-- TOC entry 5409 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN master_item.company_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_item.company_code IS 'Company code reference for multi-company support';


--
-- TOC entry 5410 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN master_item.branch_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_item.branch_code IS 'Branch code reference for multi-branch support';


--
-- TOC entry 5411 (class 0 OID 0)
-- Dependencies: 237
-- Name: COLUMN master_item.department_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_item.department_code IS 'Department code reference for multi-department support';


--
-- TOC entry 236 (class 1259 OID 24745)
-- Name: master_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.master_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.master_item_id_seq OWNER TO postgres;

--
-- TOC entry 5412 (class 0 OID 0)
-- Dependencies: 236
-- Name: master_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.master_item_id_seq OWNED BY public.master_item.id;


--
-- TOC entry 235 (class 1259 OID 24685)
-- Name: master_location; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.master_location (
    id integer NOT NULL,
    type character varying(100),
    code character varying(100) NOT NULL,
    name character varying(255),
    country character varying(100),
    state character varying(100),
    city character varying(100),
    gst_state_code character varying(100),
    pin_code character varying(100),
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    company_code character varying(10),
    branch_code text,
    department_code text,
    service_type_code text
);


ALTER TABLE public.master_location OWNER TO postgres;

--
-- TOC entry 5413 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN master_location.company_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_location.company_code IS 'Company code reference for multi-company support';


--
-- TOC entry 5414 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN master_location.branch_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_location.branch_code IS 'Branch code reference for multi-branch support';


--
-- TOC entry 5415 (class 0 OID 0)
-- Dependencies: 235
-- Name: COLUMN master_location.department_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_location.department_code IS 'Department code reference for multi-department support';


--
-- TOC entry 234 (class 1259 OID 24684)
-- Name: master_location_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.master_location_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.master_location_id_seq OWNER TO postgres;

--
-- TOC entry 5416 (class 0 OID 0)
-- Dependencies: 234
-- Name: master_location_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.master_location_id_seq OWNED BY public.master_location.id;


--
-- TOC entry 267 (class 1259 OID 25391)
-- Name: master_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.master_logs (
    id integer NOT NULL,
    username text NOT NULL,
    action text NOT NULL,
    master_type text NOT NULL,
    record_id text NOT NULL,
    record_name text,
    details text,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_code character varying,
    branch_code text,
    department_code text,
    service_type_code text
);


ALTER TABLE public.master_logs OWNER TO postgres;

--
-- TOC entry 5417 (class 0 OID 0)
-- Dependencies: 267
-- Name: TABLE master_logs; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.master_logs IS 'Logs for master data operations like customer, vendor, item, etc.';


--
-- TOC entry 5418 (class 0 OID 0)
-- Dependencies: 267
-- Name: COLUMN master_logs.username; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_logs.username IS 'Username of the user performing the action';


--
-- TOC entry 5419 (class 0 OID 0)
-- Dependencies: 267
-- Name: COLUMN master_logs.action; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_logs.action IS 'Action performed (CREATE, UPDATE, DELETE)';


--
-- TOC entry 5420 (class 0 OID 0)
-- Dependencies: 267
-- Name: COLUMN master_logs.master_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_logs.master_type IS 'Type of master data (Customer, Vendor, Item, etc.)';


--
-- TOC entry 5421 (class 0 OID 0)
-- Dependencies: 267
-- Name: COLUMN master_logs.record_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_logs.record_id IS 'Unique identifier of the master record';


--
-- TOC entry 5422 (class 0 OID 0)
-- Dependencies: 267
-- Name: COLUMN master_logs.record_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_logs.record_name IS 'Name/description of the master record';


--
-- TOC entry 5423 (class 0 OID 0)
-- Dependencies: 267
-- Name: COLUMN master_logs.details; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_logs.details IS 'Additional details about the action';


--
-- TOC entry 5424 (class 0 OID 0)
-- Dependencies: 267
-- Name: COLUMN master_logs."timestamp"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_logs."timestamp" IS 'Timestamp when the action was performed';


--
-- TOC entry 265 (class 1259 OID 25385)
-- Name: master_logs_backup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.master_logs_backup (
    id integer,
    username text,
    action text,
    entity text,
    entity_id integer,
    details text,
    "timestamp" timestamp without time zone,
    company_code character varying(10),
    branch_code text,
    department_code text
);


ALTER TABLE public.master_logs_backup OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 25390)
-- Name: master_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.master_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.master_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5425 (class 0 OID 0)
-- Dependencies: 266
-- Name: master_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.master_logs_id_seq OWNED BY public.master_logs.id;


--
-- TOC entry 233 (class 1259 OID 24659)
-- Name: master_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.master_type (
    id integer NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    status text DEFAULT 'Active'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    company_code character varying(10),
    branch_code text,
    department_code text,
    service_type_code text
);


ALTER TABLE public.master_type OWNER TO postgres;

--
-- TOC entry 5426 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN master_type.company_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_type.company_code IS 'Company code reference for multi-company support';


--
-- TOC entry 5427 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN master_type.branch_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_type.branch_code IS 'Branch code reference for multi-branch support';


--
-- TOC entry 5428 (class 0 OID 0)
-- Dependencies: 233
-- Name: COLUMN master_type.department_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_type.department_code IS 'Department code reference for multi-department support';


--
-- TOC entry 232 (class 1259 OID 24658)
-- Name: master_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.master_type_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.master_type_id_seq OWNER TO postgres;

--
-- TOC entry 5429 (class 0 OID 0)
-- Dependencies: 232
-- Name: master_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.master_type_id_seq OWNED BY public.master_type.id;


--
-- TOC entry 239 (class 1259 OID 24758)
-- Name: master_uom; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.master_uom (
    id integer NOT NULL,
    uom_type character varying(50) NOT NULL,
    code character varying(10) NOT NULL,
    description character varying(200),
    start_day character varying(50),
    end_day character varying(50),
    working_days character varying(50),
    active boolean DEFAULT true,
    company_code character varying(10),
    branch_code text,
    department_code text,
    service_type_code text
);


ALTER TABLE public.master_uom OWNER TO postgres;

--
-- TOC entry 5430 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN master_uom.company_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_uom.company_code IS 'Company code reference for multi-company support';


--
-- TOC entry 5431 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN master_uom.branch_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_uom.branch_code IS 'Branch code reference for multi-branch support';


--
-- TOC entry 5432 (class 0 OID 0)
-- Dependencies: 239
-- Name: COLUMN master_uom.department_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_uom.department_code IS 'Department code reference for multi-department support';


--
-- TOC entry 238 (class 1259 OID 24757)
-- Name: master_uom_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.master_uom_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.master_uom_id_seq OWNER TO postgres;

--
-- TOC entry 5433 (class 0 OID 0)
-- Dependencies: 238
-- Name: master_uom_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.master_uom_id_seq OWNED BY public.master_uom.id;


--
-- TOC entry 241 (class 1259 OID 24785)
-- Name: master_vessel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.master_vessel (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    vessel_name character varying(100) NOT NULL,
    flag character varying(50) NOT NULL,
    year_build character varying(50) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    imo_number character varying(100),
    company_code character varying(50),
    branch_code text,
    department_code text,
    service_type_code text,
    vessel_type character varying(50)
);


ALTER TABLE public.master_vessel OWNER TO postgres;

--
-- TOC entry 5434 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN master_vessel.company_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_vessel.company_code IS 'Company code reference for multi-company support';


--
-- TOC entry 5435 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN master_vessel.branch_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_vessel.branch_code IS 'Branch code reference for multi-branch support';


--
-- TOC entry 5436 (class 0 OID 0)
-- Dependencies: 241
-- Name: COLUMN master_vessel.department_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.master_vessel.department_code IS 'Department code reference for multi-department support';


--
-- TOC entry 240 (class 1259 OID 24784)
-- Name: master_vessel_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.master_vessel_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.master_vessel_id_seq OWNER TO postgres;

--
-- TOC entry 5437 (class 0 OID 0)
-- Dependencies: 240
-- Name: master_vessel_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.master_vessel_id_seq OWNED BY public.master_vessel.id;


--
-- TOC entry 222 (class 1259 OID 16479)
-- Name: number_relation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.number_relation (
    number_series text NOT NULL,
    starting_date date NOT NULL,
    prefix text,
    starting_no integer NOT NULL,
    ending_no integer NOT NULL,
    last_no_used integer DEFAULT 0,
    increment_by integer DEFAULT 1 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id integer NOT NULL,
    company_code text,
    ending_date timestamp without time zone,
    branch_code text,
    department_code text,
    service_type_code text
);


ALTER TABLE public.number_relation OWNER TO postgres;

--
-- TOC entry 5438 (class 0 OID 0)
-- Dependencies: 222
-- Name: COLUMN number_relation.ending_date; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.number_relation.ending_date IS 'Ending date and time for the relation. Mutually exclusive with ending_no.';


--
-- TOC entry 224 (class 1259 OID 16507)
-- Name: number_relation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.number_relation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.number_relation_id_seq OWNER TO postgres;

--
-- TOC entry 5439 (class 0 OID 0)
-- Dependencies: 224
-- Name: number_relation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.number_relation_id_seq OWNED BY public.number_relation.id;


--
-- TOC entry 221 (class 1259 OID 16423)
-- Name: number_series; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.number_series (
    code text NOT NULL,
    description text,
    basecode text,
    is_default boolean DEFAULT false,
    is_manual boolean DEFAULT false,
    is_primary boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id integer NOT NULL,
    company_code text,
    branch_code text,
    department_code text,
    service_type_code text
);


ALTER TABLE public.number_series OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16496)
-- Name: number_series_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.number_series_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.number_series_id_seq OWNER TO postgres;

--
-- TOC entry 5440 (class 0 OID 0)
-- Dependencies: 223
-- Name: number_series_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.number_series_id_seq OWNED BY public.number_series.id;


--
-- TOC entry 259 (class 1259 OID 25302)
-- Name: settings_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings_logs (
    id integer NOT NULL,
    "timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    user_id character varying(100),
    user_name character varying(255),
    action character varying(100) NOT NULL,
    module character varying(100) NOT NULL,
    entity_type character varying(100),
    entity_id character varying(100),
    entity_name character varying(255),
    details text,
    ip_address character varying(45),
    user_agent text,
    status character varying(20) DEFAULT 'SUCCESS'::character varying NOT NULL,
    error_message text,
    old_value jsonb,
    new_value jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.settings_logs OWNER TO postgres;

--
-- TOC entry 5441 (class 0 OID 0)
-- Dependencies: 259
-- Name: TABLE settings_logs; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.settings_logs IS 'Stores all settings activity logs for audit and monitoring purposes';


--
-- TOC entry 5442 (class 0 OID 0)
-- Dependencies: 259
-- Name: COLUMN settings_logs.id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings_logs.id IS 'Primary key, auto-incrementing';


--
-- TOC entry 5443 (class 0 OID 0)
-- Dependencies: 259
-- Name: COLUMN settings_logs."timestamp"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings_logs."timestamp" IS 'When the action occurred';


--
-- TOC entry 5444 (class 0 OID 0)
-- Dependencies: 259
-- Name: COLUMN settings_logs.user_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings_logs.user_id IS 'ID of the user who performed the action';


--
-- TOC entry 5445 (class 0 OID 0)
-- Dependencies: 259
-- Name: COLUMN settings_logs.user_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings_logs.user_name IS 'Name of the user who performed the action';


--
-- TOC entry 5446 (class 0 OID 0)
-- Dependencies: 259
-- Name: COLUMN settings_logs.action; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings_logs.action IS 'Type of action performed (CREATE, UPDATE, DELETE, etc.)';


--
-- TOC entry 5447 (class 0 OID 0)
-- Dependencies: 259
-- Name: COLUMN settings_logs.module; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings_logs.module IS 'Module where the action occurred (Company Management, User Management, etc.)';


--
-- TOC entry 5448 (class 0 OID 0)
-- Dependencies: 259
-- Name: COLUMN settings_logs.entity_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings_logs.entity_type IS 'Type of entity affected (Company, User, Branch, etc.)';


--
-- TOC entry 5449 (class 0 OID 0)
-- Dependencies: 259
-- Name: COLUMN settings_logs.entity_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings_logs.entity_id IS 'ID of the specific entity affected';


--
-- TOC entry 5450 (class 0 OID 0)
-- Dependencies: 259
-- Name: COLUMN settings_logs.entity_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings_logs.entity_name IS 'Name of the specific entity affected';


--
-- TOC entry 5451 (class 0 OID 0)
-- Dependencies: 259
-- Name: COLUMN settings_logs.details; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings_logs.details IS 'Detailed description of the action';


--
-- TOC entry 5452 (class 0 OID 0)
-- Dependencies: 259
-- Name: COLUMN settings_logs.ip_address; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings_logs.ip_address IS 'IP address of the user';


--
-- TOC entry 5453 (class 0 OID 0)
-- Dependencies: 259
-- Name: COLUMN settings_logs.user_agent; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings_logs.user_agent IS 'User agent string from the browser';


--
-- TOC entry 5454 (class 0 OID 0)
-- Dependencies: 259
-- Name: COLUMN settings_logs.status; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings_logs.status IS 'Status of the action (SUCCESS, ERROR, WARNING, INFO)';


--
-- TOC entry 5455 (class 0 OID 0)
-- Dependencies: 259
-- Name: COLUMN settings_logs.error_message; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings_logs.error_message IS 'Error message if the action failed';


--
-- TOC entry 5456 (class 0 OID 0)
-- Dependencies: 259
-- Name: COLUMN settings_logs.old_value; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings_logs.old_value IS 'Previous value before the change (JSON format)';


--
-- TOC entry 5457 (class 0 OID 0)
-- Dependencies: 259
-- Name: COLUMN settings_logs.new_value; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings_logs.new_value IS 'New value after the change (JSON format)';


--
-- TOC entry 5458 (class 0 OID 0)
-- Dependencies: 259
-- Name: COLUMN settings_logs.created_at; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings_logs.created_at IS 'When the log record was created';


--
-- TOC entry 260 (class 1259 OID 25325)
-- Name: recent_logs; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.recent_logs AS
 SELECT id,
    "timestamp",
    user_name,
    action,
    module,
    entity_type,
    entity_name,
    details,
    status,
    error_message
   FROM public.settings_logs
  WHERE ("timestamp" >= (CURRENT_TIMESTAMP - '7 days'::interval))
  ORDER BY "timestamp" DESC;


ALTER VIEW public.recent_logs OWNER TO postgres;

--
-- TOC entry 261 (class 1259 OID 25336)
-- Name: service_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_types (
    code text NOT NULL,
    company_code text NOT NULL,
    branch_code text NOT NULL,
    department_code text NOT NULL,
    name text NOT NULL,
    description text,
    status text,
    start_date date,
    close_date date,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    incharge_name text,
    incharge_from date
);


ALTER TABLE public.service_types OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 25364)
-- Name: service_type_dropdown; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.service_type_dropdown AS
 SELECT code,
    name,
    ((code || ' - '::text) || name) AS label
   FROM public.service_types;


ALTER VIEW public.service_type_dropdown OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 24934)
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    key character varying(255) NOT NULL,
    value text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_code character varying(10),
    branch_code text,
    department_code text
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- TOC entry 5459 (class 0 OID 0)
-- Dependencies: 257
-- Name: COLUMN settings.company_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings.company_code IS 'Company code reference for multi-company support';


--
-- TOC entry 5460 (class 0 OID 0)
-- Dependencies: 257
-- Name: COLUMN settings.branch_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings.branch_code IS 'Branch code reference for multi-branch support';


--
-- TOC entry 5461 (class 0 OID 0)
-- Dependencies: 257
-- Name: COLUMN settings.department_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.settings.department_code IS 'Department code reference for multi-department support';


--
-- TOC entry 256 (class 1259 OID 24933)
-- Name: settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.settings_id_seq OWNER TO postgres;

--
-- TOC entry 5462 (class 0 OID 0)
-- Dependencies: 256
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- TOC entry 258 (class 1259 OID 25301)
-- Name: settings_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.settings_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.settings_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5463 (class 0 OID 0)
-- Dependencies: 258
-- Name: settings_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settings_logs_id_seq OWNED BY public.settings_logs.id;


--
-- TOC entry 264 (class 1259 OID 25370)
-- Name: setup_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.setup_logs (
    id integer NOT NULL,
    username text NOT NULL,
    action text NOT NULL,
    setup_type text NOT NULL,
    entity_type text NOT NULL,
    entity_code text NOT NULL,
    entity_name text,
    details text,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.setup_logs OWNER TO postgres;

--
-- TOC entry 5464 (class 0 OID 0)
-- Dependencies: 264
-- Name: TABLE setup_logs; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.setup_logs IS 'Logs for setup operations like company, branch, department, and service type management';


--
-- TOC entry 5465 (class 0 OID 0)
-- Dependencies: 264
-- Name: COLUMN setup_logs.username; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.setup_logs.username IS 'Username of the user performing the action';


--
-- TOC entry 5466 (class 0 OID 0)
-- Dependencies: 264
-- Name: COLUMN setup_logs.action; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.setup_logs.action IS 'Action performed (CREATE, UPDATE, DELETE)';


--
-- TOC entry 5467 (class 0 OID 0)
-- Dependencies: 264
-- Name: COLUMN setup_logs.setup_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.setup_logs.setup_type IS 'Type of setup operation (Company, Branch, Department, ServiceType)';


--
-- TOC entry 5468 (class 0 OID 0)
-- Dependencies: 264
-- Name: COLUMN setup_logs.entity_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.setup_logs.entity_type IS 'Type of entity (company, branch, department, service_type)';


--
-- TOC entry 5469 (class 0 OID 0)
-- Dependencies: 264
-- Name: COLUMN setup_logs.entity_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.setup_logs.entity_code IS 'Code of the entity being managed';


--
-- TOC entry 5470 (class 0 OID 0)
-- Dependencies: 264
-- Name: COLUMN setup_logs.entity_name; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.setup_logs.entity_name IS 'Name of the entity being managed';


--
-- TOC entry 5471 (class 0 OID 0)
-- Dependencies: 264
-- Name: COLUMN setup_logs.details; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.setup_logs.details IS 'Additional details about the action';


--
-- TOC entry 5472 (class 0 OID 0)
-- Dependencies: 264
-- Name: COLUMN setup_logs."timestamp"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.setup_logs."timestamp" IS 'Timestamp when the action was performed';


--
-- TOC entry 263 (class 1259 OID 25369)
-- Name: setup_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.setup_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.setup_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5473 (class 0 OID 0)
-- Dependencies: 263
-- Name: setup_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.setup_logs_id_seq OWNED BY public.setup_logs.id;


--
-- TOC entry 253 (class 1259 OID 24870)
-- Name: tariff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tariff (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    mode character varying(20) NOT NULL,
    shipping_type character varying(50),
    cargo_type character varying(50),
    tariff_type character varying(50),
    basis character varying(50),
    container_type character varying(50),
    item_name character varying(100),
    currency character varying(10),
    from_location character varying(100),
    to_location character varying(100),
    party_type character varying(20),
    party_name character varying(100),
    charges numeric(18,4),
    freight_charge_type character varying(50),
    effective_date date,
    period_start_date date,
    period_end_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company_code character varying(10),
    branch_code text,
    department_code text,
    service_type_code text
);


ALTER TABLE public.tariff OWNER TO postgres;

--
-- TOC entry 5474 (class 0 OID 0)
-- Dependencies: 253
-- Name: COLUMN tariff.company_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tariff.company_code IS 'Company code reference for multi-company support';


--
-- TOC entry 5475 (class 0 OID 0)
-- Dependencies: 253
-- Name: COLUMN tariff.branch_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tariff.branch_code IS 'Branch code reference for multi-branch support';


--
-- TOC entry 5476 (class 0 OID 0)
-- Dependencies: 253
-- Name: COLUMN tariff.department_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.tariff.department_code IS 'Department code reference for multi-department support';


--
-- TOC entry 252 (class 1259 OID 24869)
-- Name: tariff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tariff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tariff_id_seq OWNER TO postgres;

--
-- TOC entry 5477 (class 0 OID 0)
-- Dependencies: 252
-- Name: tariff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tariff_id_seq OWNED BY public.tariff.id;


--
-- TOC entry 218 (class 1259 OID 16388)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(255),
    phone character varying(20),
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    full_name character varying(100),
    employee_id character varying(50),
    gender character varying(50),
    date_of_birth date,
    branch text,
    department text,
    designation character varying(100),
    reporting_manager character varying(100),
    role character varying(50),
    status character varying(20),
    joining_date date,
    employment_type character varying(50),
    vehicle_assigned character varying(100),
    shift_timing character varying(50),
    bio text,
    avatar_url text,
    permission character varying(100),
    company_code character varying(10),
    branch_code text,
    department_code text,
    service_type_code text,
    CONSTRAINT at_least_one_contact CHECK (((email IS NOT NULL) OR (phone IS NOT NULL)))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 5478 (class 0 OID 0)
-- Dependencies: 218
-- Name: COLUMN users.company_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.company_code IS 'Company code reference for multi-company support';


--
-- TOC entry 5479 (class 0 OID 0)
-- Dependencies: 218
-- Name: COLUMN users.branch_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.branch_code IS 'Branch code reference for multi-branch support';


--
-- TOC entry 5480 (class 0 OID 0)
-- Dependencies: 218
-- Name: COLUMN users.department_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.department_code IS 'Department code reference for multi-department support';


--
-- TOC entry 217 (class 1259 OID 16387)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5481 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 245 (class 1259 OID 24827)
-- Name: vendor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendor (
    id integer NOT NULL,
    vendor_no character varying(50) NOT NULL,
    type character varying(50),
    name character varying(255),
    name2 character varying(255),
    address character varying(255),
    address1 character varying(255),
    country character varying(100),
    state character varying(100),
    city character varying(100),
    postal_code character varying(20),
    website character varying(255),
    bill_to_vendor_name character varying(255),
    vat_gst_no character varying(50),
    place_of_supply character varying(100),
    pan_no character varying(20),
    tan_no character varying(20),
    contacts jsonb DEFAULT '[]'::jsonb,
    company_code character varying(10),
    branch_code text,
    department_code text,
    service_type_code text,
    blocked character varying(50)
);


ALTER TABLE public.vendor OWNER TO postgres;

--
-- TOC entry 5482 (class 0 OID 0)
-- Dependencies: 245
-- Name: COLUMN vendor.company_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vendor.company_code IS 'Company code reference for multi-company support';


--
-- TOC entry 5483 (class 0 OID 0)
-- Dependencies: 245
-- Name: COLUMN vendor.branch_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vendor.branch_code IS 'Branch code reference for multi-branch support';


--
-- TOC entry 5484 (class 0 OID 0)
-- Dependencies: 245
-- Name: COLUMN vendor.department_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.vendor.department_code IS 'Department code reference for multi-department support';


--
-- TOC entry 244 (class 1259 OID 24826)
-- Name: vendor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vendor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vendor_id_seq OWNER TO postgres;

--
-- TOC entry 5485 (class 0 OID 0)
-- Dependencies: 244
-- Name: vendor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendor_id_seq OWNED BY public.vendor.id;


--
-- TOC entry 4964 (class 2604 OID 33121)
-- Name: account_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_details ALTER COLUMN id SET DEFAULT nextval('public.account_details_id_seq'::regclass);


--
-- TOC entry 4898 (class 2604 OID 16417)
-- Name: auth_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_logs ALTER COLUMN id SET DEFAULT nextval('public.auth_logs_id_seq'::regclass);


--
-- TOC entry 4936 (class 2604 OID 24853)
-- Name: container_code id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.container_code ALTER COLUMN id SET DEFAULT nextval('public.container_code_id_seq'::regclass);


--
-- TOC entry 4934 (class 2604 OID 24843)
-- Name: currency_code id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currency_code ALTER COLUMN id SET DEFAULT nextval('public.currency_code_id_seq'::regclass);


--
-- TOC entry 4929 (class 2604 OID 24816)
-- Name: customer id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer ALTER COLUMN id SET DEFAULT nextval('public.customer_id_seq'::regclass);


--
-- TOC entry 4945 (class 2604 OID 24900)
-- Name: entity_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entity_documents ALTER COLUMN id SET DEFAULT nextval('public.entity_documents_id_seq'::regclass);


--
-- TOC entry 4938 (class 2604 OID 24863)
-- Name: gst_setup id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_setup ALTER COLUMN id SET DEFAULT nextval('public.gst_setup_id_seq'::regclass);


--
-- TOC entry 4968 (class 2604 OID 33140)
-- Name: incharge id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incharge ALTER COLUMN id SET DEFAULT nextval('public.incharge_id_seq'::regclass);


--
-- TOC entry 4961 (class 2604 OID 25425)
-- Name: mapping_relations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mapping_relations ALTER COLUMN id SET DEFAULT nextval('public.mapping_relations_id_seq'::regclass);


--
-- TOC entry 4911 (class 2604 OID 24647)
-- Name: master_code id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_code ALTER COLUMN id SET DEFAULT nextval('public.master_code_id_seq'::regclass);


--
-- TOC entry 4923 (class 2604 OID 24749)
-- Name: master_item id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_item ALTER COLUMN id SET DEFAULT nextval('public.master_item_id_seq'::regclass);


--
-- TOC entry 4919 (class 2604 OID 24688)
-- Name: master_location id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_location ALTER COLUMN id SET DEFAULT nextval('public.master_location_id_seq'::regclass);


--
-- TOC entry 4959 (class 2604 OID 25394)
-- Name: master_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_logs ALTER COLUMN id SET DEFAULT nextval('public.master_logs_id_seq'::regclass);


--
-- TOC entry 4915 (class 2604 OID 24662)
-- Name: master_type id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_type ALTER COLUMN id SET DEFAULT nextval('public.master_type_id_seq'::regclass);


--
-- TOC entry 4925 (class 2604 OID 24761)
-- Name: master_uom id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_uom ALTER COLUMN id SET DEFAULT nextval('public.master_uom_id_seq'::regclass);


--
-- TOC entry 4927 (class 2604 OID 24788)
-- Name: master_vessel id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_vessel ALTER COLUMN id SET DEFAULT nextval('public.master_vessel_id_seq'::regclass);


--
-- TOC entry 4910 (class 2604 OID 16508)
-- Name: number_relation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.number_relation ALTER COLUMN id SET DEFAULT nextval('public.number_relation_id_seq'::regclass);


--
-- TOC entry 4905 (class 2604 OID 16497)
-- Name: number_series id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.number_series ALTER COLUMN id SET DEFAULT nextval('public.number_series_id_seq'::regclass);


--
-- TOC entry 4948 (class 2604 OID 24937)
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- TOC entry 4951 (class 2604 OID 25305)
-- Name: settings_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings_logs ALTER COLUMN id SET DEFAULT nextval('public.settings_logs_id_seq'::regclass);


--
-- TOC entry 4957 (class 2604 OID 25373)
-- Name: setup_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.setup_logs ALTER COLUMN id SET DEFAULT nextval('public.setup_logs_id_seq'::regclass);


--
-- TOC entry 4942 (class 2604 OID 24873)
-- Name: tariff id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tariff ALTER COLUMN id SET DEFAULT nextval('public.tariff_id_seq'::regclass);


--
-- TOC entry 4896 (class 2604 OID 16391)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4932 (class 2604 OID 24830)
-- Name: vendor id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor ALTER COLUMN id SET DEFAULT nextval('public.vendor_id_seq'::regclass);


--
-- TOC entry 5141 (class 2606 OID 33127)
-- Name: account_details account_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_details
    ADD CONSTRAINT account_details_pkey PRIMARY KEY (id);


--
-- TOC entry 4989 (class 2606 OID 16422)
-- Name: auth_logs auth_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_logs
    ADD CONSTRAINT auth_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5002 (class 2606 OID 16531)
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (code);


--
-- TOC entry 5000 (class 2606 OID 24699)
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (code);


--
-- TOC entry 5067 (class 2606 OID 24858)
-- Name: container_code container_code_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.container_code
    ADD CONSTRAINT container_code_code_key UNIQUE (code);


--
-- TOC entry 5069 (class 2606 OID 24856)
-- Name: container_code container_code_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.container_code
    ADD CONSTRAINT container_code_pkey PRIMARY KEY (id);


--
-- TOC entry 5060 (class 2606 OID 24848)
-- Name: currency_code currency_code_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currency_code
    ADD CONSTRAINT currency_code_code_key UNIQUE (code);


--
-- TOC entry 5062 (class 2606 OID 24846)
-- Name: currency_code currency_code_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currency_code
    ADD CONSTRAINT currency_code_pkey PRIMARY KEY (id);


--
-- TOC entry 5046 (class 2606 OID 24825)
-- Name: customer customer_customer_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_customer_no_key UNIQUE (customer_no);


--
-- TOC entry 5048 (class 2606 OID 24823)
-- Name: customer customer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (id);


--
-- TOC entry 5004 (class 2606 OID 16543)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (code);


--
-- TOC entry 5084 (class 2606 OID 24906)
-- Name: entity_documents entity_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entity_documents
    ADD CONSTRAINT entity_documents_pkey PRIMARY KEY (id);


--
-- TOC entry 5074 (class 2606 OID 24868)
-- Name: gst_setup gst_setup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_setup
    ADD CONSTRAINT gst_setup_pkey PRIMARY KEY (id);


--
-- TOC entry 5148 (class 2606 OID 33150)
-- Name: incharge incharge_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.incharge
    ADD CONSTRAINT incharge_pkey PRIMARY KEY (id);


--
-- TOC entry 5139 (class 2606 OID 25431)
-- Name: mapping_relations mapping_relations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mapping_relations
    ADD CONSTRAINT mapping_relations_pkey PRIMARY KEY (id);


--
-- TOC entry 5009 (class 2606 OID 24657)
-- Name: master_code master_code_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_code
    ADD CONSTRAINT master_code_code_key UNIQUE (code);


--
-- TOC entry 5011 (class 2606 OID 24655)
-- Name: master_code master_code_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_code
    ADD CONSTRAINT master_code_pkey PRIMARY KEY (id);


--
-- TOC entry 5028 (class 2606 OID 24754)
-- Name: master_item master_item_item_type_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_item
    ADD CONSTRAINT master_item_item_type_code_key UNIQUE (item_type, code);


--
-- TOC entry 5030 (class 2606 OID 24752)
-- Name: master_item master_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_item
    ADD CONSTRAINT master_item_pkey PRIMARY KEY (id);


--
-- TOC entry 5021 (class 2606 OID 24697)
-- Name: master_location master_location_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_location
    ADD CONSTRAINT master_location_code_key UNIQUE (code);


--
-- TOC entry 5023 (class 2606 OID 24695)
-- Name: master_location master_location_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_location
    ADD CONSTRAINT master_location_pkey PRIMARY KEY (id);


--
-- TOC entry 5132 (class 2606 OID 25399)
-- Name: master_logs master_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_logs
    ADD CONSTRAINT master_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5016 (class 2606 OID 24669)
-- Name: master_type master_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_type
    ADD CONSTRAINT master_type_pkey PRIMARY KEY (id);


--
-- TOC entry 5035 (class 2606 OID 24778)
-- Name: master_uom master_uom_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_uom
    ADD CONSTRAINT master_uom_code_key UNIQUE (code);


--
-- TOC entry 5037 (class 2606 OID 24766)
-- Name: master_uom master_uom_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_uom
    ADD CONSTRAINT master_uom_pkey PRIMARY KEY (id);


--
-- TOC entry 5042 (class 2606 OID 24793)
-- Name: master_vessel master_vessel_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_vessel
    ADD CONSTRAINT master_vessel_code_key UNIQUE (code);


--
-- TOC entry 5044 (class 2606 OID 24791)
-- Name: master_vessel master_vessel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_vessel
    ADD CONSTRAINT master_vessel_pkey PRIMARY KEY (id);


--
-- TOC entry 4998 (class 2606 OID 16510)
-- Name: number_relation number_relation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.number_relation
    ADD CONSTRAINT number_relation_pkey PRIMARY KEY (id);


--
-- TOC entry 4994 (class 2606 OID 16499)
-- Name: number_series number_series_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.number_series
    ADD CONSTRAINT number_series_pkey PRIMARY KEY (id);


--
-- TOC entry 5117 (class 2606 OID 25344)
-- Name: service_types service_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_pkey PRIMARY KEY (code);


--
-- TOC entry 5096 (class 2606 OID 24945)
-- Name: settings settings_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_key UNIQUE (key);


--
-- TOC entry 5111 (class 2606 OID 25312)
-- Name: settings_logs settings_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings_logs
    ADD CONSTRAINT settings_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5098 (class 2606 OID 24943)
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5125 (class 2606 OID 25378)
-- Name: setup_logs setup_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.setup_logs
    ADD CONSTRAINT setup_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5082 (class 2606 OID 24879)
-- Name: tariff tariff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tariff
    ADD CONSTRAINT tariff_pkey PRIMARY KEY (id);


--
-- TOC entry 4996 (class 2606 OID 16461)
-- Name: number_series unique_code; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.number_series
    ADD CONSTRAINT unique_code UNIQUE (code);


--
-- TOC entry 4981 (class 2606 OID 16400)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4983 (class 2606 OID 16402)
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- TOC entry 4985 (class 2606 OID 16396)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4987 (class 2606 OID 16398)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5056 (class 2606 OID 24836)
-- Name: vendor vendor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_pkey PRIMARY KEY (id);


--
-- TOC entry 5058 (class 2606 OID 24838)
-- Name: vendor vendor_vendor_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_vendor_no_key UNIQUE (vendor_no);


--
-- TOC entry 5142 (class 1259 OID 33128)
-- Name: idx_account_details_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_account_details_entity ON public.account_details USING btree (entity_type, entity_code);


--
-- TOC entry 5143 (class 1259 OID 33133)
-- Name: idx_account_details_primary; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_account_details_primary ON public.account_details USING btree (entity_type, entity_code) WHERE (is_primary = true);


--
-- TOC entry 4990 (class 1259 OID 25231)
-- Name: idx_auth_logs_branch_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_logs_branch_code ON public.auth_logs USING btree (branch_code);


--
-- TOC entry 4991 (class 1259 OID 25230)
-- Name: idx_auth_logs_company_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_logs_company_code ON public.auth_logs USING btree (company_code);


--
-- TOC entry 4992 (class 1259 OID 25232)
-- Name: idx_auth_logs_department_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_auth_logs_department_code ON public.auth_logs USING btree (department_code);


--
-- TOC entry 5070 (class 1259 OID 25234)
-- Name: idx_container_code_branch_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_container_code_branch_code ON public.container_code USING btree (branch_code);


--
-- TOC entry 5071 (class 1259 OID 25233)
-- Name: idx_container_code_company_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_container_code_company_code ON public.container_code USING btree (company_code);


--
-- TOC entry 5072 (class 1259 OID 25235)
-- Name: idx_container_code_department_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_container_code_department_code ON public.container_code USING btree (department_code);


--
-- TOC entry 5063 (class 1259 OID 25237)
-- Name: idx_currency_code_branch_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_currency_code_branch_code ON public.currency_code USING btree (branch_code);


--
-- TOC entry 5064 (class 1259 OID 25236)
-- Name: idx_currency_code_company_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_currency_code_company_code ON public.currency_code USING btree (company_code);


--
-- TOC entry 5065 (class 1259 OID 25238)
-- Name: idx_currency_code_department_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_currency_code_department_code ON public.currency_code USING btree (department_code);


--
-- TOC entry 5049 (class 1259 OID 25240)
-- Name: idx_customer_branch_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_branch_code ON public.customer USING btree (branch_code);


--
-- TOC entry 5050 (class 1259 OID 25239)
-- Name: idx_customer_company_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_company_code ON public.customer USING btree (company_code);


--
-- TOC entry 5051 (class 1259 OID 25241)
-- Name: idx_customer_department_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_customer_department_code ON public.customer USING btree (department_code);


--
-- TOC entry 5085 (class 1259 OID 25243)
-- Name: idx_entity_documents_branch_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_entity_documents_branch_code ON public.entity_documents USING btree (branch_code);


--
-- TOC entry 5086 (class 1259 OID 25242)
-- Name: idx_entity_documents_company_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_entity_documents_company_code ON public.entity_documents USING btree (company_code);


--
-- TOC entry 5087 (class 1259 OID 25244)
-- Name: idx_entity_documents_department_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_entity_documents_department_code ON public.entity_documents USING btree (department_code);


--
-- TOC entry 5088 (class 1259 OID 24912)
-- Name: idx_entity_documents_entity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_entity_documents_entity_id ON public.entity_documents USING btree (entity_code);


--
-- TOC entry 5089 (class 1259 OID 24907)
-- Name: idx_entity_documents_entity_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_entity_documents_entity_type ON public.entity_documents USING btree (entity_type);


--
-- TOC entry 5090 (class 1259 OID 24913)
-- Name: idx_entity_documents_entity_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_entity_documents_entity_type_id ON public.entity_documents USING btree (entity_type, entity_code);


--
-- TOC entry 5075 (class 1259 OID 25246)
-- Name: idx_gst_setup_branch_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gst_setup_branch_code ON public.gst_setup USING btree (branch_code);


--
-- TOC entry 5076 (class 1259 OID 25245)
-- Name: idx_gst_setup_company_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gst_setup_company_code ON public.gst_setup USING btree (company_code);


--
-- TOC entry 5077 (class 1259 OID 25247)
-- Name: idx_gst_setup_department_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_gst_setup_department_code ON public.gst_setup USING btree (department_code);


--
-- TOC entry 5144 (class 1259 OID 33153)
-- Name: idx_incharge_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_incharge_active ON public.incharge USING btree (entity_type, entity_code, status) WHERE (status = 'active'::text);


--
-- TOC entry 5145 (class 1259 OID 33151)
-- Name: idx_incharge_entity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_incharge_entity ON public.incharge USING btree (entity_type, entity_code);


--
-- TOC entry 5146 (class 1259 OID 33152)
-- Name: idx_incharge_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_incharge_status ON public.incharge USING btree (status);


--
-- TOC entry 5099 (class 1259 OID 25315)
-- Name: idx_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_action ON public.settings_logs USING btree (action);


--
-- TOC entry 5100 (class 1259 OID 25320)
-- Name: idx_logs_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_created_at ON public.settings_logs USING btree (created_at);


--
-- TOC entry 5101 (class 1259 OID 25319)
-- Name: idx_logs_entity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_entity_id ON public.settings_logs USING btree (entity_id);


--
-- TOC entry 5102 (class 1259 OID 25318)
-- Name: idx_logs_entity_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_entity_type ON public.settings_logs USING btree (entity_type);


--
-- TOC entry 5103 (class 1259 OID 25314)
-- Name: idx_logs_module; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_module ON public.settings_logs USING btree (module);


--
-- TOC entry 5104 (class 1259 OID 25321)
-- Name: idx_logs_module_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_module_action ON public.settings_logs USING btree (module, action);


--
-- TOC entry 5105 (class 1259 OID 25322)
-- Name: idx_logs_module_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_module_status ON public.settings_logs USING btree (module, status);


--
-- TOC entry 5106 (class 1259 OID 25316)
-- Name: idx_logs_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_status ON public.settings_logs USING btree (status);


--
-- TOC entry 5107 (class 1259 OID 25313)
-- Name: idx_logs_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_timestamp ON public.settings_logs USING btree ("timestamp");


--
-- TOC entry 5108 (class 1259 OID 25323)
-- Name: idx_logs_timestamp_module; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_timestamp_module ON public.settings_logs USING btree ("timestamp", module);


--
-- TOC entry 5109 (class 1259 OID 25317)
-- Name: idx_logs_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_logs_user_id ON public.settings_logs USING btree (user_id);


--
-- TOC entry 5133 (class 1259 OID 25454)
-- Name: idx_mapping_relations_branch; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mapping_relations_branch ON public.mapping_relations USING btree (branch_code);


--
-- TOC entry 5134 (class 1259 OID 25452)
-- Name: idx_mapping_relations_code_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mapping_relations_code_type ON public.mapping_relations USING btree (code_type);


--
-- TOC entry 5135 (class 1259 OID 25453)
-- Name: idx_mapping_relations_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mapping_relations_company ON public.mapping_relations USING btree (company_code);


--
-- TOC entry 5136 (class 1259 OID 25455)
-- Name: idx_mapping_relations_department; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mapping_relations_department ON public.mapping_relations USING btree (department_code);


--
-- TOC entry 5137 (class 1259 OID 25456)
-- Name: idx_mapping_relations_service_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mapping_relations_service_type ON public.mapping_relations USING btree (service_type_code);


--
-- TOC entry 5005 (class 1259 OID 25252)
-- Name: idx_master_code_branch_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_code_branch_code ON public.master_code USING btree (branch_code);


--
-- TOC entry 5006 (class 1259 OID 25251)
-- Name: idx_master_code_company_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_code_company_code ON public.master_code USING btree (company_code);


--
-- TOC entry 5007 (class 1259 OID 25253)
-- Name: idx_master_code_department_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_code_department_code ON public.master_code USING btree (department_code);


--
-- TOC entry 5024 (class 1259 OID 25255)
-- Name: idx_master_item_branch_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_item_branch_code ON public.master_item USING btree (branch_code);


--
-- TOC entry 5025 (class 1259 OID 25254)
-- Name: idx_master_item_company_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_item_company_code ON public.master_item USING btree (company_code);


--
-- TOC entry 5026 (class 1259 OID 25256)
-- Name: idx_master_item_department_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_item_department_code ON public.master_item USING btree (department_code);


--
-- TOC entry 5017 (class 1259 OID 25258)
-- Name: idx_master_location_branch_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_location_branch_code ON public.master_location USING btree (branch_code);


--
-- TOC entry 5018 (class 1259 OID 25257)
-- Name: idx_master_location_company_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_location_company_code ON public.master_location USING btree (company_code);


--
-- TOC entry 5019 (class 1259 OID 25259)
-- Name: idx_master_location_department_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_location_department_code ON public.master_location USING btree (department_code);


--
-- TOC entry 5126 (class 1259 OID 25401)
-- Name: idx_master_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_logs_action ON public.master_logs USING btree (action);


--
-- TOC entry 5127 (class 1259 OID 25402)
-- Name: idx_master_logs_master_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_logs_master_type ON public.master_logs USING btree (master_type);


--
-- TOC entry 5128 (class 1259 OID 25403)
-- Name: idx_master_logs_record_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_logs_record_id ON public.master_logs USING btree (record_id);


--
-- TOC entry 5129 (class 1259 OID 25404)
-- Name: idx_master_logs_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_logs_timestamp ON public.master_logs USING btree ("timestamp");


--
-- TOC entry 5130 (class 1259 OID 25400)
-- Name: idx_master_logs_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_logs_username ON public.master_logs USING btree (username);


--
-- TOC entry 5012 (class 1259 OID 25264)
-- Name: idx_master_type_branch_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_type_branch_code ON public.master_type USING btree (branch_code);


--
-- TOC entry 5013 (class 1259 OID 25263)
-- Name: idx_master_type_company_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_type_company_code ON public.master_type USING btree (company_code);


--
-- TOC entry 5014 (class 1259 OID 25265)
-- Name: idx_master_type_department_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_type_department_code ON public.master_type USING btree (department_code);


--
-- TOC entry 5031 (class 1259 OID 25267)
-- Name: idx_master_uom_branch_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_uom_branch_code ON public.master_uom USING btree (branch_code);


--
-- TOC entry 5032 (class 1259 OID 25266)
-- Name: idx_master_uom_company_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_uom_company_code ON public.master_uom USING btree (company_code);


--
-- TOC entry 5033 (class 1259 OID 25268)
-- Name: idx_master_uom_department_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_uom_department_code ON public.master_uom USING btree (department_code);


--
-- TOC entry 5038 (class 1259 OID 25270)
-- Name: idx_master_vessel_branch_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_vessel_branch_code ON public.master_vessel USING btree (branch_code);


--
-- TOC entry 5039 (class 1259 OID 25473)
-- Name: idx_master_vessel_company_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_vessel_company_code ON public.master_vessel USING btree (company_code);


--
-- TOC entry 5040 (class 1259 OID 25271)
-- Name: idx_master_vessel_department_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_master_vessel_department_code ON public.master_vessel USING btree (department_code);


--
-- TOC entry 5112 (class 1259 OID 25361)
-- Name: idx_service_types_branch_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_service_types_branch_code ON public.service_types USING btree (branch_code);


--
-- TOC entry 5113 (class 1259 OID 25363)
-- Name: idx_service_types_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_service_types_code ON public.service_types USING btree (code);


--
-- TOC entry 5114 (class 1259 OID 25360)
-- Name: idx_service_types_company_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_service_types_company_code ON public.service_types USING btree (company_code);


--
-- TOC entry 5115 (class 1259 OID 25362)
-- Name: idx_service_types_department_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_service_types_department_code ON public.service_types USING btree (department_code);


--
-- TOC entry 5091 (class 1259 OID 25273)
-- Name: idx_settings_branch_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settings_branch_code ON public.settings USING btree (branch_code);


--
-- TOC entry 5092 (class 1259 OID 25272)
-- Name: idx_settings_company_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settings_company_code ON public.settings USING btree (company_code);


--
-- TOC entry 5093 (class 1259 OID 25274)
-- Name: idx_settings_department_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settings_department_code ON public.settings USING btree (department_code);


--
-- TOC entry 5094 (class 1259 OID 24946)
-- Name: idx_settings_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settings_key ON public.settings USING btree (key);


--
-- TOC entry 5118 (class 1259 OID 25380)
-- Name: idx_setup_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_setup_logs_action ON public.setup_logs USING btree (action);


--
-- TOC entry 5119 (class 1259 OID 25383)
-- Name: idx_setup_logs_entity_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_setup_logs_entity_code ON public.setup_logs USING btree (entity_code);


--
-- TOC entry 5120 (class 1259 OID 25382)
-- Name: idx_setup_logs_entity_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_setup_logs_entity_type ON public.setup_logs USING btree (entity_type);


--
-- TOC entry 5121 (class 1259 OID 25381)
-- Name: idx_setup_logs_setup_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_setup_logs_setup_type ON public.setup_logs USING btree (setup_type);


--
-- TOC entry 5122 (class 1259 OID 25384)
-- Name: idx_setup_logs_timestamp; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_setup_logs_timestamp ON public.setup_logs USING btree ("timestamp");


--
-- TOC entry 5123 (class 1259 OID 25379)
-- Name: idx_setup_logs_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_setup_logs_username ON public.setup_logs USING btree (username);


--
-- TOC entry 5078 (class 1259 OID 25276)
-- Name: idx_tariff_branch_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tariff_branch_code ON public.tariff USING btree (branch_code);


--
-- TOC entry 5079 (class 1259 OID 25275)
-- Name: idx_tariff_company_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tariff_company_code ON public.tariff USING btree (company_code);


--
-- TOC entry 5080 (class 1259 OID 25277)
-- Name: idx_tariff_department_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tariff_department_code ON public.tariff USING btree (department_code);


--
-- TOC entry 4977 (class 1259 OID 25279)
-- Name: idx_users_branch_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_branch_code ON public.users USING btree (branch_code);


--
-- TOC entry 4978 (class 1259 OID 25278)
-- Name: idx_users_company_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_company_code ON public.users USING btree (company_code);


--
-- TOC entry 4979 (class 1259 OID 25280)
-- Name: idx_users_department_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_department_code ON public.users USING btree (department_code);


--
-- TOC entry 5052 (class 1259 OID 25282)
-- Name: idx_vendor_branch_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_branch_code ON public.vendor USING btree (branch_code);


--
-- TOC entry 5053 (class 1259 OID 25281)
-- Name: idx_vendor_company_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_company_code ON public.vendor USING btree (company_code);


--
-- TOC entry 5054 (class 1259 OID 25283)
-- Name: idx_vendor_department_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_vendor_department_code ON public.vendor USING btree (department_code);


--
-- TOC entry 5214 (class 2620 OID 33155)
-- Name: incharge trigger_update_incharge_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_incharge_updated_at BEFORE UPDATE ON public.incharge FOR EACH ROW EXECUTE FUNCTION public.update_incharge_updated_at();


--
-- TOC entry 5211 (class 2620 OID 24911)
-- Name: entity_documents update_entity_documents_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_entity_documents_updated_at BEFORE UPDATE ON public.entity_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5213 (class 2620 OID 25368)
-- Name: service_types update_service_types_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_service_types_updated_at BEFORE UPDATE ON public.service_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5212 (class 2620 OID 24947)
-- Name: settings update_settings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5152 (class 2606 OID 24953)
-- Name: auth_logs auth_logs_branch_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_logs
    ADD CONSTRAINT auth_logs_branch_code_fkey FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;


--
-- TOC entry 5153 (class 2606 OID 24948)
-- Name: auth_logs auth_logs_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_logs
    ADD CONSTRAINT auth_logs_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;


--
-- TOC entry 5154 (class 2606 OID 24958)
-- Name: auth_logs auth_logs_department_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_logs
    ADD CONSTRAINT auth_logs_department_code_fkey FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;


--
-- TOC entry 5158 (class 2606 OID 24700)
-- Name: branches branches_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE CASCADE;


--
-- TOC entry 5189 (class 2606 OID 24970)
-- Name: container_code container_code_branch_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.container_code
    ADD CONSTRAINT container_code_branch_code_fkey FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;


--
-- TOC entry 5190 (class 2606 OID 24965)
-- Name: container_code container_code_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.container_code
    ADD CONSTRAINT container_code_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;


--
-- TOC entry 5191 (class 2606 OID 24975)
-- Name: container_code container_code_department_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.container_code
    ADD CONSTRAINT container_code_department_code_fkey FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;


--
-- TOC entry 5186 (class 2606 OID 24987)
-- Name: currency_code currency_code_branch_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currency_code
    ADD CONSTRAINT currency_code_branch_code_fkey FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;


--
-- TOC entry 5187 (class 2606 OID 24982)
-- Name: currency_code currency_code_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currency_code
    ADD CONSTRAINT currency_code_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;


--
-- TOC entry 5188 (class 2606 OID 24992)
-- Name: currency_code currency_code_department_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currency_code
    ADD CONSTRAINT currency_code_department_code_fkey FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;


--
-- TOC entry 5180 (class 2606 OID 25002)
-- Name: customer customer_branch_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_branch_code_fkey FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;


--
-- TOC entry 5181 (class 2606 OID 24997)
-- Name: customer customer_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;


--
-- TOC entry 5182 (class 2606 OID 25007)
-- Name: customer customer_department_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_department_code_fkey FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;


--
-- TOC entry 5159 (class 2606 OID 16549)
-- Name: departments departments_branch_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_branch_code_fkey FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE CASCADE;


--
-- TOC entry 5160 (class 2606 OID 24705)
-- Name: departments departments_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE CASCADE;


--
-- TOC entry 5198 (class 2606 OID 25017)
-- Name: entity_documents entity_documents_branch_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entity_documents
    ADD CONSTRAINT entity_documents_branch_code_fkey FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;


--
-- TOC entry 5199 (class 2606 OID 25012)
-- Name: entity_documents entity_documents_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entity_documents
    ADD CONSTRAINT entity_documents_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;


--
-- TOC entry 5200 (class 2606 OID 25022)
-- Name: entity_documents entity_documents_department_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entity_documents
    ADD CONSTRAINT entity_documents_department_code_fkey FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;


--
-- TOC entry 5207 (class 2606 OID 25437)
-- Name: mapping_relations fk_mapping_relations_branch; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mapping_relations
    ADD CONSTRAINT fk_mapping_relations_branch FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE CASCADE;


--
-- TOC entry 5208 (class 2606 OID 25432)
-- Name: mapping_relations fk_mapping_relations_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mapping_relations
    ADD CONSTRAINT fk_mapping_relations_company FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE CASCADE;


--
-- TOC entry 5209 (class 2606 OID 25442)
-- Name: mapping_relations fk_mapping_relations_department; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mapping_relations
    ADD CONSTRAINT fk_mapping_relations_department FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE CASCADE;


--
-- TOC entry 5210 (class 2606 OID 25447)
-- Name: mapping_relations fk_mapping_relations_service_type; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mapping_relations
    ADD CONSTRAINT fk_mapping_relations_service_type FOREIGN KEY (service_type_code) REFERENCES public.service_types(code) ON DELETE CASCADE;


--
-- TOC entry 5192 (class 2606 OID 25034)
-- Name: gst_setup gst_setup_branch_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_setup
    ADD CONSTRAINT gst_setup_branch_code_fkey FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;


--
-- TOC entry 5193 (class 2606 OID 25029)
-- Name: gst_setup gst_setup_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_setup
    ADD CONSTRAINT gst_setup_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;


--
-- TOC entry 5194 (class 2606 OID 25039)
-- Name: gst_setup gst_setup_department_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_setup
    ADD CONSTRAINT gst_setup_department_code_fkey FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;


--
-- TOC entry 5161 (class 2606 OID 25064)
-- Name: master_code master_code_branch_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_code
    ADD CONSTRAINT master_code_branch_code_fkey FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;


--
-- TOC entry 5162 (class 2606 OID 25059)
-- Name: master_code master_code_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_code
    ADD CONSTRAINT master_code_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;


--
-- TOC entry 5163 (class 2606 OID 25069)
-- Name: master_code master_code_department_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_code
    ADD CONSTRAINT master_code_department_code_fkey FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;


--
-- TOC entry 5171 (class 2606 OID 25081)
-- Name: master_item master_item_branch_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_item
    ADD CONSTRAINT master_item_branch_code_fkey FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;


--
-- TOC entry 5172 (class 2606 OID 25076)
-- Name: master_item master_item_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_item
    ADD CONSTRAINT master_item_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;


--
-- TOC entry 5173 (class 2606 OID 25086)
-- Name: master_item master_item_department_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_item
    ADD CONSTRAINT master_item_department_code_fkey FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;


--
-- TOC entry 5168 (class 2606 OID 25096)
-- Name: master_location master_location_branch_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_location
    ADD CONSTRAINT master_location_branch_code_fkey FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;


--
-- TOC entry 5169 (class 2606 OID 25091)
-- Name: master_location master_location_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_location
    ADD CONSTRAINT master_location_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;


--
-- TOC entry 5170 (class 2606 OID 25101)
-- Name: master_location master_location_department_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_location
    ADD CONSTRAINT master_location_department_code_fkey FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;


--
-- TOC entry 5164 (class 2606 OID 25126)
-- Name: master_type master_type_branch_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_type
    ADD CONSTRAINT master_type_branch_code_fkey FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;


--
-- TOC entry 5165 (class 2606 OID 25121)
-- Name: master_type master_type_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_type
    ADD CONSTRAINT master_type_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;


--
-- TOC entry 5166 (class 2606 OID 25131)
-- Name: master_type master_type_department_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_type
    ADD CONSTRAINT master_type_department_code_fkey FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;


--
-- TOC entry 5167 (class 2606 OID 24670)
-- Name: master_type master_type_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_type
    ADD CONSTRAINT master_type_key_fkey FOREIGN KEY (key) REFERENCES public.master_code(code) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5174 (class 2606 OID 25143)
-- Name: master_uom master_uom_branch_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_uom
    ADD CONSTRAINT master_uom_branch_code_fkey FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;


--
-- TOC entry 5175 (class 2606 OID 25138)
-- Name: master_uom master_uom_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_uom
    ADD CONSTRAINT master_uom_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;


--
-- TOC entry 5176 (class 2606 OID 25148)
-- Name: master_uom master_uom_department_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_uom
    ADD CONSTRAINT master_uom_department_code_fkey FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;


--
-- TOC entry 5177 (class 2606 OID 25160)
-- Name: master_vessel master_vessel_branch_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_vessel
    ADD CONSTRAINT master_vessel_branch_code_fkey FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;


--
-- TOC entry 5178 (class 2606 OID 25474)
-- Name: master_vessel master_vessel_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_vessel
    ADD CONSTRAINT master_vessel_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;


--
-- TOC entry 5179 (class 2606 OID 25165)
-- Name: master_vessel master_vessel_department_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_vessel
    ADD CONSTRAINT master_vessel_department_code_fkey FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;


--
-- TOC entry 5156 (class 2606 OID 24733)
-- Name: number_relation number_relation_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.number_relation
    ADD CONSTRAINT number_relation_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code);


--
-- TOC entry 5155 (class 2606 OID 24728)
-- Name: number_series number_series_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.number_series
    ADD CONSTRAINT number_series_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code);


--
-- TOC entry 5157 (class 2606 OID 16491)
-- Name: number_relation number_series_relation_number_series_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.number_relation
    ADD CONSTRAINT number_series_relation_number_series_fkey FOREIGN KEY (number_series) REFERENCES public.number_series(code) ON DELETE CASCADE;


--
-- TOC entry 5204 (class 2606 OID 25350)
-- Name: service_types service_types_branch_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_branch_code_fkey FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE CASCADE;


--
-- TOC entry 5205 (class 2606 OID 25345)
-- Name: service_types service_types_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE CASCADE;


--
-- TOC entry 5206 (class 2606 OID 25355)
-- Name: service_types service_types_department_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_department_code_fkey FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE CASCADE;


--
-- TOC entry 5201 (class 2606 OID 25175)
-- Name: settings settings_branch_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_branch_code_fkey FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;


--
-- TOC entry 5202 (class 2606 OID 25170)
-- Name: settings settings_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;


--
-- TOC entry 5203 (class 2606 OID 25180)
-- Name: settings settings_department_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_department_code_fkey FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;


--
-- TOC entry 5195 (class 2606 OID 25190)
-- Name: tariff tariff_branch_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tariff
    ADD CONSTRAINT tariff_branch_code_fkey FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;


--
-- TOC entry 5196 (class 2606 OID 25185)
-- Name: tariff tariff_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tariff
    ADD CONSTRAINT tariff_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;


--
-- TOC entry 5197 (class 2606 OID 25195)
-- Name: tariff tariff_department_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tariff
    ADD CONSTRAINT tariff_department_code_fkey FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;


--
-- TOC entry 5149 (class 2606 OID 25205)
-- Name: users users_branch_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_branch_code_fkey FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;


--
-- TOC entry 5150 (class 2606 OID 25200)
-- Name: users users_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;


--
-- TOC entry 5151 (class 2606 OID 25210)
-- Name: users users_department_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_code_fkey FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;


--
-- TOC entry 5183 (class 2606 OID 25220)
-- Name: vendor vendor_branch_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_branch_code_fkey FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;


--
-- TOC entry 5184 (class 2606 OID 25215)
-- Name: vendor vendor_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;


--
-- TOC entry 5185 (class 2606 OID 25225)
-- Name: vendor vendor_department_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_department_code_fkey FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;


-- Completed on 2025-08-19 11:21:18

--
-- PostgreSQL database dump complete
--

