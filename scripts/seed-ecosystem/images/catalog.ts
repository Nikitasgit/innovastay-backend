import type { ImageTheme } from "../config";

export const THEME_COLORS: Record<ImageTheme, string> = {
  portrait: "#6B7C5E",
  bakery: "#C4A574",
  bar: "#3D2B1F",
  market: "#E07A3D",
  concert: "#2C1A4D",
  gallery: "#D9D2C5",
  workshop: "#8B6914",
  farm: "#4A7C3F",
  brewery: "#B8860B",
  restaurant: "#8B3A3A",
};

/** Curated Unsplash photo IDs (Unsplash License). Downloaded at seed time, stored on S3. */
export const UNSPLASH_CATALOG: Record<ImageTheme, string[]> = {
  portrait: [
    "photo-1494790108377-be9c29b29330",
    "photo-1507003211169-0a1dd7228f2d",
    "photo-1500648767791-00dcc994a43e",
    "photo-1438761681033-6461ffad8d80",
    "photo-1472099645785-5658abf4ff4e",
    "photo-1534528741775-53994a69daeb",
  ],
  bakery: [
    "photo-1509440159596-0249088772ff",
    "photo-1555507036-ab1f4038808a",
    "photo-1517433670267-08bbd4be890f",
    "photo-1509722747041-616f39b57569",
    "photo-1549931319-a545dcf3d7a6",
    "photo-1586444248902-2f64eddc13df",
  ],
  bar: [
    "photo-1514933651103-005eec06c04b",
    "photo-1572116463160-434c4c8e40d5",
    "photo-1470337458703-46ad1756a187",
    "photo-1543007630-9710e4a00a20",
    "photo-1575444758702-4a6b9222336e",
    "photo-1566417713940-fe7c737a9ef2",
  ],
  market: [
    "photo-1488459716781-31cf13d2d10b",
    "photo-1542838132-92c53300491e",
    "photo-1533900298318-6b8da08a523e",
    "photo-1579113800032-c38bd7635818",
    "photo-1516594798947-e65505dbb29d",
    "photo-1461354464878-ad92f492a5a0",
  ],
  concert: [
    "photo-1470229722913-7c0e2dbb8d90",
    "photo-1501281668745-f2f12d43aa88",
    "photo-1459749411177-04de30447af0",
    "photo-1514525253161-7a46d19cd819",
    "photo-1493225457124-a3eb161ffa5f",
    "photo-1429962714451-bb934ecdc4ec",
  ],
  gallery: [
    "photo-1536924940846-227afb31e2a5",
    "photo-1577083552431-6e5fd01988ec",
    "photo-1561214115-f2f4142479b9",
    "photo-1554907984-15263bfd63bd",
    "photo-1541961017774-22349e4a1262",
    "photo-1513364776144-60967b0f800f",
  ],
  workshop: [
    "photo-1452860606245-08befc0ff44b",
    "photo-1459411552884-841db9b3cc2a",
    "photo-1565193566173-7a0ee3dbe261",
    "photo-1610701596007-11502861dcfa",
    "photo-1493106819501-66d381c466f1",
    "photo-1605721911519-3dfeb3be25e7",
  ],
  farm: [
    "photo-1500382017468-9049fed747ef",
    "photo-1464226184884-fa280b87c399",
    "photo-1625246333191-94d9e1721f10",
    "photo-1574943320219-553eb213f72d",
    "photo-1416879595882-3373a0480b5b",
    "photo-1466692476866-aef14aa09732",
  ],
  brewery: [
    "photo-1559526324-4b87b5e36e44",
    "photo-1571613316887-6f8d5dcbf7ef",
    "photo-1535958636474-b021ee553b07",
    "photo-1608270586620-248524c67de9",
    "photo-1618885472179-5e47e0c1dd80",
    "photo-1436076863939-06870fe779c2",
  ],
  restaurant: [
    "photo-1517248135467-4c7edcad34c4",
    "photo-1414235077428-338989a2e2d2",
    "photo-1559339352-11d035aa65de",
    "photo-1466978913421-dad2ebd01d17",
    "photo-1552566626-52f8b828add9",
    "photo-1424848430585-92c8c6f71c4e",
  ],
};

export function unsplashUrl(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&h=800&q=80`;
}

export const EVENT_THEME_BY_CATEGORY: Record<string, ImageTheme> = {
  workshop: "workshop",
  exhibition: "gallery",
  market: "market",
  tasting: "brewery",
  concert: "concert",
  festival: "concert",
  conference: "gallery",
  performance: "concert",
  meetup: "bar",
  online_event: "workshop",
};
