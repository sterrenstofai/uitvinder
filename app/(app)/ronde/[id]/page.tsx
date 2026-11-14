import { leesLes } from "@/lib/lessen";
import { Ronde } from "./scherm";

export default async function Pagina({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Ronde id={id} lessen={{ 3: leesLes(3), 4: leesLes(4), 5: leesLes(5) }} />;
}
