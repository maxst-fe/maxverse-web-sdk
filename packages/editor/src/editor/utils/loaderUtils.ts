export const getFilesFromItemList = async (dataTransferItemList: DataTransferItemList) => {
  const files: File[] = [];
  const filesMap: { [key: string]: File } = {};

  async function handleEntry(entry: FileSystemEntry | FileSystemDirectoryEntry) {
    return new Promise((resolve, reject) => {
      if (entry.isDirectory) {
        const directory = entry as FileSystemDirectoryEntry;
        const reader = directory.createReader();

        reader.readEntries(async function (entries) {
          for (let i = 0; i < entries.length; i++) {
            await handleEntry(entries[i]);
          }

          resolve(true);
        });
      }

      if (entry.isFile) {
        const fileEntry = entry as FileSystemFileEntry;

        fileEntry.file(
          function (file: any) {
            files.push(file);

            filesMap[entry.fullPath.slice(1)] = file;
            resolve(true);
          },
          () => {
            reject(false);
          },
        );
      }
    });
  }

  for (let i = 0; i < dataTransferItemList.length; i++) {
    const item = dataTransferItemList[i];

    if (item.kind === 'file') {
      const file = item.webkitGetAsEntry();
      if (file) {
        await handleEntry(file);
      }
    }
  }

  return { files, filesMap };
};
