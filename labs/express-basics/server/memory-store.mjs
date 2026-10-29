import {randomUUID} from 'node:crypto';
export function createMemoryStore() {
  const items = new Map();
  return {
    list({kw, industry, difficulty, offset, limit}) {
      const found = [...items.values()].filter(item => item.title.includes(kw)
        && (!industry || item.industry === industry) && (!difficulty || item.difficulty === difficulty));
      return {items: found.slice(offset, offset + limit), total: found.length, offset, limit};
    },
    get(id) { return items.get(id); },
    create(fields) {
      const item = {id: randomUUID(), ...fields};
      items.set(item.id, item);
      return item;
    },
    update(id, fields) {
      if (!items.has(id)) return undefined;
      const item = {...items.get(id), ...fields};
      items.set(id, item);
      return item;
    },
    remove(id) { return items.delete(id); },
  };
}
