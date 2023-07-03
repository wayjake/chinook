import { promises as fs } from "fs";
import { last } from "lodash";

/**
 * Chinook is based on a single local file at the
 * project root to store the stringified
 * version of the database.
 */
const databasePath = process.env.NODE_ENV === "test" ? "./chinook.db" : "./chinook-test.db";

type Items = any[];

/**
 * This is our in-memory database
 */
let items: Items;

/**
 * Exposes the items array incase that you'd like
 * to just access the object directly
 * @returns {Promise<Items>} A Promise that resolves with the items array
 */
export async function getItems(): Promise<Items> {
  return items;
}

/**
 * Writes a new object into the items array and saves it to disk.
 *
 * @param {string} id The id of the object to be added.
 * @param {any} row The object to be added.
 * @throws {Error} If the row object does not have an id property.
 * @returns {Promise<void>}
 */
export async function writeNewObject(id: string, row: any): Promise<void> {
  if (!row.id) throw new Error("ID is a required field");
  items.push(row);
  await writeItemsToFile(items);
}

/**
 * Removes the item with the given id from the items array and saves the new state to disk.
 *
 * @param {string} id The id of the item to be deleted.
 * @returns {Promise<void>}
 */
export async function deleteItem(id: string): Promise<void> {
  items = items.filter((item) => item.id !== id);
  await writeItemsToFile(items);
}

/**
 * Returns the first item from the items array that has the given id.
 *
 * @param {string} id The id of the item to find.
 * @returns {Promise<any>} A Promise that resolves with the item found or undefined.
 */
export async function getItem(id: string): Promise<any> {
  return items.find((item) => item.id === id);
}

/**
 * Returns the last item from the items array.
 *
 * @returns {Promise<any>} A Promise that resolves with the last item or undefined.
 */
export async function getLast(): Promise<any> {
  return last(items);
}

/**
 * Writes the items array to the disk in JSON format.
 *
 * @param {Items} items The items array to be saved.
 * @returns {Promise<void>}
 */
export async function writeItemsToFile(items: Items): Promise<void> {
  const buffer = Buffer.from(JSON.stringify(items));
  await fs.writeFile(databasePath, buffer, "binary");
}

/**
 * Loads the items array from disk. If there is an error in reading or parsing the file,
 * it initializes an empty array.
 *
 * @returns {Promise<Items>} A Promise that resolves with the loaded items array.
 */
export async function loadStorage(): Promise<Items> {
  try {
    const buffer = await fs.readFile(databasePath, "binary");
    items = JSON.parse(buffer.toString());
  } catch (err: unknown) {
    if (err instanceof Error && err.message === `Unexpected end of JSON input`) {
      await initStorageData(true);
    } else {
      throw err;
    }
  }
  return items;
}

/**
 * Initializes the database with the provided initial data. This function is primarily used for testing.
 *
 * @param {boolean} [force=false] Whether to force initialization regardless of the NODE_ENV value.
 * @param {Items} [initialDate=[]] The initial data to be used for the database.
 * @throws {Error} If force is false and NODE_ENV is not "test".
 * @returns {Promise<void>}
 */
export async function initStorageData(force = false, initialDate: Items = []): Promise<void> {
  if (!force && process.env.NODE_ENV !== "test") {
    throw new Error("This function is only available in testing mode");
  }
  return writeItemsToFile(initialDate);
}
