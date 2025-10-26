export const DEFAULT_DELIMITER: string = '.';
export const ESCAPE_CHARACTER = '\\';

/**
 * A name is a sequence of string components separated by a delimiter character.
 * Special characters within the string may need masking, if they are to appear verbatim.
 * There are only two special characters, the delimiter character and the escape character.
 * The escape character can't be set, the delimiter character can.
 * 
 * Homogenous name examples
 * 
 * "oss.cs.fau.de" is a name with four name components and the delimiter character '.'.
 * "///" is a name with four empty components and the delimiter character '/'.
 * "Oh\.\.\." is a name with one component, if the delimiter character is '.'.
 */
export class Name {

  private delimiter: string = DEFAULT_DELIMITER;
  private components: string[] = [];

  /** Expects that all Name components are properly masked */
  constructor(other: string[], delimiter?: string) {
    this.delimiter = this.normalizeDelimiter(delimiter ?? DEFAULT_DELIMITER);
    this.components = Array.isArray(other) ? [...other] : [];
  }

  /**
     * Returns a human-readable representation of the Name instance using user-set control characters
     * Control characters are not escaped (creating a human-readable string)
     * Users can vary the delimiter character to be used
   */
  public asString(delimiter: string = this.delimiter): string {
    const raw = this.components.map(c => this.unmask(c, this.delimiter));
    return raw.join(delimiter);
  }

  /**
     * Returns a machine-readable representation of Name instance using default control characters
     * Machine-readable means that from a data string, a Name can be parsed back in
     * The control characters in the data string are the default characters
   */
  public asDataString(): string {
    const raw = this.components.map(c => this.unmask(c, this.delimiter));
    const maskedForDefault = raw.map(r => this.mask(r, DEFAULT_DELIMITER));
    return maskedForDefault.join(DEFAULT_DELIMITER);
  }

  public getComponent(i: number): string {
    return this.components[i];
  }

  /** Expects that new Name component c is properly masked */
  public setComponent(i: number, c: string): void {
    if (i < 0 || i >= this.components.length) return;
    this.components[i] = c;
  }

  /** Returns number of components in Name instance */
  public getNoComponents(): number {
    return this.components.length;
  }

  /** Expects that new Name component c is properly masked */
  public insert(i: number, c: string): void {
    const idx = Math.max(0, Math.min(i, this.components.length));
    this.components.splice(idx, 0, c);
  }

  /** Expects that new Name component c is properly masked */
  public append(c: string): void {
    this.components.push(c);
  }

  public remove(i: number): void {
    if (i < 0 || i >= this.components.length) return;
    this.components.splice(i, 1);
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
