import { Editor } from "codemirror";
const Flatpickr = require("flatpickr");
import "flatpickr/dist/themes/material_blue.css";
import { insertHint } from "./codemirror";

export class DatepickerAutocomplete {
    public constructor(private cm: () => Editor, private dateToStr: (d: Date) => string) {

    }

    public render(element: HTMLElement, self: any, currentValue: Date) {
        let fp = new Flatpickr(element, {
            inline: true,
            static: true,
            defaultDate: currentValue || new Date(),
            onClose: (selectedDate: Date[]) => this.pick(selectedDate[0], self),
        });

        setTimeout(() => { (<any>element).hintId = null; }, 0);
    }

    private pick(date: Date, hints: any) {
        insertHint(this.cm(), hints, {text: this.dateToStr(date)});
    }
}
