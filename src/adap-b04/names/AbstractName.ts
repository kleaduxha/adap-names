import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { MethodFailedException } from "../common/MethodFailedException";
import { InvalidStateException } from "../common/InvalidStateException";
export abstract class AbstractName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;

    constructor(delimiter: string = DEFAULT_DELIMITER) {
        this.delimiter = this.normalizeDelimiter(delimiter);
        this.assertClassInvariant();
    }

    public abstract clone(): Name;

    public asString(delimiter: string = this.delimiter): string {
        this.assertClassInvariant();

        const raw = this.getComponentsInternal().map(
            c => this.unmask(c, this.delimiter)
        );
        const result = raw.join(delimiter);
        const expectedMinComponents = this.getNoComponents();
        const parts = result.length === 0 ? [] : result.split(delimiter);
        this.assertPostcondition(
            parts.length >= expectedMinComponents,
            "asString lost components"
        );

        this.assertClassInvariant();
        return result;
    }

    public asDataString(): string {
        this.assertClassInvariant();

        const raw = this.getComponentsInternal().map(
            c => this.unmask(c, this.delimiter)
        );
        const maskedForDefault = raw.map(r => this.mask(r, DEFAULT_DELIMITER));
        const result = maskedForDefault.join(DEFAULT_DELIMITER);

        // Postcondition: parsing the data string yields the same number of components
        const reparsed =
            result.length === 0
                ? []
                : this.splitMasked(result, DEFAULT_DELIMITER);
        this.assertPostcondition(
            reparsed.length === this.getNoComponents(),
            "asDataString not reversible"
        );

        this.assertClassInvariant();
        return result;
    }

    public toString(): string {
        return this.asDataString();
    }

    public isEqual(other: Name): boolean {
        // Precondition
        this.assertPrecondition(other !== null && other !== undefined, "other must not be null");

        if (this === other) {
            return true;
        }

        const thisCount = this.getNoComponents();
        if (thisCount !== other.getNoComponents()) {
            return false;
        }

        for (let i = 0; i < thisCount; i++) {
            if (this.getComponent(i) !== other.getComponent(i)) {
                return false;
            }
        }
        return this.getDelimiterCharacter() === other.getDelimiterCharacter();
    }

    public getHashCode(): number {

        const repr = `${this.getDelimiterCharacter()}:${this.asDataString()}`;
        let hash = 0;
        for (let i = 0; i < repr.length; i++) {
            hash = (hash * 31 + repr.charCodeAt(i)) | 0;
        }
        return hash;
    }

    public isEmpty(): boolean {
        this.assertClassInvariant();
        const empty = this.getNoComponents() === 0;
        this.assertClassInvariant();
        return empty;
    }

    public getDelimiterCharacter(): string {
        this.assertClassInvariant();
        return this.delimiter;
    }

    public getNoComponents(): number {
        this.assertClassInvariant();
        const count = this.getComponentsInternal().length;
        this.assertPostcondition(count >= 0, "negative component count");
        this.assertClassInvariant();
        return count;
    }

    public getComponent(i: number): string {
        this.assertValidIndexForAccess(i);
        this.assertClassInvariant();

        const result = this.getComponentsInternal()[i];

        this.assertPostcondition(
            typeof result === "string",
            "getComponent did not return a string"
        );

        this.assertClassInvariant();
        return result;
    }

    public setComponent(i: number, c: string): void {
        this.assertValidIndexForAccess(i);
        this.assertPrecondition(typeof c === "string", "component must be a string");

        this.assertClassInvariant();
        const before = this.getNoComponents();

        const components = this.getComponentsInternal();
        components[i] = c;
        this.setComponentsInternal(components);

        // Postconditions
        this.assertPostcondition(
            this.getNoComponents() === before,
            "setComponent changed number of components"
        );
        this.assertPostcondition(
            this.getComponent(i) === c,
            "setComponent did not store component correctly"
        );
        this.assertClassInvariant();
    }

    public insert(i: number, c: string): void {
        // Insert is allowed at position == length as well
        this.assertValidIndexForInsert(i);
        this.assertPrecondition(typeof c === "string", "component must be a string");

        this.assertClassInvariant();
        const before = this.getNoComponents();

        const components = this.getComponentsInternal();
        components.splice(i, 0, c);
        this.setComponentsInternal(components);

        this.assertPostcondition(
            this.getNoComponents() === before + 1,
            "insert did not increase size"
        );
        this.assertPostcondition(
            this.getComponent(i) === c,
            "insert did not insert at given index"
        );
        this.assertClassInvariant();
    }

    public append(c: string): void {
        this.insert(this.getNoComponents(), c);
    }

    public remove(i: number): void {
        this.assertValidIndexForAccess(i);

        this.assertClassInvariant();
        const before = this.getNoComponents();

        const components = this.getComponentsInternal();
        components.splice(i, 1);
        this.setComponentsInternal(components);

        this.assertPostcondition(
            this.getNoComponents() === before - 1,
            "remove did not decrease size"
        );
        this.assertClassInvariant();
    }

    public concat(other: Name): void {
        this.assertPrecondition(other !== null && other !== undefined, "other must not be null");

        this.assertClassInvariant();
        const before = this.getNoComponents();
        const otherCount = other.getNoComponents();

        const components = this.getComponentsInternal();
        for (let i = 0; i < otherCount; i++) {
            // According to the interface, components are already properly masked.
            components.push(other.getComponent(i));
        }
        this.setComponentsInternal(components);

        this.assertPostcondition(
            this.getNoComponents() === before + otherCount,
            "concat did not add all components"
        );
        this.assertClassInvariant();
    }

    protected abstract getComponentsInternal(): string[];
    protected abstract setComponentsInternal(components: string[]): void;


    protected normalizeDelimiter(d: string): string {
        if (typeof d !== "string" || d.length !== 1) {
            throw new IllegalArgumentException("delimiter must be a single character");
        }
        if (d === ESCAPE_CHARACTER) {
            throw new IllegalArgumentException("escape character cannot be the delimiter");
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

    protected splitMasked(data: string, delimiter: string): string[] {
        const result: string[] = [];
        let current = "";
        let escaped = false;

        for (let i = 0; i < data.length; i++) {
            const ch = data[i];
            if (escaped) {
                current += ch;
                escaped = false;
            } else if (ch === ESCAPE_CHARACTER) {
                escaped = true;
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

    private escapeForRegExp(s: string): string {
        return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    protected assertPrecondition(condition: boolean, message: string): void {
        if (!condition) {
            throw new IllegalArgumentException(message);
        }
    }

    protected assertPostcondition(condition: boolean, message: string): void {
        if (!condition) {
            throw new MethodFailedException(message);
        }
    }

    protected assertInvariantCondition(condition: boolean, message: string): void {
        if (!condition) {
            throw new InvalidStateException(message);
        }
    }

    protected assertClassInvariant(): void {
        // delimiter must be a single non-escape character
        this.assertInvariantCondition(
            typeof this.delimiter === "string" &&
                this.delimiter.length === 1 &&
                this.delimiter !== ESCAPE_CHARACTER,
            "invalid delimiter"
        );

        const components = this.getComponentsInternal();
        this.assertInvariantCondition(
            Array.isArray(components),
            "components must be an array"
        );
        for (const c of components) {
            this.assertInvariantCondition(
                typeof c === "string",
                "components must be strings"
            );
        }
    }

    protected assertValidIndexForAccess(i: number): void {
        const n = this.getComponentsInternal().length;
        const ok = Number.isInteger(i) && i >= 0 && i < n;
        this.assertPrecondition(ok, "index out of bounds");
    }

    protected assertValidIndexForInsert(i: number): void {
        const n = this.getComponentsInternal().length;
        const ok = Number.isInteger(i) && i >= 0 && i <= n;
        this.assertPrecondition(ok, "index out of bounds for insert");
    }
}