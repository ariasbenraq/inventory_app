import { ItemType } from './item-type.enum';

export const ITEM_ATTRIBUTE_DICTIONARY: Record<ItemType, readonly string[]> = {
  [ItemType.GENERAL]: ['detalle', 'presentacion', 'referencia'],
  [ItemType.CONSUMABLE]: ['presentacion', 'contenido', 'color', 'material'],
  [ItemType.DURABLE]: ['modelo', 'color', 'material', 'dimensiones'],
  [ItemType.ELECTRICAL]: ['modelo', 'color', 'voltaje', 'potencia_w', 'largo_m'],
  [ItemType.OFFICE_SUPPLY]: ['modelo', 'color', 'punta', 'tamano', 'material'],
};
