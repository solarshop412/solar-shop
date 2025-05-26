import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { SustainabilityFeature } from '../sustainability.component';

export const SustainabilityActions = createActionGroup({
    source: 'Sustainability',
    events: {
        'Load Features': emptyProps(),
        'Load Features Success': props<{ features: SustainabilityFeature[] }>(),
        'Load Features Failure': props<{ error: string }>(),
    },
}); 