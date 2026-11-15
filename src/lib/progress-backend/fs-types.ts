// File System Access API bits the bundled DOM lib may not declare.
export interface FSPermissionDescriptor {
  mode?: "read" | "readwrite";
}
export interface FSFileHandle {
  kind: "file";
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<{ write(data: string): Promise<void>; close(): Promise<void>; abort?(): Promise<void> }>;
  queryPermission(d?: FSPermissionDescriptor): Promise<PermissionState>;
  requestPermission(d?: FSPermissionDescriptor): Promise<PermissionState>;
}
export interface FilePickerOptions {
  types?: { description?: string; accept: Record<string, string[]> }[];
  excludeAcceptAllOption?: boolean;
  multiple?: boolean;
  suggestedName?: string;
}
export type PickerWindow = {
  showSaveFilePicker(o?: FilePickerOptions): Promise<FSFileHandle>;
  showOpenFilePicker(o?: FilePickerOptions): Promise<FSFileHandle[]>;
};
