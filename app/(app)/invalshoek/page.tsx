import { leesLes } from "@/lib/lessen";
import { InvalshoekScherm } from "./scherm";

export default function Pagina() {
  return <InvalshoekScherm les={leesLes(2)} />;
}
