import { DEFAULT_DELIMITER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

export class StringName extends AbstractName {

    protected name: string = "";
    protected noComponents: number = 0;

    constructor(source: string, delimiter: string = DEFAULT_DELIMITER) {
        super(delimiter);
        this.name = source ?? "";
        this.noComponents =
            this.name.length === 0
                ? 0
                : this.splitMasked(this.name, this.delimiter).length;
        this.assertClassInvariant();
    }

    public clone(): Name {
        const copy = new StringName(this.name, this.delimiter);
        if (!this.isEqual(copy)) {
            throw new Error("clone failed to create equal StringName");
        }
        return copy;
    }

    public getNoComponents(): number {
        // Use cached value but still respect invariant and postcondition
        this.assertClassInvariant();
        const count = this.noComponents;
        this.assertPostcondition(count >= 0, "negative component count");
        this.assertClassInvariant();
        return count;
    }

    protected getComponentsInternal(): string[] {
        if (this.name.length === 0) {
            return [];
        }
        return this.splitMasked(this.name, this.delimiter);
    }

    protected setComponentsInternal(components: string[]): void {
        this.name = components.join(this.delimiter);
        this.noComponents = components.length;
        this.assertClassInvariant();
    }
}