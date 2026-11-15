import { leesZoWerktHet } from "@/lib/lessen";
import { Vandaag } from "./scherm";

export default function Pagina() {
  return <Vandaag zoWerktHet={leesZoWerktHet()} />;
}
