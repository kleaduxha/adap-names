import { AbstractName } from "./AbstractName";
export class StringName extends AbstractName {

  protected name: string = "";
  protected noComponents: number = 0;

  constructor(source: string, delimiter?: string) {
    super(delimiter);
    this.name = source ?? "";
    this.noComponents = this.name === "" ? 0 : this.splitMasked(this.name, this.delimiter).length;
  }

  public getNoComponents(): number {
    return this.noComponents;
  }

  public getComponent(i: number): string {
    const comps = this.getComponents();
    return comps[i];
  }

  public setComponent(i: number, c: string): void {
    const comps = this.getComponents();
    if (i < 0 || i >= comps.length) {
      return;
    }
    comps[i] = c;
    this.updateFromComponents(comps);
  }

  public insert(i: number, c: string): void {
    const comps = this.getComponents();
    const idx = Math.max(0, Math.min(i, comps.length));
    comps.splice(idx, 0, c);
    this.updateFromComponents(comps);
  }

  public append(c: string): void {
    const comps = this.getComponents();
    comps.push(c);
    this.updateFromComponents(comps);
  }

  public remove(i: number): void {
    const comps = this.getComponents();
    if (i < 0 || i >= comps.length) {
      return;
    }
    comps.splice(i, 1);
    this.updateFromComponents(comps);
  }

  private getComponents(): string[] {
    if (this.name === "") {
      this.noComponents = 0;
      return [];
    }
    const comps = this.splitMasked(this.name, this.delimiter);
    this.noComponents = comps.length;
    return comps;
  }

  private updateFromComponents(components: string[]): void {
    this.noComponents = components.length;
    this.name = components.join(this.delimiter);
  }

}