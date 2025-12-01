import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";


export abstract class AbstractName implements Name {

  protected delimiter: string;

  protected constructor(delimiter: string = DEFAULT_DELIMITER) {
    this.delimiter = this.normalizeDelimiter(delimiter);
  }

  // Printable Interface

  public asString(delimiter: string = this.delimiter): string {
    const maskedComponents = this.getComponentsInternal();
    const raw = maskedComponents.map(c => this.unmask(c, this.delimiter));
    return raw.join(delimiter);
  }

  public asDataString(): string {
    const maskedComponents = this.getComponentsInternal();
    const raw = maskedComponents.map(c => this.unmask(c, this.delimiter));
    const maskedForDefault = raw.map(r => this.mask(r, DEFAULT_DELIMITER));
    return maskedForDefault.join(DEFAULT_DELIMITER);
  }

  public getDelimiterCharacter(): string {
    return this.delimiter;
  }

  // Name Interface

  public isEmpty(): boolean {
    return this.getNoComponents() === 0;
  }

  public getNoComponents(): number {
    return this.getComponentsInternal().length;
  }

  public getComponent(i: number): string {
    return this.getComponentsInternal()[i];
  }

  public setComponent(i: number, c: string): void {
    const comps = this.getComponentsInternal();
    if (i < 0 || i >= comps.length) {
      return;
    }
    comps[i] = c;
    this.setComponentsInternal(comps);
  }

  public insert(i: number, c: string): void {
    const comps = this.getComponentsInternal();
    const idx = Math.max(0, Math.min(i, comps.length));
    comps.splice(idx, 0, c);
    this.setComponentsInternal(comps);
  }

  public append(c: string): void {
    const comps = this.getComponentsInternal();
    comps.push(c);
    this.setComponentsInternal(comps);
  }

  public remove(i: number): void {
    const comps = this.getComponentsInternal();
    if (i < 0 || i >= comps.length) {
      return;
    }
    comps.splice(i, 1);
    this.setComponentsInternal(comps);
  }

  public concat(other: Name): void {
    const comps = this.getComponentsInternal();
    const count = other.getNoComponents();
    for (let i = 0; i < count; i++) {
      comps.push(other.getComponent(i));
    }
    this.setComponentsInternal(comps);
  }

  // narrow inheritance interface

 
  protected abstract getComponentsInternal(): string[];

 
  protected abstract setComponentsInternal(components: string[]): void;

  

  protected normalizeDelimiter(d: string): string {
    if (typeof d !== "string" || d.length !== 1) {
      throw new RangeError("delimiter must be a single character");
    }
    if (d === ESCAPE_CHARACTER) {
      throw new RangeError("escape character cannot be the delimiter");
    }
    return d;
  }

  protected mask(raw: string, delimiter: string): string {
    return raw
      .replace(/\\/g, ESCAPE_CHARACTER + ESCAPE_CHARACTER)
      .replace(new RegExp(this.escapeForRegExp(delimiter), "g"), ESCAPE_CHARACTER + delimiter);
  }

  protected unmask(masked: string, delimiter: string): string {
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

  protected escapeForRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }


  protected splitMasked(text: string, delimiter: string): string[] {
    if (text === "") {
      return [];
    }
    const result: string[] = [];
    let current = "";
    let escaping = false;

    for (const ch of text) {
      if (escaping) {
        current += ch;
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

}