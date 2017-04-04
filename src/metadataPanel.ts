import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";
import TextField from "material-ui/TextField";
import { createElement as __, DOM as _ } from "react";
import { Metadata_t, metadataFields } from "./metadata";

const customContentStyle = {
    width: "90%",
    maxWidth: "none",
};

export type MetaDataPanelStyle_t = {
    style?: any,
    headerStyle?: any,
    contentStyle?: any,
    button?: any,
};

export type MetaDataPanel_t = {
    allowEdition: boolean,
    editionMode: boolean,
    fields: Metadata_t[],
    onEdit: () => void,
    onSave: (fields: Metadata_t[]) => void,
    groups?: MetaDataPanelGroupInfo_t,
};

export type MetaDataPanelGroup_t = {
    label: string,
    id: string,
    expanded: boolean,
    order: number,
};
export type MetaDataPanelGroupInfo_t = {
    groups: MetaDataPanelGroup_t[],
    itemToGroup: { [id: string]: string },
};

export function MetaDataPanel({allowEdition, editionMode, fields, onEdit, onSave, groups}: MetaDataPanel_t, style?: MetaDataPanelStyle_t) {
    return _.div({ className: "metadata" }, [
        allowEdition ? _.div({ className: "metadata-header" }, [
            __(FlatButton, {
                label: editionMode ? "Save" : "Edit", primary: true, keyboardFocused: true,
                onTouchTap: () => editionMode ? onSave(fields) : onEdit(), style: (style && style.button) ? style.button : {},
            }),
        ]) : _.div({ className: "metadata-header" }),
        _.div({ className: "metadata-content" + (editionMode ? " edited" : ""), style: style && style.contentStyle ? style.contentStyle : {} }, metadataFields(fields, editionMode, groups)),
    ],
    );

}
