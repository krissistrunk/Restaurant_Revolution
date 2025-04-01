import { useState } from "react";
import { MenuItem } from "@/types";
import { useCart } from "@/hooks/useCart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MenuItemCardProps {
  menuItem: MenuItem;
}

const MenuItemCard = ({ menuItem }: MenuItemCardProps) => {
  const { addToCart } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<Record<string, boolean>>({});

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

  return (
    <>
      <div className="bg-white rounded-lg shadow p-4 flex">
        <img
          src={menuItem.imageUrl}
          alt={menuItem.name}
          className="w-24 h-24 object-cover rounded-lg"
        />
        <div className="ml-4 flex-grow">
          <div className="flex justify-between">
            <h4 className="font-heading font-semibold">{menuItem.name}</h4>
            <span className="font-accent font-semibold text-primary">
              ${menuItem.price.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{menuItem.description}</p>
          <div className="flex justify-between items-center mt-2">
            <div className="flex space-x-1">
              {menuItem.isVegetarian && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Vegetarian
                </span>
              )}
              {menuItem.isGlutenFree && (
                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                  Gluten Free
                </span>
              )}
              {menuItem.isSeafood && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                  Seafood
                </span>
              )}
              {menuItem.isPopular && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  Popular
                </span>
              )}
            </div>
            <button
              className="bg-primary text-white rounded-full p-1"
              onClick={handleAddToCart}
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
            </button>
          </div>
        </div>
      </div>

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
    </>
  );
};

export default MenuItemCard;
