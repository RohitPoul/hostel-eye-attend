
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface BuildingFormProps {
  isEditing?: boolean;
  buildingId?: string;
}

const BuildingForm = ({ isEditing = false, buildingId }: BuildingFormProps) => {
  const [formData, setFormData] = useState({
    name: isEditing ? 'Satyaadi' : '',
    blocks: isEditing ? '4' : '',
    floorsPerBlock: isEditing ? '4' : '',
    roomsPerFloor: isEditing ? '8' : '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simple validation
    if (!formData.name || !formData.blocks || !formData.floorsPerBlock || !formData.roomsPerFloor) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // In a real app, this would be an API call to save the building
    setTimeout(() => {
      toast({
        title: isEditing ? "Building Updated" : "Building Created",
        description: `${formData.name} has been ${isEditing ? 'updated' : 'added'} successfully.`,
      });
      
      navigate('/buildings');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => navigate('/buildings')}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Buildings
        </Button>
      </div>

      <h2 className="text-xl font-semibold mb-6">
        {isEditing ? 'Edit Building' : 'Add New Building'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Building Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Satyaadi"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="blocks">Number of Blocks</Label>
            <Input
              id="blocks"
              name="blocks"
              type="number"
              min="1"
              placeholder="e.g. 4"
              value={formData.blocks}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="floorsPerBlock">Floors per Block</Label>
            <Input
              id="floorsPerBlock"
              name="floorsPerBlock"
              type="number"
              min="1"
              placeholder="e.g. 4"
              value={formData.floorsPerBlock}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomsPerFloor">Rooms per Floor</Label>
            <Input
              id="roomsPerFloor"
              name="roomsPerFloor"
              type="number"
              min="1"
              placeholder="e.g. 8"
              value={formData.roomsPerFloor}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/buildings')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary-dark"
            disabled={isSubmitting}
          >
            {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Building' : 'Create Building')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BuildingForm;
