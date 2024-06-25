export type Color = string;

export interface Grid {
  tiles: Color[];
  versionstamps: string[];
  enabled: boolean;
}

export interface GridUpdate {
  index: number;
  color: Color;
  versionstamp: string;
}
