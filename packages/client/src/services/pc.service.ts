import { loadCollection, saveCollection, loadPcBox, savePcBox } from './storage';

export function transferToPC(instanceIds: string[]): void {
  const idSet = new Set(instanceIds);
  const collection = loadCollection();
  const pcBox = loadPcBox();

  const toMove = collection.filter(p => idSet.has(p.instanceId));
  const remaining = collection.filter(p => !idSet.has(p.instanceId));

  saveCollection(remaining);
  savePcBox([...pcBox, ...toMove]);
}

export function transferFromPC(instanceIds: string[]): void {
  const idSet = new Set(instanceIds);
  const collection = loadCollection();
  const pcBox = loadPcBox();

  const toMove = pcBox.filter(p => idSet.has(p.instanceId));
  const remaining = pcBox.filter(p => !idSet.has(p.instanceId));

  savePcBox(remaining);
  saveCollection([...collection, ...toMove]);
}
