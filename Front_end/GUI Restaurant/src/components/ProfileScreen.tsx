import { Edit } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProfileScreenProps {
  coverImage: string;
}

export function ProfileScreen({ coverImage }: ProfileScreenProps) {
  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="h-64 bg-gray-200 relative">
          <ImageWithFallback
            src={coverImage}
            alt="Restaurant cover"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="p-8">
          <div className="space-y-6">
            <div>
              <label className="text-gray-600 text-sm">Name of Restaurant</label>
              <p className="mt-1">The Gourmet Kitchen</p>
            </div>
            
            <div>
              <label className="text-gray-600 text-sm">Gmail:</label>
              <p className="mt-1">contact@gourmetkitchen.com</p>
            </div>
            
            <div>
              <label className="text-gray-600 text-sm">Address</label>
              <p className="mt-1">123 Culinary Street, Food District, NYC 10001</p>
            </div>
            
            <div>
              <label className="text-gray-600 text-sm">Contact</label>
              <p className="mt-1">+1 (555) 123-4567</p>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
