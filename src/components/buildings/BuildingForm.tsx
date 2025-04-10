
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface BuildingFormProps {
  isEditing?: boolean;
  buildingId?: string;
}

interface Building {
  id: string;
  name: string;
}

const BuildingForm = ({ isEditing = false, buildingId }: BuildingFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    blocks: '4',
    floorsPerBlock: '4',
    roomsPerFloor: '8',
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch building data if editing
  const { data: buildingData, isLoading: isFetchingBuilding } = useQuery({
    queryKey: ['building', buildingId],
    queryFn: async () => {
      if (!buildingId || !isEditing) return null;
      
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .eq('id', buildingId)
        .single();
      
      if (error) {
        console.error('Error fetching building:', error);
        throw error;
      }
      
      return data;
    },
    enabled: isEditing && !!buildingId,
  });

  // Set form data when building data is loaded
  useEffect(() => {
    if (buildingData) {
      setFormData(prev => ({
        ...prev,
        name: buildingData.name || '',
      }));
    }
  }, [buildingData]);

  // Create building mutation
  const createBuilding = useMutation({
    mutationFn: async (data: typeof formData) => {
      // First, insert the building
      const { data: newBuilding, error } = await supabase
        .from('buildings')
        .insert([{ name: data.name }])
        .select()
        .single();
      
      if (error) throw error;
      if (!newBuilding) throw new Error('Failed to create building');
      
      // Then create the blocks
      const blockCount = parseInt(data.blocks);
      if (blockCount > 0) {
        const blocks = Array.from({ length: blockCount }).map((_, i) => ({
          building_id: newBuilding.id,
          name: `Block ${String.fromCharCode(65 + i)}`, // Block A, Block B, etc.
        }));
        
        const { error: blocksError } = await supabase
          .from('blocks')
          .insert(blocks);
        
        if (blocksError) throw blocksError;
      }
      
      return newBuilding;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      toast({
        title: "Building Created",
        description: `${formData.name} has been added successfully.`,
      });
      navigate('/buildings');
    },
    onError: (error) => {
      console.error('Error creating building:', error);
      toast({
        title: "Error",
        description: "Failed to create building. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update building mutation
  const updateBuilding = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('buildings')
        .update({ name: data.name })
        .eq('id', buildingId!);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      queryClient.invalidateQueries({ queryKey: ['building', buildingId] });
      toast({
        title: "Building Updated",
        description: `${formData.name} has been updated successfully.`,
      });
      navigate('/buildings');
    },
    onError: (error) => {
      console.error('Error updating building:', error);
      toast({
        title: "Error",
        description: "Failed to update building. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simple validation
    if (!formData.name || !formData.blocks || !formData.floorsPerBlock || !formData.roomsPerFloor) {
      toast({
        title: "Validation Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    if (isEditing && buildingId) {
      updateBuilding.mutate(formData);
    } else {
      createBuilding.mutate(formData);
    }
  };

  if (isEditing && isFetchingBuilding) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500">Loading building data...</p>
      </div>
    );
  }

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
              disabled={isEditing} // Can't change the number of blocks when editing
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
              disabled={isEditing} // Can't change the number of floors when editing
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
              disabled={isEditing} // Can't change the number of rooms when editing
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
            disabled={createBuilding.isPending || updateBuilding.isPending}
          >
            {isEditing 
              ? (updateBuilding.isPending ? 'Updating...' : 'Update Building') 
              : (createBuilding.isPending ? 'Creating...' : 'Create Building')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BuildingForm;
