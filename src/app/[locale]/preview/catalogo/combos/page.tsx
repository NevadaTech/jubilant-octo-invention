import { previewScreens } from "@/modules/preview";
import { CatalogNameList } from "@/modules/preview/presentation/catalogo/catalog-name-list";

const combos = [{ name: "Combo Escritorio" }] as const;

export default function CombosPreviewPage() {
  return (
    <CatalogNameList
      title={previewScreens.combos.label}
      actionLabel="Nuevo combo"
      items={combos}
    />
  );
}
