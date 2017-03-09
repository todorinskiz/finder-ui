
import { DOM as _, createElement as __, ReactElement } from 'react';

import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import FontIcon from 'material-ui/FontIcon';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';


export type PageMenuItem_t = {
    key?: string,
    label: string,
    iconName?: string,  // font-awesome name.
    children?: PageMenuItem_t[]  // recursive possible.
};

export type PageMenu_t = {
    menuItems: PageMenuItem_t[],
    onMenuSelected: (menuIdx: number, key? : string) => void
};

type MenuItemWrapper_t = {
    idx : number,
    menuItem: PageMenuItem_t,
    onMenuSelected: (menuIdx: number, key? : string) => void
};

function MenuItemWrapper({idx, menuItem, onMenuSelected} : MenuItemWrapper_t) : ReactElement<any> {
    return __(MenuItem, { 
        key: menuItem.key, 
        leftIcon: menuItem.iconName !== undefined ? __(FontIcon, {className:`fa ${menuItem.iconName}`}) : undefined,
        rightIcon: menuItem.children !== undefined &&  menuItem.children.length > 0 ?  __(ArrowDropRight) : undefined,
        primaryText: menuItem.label, 
        onTouchTap: () => onMenuSelected(idx, menuItem.key),
        menuItems: menuItem.children !== undefined ?  menuItem.children.map((mi, i) => MenuItemWrapper({idx: (idx*100)+i, menuItem: mi, onMenuSelected: onMenuSelected})) : []
    });
}

export function PageMenu({menuItems, onMenuSelected} : PageMenu_t) : ReactElement<any> {
    return __(IconMenu, {
            iconButtonElement: __(IconButton, {}, __(MoreVertIcon, { color: 'white' })),
            targetOrigin: { horizontal: 'left', vertical: 'top' },
            anchorOrigin: { horizontal: 'left', vertical: 'top' },
        }, menuItems.map((m, i) => MenuItemWrapper({idx: i, menuItem: m, onMenuSelected: onMenuSelected })
    )); 
}

