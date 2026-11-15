import { Klantdossier } from "./scherm";

export default async function Pagina({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Klantdossier id={id} />;
}
