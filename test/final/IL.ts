export interface IL {
  $type: string;
  core: string;
  name: string;
  Commands: IL[];
  content: string | [];
  [key: string]: any;
}
