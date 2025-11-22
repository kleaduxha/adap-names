import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

export class StringName implements Name {

  protected delimiter: string = DEFAULT_DELIMITER;
  protected name: string = "";
  protected noComponents: number = 0;

  constructor(source: string, delimiter?: string) {
    this.delimiter = this.normalizeDelimiter(delimiter ?? DEFAULT_DELIMITER);
    this.name = source ?? "";
    this.noComponents = this.name === "" ? 0 : this.splitMasked(this.name, this.delimiter).length;
  }

  public asString(delimiter: string = this.delimiter): string {
    const comps = this.getComponents();
    const raw = comps.map(c => this.unmask(c, this.delimiter));
    return raw.join(delimiter);
  }

  public asDataString(): string {
    const comps = this.getComponents();
    const raw = comps.map(c => this.unmask(c, this.delimiter));
    const maskedForDefault = raw.map(r => this.mask(r, DEFAULT_DELIMITER));
    return maskedForDefault.join(DEFAULT_DELIMITER);
  }

  public getDelimiterCharacter(): string {
    return this.delimiter;
  }

  public isEmpty(): boolean {
    return this.noComponents === 0;
  }

  public getNoComponents(): number {
    return this.noComponents;
  }

  public getComponent(n: number): string {
    const comps = this.getComponents();
    return comps[n];
  }

  public setComponent(n: number, c: string): void {
    const comps = this.getComponents();
    if (n < 0 || n >= comps.length) return;
    comps[n] = c;
    this.updateFromComponents(comps);
  }

  public insert(n: number, c: string): void {
    const comps = this.getComponents();
    const idx = Math.max(0, Math.min(n, comps.length));
    comps.splice(idx, 0, c);
    this.updateFromComponents(comps);
  }

  public append(c: string): void {
    const comps = this.getComponents();
    comps.push(c);
    this.updateFromComponents(comps);
  }

  public remove(n: number): void {
    const comps = this.getComponents();
    if (n < 0 || n >= comps.length) return;
    comps.splice(n, 1);
    this.updateFromComponents(comps);
  }

  public concat(other: Name): void {
    const comps = this.getComponents();
    const count = other.getNoComponents();
    for (let i = 0; i < count; i++) {
      comps.push(other.getComponent(i));
    }
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
  private splitMasked(text: string, delimiter: string): string[] {
    if (text === "") {
      return [];
    }
    const result: string[] = [];
    let current = "";
    let escaping = false;

    for (const ch of text) {
      if (escaping) {
        current += ESCAPE_CHARACTER + ch;
        escaping = false;
      } else if (ch === ESCAPE_CHARACTER) {
        escaping = true;
      } else if (ch === delimiter) {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }

    result.push(current);
    return result;
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