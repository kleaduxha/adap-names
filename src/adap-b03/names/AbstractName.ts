import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { StringArrayName } from "./StringArrayName";

export abstract class AbstractName implements Name {

  protected delimiter: string = DEFAULT_DELIMITER;

  constructor(delimiter: string = DEFAULT_DELIMITER) {
    this.delimiter = this.normalizeDelimiter(delimiter);
  }


  public clone(): Name {
    const comps: string[] = [];
    const count = this.getNoComponents();
    for (let i = 0; i < count; i++) {
      comps.push(this.getComponent(i));
    }
    return new StringArrayName(comps, this.delimiter);
  }

  public asString(delimiter: string = this.delimiter): string {
    const raw: string[] = [];
    const count = this.getNoComponents();
    for (let i = 0; i < count; i++) {
      const masked = this.getComponent(i);
      raw.push(this.unmask(masked, this.delimiter));
    }
    return raw.join(delimiter);
  }

  public asDataString(): string {
    const raw: string[] = [];
    const count = this.getNoComponents();
    for (let i = 0; i < count; i++) {
      const masked = this.getComponent(i);
      raw.push(this.unmask(masked, this.delimiter));
    }
    const maskedForDefault = raw.map(r => this.mask(r, DEFAULT_DELIMITER));
    return maskedForDefault.join(DEFAULT_DELIMITER);
  }

  public toString(): string {
    return this.asDataString();
  }

  public isEqual(other: Name): boolean {
    return this.asDataString() === other.asDataString();
  }

  public getHashCode(): number {
    const s = this.asDataString();
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      hash = (hash * 31 + c) | 0; 
    }
    return hash;
  }


  public isEmpty(): boolean {
    return this.getNoComponents() === 0;
  }

  public getDelimiterCharacter(): string {
    return this.delimiter;
  }


  public concat(other: Name): void {
    const count = other.getNoComponents();
    for (let i = 0; i < count; i++) {
      this.append(other.getComponent(i));
    }
  }


  abstract getNoComponents(): number;

  abstract getComponent(i: number): string;
  abstract setComponent(i: number, c: string): void;

  abstract insert(i: number, c: string): void;
  abstract append(c: string): void;
  abstract remove(i: number): void;


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