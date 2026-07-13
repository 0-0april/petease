-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.ACCOUNT (
  AccID uuid NOT NULL DEFAULT gen_random_uuid(),
  AccUserName character varying NOT NULL UNIQUE,
  AccEmail character varying NOT NULL UNIQUE,
  AccPhoneNum character varying,
  AccPass text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ACCOUNT_pkey PRIMARY KEY (AccID)
);
CREATE TABLE public.ADMIN (
  AdminID uuid NOT NULL DEFAULT gen_random_uuid(),
  AdminName character varying NOT NULL,
  AdminBDay date,
  AdminAddress text,
  AccID uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ADMIN_pkey PRIMARY KEY (AdminID),
  CONSTRAINT ADMIN_AccID_fkey FOREIGN KEY (AccID) REFERENCES public.ACCOUNT(AccID)
);
CREATE TABLE public.VETSTAFF (
  StaffID uuid NOT NULL DEFAULT gen_random_uuid(),
  StaffName character varying NOT NULL,
  StaffBDay date,
  StaffAddress text,
  AccID uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT VETSTAFF_pkey PRIMARY KEY (StaffID),
  CONSTRAINT VETSTAFF_AccID_fkey FOREIGN KEY (AccID) REFERENCES public.ACCOUNT(AccID)
);
CREATE TABLE public.USER (
  UserID uuid NOT NULL DEFAULT gen_random_uuid(),
  UserName character varying NOT NULL,
  AccID uuid NOT NULL,
  UserAddress text,
  created_at timestamp with time zone DEFAULT now(),
  UserLastLogin timestamp without time zone DEFAULT now(),
  CONSTRAINT USER_pkey PRIMARY KEY (UserID),
  CONSTRAINT USER_AccID_fkey FOREIGN KEY (AccID) REFERENCES public.ACCOUNT(AccID)
);
CREATE TABLE public.SERVICES (
  ServID uuid NOT NULL DEFAULT gen_random_uuid(),
  ServType character varying NOT NULL,
  ServDayAvailable ARRAY NOT NULL DEFAULT '{}'::days_of_week[],
  ServSlot integer NOT NULL DEFAULT 1,
  ServStatus USER-DEFINED NOT NULL DEFAULT 'Active'::serv_status,
  ServEndDate date,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT SERVICES_pkey PRIMARY KEY (ServID)
);
CREATE TABLE public.MEDICALHISTORY (
  MedID uuid NOT NULL DEFAULT gen_random_uuid(),
  Medicine character varying NOT NULL,
  Description text,
  ServID uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT MEDICALHISTORY_pkey PRIMARY KEY (MedID),
  CONSTRAINT MEDICALHISTORY_ServID_fkey FOREIGN KEY (ServID) REFERENCES public.SERVICES(ServID)
);
CREATE TABLE public.PET (
  PetID uuid NOT NULL DEFAULT gen_random_uuid(),
  PetName character varying NOT NULL,
  PetBDay date,
  PetSpecie character varying,
  PetBreed character varying,
  PetMarkings text,
  PetGender USER-DEFINED,
  PetDetails text,
  PetImg text,
  PetAvailable boolean NOT NULL DEFAULT true,
  PetRegType text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT PET_pkey PRIMARY KEY (PetID)
);
CREATE TABLE public.USERPETS (
  UserPetID uuid NOT NULL DEFAULT gen_random_uuid(),
  UserID uuid NOT NULL,
  PetID uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT USERPETS_pkey PRIMARY KEY (UserPetID),
  CONSTRAINT USERPETS_PetID_fkey FOREIGN KEY (PetID) REFERENCES public.PET(PetID),
  CONSTRAINT USERPETS_UserID_fkey FOREIGN KEY (UserID) REFERENCES public.USER(UserID)
);
CREATE TABLE public.ADOPTION (
  AdoptID uuid NOT NULL DEFAULT gen_random_uuid(),
  UserID uuid NOT NULL,
  UserPetsID uuid NOT NULL,
  AdoptReqDate timestamp with time zone NOT NULL DEFAULT now(),
  AdoptStatus USER-DEFINED NOT NULL DEFAULT 'Pending'::adopt_status,
  AdoptionWaiver text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ADOPTION_pkey PRIMARY KEY (AdoptID),
  CONSTRAINT ADOPTION_UserID_fkey FOREIGN KEY (UserID) REFERENCES public.USER(UserID),
  CONSTRAINT ADOPTION_UserPetsID_fkey FOREIGN KEY (UserPetsID) REFERENCES public.USERPETS(UserPetID)
);
CREATE TABLE public.APPOINTMENT (
  AppointID uuid NOT NULL DEFAULT gen_random_uuid(),
  UserPetID uuid NOT NULL,
  ServID uuid NOT NULL,
  AppointDateCreated timestamp with time zone NOT NULL DEFAULT now(),
  AppointSchedDate timestamp with time zone NOT NULL,
  AppointStatus USER-DEFINED NOT NULL DEFAULT 'Pending'::appoint_status,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT APPOINTMENT_pkey PRIMARY KEY (AppointID),
  CONSTRAINT APPOINTMENT_ServID_fkey FOREIGN KEY (ServID) REFERENCES public.SERVICES(ServID),
  CONSTRAINT APPOINTMENT_UserPetID_fkey FOREIGN KEY (UserPetID) REFERENCES public.USERPETS(UserPetID)
);
CREATE TABLE public.APPOINTMENTLOGS (
  LogID uuid NOT NULL DEFAULT gen_random_uuid(),
  AppointID uuid NOT NULL,
  LogAttendance boolean NOT NULL DEFAULT false,
  LogStaffAssigned uuid,
  LogNote text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT APPOINTMENTLOGS_pkey PRIMARY KEY (LogID),
  CONSTRAINT APPOINTMENTLOGS_AppointID_fkey FOREIGN KEY (AppointID) REFERENCES public.APPOINTMENT(AppointID),
  CONSTRAINT APPOINTMENTLOGS_LogStaffAssigned_fkey FOREIGN KEY (LogStaffAssigned) REFERENCES public.ACCOUNT(AccID)
);
CREATE TABLE public.MESSAGES (
  MessID uuid NOT NULL DEFAULT gen_random_uuid(),
  MessFrom uuid NOT NULL,
  MessTo uuid NOT NULL,
  MessContent text NOT NULL,
  MessTimeStamp timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT MESSAGES_pkey PRIMARY KEY (MessID),
  CONSTRAINT MESSAGES_MessFrom_fkey FOREIGN KEY (MessFrom) REFERENCES public.USER(UserID),
  CONSTRAINT MESSAGES_MessTo_fkey FOREIGN KEY (MessTo) REFERENCES public.USER(UserID)
);
CREATE TABLE public.ANNOUNCEMENT (
  AnnounceID uuid NOT NULL DEFAULT gen_random_uuid(),
  AnnounceTitle character varying NOT NULL,
  AnnounceContent text NOT NULL,
  AnnounceType USER-DEFINED NOT NULL DEFAULT 'General'::announce_type,
  AnnounceDateUpdated timestamp with time zone NOT NULL DEFAULT now(),
  AnnouncedBy uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ANNOUNCEMENT_pkey PRIMARY KEY (AnnounceID),
  CONSTRAINT ANNOUNCEMENT_AnnouncedBy_fkey FOREIGN KEY (AnnouncedBy) REFERENCES public.ADMIN(AdminID)
);
CREATE TABLE public.REPORTS (
  ReportID uuid NOT NULL DEFAULT gen_random_uuid(),
  ReportedUser uuid NOT NULL,
  ReportedBy uuid NOT NULL,
  ReportReason text NOT NULL,
  ReportDescription text,
  ReportMessageLog text,
  ReportStatus USER-DEFINED NOT NULL DEFAULT 'Open'::report_status,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT REPORTS_pkey PRIMARY KEY (ReportID),
  CONSTRAINT REPORTS_ReportedBy_fkey FOREIGN KEY (ReportedBy) REFERENCES public.USER(UserID),
  CONSTRAINT REPORTS_ReportedUser_fkey FOREIGN KEY (ReportedUser) REFERENCES public.USER(UserID)
);
CREATE TABLE public.NOTIFICATION (
  NotifID uuid NOT NULL DEFAULT gen_random_uuid(),
  AccID uuid NOT NULL,
  NotifTitle character varying NOT NULL,
  NotifMessage text NOT NULL,
  NotifType character varying,
  NotifRead boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT NOTIFICATION_pkey PRIMARY KEY (NotifID),
  CONSTRAINT NOTIFICATION_AccID_fkey FOREIGN KEY (AccID) REFERENCES public.ACCOUNT(AccID)
);