import { MetingScherm } from "./scherm";

export default async function Pagina({ params }: { params: Promise<{ week: string }> }) {
  const { week } = await params;
  return <MetingScherm week={[1, 6, 12].includes(Number(week)) ? Number(week) : 1} />;
}
