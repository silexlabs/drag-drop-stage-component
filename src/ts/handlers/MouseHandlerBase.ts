import { StageStore } from '../flux/StageStore';
import { Hooks, MouseData } from '../Types';

export class MouseHandlerBase {
  constructor(protected doc: HTMLDocument, protected store: StageStore, protected hooks: Hooks) {}
  update(mouseData: MouseData) {};
  release() {};
}
