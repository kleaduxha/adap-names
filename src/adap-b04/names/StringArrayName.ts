import { DEFAULT_DELIMITER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

export class StringArrayName extends AbstractName {

    protected components: string[] = [];

    constructor(source: string[], delimiter: string = DEFAULT_DELIMITER) {
        super(delimiter);
        this.components = Array.isArray(source) ? [...source] : [];
        this.assertClassInvariant();
    }

    public clone(): Name {
        // Clone must produce an equal but independent object
        const copy = new StringArrayName(this.components, this.delimiter);
        // Postcondition (weak): cloned object is equal
        if (!this.isEqual(copy)) {
            throw new Error("clone failed to create equal StringArrayName");
        }
        return copy;
    }

    // Representation hooks for AbstractName

    protected getComponentsInternal(): string[] {
        return [...this.components];
    }

    protected setComponentsInternal(components: string[]): void {
        this.components = [...components];
        this.assertClassInvariant();
    }
}