import { createActionGroup, emptyProps } from '@ngrx/store';

export const NavbarActions = createActionGroup({
    source: 'Navbar',
    events: {
        'Initialize Navbar': emptyProps(),
        'Toggle Mobile Menu': emptyProps(),
        'Toggle Language': emptyProps(),
    },
}); 