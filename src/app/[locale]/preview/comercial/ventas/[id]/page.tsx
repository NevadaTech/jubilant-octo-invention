import { SaleDetail } from "@/modules/preview/presentation/comercial/sale-detail";

interface VentaPreviewPageProps {
  params: Promise<{ id: string }>;
}

function decodeId(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function VentaPreviewPage({
  params,
}: VentaPreviewPageProps) {
  const { id } = await params;
  return <SaleDetail id={decodeId(id)} />;
}
