import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BlogState } from './blog.state';

export const selectBlogState = createFeatureSelector<BlogState>('blog');

export const selectBlogPosts = createSelector(
    selectBlogState,
    (state: BlogState) => state.posts
);

export const selectIsLoading = createSelector(
    selectBlogState,
    (state: BlogState) => state.isLoading
);

export const selectError = createSelector(
    selectBlogState,
    (state: BlogState) => state.error
);

export const selectSelectedPostId = createSelector(
    selectBlogState,
    (state: BlogState) => state.selectedPostId
);

export const selectSelectedPost = createSelector(
    selectBlogState,
    (state: BlogState) => state.posts.find(post => post.id === state.selectedPostId)
);

export const selectFilteredCategory = createSelector(
    selectBlogState,
    (state: BlogState) => state.filteredCategory
);

export const selectSearchQuery = createSelector(
    selectBlogState,
    (state: BlogState) => state.searchQuery
);

export const selectFilteredPosts = createSelector(
    selectBlogPosts,
    selectFilteredCategory,
    selectSearchQuery,
    (posts, category, searchQuery) => {
        let filteredPosts = posts;

        if (category) {
            filteredPosts = filteredPosts.filter(post => post.category === category);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredPosts = filteredPosts.filter(post =>
                post.title.toLowerCase().includes(query) ||
                post.excerpt.toLowerCase().includes(query) ||
                post.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        return filteredPosts;
    }
);

export const selectCategories = createSelector(
    selectBlogPosts,
    (posts) => {
        const categories = posts.map(post => post.category);
        return [...new Set(categories)].sort();
    }
); 