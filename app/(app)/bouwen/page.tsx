import { leesLes } from "@/lib/lessen";
import { Bouwen } from "./scherm";

export default function Pagina() {
  return <Bouwen les={leesLes("bouw")} />;
}
