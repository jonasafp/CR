import {
  createContext,
} from "react";

import type {
  CurrentCompanyMembership,
} from "../../services/auth/authService";

export type ActiveCompany = {
  id:
    string;

  legalName:
    string;

  tradeName:
    string;

  document:
    string
    | null;

  email:
    string
    | null;

  phone:
    string
    | null;

  city:
    string
    | null;

  state:
    string
    | null;

  logoUrl:
    string
    | null;

  status:
    "active"
    | "inactive";
};

export type CompanyContextValue = {
  company:
    ActiveCompany
    | null;

  membership:
    CurrentCompanyMembership
    | null;

  companyId:
    string
    | null;

  isLoading:
    boolean;

  error:
    string;

  refreshCompany:
    () =>
      Promise<void>;
};

const CompanyContext =
  createContext<
    CompanyContextValue
    | undefined
  >(undefined);

export default CompanyContext;