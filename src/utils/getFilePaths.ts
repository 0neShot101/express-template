import { readdir } from 'fs/promises';
import path from 'path';

/**
 * Recursively gets all file paths from a directory.
 * 
 * This function:
 * - Recursively traverses directories
 * - Returns absolute paths to all matching files
 * 
 * @param {string} directory - The root directory from which to start searching
 * @returns {Promise<string[]>} Promise that resolves to an array of file paths
 * @async
 */
const getFilePaths = async (directory: string): Promise<string[]> => {
  const dirents = await readdir(directory, { 'withFileTypes': true, });
  
  const files = await Promise.all(
    dirents.map(async (dirent) => {
      const resultPath = path.join(directory, dirent.name);

      return dirent.isDirectory() ? getFilePaths(resultPath) : resultPath;
    }),
  );

  return Array.prototype.concat(...files)
};

export default getFilePaths;
