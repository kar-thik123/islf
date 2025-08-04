--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-07-31 17:17:20

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
-- TOC entry 262 (class 1255 OID 24910)
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
-- TOC entry 220 (class 1259 OID 16414)
-- Name: auth_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_logs (
    id integer NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now() NOT NULL,
    username character varying(255) NOT NULL,
    action character varying(100) NOT NULL,
    details text
);


ALTER TABLE public.auth_logs OWNER TO postgres;

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
-- TOC entry 5159 (class 0 OID 0)
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
    address1 text,
    address2 text,
    logo text
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 24850)
-- Name: container_code; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.container_code (
    id integer NOT NULL,
    code character varying(10) NOT NULL,
    description character varying(100),
    status character varying(20) DEFAULT 'Active'::character varying
);


ALTER TABLE public.container_code OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 24849)
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
-- TOC entry 5160 (class 0 OID 0)
-- Dependencies: 250
-- Name: container_code_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.container_code_id_seq OWNED BY public.container_code.id;


--
-- TOC entry 249 (class 1259 OID 24840)
-- Name: currency_code; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.currency_code (
    id integer NOT NULL,
    code character varying(10) NOT NULL,
    description character varying(100),
    status character varying(20) DEFAULT 'Active'::character varying
);


ALTER TABLE public.currency_code OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 24839)
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
-- TOC entry 5161 (class 0 OID 0)
-- Dependencies: 248
-- Name: currency_code_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.currency_code_id_seq OWNED BY public.currency_code.id;


--
-- TOC entry 245 (class 1259 OID 24813)
-- Name: customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customer (
    id integer NOT NULL,
    customer_no character varying(50) NOT NULL,
    type character varying(50),
    name character varying(255),
    name2 character varying(255),
    blocked boolean DEFAULT false,
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
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.customer OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 24812)
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
-- TOC entry 5162 (class 0 OID 0)
-- Dependencies: 244
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
-- TOC entry 259 (class 1259 OID 24897)
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
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.entity_documents OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 24896)
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
-- TOC entry 5163 (class 0 OID 0)
-- Dependencies: 258
-- Name: entity_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.entity_documents_id_seq OWNED BY public.entity_documents.id;


--
-- TOC entry 253 (class 1259 OID 24860)
-- Name: gst_setup; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gst_setup (
    id integer NOT NULL,
    "from" character varying(100) NOT NULL,
    "to" character varying(100) NOT NULL,
    sgst boolean DEFAULT false,
    cgst boolean DEFAULT false,
    igst boolean DEFAULT false
);


ALTER TABLE public.gst_setup OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 24859)
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
-- TOC entry 5164 (class 0 OID 0)
-- Dependencies: 252
-- Name: gst_setup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.gst_setup_id_seq OWNED BY public.gst_setup.id;


--
-- TOC entry 243 (class 1259 OID 24804)
-- Name: mapping; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mapping (
    id integer NOT NULL,
    customercode text,
    vendorcode text,
    employeecode text,
    customerquote text,
    invoiceno text,
    taxno text,
    jobcardno text,
    branchno text,
    departmentno text,
    vesselcode text
);


ALTER TABLE public.mapping OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 24803)
-- Name: mapping_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mapping_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mapping_id_seq OWNER TO postgres;

--
-- TOC entry 5165 (class 0 OID 0)
-- Dependencies: 242
-- Name: mapping_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mapping_id_seq OWNED BY public.mapping.id;


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
    CONSTRAINT master_code_status_check CHECK (((status)::text = ANY ((ARRAY['Active'::character varying, 'Inactive'::character varying])::text[])))
);


ALTER TABLE public.master_code OWNER TO postgres;

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
-- TOC entry 5166 (class 0 OID 0)
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
    active boolean DEFAULT true
);


ALTER TABLE public.master_item OWNER TO postgres;

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
-- TOC entry 5167 (class 0 OID 0)
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
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.master_location OWNER TO postgres;

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
-- TOC entry 5168 (class 0 OID 0)
-- Dependencies: 234
-- Name: master_location_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.master_location_id_seq OWNED BY public.master_location.id;


--
-- TOC entry 257 (class 1259 OID 24883)
-- Name: master_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.master_logs (
    id integer NOT NULL,
    username text,
    action text,
    entity text,
    entity_id integer,
    details text,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.master_logs OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 24882)
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
-- TOC entry 5169 (class 0 OID 0)
-- Dependencies: 256
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
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.master_type OWNER TO postgres;

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
-- TOC entry 5170 (class 0 OID 0)
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
    active boolean DEFAULT true
);


ALTER TABLE public.master_uom OWNER TO postgres;

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
-- TOC entry 5171 (class 0 OID 0)
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
    year_build character varying(10) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    imo_number character varying(100)
);


ALTER TABLE public.master_vessel OWNER TO postgres;

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
-- TOC entry 5172 (class 0 OID 0)
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
    ending_date timestamp without time zone
);


ALTER TABLE public.number_relation OWNER TO postgres;

--
-- TOC entry 5173 (class 0 OID 0)
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
-- TOC entry 5174 (class 0 OID 0)
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
    company_code text
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
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 223
-- Name: number_series_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.number_series_id_seq OWNED BY public.number_series.id;


--
-- TOC entry 261 (class 1259 OID 24934)
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    id integer NOT NULL,
    key character varying(255) NOT NULL,
    value text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 24933)
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
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 260
-- Name: settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.settings_id_seq OWNED BY public.settings.id;


--
-- TOC entry 255 (class 1259 OID 24870)
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
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tariff OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 24869)
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
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 254
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
    CONSTRAINT at_least_one_contact CHECK (((email IS NOT NULL) OR (phone IS NOT NULL)))
);


ALTER TABLE public.users OWNER TO postgres;

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
-- TOC entry 5178 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 247 (class 1259 OID 24827)
-- Name: vendor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vendor (
    id integer NOT NULL,
    vendor_no character varying(50) NOT NULL,
    type character varying(50),
    name character varying(255),
    name2 character varying(255),
    blocked boolean DEFAULT false,
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
    contacts jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.vendor OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 24826)
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
-- TOC entry 5179 (class 0 OID 0)
-- Dependencies: 246
-- Name: vendor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vendor_id_seq OWNED BY public.vendor.id;


--
-- TOC entry 4860 (class 2604 OID 16417)
-- Name: auth_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_logs ALTER COLUMN id SET DEFAULT nextval('public.auth_logs_id_seq'::regclass);


--
-- TOC entry 4901 (class 2604 OID 24853)
-- Name: container_code id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.container_code ALTER COLUMN id SET DEFAULT nextval('public.container_code_id_seq'::regclass);


--
-- TOC entry 4899 (class 2604 OID 24843)
-- Name: currency_code id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currency_code ALTER COLUMN id SET DEFAULT nextval('public.currency_code_id_seq'::regclass);


--
-- TOC entry 4892 (class 2604 OID 24816)
-- Name: customer id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer ALTER COLUMN id SET DEFAULT nextval('public.customer_id_seq'::regclass);


--
-- TOC entry 4912 (class 2604 OID 24900)
-- Name: entity_documents id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entity_documents ALTER COLUMN id SET DEFAULT nextval('public.entity_documents_id_seq'::regclass);


--
-- TOC entry 4903 (class 2604 OID 24863)
-- Name: gst_setup id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_setup ALTER COLUMN id SET DEFAULT nextval('public.gst_setup_id_seq'::regclass);


--
-- TOC entry 4891 (class 2604 OID 24807)
-- Name: mapping id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mapping ALTER COLUMN id SET DEFAULT nextval('public.mapping_id_seq'::regclass);


--
-- TOC entry 4873 (class 2604 OID 24647)
-- Name: master_code id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_code ALTER COLUMN id SET DEFAULT nextval('public.master_code_id_seq'::regclass);


--
-- TOC entry 4885 (class 2604 OID 24749)
-- Name: master_item id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_item ALTER COLUMN id SET DEFAULT nextval('public.master_item_id_seq'::regclass);


--
-- TOC entry 4881 (class 2604 OID 24688)
-- Name: master_location id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_location ALTER COLUMN id SET DEFAULT nextval('public.master_location_id_seq'::regclass);


--
-- TOC entry 4910 (class 2604 OID 24886)
-- Name: master_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_logs ALTER COLUMN id SET DEFAULT nextval('public.master_logs_id_seq'::regclass);


--
-- TOC entry 4877 (class 2604 OID 24662)
-- Name: master_type id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_type ALTER COLUMN id SET DEFAULT nextval('public.master_type_id_seq'::regclass);


--
-- TOC entry 4887 (class 2604 OID 24761)
-- Name: master_uom id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_uom ALTER COLUMN id SET DEFAULT nextval('public.master_uom_id_seq'::regclass);


--
-- TOC entry 4889 (class 2604 OID 24788)
-- Name: master_vessel id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_vessel ALTER COLUMN id SET DEFAULT nextval('public.master_vessel_id_seq'::regclass);


--
-- TOC entry 4872 (class 2604 OID 16508)
-- Name: number_relation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.number_relation ALTER COLUMN id SET DEFAULT nextval('public.number_relation_id_seq'::regclass);


--
-- TOC entry 4867 (class 2604 OID 16497)
-- Name: number_series id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.number_series ALTER COLUMN id SET DEFAULT nextval('public.number_series_id_seq'::regclass);


--
-- TOC entry 4915 (class 2604 OID 24937)
-- Name: settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings ALTER COLUMN id SET DEFAULT nextval('public.settings_id_seq'::regclass);


--
-- TOC entry 4907 (class 2604 OID 24873)
-- Name: tariff id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tariff ALTER COLUMN id SET DEFAULT nextval('public.tariff_id_seq'::regclass);


--
-- TOC entry 4858 (class 2604 OID 16391)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4896 (class 2604 OID 24830)
-- Name: vendor id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor ALTER COLUMN id SET DEFAULT nextval('public.vendor_id_seq'::regclass);


--
-- TOC entry 4929 (class 2606 OID 16422)
-- Name: auth_logs auth_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_logs
    ADD CONSTRAINT auth_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4939 (class 2606 OID 16531)
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (code);


--
-- TOC entry 4937 (class 2606 OID 24699)
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (code);


--
-- TOC entry 4979 (class 2606 OID 24858)
-- Name: container_code container_code_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.container_code
    ADD CONSTRAINT container_code_code_key UNIQUE (code);


--
-- TOC entry 4981 (class 2606 OID 24856)
-- Name: container_code container_code_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.container_code
    ADD CONSTRAINT container_code_pkey PRIMARY KEY (id);


--
-- TOC entry 4975 (class 2606 OID 24848)
-- Name: currency_code currency_code_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currency_code
    ADD CONSTRAINT currency_code_code_key UNIQUE (code);


--
-- TOC entry 4977 (class 2606 OID 24846)
-- Name: currency_code currency_code_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.currency_code
    ADD CONSTRAINT currency_code_pkey PRIMARY KEY (id);


--
-- TOC entry 4967 (class 2606 OID 24825)
-- Name: customer customer_customer_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_customer_no_key UNIQUE (customer_no);


--
-- TOC entry 4969 (class 2606 OID 24823)
-- Name: customer customer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY (id);


--
-- TOC entry 4941 (class 2606 OID 16543)
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (code);


--
-- TOC entry 4989 (class 2606 OID 24906)
-- Name: entity_documents entity_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entity_documents
    ADD CONSTRAINT entity_documents_pkey PRIMARY KEY (id);


--
-- TOC entry 4983 (class 2606 OID 24868)
-- Name: gst_setup gst_setup_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gst_setup
    ADD CONSTRAINT gst_setup_pkey PRIMARY KEY (id);


--
-- TOC entry 4965 (class 2606 OID 24811)
-- Name: mapping mapping_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mapping
    ADD CONSTRAINT mapping_pkey PRIMARY KEY (id);


--
-- TOC entry 4943 (class 2606 OID 24657)
-- Name: master_code master_code_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_code
    ADD CONSTRAINT master_code_code_key UNIQUE (code);


--
-- TOC entry 4945 (class 2606 OID 24655)
-- Name: master_code master_code_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_code
    ADD CONSTRAINT master_code_pkey PRIMARY KEY (id);


--
-- TOC entry 4953 (class 2606 OID 24754)
-- Name: master_item master_item_item_type_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_item
    ADD CONSTRAINT master_item_item_type_code_key UNIQUE (item_type, code);


--
-- TOC entry 4955 (class 2606 OID 24752)
-- Name: master_item master_item_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_item
    ADD CONSTRAINT master_item_pkey PRIMARY KEY (id);


--
-- TOC entry 4949 (class 2606 OID 24697)
-- Name: master_location master_location_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_location
    ADD CONSTRAINT master_location_code_key UNIQUE (code);


--
-- TOC entry 4951 (class 2606 OID 24695)
-- Name: master_location master_location_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_location
    ADD CONSTRAINT master_location_pkey PRIMARY KEY (id);


--
-- TOC entry 4987 (class 2606 OID 24891)
-- Name: master_logs master_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_logs
    ADD CONSTRAINT master_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4947 (class 2606 OID 24669)
-- Name: master_type master_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_type
    ADD CONSTRAINT master_type_pkey PRIMARY KEY (id);


--
-- TOC entry 4957 (class 2606 OID 24778)
-- Name: master_uom master_uom_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_uom
    ADD CONSTRAINT master_uom_code_key UNIQUE (code);


--
-- TOC entry 4959 (class 2606 OID 24766)
-- Name: master_uom master_uom_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_uom
    ADD CONSTRAINT master_uom_pkey PRIMARY KEY (id);


--
-- TOC entry 4961 (class 2606 OID 24793)
-- Name: master_vessel master_vessel_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_vessel
    ADD CONSTRAINT master_vessel_code_key UNIQUE (code);


--
-- TOC entry 4963 (class 2606 OID 24791)
-- Name: master_vessel master_vessel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_vessel
    ADD CONSTRAINT master_vessel_pkey PRIMARY KEY (id);


--
-- TOC entry 4935 (class 2606 OID 16510)
-- Name: number_relation number_relation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.number_relation
    ADD CONSTRAINT number_relation_pkey PRIMARY KEY (id);


--
-- TOC entry 4931 (class 2606 OID 16499)
-- Name: number_series number_series_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.number_series
    ADD CONSTRAINT number_series_pkey PRIMARY KEY (id);


--
-- TOC entry 4995 (class 2606 OID 24945)
-- Name: settings settings_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_key_key UNIQUE (key);


--
-- TOC entry 4997 (class 2606 OID 24943)
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4985 (class 2606 OID 24879)
-- Name: tariff tariff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tariff
    ADD CONSTRAINT tariff_pkey PRIMARY KEY (id);


--
-- TOC entry 4933 (class 2606 OID 16461)
-- Name: number_series unique_code; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.number_series
    ADD CONSTRAINT unique_code UNIQUE (code);


--
-- TOC entry 4921 (class 2606 OID 16400)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4923 (class 2606 OID 16402)
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- TOC entry 4925 (class 2606 OID 16396)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4927 (class 2606 OID 16398)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4971 (class 2606 OID 24836)
-- Name: vendor vendor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_pkey PRIMARY KEY (id);


--
-- TOC entry 4973 (class 2606 OID 24838)
-- Name: vendor vendor_vendor_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vendor
    ADD CONSTRAINT vendor_vendor_no_key UNIQUE (vendor_no);


--
-- TOC entry 4990 (class 1259 OID 24912)
-- Name: idx_entity_documents_entity_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_entity_documents_entity_id ON public.entity_documents USING btree (entity_code);


--
-- TOC entry 4991 (class 1259 OID 24907)
-- Name: idx_entity_documents_entity_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_entity_documents_entity_type ON public.entity_documents USING btree (entity_type);


--
-- TOC entry 4992 (class 1259 OID 24913)
-- Name: idx_entity_documents_entity_type_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_entity_documents_entity_type_id ON public.entity_documents USING btree (entity_type, entity_code);


--
-- TOC entry 4993 (class 1259 OID 24946)
-- Name: idx_settings_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settings_key ON public.settings USING btree (key);


--
-- TOC entry 5005 (class 2620 OID 24911)
-- Name: entity_documents update_entity_documents_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_entity_documents_updated_at BEFORE UPDATE ON public.entity_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5006 (class 2620 OID 24947)
-- Name: settings update_settings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5001 (class 2606 OID 24700)
-- Name: branches branches_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE CASCADE;


--
-- TOC entry 5002 (class 2606 OID 16549)
-- Name: departments departments_branch_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_branch_code_fkey FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE CASCADE;


--
-- TOC entry 5003 (class 2606 OID 24705)
-- Name: departments departments_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE CASCADE;


--
-- TOC entry 5004 (class 2606 OID 24670)
-- Name: master_type master_type_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.master_type
    ADD CONSTRAINT master_type_key_fkey FOREIGN KEY (key) REFERENCES public.master_code(code) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 4999 (class 2606 OID 24733)
-- Name: number_relation number_relation_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.number_relation
    ADD CONSTRAINT number_relation_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code);


--
-- TOC entry 4998 (class 2606 OID 24728)
-- Name: number_series number_series_company_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.number_series
    ADD CONSTRAINT number_series_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code);


--
-- TOC entry 5000 (class 2606 OID 16491)
-- Name: number_relation number_series_relation_number_series_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.number_relation
    ADD CONSTRAINT number_series_relation_number_series_fkey FOREIGN KEY (number_series) REFERENCES public.number_series(code) ON DELETE CASCADE;


-- Completed on 2025-07-31 17:17:20

--
-- PostgreSQL database dump complete
--

