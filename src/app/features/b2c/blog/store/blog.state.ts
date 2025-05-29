import { BlogPost } from '../../../../shared/models/blog.model';

export interface BlogState {
    posts: BlogPost[];
    selectedPostId: string | null;
    filteredCategory: string | null;
    searchQuery: string | null;
    isLoading: boolean;
    error: string | null;
}

export const initialBlogState: BlogState = {
    posts: [],
    selectedPostId: null,
    filteredCategory: null,
    searchQuery: null,
    isLoading: false,
    error: null,
}; 