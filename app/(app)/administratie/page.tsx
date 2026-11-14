import { leesAdministratie } from "@/lib/lessen";
import { AdministratieScherm } from "./scherm";

export default function Pagina() {
  return <AdministratieScherm inhoud={leesAdministratie()} />;
}
