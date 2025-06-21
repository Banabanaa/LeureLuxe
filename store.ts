import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/sanity.types';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface StoreState {
  // User-specific data stores
  userCarts: Record<string, CartItem[]>;
  userWishlists: Record<string, Product[]>;
  currentUserId: string | null;
  
  // User management
  setCurrentUser: (userId: string | null) => void;
  migrateGuestToUser: (userId: string) => void;
  
  // Cart actions
  addToCart: (product: Product) => void;
  deleteCartProduct: (productId: string) => void;
  resetCart: () => void;
  getGroupedItems: () => { product: Product; quantity: number }[];
  getItemCount: (productId: string) => number;
  getSubTotalPrice: () => number;
  getTotalPrice: () => number;
  
  // Wishlist actions
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  resetWishlist: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      userCarts: {},
      userWishlists: {},
      currentUserId: null,
      
      // User management
      setCurrentUser: (userId) => set({ currentUserId: userId }),
      
      migrateGuestToUser: (userId) => {
        const { currentUserId, userCarts, userWishlists } = get();
        
        if (currentUserId?.startsWith('guest-')) {
          set({
            currentUserId: userId,
            userCarts: {
              ...userCarts,
              [userId]: userCarts[currentUserId] || []
            },
            userWishlists: {
              ...userWishlists,
              [userId]: userWishlists[currentUserId] || []
            }
          });
        }
      },
      
      // Cart actions
      addToCart: (product) => {
        const { currentUserId, userCarts } = get();
        if (!currentUserId) return;
        
        const currentCart = userCarts[currentUserId] || [];
        const existingItem = currentCart.find(item => item.product._id === product._id);
        
        set({
          userCarts: {
            ...userCarts,
            [currentUserId]: existingItem
              ? currentCart.map(item =>
                  item.product._id === product._id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
                )
              : [...currentCart, { product, quantity: 1 }]
          }
        });
      },
      
      deleteCartProduct: (productId) => {
        const { currentUserId, userCarts } = get();
        if (!currentUserId) return;
        
        set({
          userCarts: {
            ...userCarts,
            [currentUserId]: (userCarts[currentUserId] || []).filter(
              item => item.product._id !== productId
            )
          }
        });
      },
      
      resetCart: () => {
        const { currentUserId, userCarts } = get();
        if (!currentUserId) return;
        
        set({
          userCarts: {
            ...userCarts,
            [currentUserId]: []
          }
        });
      },
      
      getGroupedItems: () => {
        const { currentUserId, userCarts } = get();
        if (!currentUserId) return [];
        
        return (userCarts[currentUserId] || []).map(item => ({
          product: item.product,
          quantity: item.quantity
        }));
      },
      
      getItemCount: (productId) => {
        const { currentUserId, userCarts } = get();
        if (!currentUserId) return 0;
        
        const item = (userCarts[currentUserId] || []).find(
          item => item.product._id === productId
        );
        return item ? item.quantity : 0;
      },
      
      getSubTotalPrice: () => {
        const { currentUserId, userCarts } = get();
        if (!currentUserId) return 0;
        
        return (userCarts[currentUserId] || []).reduce(
          (total, item) => total + (item.product.price || 0) * item.quantity,
          0
        );
      },
      
      getTotalPrice: () => {
        // Add discount logic here if needed
        return get().getSubTotalPrice();
      },
      
      // Wishlist actions
      addToWishlist: (product) => {
        const { currentUserId, userWishlists } = get();
        if (!currentUserId) return;
        
        const currentWishlist = userWishlists[currentUserId] || [];
        
        set({
          userWishlists: {
            ...userWishlists,
            [currentUserId]: currentWishlist.some(p => p._id === product._id)
              ? currentWishlist
              : [...currentWishlist, product]
          }
        });
      },
      
      removeFromWishlist: (productId) => {
        const { currentUserId, userWishlists } = get();
        if (!currentUserId) return;
        
        set({
          userWishlists: {
            ...userWishlists,
            [currentUserId]: (userWishlists[currentUserId] || []).filter(
              product => product._id !== productId
            )
          }
        });
      },
      
      resetWishlist: () => {
        const { currentUserId, userWishlists } = get();
        if (!currentUserId) return;
        
        set({
          userWishlists: {
            ...userWishlists,
            [currentUserId]: []
          }
        });
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        userCarts: state.userCarts,
        userWishlists: state.userWishlists,
        currentUserId: state.currentUserId
      }),
      onRehydrateStorage: () => (state) => {
        // Handle rehydration logic if needed
        if (state && !state.currentUserId) {
          state.setCurrentUser(`guest-${Math.random().toString(36).substring(2, 15)}`);
        }
      }
    }
  )
);

export default useStore;