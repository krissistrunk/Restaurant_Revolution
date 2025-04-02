import { useState, useRef } from "react";
import { MenuItem } from "@/types";
import { useCart } from "@/hooks/useCart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

interface MenuItemCardProps {
  menuItem: MenuItem;
}

const MenuItemCard = ({ menuItem }: MenuItemCardProps) => {
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, boolean>>({});
  const [location, navigate] = useLocation();

  const handleAddToCart = () => {
    if (menuItem.modifiers && menuItem.modifiers.length > 0) {
      setIsModalOpen(true);
    } else {
      addToCart({
        menuItem,
        quantity: 1,
      });
    }
  };

  const handleAddToCartWithModifiers = () => {
    addToCart({
      menuItem,
      quantity,
      notes,
      selectedModifiers,
    });
    setIsModalOpen(false);
    setNotes("");
    setQuantity(1);
    setSelectedModifiers({});
  };

  const toggleModifier = (modifierName: string) => {
    setSelectedModifiers({
      ...selectedModifiers,
      [modifierName]: !selectedModifiers[modifierName],
    });
  };

  const handleShowDetails = () => {
    setIsDetailModalOpen(true);
  };

  return (
    <>
      <motion.div 
        className="bg-white rounded-lg shadow p-4 flex cursor-pointer relative overflow-hidden" 
        onClick={handleShowDetails}
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 17
        }}
      >
        {/* Add a subtle gradient overlay on hover */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 z-0"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />

        <motion.img
          src={menuItem.imageUrl}
          alt={menuItem.name}
          className="w-24 h-24 object-cover rounded-lg relative z-10"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        />
        
        <div className="ml-4 flex-grow relative z-10">
          <div className="flex justify-between">
            <motion.h4 
              className="font-heading font-semibold"
              whileHover={{ color: "var(--primary)" }}
            >
              {menuItem.name}
            </motion.h4>
            <span className="font-accent font-semibold text-primary">
              ${menuItem.price.toFixed(2)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mt-1">{menuItem.description}</p>
          
          <div className="flex justify-between items-center mt-2">
            <div className="flex flex-wrap gap-1">
              {menuItem.isVegetarian && (
                <motion.span 
                  className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                  whileHover={{ scale: 1.05, backgroundColor: "rgb(187, 247, 208)" }}
                >
                  Vegetarian
                </motion.span>
              )}
              {menuItem.isGlutenFree && (
                <motion.span 
                  className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded"
                  whileHover={{ scale: 1.05, backgroundColor: "rgb(254, 240, 138)" }}
                >
                  Gluten Free
                </motion.span>
              )}
              {menuItem.isSeafood && (
                <motion.span 
                  className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded"
                  whileHover={{ scale: 1.05, backgroundColor: "rgb(254, 205, 211)" }}
                >
                  Seafood
                </motion.span>
              )}
              {menuItem.isPopular && (
                <motion.span 
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  whileHover={{ scale: 1.05, backgroundColor: "rgb(191, 219, 254)" }}
                >
                  Popular
                </motion.span>
              )}
            </div>
            
            <motion.button
              className="bg-primary text-white rounded-full p-1 z-10 relative"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Customization Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customize Your Order</DialogTitle>
            <DialogDescription>{menuItem.name}</DialogDescription>
          </DialogHeader>
          
          {menuItem.modifiers && menuItem.modifiers.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Options</h3>
              <div className="space-y-2">
                {menuItem.modifiers.map((modifier) => (
                  <div key={modifier.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`modifier-${modifier.id}`}
                      checked={!!selectedModifiers[modifier.name]}
                      onCheckedChange={() => toggleModifier(modifier.name)}
                    />
                    <Label htmlFor={`modifier-${modifier.id}`} className="flex-1">
                      {modifier.name}
                    </Label>
                    {modifier.price > 0 && (
                      <span className="text-sm text-gray-600">
                        +${modifier.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions</Label>
            <Textarea
              id="notes"
              placeholder="E.g., No onions, extra sauce..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Quantity</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                disabled={quantity <= 1}
                onClick={() => setQuantity(quantity - 1)}
              >
                -
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddToCartWithModifiers}>
              Add to Cart - ${(menuItem.price * quantity).toFixed(2)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="border-b pb-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <DialogTitle className="text-xl">{menuItem.name}</DialogTitle>
              </div>
              <DialogDescription className="text-sm text-gray-500">
                {menuItem.categoryId && `Category ID: ${menuItem.categoryId}`}
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <img
                src={menuItem.imageUrl}
                alt={`${menuItem.name} - main view`}
                className="w-full h-48 rounded-lg object-cover"
              />
              <img
                src={menuItem.imageUrl}
                alt={`${menuItem.name} - secondary view`}
                className="w-full h-48 rounded-lg object-cover"
              />
              <div className="col-span-2 flex justify-center">
                <button 
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-6 py-2 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back to Menu
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-2">Description</h3>
                <p className="text-gray-600">{menuItem.description}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-lg mb-2">Price</h3>
                <p className="text-2xl font-accent text-primary">${menuItem.price.toFixed(2)}</p>
              </div>
              
              {menuItem.allergens && menuItem.allergens.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-lg mb-2">Allergens</h3>
                  <div className="flex flex-wrap gap-2">
                    {menuItem.allergens.map((allergen, index) => (
                      <span key={index} className="bg-red-50 text-red-700 px-2 py-1 rounded text-sm">
                        {allergen}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="font-medium text-lg">Dietary Information</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {menuItem.isVegetarian && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      Vegetarian
                    </span>
                  )}
                  {menuItem.isGlutenFree && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                      Gluten Free
                    </span>
                  )}
                  {menuItem.isSeafood && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                      Contains Seafood
                    </span>
                  )}
                  {!menuItem.isVegetarian && !menuItem.isGlutenFree && !menuItem.isSeafood && (
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                      No specific dietary information
                    </span>
                  )}
                </div>
              </div>
              
              {menuItem.nutritionInfo && (
                <div>
                  <h3 className="font-medium text-lg">Nutrition Information</h3>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {Object.entries(menuItem.nutritionInfo).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-2 rounded">
                        <span className="font-medium">{key}: </span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {menuItem.modifiers && menuItem.modifiers.length > 0 && (
                <div>
                  <h3 className="font-medium text-lg">Available Modifiers</h3>
                  <div className="space-y-2 mt-1">
                    {menuItem.modifiers.map((modifier) => (
                      <div key={modifier.id} className="flex justify-between items-center">
                        <span>{modifier.name}</span>
                        {modifier.price > 0 && (
                          <span className="text-gray-600">+${modifier.price.toFixed(2)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
            <Button onClick={handleAddToCart}>
              Add to Cart - ${menuItem.price.toFixed(2)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MenuItemCard;
