import { Publiek } from "./scherm";

export default async function Pagina({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <Publiek slug={slug} />;
}
