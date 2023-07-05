import { promises as fs } from "fs";
import { last } from "lodash";

/**
 * Chinook is based on a single local file at the
 * project root to store the stringified
 * version of the database.
 */
const databasePath = process.env.NODE_ENV === "test" ? "./chinook-test.db" : "./chinook.db";

/**
 * This is our in-memory database
 */
let items: Items;

/**
 * Exposes the items array incase that you'd like
 * to just access the object directly
 * @returns {Items} A Promise that resolves with the items array
 */
export function getItems(): Items {
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
 * @returns {any} A Promise that resolves with the item found or undefined.
 */
export function getItem(id: string): any {
  return items.find((item) => item.id === id);
}

/**
 * Returns the last item from the items array.
 *
 * @returns {any} A Promise that resolves with the last item or undefined.
 */
export function getLast(): any {
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
 * it initializes an empty array. It's called connect because that best matches the
 * lingo around connecting to a database.
 *
 * @returns {Promise<Items>} A Promise that resolves with the loaded items array.
 */
export async function connect(): Promise<Items> {
  // Let's see if the file exists
  // and create it if it doesn't!
  try {
    await fs.access(databasePath);
  } catch (err) {
    await writeItemsToFile([]);
  }
  // Now we can read from the file
  // feeling pretty confident that it
  // will exists now, at least.
  try {
    const buffer = await fs.readFile(databasePath, "binary");
    items = JSON.parse(buffer.toString());
  } catch (err: unknown) {
    throw err;
  }
  return items;
}
