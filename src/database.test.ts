import { expect, test, describe, beforeAll } from "bun:test";
import {
  loadStorage,
  writeNewObject,
  deleteItem,
  getLast,
  getItem,
  initStorageData,
} from "./database";

describe("Basic db operations", () => {
  // make sure the test DB file is ready
  // and there is an empty items array
  beforeAll(async () => {
    await initStorageData();
    await loadStorage();
  });

  test("Write object", async () => {
    const id = "32k324";
    const itemToAdd = {
      id,
      name: "Jake Berg",
    };
    await writeNewObject(id, itemToAdd);
    const items = await loadStorage();
    const item = items.find((item) => item.id === itemToAdd.id);
    expect(item.id).toBe("32k324");
  });

  test("Object that's missing an ID throws and error", async () => {
    const id = "431243i";
    const item = {
      name: "Jake Berg",
    };
    expect(async () => {
      await writeNewObject(id, item);
    }).toThrow();
  });

  test("Get last should return last item added to array", async () => {
    const items = [
      {
        id: "1",
        name: "Jake Berg",
      },
      {
        id: "2",
        name: "Sally Summers",
      },
      {
        id: "3",
        name: "Jason Atwater",
      },
    ];
    for (let i = 0; i < items.length; i++) {
      await writeNewObject(items[i].id, items[i]);
    }
    const item = await getLast();
    expect(item.id).toEqual(items[2].id);
  });

  test("Deleting from the DB should remove item from the DB", async () => {
    const items = [
      {
        id: "1",
        name: "Jake Berg",
      },
      {
        id: "2",
        name: "Sally Summers",
      },
      {
        id: "3",
        name: "Jason Atwater",
      },
    ];
    for (let i = 0; i < items.length; i++) {
      await writeNewObject(items[i].id, items[i]);
    }
    await deleteItem("1");
    const missingItem = await getItem("1");
    const itemExists = await getItem("2");

    expect(missingItem).toBeUndefined();
    expect(itemExists).toBeDefined();
  });
});
