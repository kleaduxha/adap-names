import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

export class StringArrayName implements Name {

  protected delimiter: string = DEFAULT_DELIMITER;
  protected components: string[] = [];


  constructor(source: string[], delimiter?: string) {
    this.delimiter = this.normalizeDelimiter(delimiter ?? DEFAULT_DELIMITER);
    this.components = Array.isArray(source) ? [...source] : [];
  }

 
  public asString(delimiter: string = this.delimiter): string {
    const raw = this.components.map(c => this.unmask(c, this.delimiter));
    return raw.join(delimiter);
  }


  public asDataString(): string {
    const raw = this.components.map(c => this.unmask(c, this.delimiter));
    const maskedForDefault = raw.map(r => this.mask(r, DEFAULT_DELIMITER));
    return maskedForDefault.join(DEFAULT_DELIMITER);
  }

  public getDelimiterCharacter(): string {
    return this.delimiter;
  }

  public isEmpty(): boolean {
    return this.components.length === 0;
  }


  public getNoComponents(): number {
    return this.components.length;
  }

  public getComponent(i: number): string {
    return this.components[i];
  }

  public setComponent(i: number, c: string): void {
    if (i < 0 || i >= this.components.length) return;
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
    if (i < 0 || i >= this.components.length) return;
    this.components.splice(i, 1);
  }

  public concat(other: Name): void {
    const count = other.getNoComponents();
    for (let i = 0; i < count; i++) {
      this.components.push(other.getComponent(i));
    }
  }


  private normalizeDelimiter(d: string): string {
    if (typeof d !== "string" || d.length !== 1) {
      throw new RangeError("delimiter must be a single character");
    }
    if (d === ESCAPE_CHARACTER) {
      throw new RangeError("escape character cannot be the delimiter");
    }
    return d;
  }

  private mask(raw: string, delimiter: string): string {
    return raw
      .replace(/\\/g, ESCAPE_CHARACTER + ESCAPE_CHARACTER)
      .replace(new RegExp(this.escapeForRegExp(delimiter), "g"), ESCAPE_CHARACTER + delimiter);
  }

  private unmask(masked: string, delimiter: string): string {
    let out = "";
    for (let i = 0; i < masked.length; i++) {
      const ch = masked[i];
      if (ch === ESCAPE_CHARACTER) {
        const next = masked[i + 1];
        if (next === ESCAPE_CHARACTER || next === delimiter) {
          out += next;
          i++;
        } else {
          out += ESCAPE_CHARACTER;
        }
      } else {
        out += ch;
      }
    }
    return out;
  }

  private escapeForRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

}