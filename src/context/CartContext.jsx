import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (vehicle, variant, modelId) => {
    // Check if vehicle already in cart
    const existingIndex = cartItems.findIndex(
      (item) => item.vehicle.id === vehicle.id
    );

    if (existingIndex >= 0) {
      // Update quantity if already exists
      const updatedCart = [...cartItems];
      updatedCart[existingIndex].quantity += 1;
      setCartItems(updatedCart);
      return { success: true, message: "Đã tăng số lượng xe trong giỏ hàng" };
    } else {
      // Add new item
      const newItem = {
        vehicle,
        variant,
        modelId,
        quantity: 1,
        discountPercent: 0,
        note: "",
      };
      setCartItems([...cartItems, newItem]);
      return { success: true, message: "Đã thêm xe vào giỏ hàng" };
    }
  };

  const removeFromCart = (vehicleId) => {
    setCartItems(cartItems.filter((item) => item.vehicle.id !== vehicleId));
  };

  const updateCartItem = (vehicleId, updates) => {
    setCartItems(
      cartItems.map((item) =>
        item.vehicle.id === vehicleId ? { ...item, ...updates } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemTotal =
        item.variant.price *
        item.quantity *
        ((100 - item.discountPercent) / 100);
      return total + itemTotal;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        getCartCount,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
