import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject, from } from 'rxjs';
import { SupabaseService } from '../../../services/supabase.service';
import { DataTableComponent, TableConfig } from '../shared/data-table/data-table.component';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../shared/services/translation.service';
import { AdminNotificationsService } from '../shared/services/admin-notifications.service';

interface UserWishlistSummary {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    itemCount: number;
    lastUpdated: string;
}

interface WishlistItemDetail {
    id: string;
    productId: string;
    productName: string;
    productPrice: number;
    productImage: string;
    addedAt: string;
}

@Component({
    selector: 'app-admin-wishlist',
    standalone: true,
    imports: [CommonModule, DataTableComponent, TranslatePipe],
    templateUrl: './admin-wishlist.component.html',
    styleUrls: ['./admin-wishlist.component.scss']
})
export class AdminWishlistComponent implements OnInit {
    private supabaseService = inject(SupabaseService);
    private router = inject(Router);
    private title = inject(Title);
    private translationService = inject(TranslationService);
    private notificationsService = inject(AdminNotificationsService);

    private userWishlistsSubject = new BehaviorSubject<UserWishlistSummary[]>([]);
    private wishlistItemsSubject = new BehaviorSubject<WishlistItemDetail[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(true);

    userWishlists$ = this.userWishlistsSubject.asObservable();
    wishlistItems$ = this.wishlistItemsSubject.asObservable();
    loading$ = this.loadingSubject.asObservable();

    selectedUserWishlist: UserWishlistSummary | null = null;

    tableConfig!: TableConfig;

    ngOnInit(): void {
        this.initializeTableConfig();
        this.title.setTitle(this.translationService.translate('adminWishlist.title') + ' Management - Solar Shop Admin');
        this.loadUserWishlists();

        // Mark wishlists section as viewed to clear notification badge
        this.notificationsService.markSectionAsViewed('wishlists');
    }

    private initializeTableConfig(): void {
        this.tableConfig = {
            columns: [
                {
                    key: 'userName',
                    label: this.translationService.translate('adminWishlist.userName'),
                    type: 'text',
                    sortable: true,
                    searchable: true
                },
                {
                    key: 'userEmail',
                    label: this.translationService.translate('adminWishlist.userEmail'),
                    type: 'text',
                    sortable: true,
                    searchable: true
                },
                {
                    key: 'itemCount',
                    label: this.translationService.translate('adminWishlist.itemCount'),
                    type: 'number',
                    sortable: true
                },
                {
                    key: 'lastUpdated',
                    label: this.translationService.translate('adminWishlist.lastUpdated'),
                    type: 'date',
                    sortable: true
                }
            ],
            actions: [
                {
                    label: this.translationService.translate('adminWishlist.viewDetails'),
                    icon: 'eye',
                    action: 'details',
                    class: 'text-blue-600 hover:text-blue-900'
                },
                {
                    label: this.translationService.translate('adminWishlist.deleteAll'),
                    icon: 'trash2',
                    action: 'deleteAll',
                    class: 'text-red-600 hover:text-red-900'
                }
            ],
            searchable: true,
            sortable: true,
            paginated: true,
            pageSize: 20,
            allowCsvImport: false,
            allowExport: true,
            rowClickable: true
        };
    }

    onTableAction(event: { action: string, item: UserWishlistSummary }): void {
        const { action, item } = event;

        switch (action) {
            case 'details':
                this.viewWishlistDetails(item);
                break;
            case 'delete':
                this.deleteUserWishlist(item);
                break;
        }
    }

    onRowClick(item: UserWishlistSummary): void {
        this.viewWishlistDetails(item);
    }

    private async loadUserWishlists(): Promise<void> {
        this.loadingSubject.next(true);

        try {
            // Get all wishlist items using direct client call
            const { data: wishlistData, error: wishlistError } = await this.supabaseService.client
                .from('wishlist')
                .select('*');

            if (wishlistError) {
                throw wishlistError;
            }

            if (!wishlistData || wishlistData.length === 0) {
                this.userWishlistsSubject.next([]);
                return;
            }

            // Get all users
            const users = await this.supabaseService.getTable('profiles');

            // Group wishlist items by user
            const userWishlistMap = new Map<string, any[]>();

            wishlistData.forEach((item: any) => {
                if (!userWishlistMap.has(item.user_id)) {
                    userWishlistMap.set(item.user_id, []);
                }
                userWishlistMap.get(item.user_id)!.push(item);
            });

            // Create summary data
            const summaries: UserWishlistSummary[] = [];

            userWishlistMap.forEach((items, userId) => {
                const user = users?.find((u: any) => u.user_id === userId);

                if (user) {
                    const lastUpdated = items.reduce((latest, current) => {
                        const currentDate = new Date(current.updated_at || current.created_at);
                        const latestDate = new Date(latest);
                        return currentDate > latestDate ? current.updated_at || current.created_at : latest;
                    }, items[0].created_at);

                    summaries.push({
                        id: `user_${userId}`,
                        userId: userId,
                        userName: user.first_name && user.last_name
                            ? `${user.first_name} ${user.last_name}`
                            : user.full_name || 'Unknown User',
                        userEmail: user.full_name || 'No email',
                        itemCount: items.length,
                        lastUpdated: lastUpdated
                    });
                }
            });

            // Sort by item count (descending)
            summaries.sort((a, b) => b.itemCount - a.itemCount);

            this.userWishlistsSubject.next(summaries);
        } catch (error) {
            console.error('Error loading user wishlists:', error);
            this.userWishlistsSubject.next([]);
        } finally {
            this.loadingSubject.next(false);
        }
    }

    private async viewWishlistDetails(userSummary: UserWishlistSummary): Promise<void> {
        this.selectedUserWishlist = userSummary;

        try {
            // Get wishlist items for this user using direct client call
            const { data: wishlistData, error: wishlistError } = await this.supabaseService.client
                .from('wishlist')
                .select('*')
                .eq('user_id', userSummary.userId);

            if (wishlistError) {
                throw wishlistError;
            }

            if (!wishlistData || wishlistData.length === 0) {
                this.wishlistItemsSubject.next([]);
                return;
            }

            // Load product details for each wishlist item
            const itemDetails: WishlistItemDetail[] = [];

            for (const wishlistItem of wishlistData) {
                try {
                    const products = await this.supabaseService.getTable('products', {
                        id: wishlistItem.product_id
                    });

                    const product = products && products.length > 0 ? products[0] : null;

                    if (product) {
                        // Get the first image from the images array
                        const firstImage = product.images && product.images.length > 0 ? product.images[0] : null;

                        itemDetails.push({
                            id: wishlistItem.id,
                            productId: product.id,
                            productName: product.name || 'Unknown Product',
                            productPrice: product.price || 0,
                            productImage: firstImage?.url || '',
                            addedAt: wishlistItem.created_at
                        });
                    }
                } catch (productError) {
                    console.warn('Could not load product details for:', wishlistItem.product_id);
                    // Add item even if product details couldn't be loaded
                    itemDetails.push({
                        id: wishlistItem.id,
                        productId: wishlistItem.product_id,
                        productName: 'Product not found',
                        productPrice: 0,
                        productImage: '',
                        addedAt: wishlistItem.created_at
                    });
                }
            }

            this.wishlistItemsSubject.next(itemDetails);
        } catch (error) {
            console.error('Error loading wishlist details:', error);
            this.wishlistItemsSubject.next([]);
        }
    }

    closeModal(): void {
        this.selectedUserWishlist = null;
        this.wishlistItemsSubject.next([]);
    }

    viewProduct(productId: string): void {
        this.router.navigate(['/admin/proizvodi/uredi', productId]);
    }

    async removeFromWishlist(wishlistItemId: string): Promise<void> {
        if (!confirm('Are you sure you want to remove this item from the wishlist?')) {
            return;
        }

        try {
            const { error } = await this.supabaseService.client
                .from('wishlist')
                .delete()
                .eq('id', wishlistItemId);

            if (error) {
                throw error;
            }

            // Refresh the current wishlist items
            if (this.selectedUserWishlist) {
                await this.viewWishlistDetails(this.selectedUserWishlist);

                // Update the summary count
                this.selectedUserWishlist.itemCount--;

                // Refresh the main list
                await this.loadUserWishlists();
            }

            alert('Item removed from wishlist successfully');
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            alert('Error removing item from wishlist');
        }
    }

    private async deleteUserWishlist(userSummary: UserWishlistSummary): Promise<void> {
        if (!confirm(`Are you sure you want to delete all wishlist items for ${userSummary.userName}? This action cannot be undone.`)) {
            return;
        }

        try {
            // Delete all wishlist items for this user using direct client call
            const { error } = await this.supabaseService.client
                .from('wishlist')
                .delete()
                .eq('user_id', userSummary.userId);

            if (error) {
                throw error;
            }

            // Close modal if it's open for this user
            if (this.selectedUserWishlist?.userId === userSummary.userId) {
                this.closeModal();
            }

            // Refresh the list
            await this.loadUserWishlists();

            alert(`All wishlist items deleted for ${userSummary.userName}`);
        } catch (error) {
            console.error('Error deleting user wishlist:', error);
            alert('Error deleting wishlist');
        }
    }

    formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
} 