import * as moment from "moment";

export const DATE_ON = "on";
export const DATE_FROM = "from";
export const DATE_UNTIL = "until";
export const DATE_TODAY = "today";
export const DATE_LASTWEEK = "last week";
export const DATE_LASTMONTH = "last month";
export const DATE_LASTYEAR = "last year";
export const DATE_RANGE_PICK = "pick a date";
export interface IDateRangeTranslator {
    translateDate(date: Date): string;
    translateWord(word: string): string;
}
export class MomentDateRangeTranslator implements IDateRangeTranslator {
    constructor(public translateWord: (word: string) => string) {

    }
    public translateDate(date: Date) {
        return moment(date).format("Y/M/D");
    }
}
export interface IDateRange {
    From(): "MIN" | Date;
    To(): "MAX" | Date;
    ToHumanReadableString(translator: IDateRangeTranslator): string;
    ToJSON(): string;
    TYPE: string;
}
export class SimpleDateRange implements IDateRange {
    public static TYPE = "SimpleDateRange";
    public TYPE = SimpleDateRange.TYPE;
    public ToJSON() {
        return JSON.stringify({TYPE: this.TYPE, from: JSON.stringify(this.from), to: JSON.stringify(this.to) });
    }
    public static ParseFromJSON(json: any) {
        return new SimpleDateRange(new Date(json.from), new Date(json.to));
    }
    private arrow = "\u2192";
    public constructor(private from: Date, private to: Date) {
    }
    public ToHumanReadableString(translator: IDateRangeTranslator) {
        const fromS = translator.translateDate(this.from);
        const toS = translator.translateDate(this.to);
        if (fromS === toS) {
            return fromS;
        }
        return (fromS + " " + this.arrow + " " + toS);
    }
    public From() {
        return this.from;
    }
    public To() {
        return this.to;
    }
}
const DAYINMS: number = 24 * 3600 * 1000;
export function addMonths(d: Date, months: number): Date {
    const result = new Date(d.valueOf());
    /*Overflow OK => https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/setMonth*/
    result.setMonth(result.getMonth() + months);
    return result;
}

export function addDays(d: Date, days: number): Date {
    return new Date(d.getTime() + (days * this.DAYINMS));
}

export class UntilDateRange implements IDateRange {
    public static TYPE = "UntilDateRange";
    public TYPE = UntilDateRange.TYPE;
    public ToJSON() {
        return JSON.stringify(this);
    }
    public static ParseFromJSON(json: any) {
        return new UntilDateRange(new Date(json.to));
    }
    constructor(public to: Date) {
    }
    public From(): "MIN" {
        return "MIN";
    }
    public To() {
        return this.to;
    }
    public ToHumanReadableString(translator: IDateRangeTranslator): string {
        return translator.translateWord(DATE_FROM) + " " + translator.translateDate(this.to);
    }
}
export class FromDateRange implements IDateRange {
    public static TYPE = "FromDateRange";
    public TYPE = FromDateRange.TYPE;
    public ToJSON() {
        return JSON.stringify(this);
    }
    public static ParseFromJSON(json: any) {
        return new UntilDateRange(new Date(json.from));
    }

    constructor(public from: Date) {

    }
    public From() {
        return this.from;
    }
    public To(): "MAX" {
        return "MAX";
    }
    public ToHumanReadableString(translator: IDateRangeTranslator): string {
        return translator.translateWord(DATE_FROM) + " " + translator.translateDate(this.from);
    }
}
export type DateCalculation_t = (date: Date) => Date;

export class LabeledDateRange implements IDateRange {
    public static TYPE = "LabeledDateRange";
    public TYPE = LabeledDateRange.TYPE;
    public ToJSON() {
        return JSON.stringify(this);
    }
    public static ParseFromJSON(json: any): IDateRange {
        return DateRangeSearchables.filter(e => e.label === json.label)[0];
    }
    constructor(public label: string, public fromCalculation: DateCalculation_t, public toCalculation: DateCalculation_t) {
    }
    public From() {
        return this.fromCalculation(new Date());
    }
    public To() {
        return this.toCalculation(new Date());
    }
    public ToHumanReadableString(translator: IDateRangeTranslator): string {
        return translator.translateWord(this.label);
    }
}

export const TODAY_RANGE = new LabeledDateRange(DATE_TODAY, (d) => d, (d) => d);
export const LAST_WEEK_RANGE = new LabeledDateRange(DATE_LASTWEEK, (d) => addDays(d, -7), (d) => d);
export const LAST_MONTH_RANGE = new LabeledDateRange(DATE_LASTMONTH, (d) => addMonths(d, -1), (d) => d);
export const LAST_YEAR_RANGE = new LabeledDateRange(DATE_LASTYEAR, (d) => addMonths(d, -12), (d) => d);
export const DateRangeSearchables = [TODAY_RANGE, LAST_WEEK_RANGE, LAST_MONTH_RANGE, LAST_YEAR_RANGE];
function toParsable(TYPE: string, ParseFromJSON: (json: any) => IDateRange) {
    return { TYPE, ParseFromJSON };
}
const dateRangeParsables = [LabeledDateRange, FromDateRange, UntilDateRange, SimpleDateRange].map(t => toParsable(t.TYPE, t.ParseFromJSON));
export function ParseDateRangeJSON(json: any) {
    for (const dateRangeParsable of dateRangeParsables) {
        if (dateRangeParsable.TYPE === json.TYPE) {
            return dateRangeParsable.ParseFromJSON(json);
        }
    }
    throw new Error("Type of daterange not parsable");

}
