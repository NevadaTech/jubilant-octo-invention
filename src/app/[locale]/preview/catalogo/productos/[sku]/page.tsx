import {
  PageHeader,
  PreviewSku,
  getPreviewProduct,
  previewScreens,
} from "@/modules/preview";
import { CatalogTextLink } from "@/modules/preview/presentation/catalogo/catalog-field";
import { ProductDetail } from "@/modules/preview/presentation/catalogo/product-detail";

interface ProductoPreviewPageProps {
  params: Promise<{ sku: string }>;
}

function decodeSku(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function ProductoPreviewPage({
  params,
}: ProductoPreviewPageProps) {
  const { sku } = await params;
  const decoded = decodeSku(sku);
  const product = getPreviewProduct(decoded);

  if (!product) {
    return (
      <div className="space-y-4">
        <PageHeader title="Producto" />
        <p className="text-sm text-foreground">
          No existe un producto con el SKU <PreviewSku>{decoded}</PreviewSku>.
        </p>
        <CatalogTextLink href={previewScreens.productos.href}>
          Volver a productos
        </CatalogTextLink>
      </div>
    );
  }

  return <ProductDetail product={product} />;
}
