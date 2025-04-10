
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface BuildingProps {
  id: string;
  name: string;
  blockCount?: number;
}

const BuildingList = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState<BuildingProps | null>(null);
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch buildings from Supabase
  const fetchBuildings = async (): Promise<BuildingProps[]> => {
    console.log('Fetching buildings...');
    const { data, error } = await supabase
      .from('buildings')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching buildings:', error);
      throw error;
    }

    // Count blocks for each building
    const buildingsWithBlockCount = await Promise.all(
      data.map(async (building) => {
        const { count, error: countError } = await supabase
          .from('blocks')
          .select('id', { count: 'exact', head: true })
          .eq('building_id', building.id);

        if (countError) {
          console.error('Error counting blocks:', countError);
          return { ...building, blockCount: 0 };
        }

        return { ...building, blockCount: count || 0 };
      })
    );

    console.log('Buildings fetched:', buildingsWithBlockCount);
    return buildingsWithBlockCount;
  };

  // Use React Query to fetch buildings
  const { data: buildings = [], isLoading, error } = useQuery({
    queryKey: ['buildings'],
    queryFn: fetchBuildings,
  });

  // Delete building mutation
  const deleteBuilding = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting building:', id);
      const { error } = await supabase
        .from('buildings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting building:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate the buildings query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['buildings'] });
      
      toast({
        title: "Building Deleted",
        description: `${buildingToDelete?.name} has been removed successfully.`,
      });
      
      setIsDeleteDialogOpen(false);
      setBuildingToDelete(null);
      setPassword('');
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to delete building. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleDeleteClick = (building: BuildingProps) => {
    setBuildingToDelete(building);
    setPassword('');
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (password !== 'admin123') {
      toast({
        title: "Invalid Password",
        description: "The confirmation password is incorrect.",
        variant: "destructive",
      });
      return;
    }

    if (buildingToDelete) {
      deleteBuilding.mutate(buildingToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500">Loading buildings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-red-500">Error loading buildings. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Buildings</h2>
        <Button 
          onClick={() => navigate('/buildings/add')}
          className="bg-primary hover:bg-primary-dark"
        >
          Add Building
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {buildings.map((building) => (
          <div
            key={building.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 transition-all duration-200 hover:shadow-md hover:-translate-y-1"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-primary-light mr-3">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{building.name}</h3>
                  <p className="text-sm text-gray-500">{building.blockCount} Blocks</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-primary hover:bg-primary-light"
                  onClick={() => navigate(`/buildings/edit/${building.id}`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50"
                  onClick={() => handleDeleteClick(building)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <Button
              variant="ghost"
              className="w-full mt-4 justify-between text-primary hover:bg-primary-light"
              onClick={() => navigate(`/buildings/${building.id}/blocks`)}
            >
              View Blocks
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {buildingToDelete?.name}? This action cannot be undone.
              All associated blocks, floors, rooms, and student data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 py-2">
            <label className="text-sm font-medium">Enter Admin Password to Confirm</label>
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Hint: Use "admin123" as the password</p>
          </div>
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteBuilding.isPending}
            >
              {deleteBuilding.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Empty State */}
      {buildings.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-gray-100">
              <Building className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          <h3 className="font-medium text-lg mb-2">No Buildings Yet</h3>
          <p className="text-gray-500 mb-4">
            Get started by adding your first building.
          </p>
          <Button
            onClick={() => navigate('/buildings/add')}
            className="bg-primary hover:bg-primary-dark"
          >
            Add Building
          </Button>
        </div>
      )}
    </div>
  );
};

export default BuildingList;
