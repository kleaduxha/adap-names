import { AbstractName } from "./AbstractName";

export class StringArrayName extends AbstractName {

  protected components: string[] = [];

  constructor(source: string[], delimiter?: string) {
    super(delimiter);
    this.components = Array.isArray(source) ? [...source] : [];
  }


  public getNoComponents(): number {
    return this.components.length;
  }

  public getComponent(i: number): string {
    return this.components[i];
  }

  public setComponent(i: number, c: string): void {
    if (i < 0 || i >= this.components.length) {
      return;
    }
    this.components[i] = c;
  }

  public insert(i: number, c: string): void {
    const idx = Math.max(0, Math.min(i, this.components.length));
    this.components.splice(idx, 0, c);
  }

  public append(c: string): void {
    this.components.push(c);
  }

  public remove(i: number): void {
    if (i < 0 || i >= this.components.length) {
      return;
    }
    this.components.splice(i, 1);
  }

}