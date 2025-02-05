
import { createElement as __ } from "react";
import * as _ from "react-dom-factories";
import { Fixture, simulateEvent } from "./testUtils";

import { PageMenu, PageMenu_t } from "./pageMenu";

import { configure } from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

// tslint:disable-next-line:no-var-requires
const jasmineEnzyme = require("jasmine-enzyme"); // no typings for jasmine-engine => require instead of import.

// TODO: Can not be tested because enzyme does not support traversing a react portal.
xdescribe("PageMenu component tests", () => {

    beforeEach(() => {
        jasmineEnzyme();
    });

    it("should display all menu items (labels) when clicking on icon", () => {
        const props: PageMenu_t = {
            menuItems: [{
                label: "M1",
            }, {
                label: "M2",
            }, {
                label: "M3",
            }],
            onMenuSelected: (menuIdx: number, key?: string) => { },
        };

        const wrapper = Fixture(PageMenu(props));

        const layer = wrapper.find("Popover RenderToLayer");
        const layerWrapper = Fixture((<any>layer).prop("render")()); // render the popup menu layer content !

        expect(layerWrapper.find("MenuItem").length).toBe(props.menuItems.length);

        for (let i = 0; i < props.menuItems.length; i++) {
            expect(layerWrapper.find("MenuItem").at(i).text()).toBe(props.menuItems[i].label);
        }

    });

    it("should call the callback function corresponding to the menu item clicked", () => {

        const props: PageMenu_t = {
            menuItems: [{
                label: "M1",
            },
            {
                label: "M2",
            }, {
                label: "M3",
            }],
            onMenuSelected: (menuIdx: number, key?: string) => { },
        };

        const clickedIndex = 1;

        spyOn(props, "onMenuSelected");

        const wrapper = Fixture(PageMenu(props));

        const layer = wrapper.find("Popover RenderToLayer");
        const layerWrapper = Fixture((<any>layer).prop("render")()); // render the popup menu layer content !

        simulateEvent(layerWrapper.find("MenuItem").at(clickedIndex).find("EnhancedButton"), "click");

        expect(props.onMenuSelected).toHaveBeenCalledWith(clickedIndex, undefined);

    });

});
