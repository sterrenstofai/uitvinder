import { leesLes, leesZoWerktHet } from "@/lib/lessen";
import { Reis } from "./scherm";

export default function Pagina() {
  return <Reis zoWerktHet={leesZoWerktHet()} lesRolscan={leesLes(1)} />;
}
