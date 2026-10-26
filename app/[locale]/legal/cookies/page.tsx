import { type Metadata } from "next";
import { LegalDocument, legalMetadata } from "../LegalDocument";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(props: Props): Promise<Metadata> {
  return legalMetadata(props.params, "Cookies");
}

export default async function CookiesPage(props: Props) {
  return <LegalDocument params={props.params} documentKey="Cookies" />;
}
