import { createActionGroup, emptyProps, props } from '@ngrx/store';

export const HeroActions = createActionGroup({
    source: 'Hero',
    events: {
        'Initialize Hero': emptyProps(),
        'Explore Products': emptyProps(),
        'Set Loading': props<{ isLoading: boolean }>(),
    },
}); 