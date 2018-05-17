import "core-js";
import "es6-shim";
import {
    DateFillinValueMatch,
    DateSearchable,
    dateWords,
    EnumPropertySearchable,
    ReferenceSearchableQueryElement,
    SimpleSearchQueryElementValueMatch,
    TextSearchable,
} from "./searchables";
import { DatePropertySearchQueryElement, EnumPropertySearchQueryElement } from "./searchquery";

// tslint:disable-next-line:no-var-requires
const jasmineEnzyme = require("jasmine-enzyme"); // no typings for jasmine-engine => require instead of import.
const debug: any = require("debug");

export function DummyISearchQuery(name: string) {
    return { HumanReadableText: () => Promise.resolve(name) };
}

describe("ReferenceSearchableQueryElement", () => {
    it("should show its suggestion when the name is partially typed", (done) => {
        const SOT = new ReferenceSearchableQueryElement("testName", DummyISearchQuery("referenceQueryName"));
        SOT.getPartiallyMatchingAutocompleteListElements("testN", "").then(matches => {
            expect(matches.length).toBe(1);
            expect(matches[0].DisplayValue()).toBe("testName");
            expect(matches[0].DisplayKey()).toBe("");
            done();
        });
    });
    it("should match exactly when the name is type correct", (done) => {
        const SOT = new ReferenceSearchableQueryElement("testName", DummyISearchQuery("referenceQueryName"));
        SOT.MatchKeyValue("", "testName").then(match => {
            expect(match.type).toBe("SimpleSearchQueryElementValueMatch");
            done();
        });
    });
    it("should match exactly when the name its letters are correct but wrongly cased.", (done) => {
        const SOT = new ReferenceSearchableQueryElement("testName", DummyISearchQuery("referenceQueryName"));
        SOT.MatchKeyValue("", "TESTname").then(match => {
            expect(match.type).toBe("SimpleSearchQueryElementValueMatch");
            done();
        });
    });
    it("should not match exactly when the name is only typed partially", (done) => {
        const SOT = new ReferenceSearchableQueryElement("testName", DummyISearchQuery("referenceQueryName"));
        SOT.MatchKeyValue("", "testNam").then(matches => {
            expect(matches.type).toBe("NoResultValueMatch");
            done();
        });
    });
});

export function dummyPropertyService() {
    return {
        translatePropertyKeyDebugDirect: (k: string) => "TRANSLATEKEY" + k,
        translatePropertyValueDebugDirect: (k: string) => "TRANSLATEVALUE" + k,
        translatePropertyKey: (k: string) => Promise.resolve("TRANSLATEKEY" + k),
        translatePropertyValue: (k: string, v: string) => Promise.resolve("TRANSLATEVALUE" + v),
    };
}
export function EnumPropertySearchable12() {
    return new EnumPropertySearchable("testProperty", ["1", "2"], dummyPropertyService());
}
describe("EnumPropertySearchable", () => {
    it("should show all property completions when the key is partially typed", (done) => {
        EnumPropertySearchable12().getPartiallyMatchingAutocompleteListElements("TRANSLATEKEY", "").then(matches => {
            expect(matches.length).toBe(2);
            expect(matches[0].DisplayValue()).toBe("TRANSLATEVALUE1");
            expect(matches[0].DisplayKey()).toBe("TRANSLATEKEYtestProperty");
            done();
        });
    });
    it("should only show the property completions for which the value partially matches", (done) => {
        EnumPropertySearchable12().getPartiallyMatchingAutocompleteListElements("TRANSLATEKEY", "VALUE2").then(matches => {
            expect(matches.length).toBe(1);
            expect(matches[0].DisplayValue()).toBe("TRANSLATEVALUE2");
            expect(matches[0].DisplayKey()).toBe("TRANSLATEKEYtestProperty");
            done();
        });
    });
    it("should match the exact key value translations", (done) => {
        EnumPropertySearchable12().MatchKeyValue("TRANSLATEKEYtestProperty", "TRANSLATEVALUE2").then(match => {
            expect(match.type).toBe("SimpleSearchQueryElementValueMatch");
            const sMatch = (<SimpleSearchQueryElementValueMatch>match);
            expect(sMatch.simpleSearchQueryElement).toBeDefined();
            const sQE = (<EnumPropertySearchQueryElement>sMatch.simpleSearchQueryElement);
            expect(sQE.key).toBe("testProperty");
            expect((<any>sQE).value).toBe("2");
            done();
        });
    });
});
function TextSearchable12() {
    return new TextSearchable("12", (s) => Promise.resolve("Tekst"));
}
describe("TextSearchable", () => {
    it("should match the text partially", (done) => {
        TextSearchable12().getPartiallyMatchingAutocompleteListElements("", "2").then(t => { expect(t.length).toBe(1); done(); });
    });
    it("should not match wrong text", (done) => {
        TextSearchable12().getPartiallyMatchingAutocompleteListElements("", "23").then(t => { expect(t.length).toBe(0); done(); });
    });
    it("should match empty", (done) => {
        TextSearchable12().getPartiallyMatchingAutocompleteListElements("", "").then(t => { expect(t.length).toBe(1); done(); });
    });
    it("should match if key is the translated version of 'text'", (done) => {
        TextSearchable12().getPartiallyMatchingAutocompleteListElements("tekst", "1").then(t => { expect(t.length).toBe(1); done(); });
    });
    it("should not match if key is not translated", (done) => {
        TextSearchable12().getPartiallyMatchingAutocompleteListElements("text", "1").then(t => { expect(t.length).toBe(0); done(); });
    });
    it("should match the exact key value", (done) => {
        TextSearchable12().MatchKeyValue("tekst", "12").then(t => { expect(t.type).toBe("SimpleSearchQueryElementValueMatch"); done(); });
    });
    it("should not match untranslated key", (done) => {
        TextSearchable12().MatchKeyValue("text", "12").then(t => { expect(t.type).toBe("NoResultValueMatch"); done(); });
    });
    it("should not match empty", (done) => {
        TextSearchable12().MatchKeyValue("", "12").then(t => { expect(t.type).toBe("NoResultValueMatch"); done(); });
    });
    it("should not match wrong value", (done) => {
        TextSearchable12().MatchKeyValue("tekst", "122").then(t => { expect(t.type).toBe("NoResultValueMatch"); done(); });
    });
});
function DateSearchableDummy() {
    return new DateSearchable("qname", dummyPropertyService(), (s) => Promise.resolve("TRANSLATED" + s));
}
describe("DateSearchable", () => {
    it("should propose all dateword date values for autocompletion", (done) => {
        const testdummyPropertyService = dummyPropertyService();
        DateSearchableDummy().getPartiallyMatchingAutocompleteListElements("TRANSLATEKEYqname", "").then(s => {
            expect(s.length).toBe(dateWords.length);
            for (let i = 0; i < s.length; i++) {
                expect(s[i].DisplayKey()).toBe(testdummyPropertyService.translatePropertyKeyDebugDirect("qname"));
                expect(s[i].DisplayValue()).toBe("TRANSLATED" + (dateWords[i]));
            }
            done();
        });
    });
    it("should propose all dateword translations that start with last", (done) => {
        const testdummyPropertyService = dummyPropertyService();
        DateSearchableDummy().getPartiallyMatchingAutocompleteListElements("TRANSLATEKEYqname", "RANSLATEDlast").then(s => {
            expect(s.length).toBe(2);
            done();
        });
    });
    it("should match exact on today translated", (done) => {
        const testdummyPropertyService = dummyPropertyService();
        DateSearchableDummy().MatchKeyValue("TRANSLATEKEYqname", "TRANSLATEDtoday").then(match => {
            expect(match.type).toBe("SimpleSearchQueryElementValueMatch");
            const sMatch = (<SimpleSearchQueryElementValueMatch>match);
            expect(sMatch.simpleSearchQueryElement).toBeDefined();
            const sQE = (<DatePropertySearchQueryElement>sMatch.simpleSearchQueryElement);
            expect(sQE.dateRange.From).toBeDefined();
            expect(sQE.dateRange.To).toBeDefined();
            done();
        });
    });
    it("should match exact on until translated", (done) => {
        const testdummyPropertyService = dummyPropertyService();
        DateSearchableDummy().MatchKeyValue("TRANSLATEKEYqname", "TRANSLATEDuntil").then(match => {
            expect(match.type).toBe("DateFillinValueMatch");
            const sMatch = (<DateFillinValueMatch>match);
            const untilToday = sMatch.onFillIn(new Date());
            expect(untilToday.dateRange.From).toBe("MIN");
            expect(untilToday.dateRange.To).toBeDefined();
            done();
        });
    });
});
