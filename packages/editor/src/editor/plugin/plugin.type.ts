export interface BasePluginType {
  init(): Promise<void> | void;
  remove(): Promise<void> | void;
}
