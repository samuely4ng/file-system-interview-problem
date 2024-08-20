import { fileAPI } from "./api";

export async function selectFile(file: string): Promise<string> {
  const { data } = await fileAPI.get(`/fs/read_file/${file.replaceAll('/', '|||')}`);
  return data as string;
}

export async function uploadFiles(files: FileList) {
  const formData = new FormData();
  for (let i = 0; i < files.length; i += 1) {
    formData.append("files", files[i]);
  }

  // TO-DO: Implement this endpoint
  /* await request("/api/upload-files", {
    method: "POST",
    body: formData,
  });*/
}

export async function listFiles(path: string = "/"): Promise<any> {
  console.log('LISTING FILES', path);
  const{ data } = await fileAPI.get(`/fs/summary/${path.replaceAll('/', '|||')}?recursive=false`);
  return data;
}
