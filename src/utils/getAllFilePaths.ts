import fs from 'fs/promises';
import path from 'path';

/**
 * gets all file paths from a directory.
 *
 * @param {string} directory - The root directory from which to start.
 * @param {string[]} allFiles - Optional array for already found files.
 * @returns {Promise<string[]>} - A Promise that resolves to an array of file paths.
 * @async
 */
const getAllFilePaths = async (
  directory: string, 
  allFiles: string[] = [],
): Promise<string[]> => {
  const dirents = await fs.readdir(directory, { 'withFileTypes': true, });

  // Wait for all dirents to be processed
  await Promise.allSettled(
    dirents.map(
      async dirent => {
        const fullPath = await path.resolve(directory, dirent.name);

        // If the current dirent is a directory, recursively get all file paths from it
        if (dirent.isDirectory() === true)
          await getAllFilePaths(fullPath, allFiles);
        else
          allFiles.push(fullPath);
      },
    ),
  );

  return allFiles;
};

export default getAllFilePaths;
