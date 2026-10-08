import {
  useContext,
} from "react";

import CompanyContext from "./CompanyContext";

export default function useCompany() {
  const context =
    useContext(
      CompanyContext,
    );

  if (
    !context
  ) {
    throw new Error(
      "useCompany deve ser utilizado dentro de CompanyProvider.",
    );
  }

  return context;
}