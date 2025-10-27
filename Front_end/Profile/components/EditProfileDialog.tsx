import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Card, CardContent } from './ui/card';
import { Separator } from './ui/separator';
import { Plus, Trash2, MapPin, Check } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface SavedAddress {
  id: string;
  label: string;
  address: string;
}

interface UserData {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  savedAddresses: SavedAddress[];
  defaultAddressId: string;
}

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: UserData;
  onSave: (updatedData: Partial<UserData>) => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  userData,
  onSave,
}: EditProfileDialogProps) {
  const [formData, setFormData] = useState({
    fullName: userData.fullName,
    email: userData.email,
    phone: userData.phone,
  });
  const [addresses, setAddresses] = useState<SavedAddress[]>(userData.savedAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState(userData.defaultAddressId);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', address: '' });

  useEffect(() => {
    if (open) {
      setFormData({
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
      });
      setAddresses(userData.savedAddresses);
      setSelectedAddressId(userData.defaultAddressId);
      setShowAddAddress(false);
      setNewAddress({ label: '', address: '' });
    }
  }, [open, userData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      savedAddresses: addresses,
      defaultAddressId: selectedAddressId,
    });
    onOpenChange(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddAddress = () => {
    if (newAddress.label.trim() && newAddress.address.trim()) {
      const newAddr: SavedAddress = {
        id: Date.now().toString(),
        label: newAddress.label,
        address: newAddress.address,
      };
      const updatedAddresses = [...addresses, newAddr];
      setAddresses(updatedAddresses);
      
      // If this is the first address, set it as default
      if (updatedAddresses.length === 1) {
        setSelectedAddressId(newAddr.id);
      }
      
      setNewAddress({ label: '', address: '' });
      setShowAddAddress(false);
    }
  };

  const handleDeleteAddress = (id: string) => {
    const updatedAddresses = addresses.filter((addr) => addr.id !== id);
    setAddresses(updatedAddresses);
    
    // If deleted address was the default, set first available as default
    if (selectedAddressId === id && updatedAddresses.length > 0) {
      setSelectedAddressId(updatedAddresses[0].id);
    } else if (updatedAddresses.length === 0) {
      setSelectedAddressId('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[95vh]">
        <DialogHeader>
          <DialogTitle className="text-orange-500">Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal information and manage your addresses
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ScrollArea className="max-h-[70vh] pr-4">
            <div className="space-y-6 py-4 px-1">
              {/* Personal Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-500">1</span>
                  </div>
                  <h3 className="text-orange-500">Personal Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="border-orange-200 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="border-orange-200 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="border-orange-200 focus:border-orange-500"
                      required
                    />
                  </div>
                  <div className="space-y-2 flex items-end">
                    <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border border-gray-200 w-full">
                      <span className="block">Username: <span className="text-gray-700">{userData.username}</span></span>
                      <span className="text-xs text-gray-400 mt-1 block">Username cannot be changed</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Address Management */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-500">2</span>
                    </div>
                    <h3 className="text-orange-500">Saved Addresses</h3>
                  </div>
                  <Button
                    type="button"
                    onClick={() => setShowAddAddress(!showAddAddress)}
                    variant="outline"
                    size="sm"
                    className="border-orange-500 text-orange-500 hover:bg-orange-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Address
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Select a default shipping address for your orders. You can add multiple addresses and switch between them.
                </p>

                {showAddAddress && (
                  <Card className="border-2 border-orange-300 bg-orange-50 shadow-md">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Plus className="w-5 h-5 text-orange-500" />
                        <h4 className="text-orange-500">Add New Address</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="newAddressLabel">Address Label *</Label>
                          <Input
                            id="newAddressLabel"
                            placeholder="e.g., Home, Work, Office"
                            value={newAddress.label}
                            onChange={(e) =>
                              setNewAddress({ ...newAddress, label: e.target.value })
                            }
                            className="border-orange-200 focus:border-orange-500 bg-white"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="newAddressText">Complete Address *</Label>
                          <Textarea
                            id="newAddressText"
                            placeholder="Street address, apartment/unit, city, state, ZIP code"
                            value={newAddress.address}
                            onChange={(e) =>
                              setNewAddress({ ...newAddress, address: e.target.value })
                            }
                            className="border-orange-200 focus:border-orange-500 bg-white min-h-[60px]"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          type="button"
                          onClick={handleAddAddress}
                          className="bg-orange-500 hover:bg-orange-600"
                          disabled={!newAddress.label.trim() || !newAddress.address.trim()}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Save Address
                        </Button>
                        <Button
                          type="button"
                          onClick={() => {
                            setShowAddAddress(false);
                            setNewAddress({ label: '', address: '' });
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {addresses.length > 0 ? (
                  <RadioGroup
                    value={selectedAddressId}
                    onValueChange={setSelectedAddressId}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <Card
                          key={addr.id}
                          className={`border-2 transition-all cursor-pointer hover:shadow-md ${
                            selectedAddressId === addr.id
                              ? 'border-orange-500 bg-orange-50 shadow-md'
                              : 'border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start gap-3">
                              <RadioGroupItem
                                value={addr.id}
                                id={addr.id}
                                className="mt-1 border-orange-500 text-orange-500"
                              />
                              <div className="flex-1 min-w-0">
                                <Label
                                  htmlFor={addr.id}
                                  className="cursor-pointer flex items-center gap-2 flex-wrap"
                                >
                                  <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                  <span className="flex-shrink-0">{addr.label}</span>
                                  {selectedAddressId === addr.id && (
                                    <span className="flex items-center gap-1 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                                      <Check className="w-3 h-3" />
                                      Default
                                    </span>
                                  )}
                                </Label>
                                <p className="text-sm text-gray-600 mt-2 ml-6 break-words">
                                  {addr.address}
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteAddress(addr.id);
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                                title="Delete address"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <Card className="border-2 border-dashed border-gray-300">
                    <CardContent className="text-center py-12 text-gray-500">
                      <MapPin className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-700">No saved addresses yet</p>
                      <p className="text-sm mt-1">Click "Add New Address" button above to create your first address</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </ScrollArea>
          <Separator className="my-4" />
          <DialogFooter className="gap-2">
            <div className="flex-1 text-sm text-gray-500">
              <span className="text-orange-500">*</span> Required fields
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-orange-300 hover:bg-orange-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-orange-500 hover:bg-orange-600"
              disabled={addresses.length === 0}
            >
              <Check className="w-4 h-4 mr-2" />
              Save All Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
