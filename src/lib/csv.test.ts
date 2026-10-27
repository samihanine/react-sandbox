import { describe, expect, it } from "vitest";
import { toDelimited } from "@/lib/csv";

describe("toDelimited", () => {
  it("joins cells and rows", () => {
    expect(
      toDelimited([
        ["a", 1, true],
        ["b", 2, null],
      ]),
    ).toBe("a,1,true\r\nb,2,");
  });

  it("quotes cells containing separators, quotes or line breaks", () => {
    expect(toDelimited([["x,y", 'say "hi"', "line\nbreak"]])).toBe('"x,y","say ""hi""","line\nbreak"');
  });

  it("formats dates and supports tabs", () => {
    expect(toDelimited([[new Date("2024-01-02T00:00:00Z"), "a\tb"]], "\t")).toBe('2024-01-02\t"a\tb"');
  });
});
