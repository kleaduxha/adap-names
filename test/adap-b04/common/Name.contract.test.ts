import { describe, it, expect } from "vitest";

import { Name } from "../../../src/adap-b04/names/Name";
import { StringName } from "../../../src/adap-b04/names/StringName";
import { StringArrayName } from "../../../src/adap-b04/names/StringArrayName";
import { IllegalArgumentException } from "../../../src/adap-b04/common/IllegalArgumentException";

describe("B04 – contracts on StringArrayName", () => {

    it("creates a non-empty StringArrayName and reads components", () => {
        const n: Name = new StringArrayName(["a", "b", "c"]);

        expect(n.isEmpty()).toBe(false);
        expect(n.getNoComponents()).toBe(3);

        expect(n.getComponent(0)).toBe("a");
        expect(n.getComponent(1)).toBe("b");
        expect(n.getComponent(2)).toBe("c");

        expect(typeof n.asString()).toBe("string");
        expect(typeof n.asDataString()).toBe("string");
    });

    it("supports an empty StringArrayName", () => {
        const n: Name = new StringArrayName([]);

        expect(n.isEmpty()).toBe(true);
        expect(n.getNoComponents()).toBe(0);

        // should not throw
        expect(() => n.asString()).not.toThrow();
        expect(() => n.asDataString()).not.toThrow();
    });

    it("constructor enforces delimiter precondition", () => {
        // escape character as delimiter is forbidden
        expect(() => new StringArrayName(["a"], "\\")).toThrow(IllegalArgumentException);
        // delimiter must be a single character
        expect(() => new StringArrayName(["a"], ".." as any)).toThrow(IllegalArgumentException);
    });

    it("getComponent enforces index precondition", () => {
        const n: Name = new StringArrayName(["x", "y"]);

        expect(() => n.getComponent(-1)).toThrow(IllegalArgumentException);
        expect(() => n.getComponent(2)).toThrow(IllegalArgumentException);
    });

    it("insert and remove keep the component count consistent", () => {
        const n: Name = new StringArrayName(["a", "c"]);

        n.insert(1, "b");
        expect(n.getNoComponents()).toBe(3);
        expect(n.getComponent(0)).toBe("a");
        expect(n.getComponent(1)).toBe("b");
        expect(n.getComponent(2)).toBe("c");

        n.remove(1);
        expect(n.getNoComponents()).toBe(2);
        expect(n.getComponent(0)).toBe("a");
        expect(n.getComponent(1)).toBe("c");
    });

    it("insert enforces index precondition", () => {
        const n: Name = new StringArrayName(["a", "b"]);

        expect(() => n.insert(-1, "x")).toThrow(IllegalArgumentException);
        expect(() => n.insert(3, "x")).toThrow(IllegalArgumentException);
    });

    it("clone creates an equal but independent StringArrayName", () => {
        const original: Name = new StringArrayName(["a", "b"]);
        const copy = original.clone() as Name;

        expect(original.isEqual(copy)).toBe(true);

        (copy as StringArrayName).setComponent(0, "x");
        expect(original.getComponent(0)).toBe("a");
        expect(copy.getComponent(0)).toBe("x");
    });

    it("concat appends all components from the other name", () => {
        const left: Name = new StringArrayName(["a"]);
        const right: Name = new StringArrayName(["b", "c"]);

        left.concat(right);

        expect(left.getNoComponents()).toBe(3);
        expect(left.getComponent(0)).toBe("a");
        expect(left.getComponent(1)).toBe("b");
        expect(left.getComponent(2)).toBe("c");
    });

    it("concat enforces other != null", () => {
        const n: Name = new StringArrayName(["a"]);
        // deliberate contract violation for the test
        // @ts-expect-error
        expect(() => n.concat(null)).toThrow(IllegalArgumentException);
    });

    it("equal StringArrayNames have the same hash code", () => {
        const n1: Name = new StringArrayName(["a", "b", "c"]);
        const n2: Name = new StringArrayName(["a", "b", "c"]);

        expect(n1.isEqual(n2)).toBe(true);
        expect(n1.getHashCode()).toBe(n2.getHashCode());
    });
});

describe("B04 – contracts on StringName", () => {

    it("creates a non-empty StringName and reads components", () => {
        const n: Name = new StringName("a.b.c");

        expect(n.isEmpty()).toBe(false);
        expect(n.getNoComponents()).toBe(3);

        expect(n.getComponent(0)).toBe("a");
        expect(n.getComponent(1)).toBe("b");
        expect(n.getComponent(2)).toBe("c");

        expect(typeof n.asString()).toBe("string");
        expect(typeof n.asDataString()).toBe("string");
    });

    it("supports an empty StringName", () => {
        const n: Name = new StringName("");

        expect(n.isEmpty()).toBe(true);
        expect(n.getNoComponents()).toBe(0);

        expect(() => n.asString()).not.toThrow();
        expect(() => n.asDataString()).not.toThrow();
    });

    it("constructor enforces delimiter precondition", () => {
        expect(() => new StringName("a", "\\")).toThrow(IllegalArgumentException);
        expect(() => new StringName("a", ".." as any)).toThrow(IllegalArgumentException);
    });

    it("getComponent enforces index precondition", () => {
        const n: Name = new StringName("x.y");

        expect(() => n.getComponent(-1)).toThrow(IllegalArgumentException);
        expect(() => n.getComponent(2)).toThrow(IllegalArgumentException);
    });

    it("append and remove keep the component count consistent", () => {
        const n: Name = new StringName("a.b");

        n.append("c");
        expect(n.getNoComponents()).toBe(3);
        expect(n.getComponent(2)).toBe("c");

        n.remove(1); // remove "b"
        expect(n.getNoComponents()).toBe(2);
        expect(n.getComponent(0)).toBe("a");
        expect(n.getComponent(1)).toBe("c");
    });

    it("clone creates an equal but independent StringName", () => {
        const original: Name = new StringName("a.b");
        const copy = original.clone() as Name;

        expect(original.isEqual(copy)).toBe(true);

        (copy as StringName).setComponent(0, "x");
        expect(original.getComponent(0)).toBe("a");
        expect(copy.getComponent(0)).toBe("x");
    });

    it("equal StringNames have the same hash code", () => {
        const n1: Name = new StringName("a.b.c");
        const n2: Name = new StringName("a.b.c");

        expect(n1.isEqual(n2)).toBe(true);
        expect(n1.getHashCode()).toBe(n2.getHashCode());
    });

    it("StringArrayName and StringName with same logical content are equal", () => {
        const arrayName: Name = new StringArrayName(["oss", "cs", "fau", "de"]);
        const stringName: Name = new StringName("oss.cs.fau.de");

        expect(arrayName.isEqual(stringName)).toBe(true);
        expect(stringName.isEqual(arrayName)).toBe(true);

        expect(arrayName.asDataString()).toBe(stringName.asDataString());
    });
});