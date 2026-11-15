import { Controle } from "../scherm";

export default async function Pagina({ params }: { params: Promise<{ nummer: string }> }) {
  const { nummer } = await params;
  return <Controle nummer={nummer} />;
}
