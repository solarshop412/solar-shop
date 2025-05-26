import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { BlogPost } from '../blog.component';

export const BlogActions = createActionGroup({
    source: 'Blog',
    events: {
        'Load Blog Posts': emptyProps(),
        'Load Blog Posts Success': props<{ posts: BlogPost[] }>(),
        'Load Blog Posts Failure': props<{ error: string }>(),
        'Select Post': props<{ postId: string }>(),
        'Filter By Category': props<{ category: string }>(),
        'Search Posts': props<{ query: string }>(),
    },
}); 