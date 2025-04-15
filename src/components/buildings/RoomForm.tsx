
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { fetchBuilding, fetchBlock, getFloorName } from '@/utils/roomUtils';

// Define the form schema with Zod
const roomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
});

type RoomFormValues = z.infer<typeof roomSchema>;

const RoomForm = () => {
  const { buildingId, blockId, floorId, roomId } = useParams();
  const isEditing = !!roomId;
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch building data for breadcrumb
  const { data: building } = useQuery({
    queryKey: ['building', buildingId],
    queryFn: () => fetchBuilding(buildingId),
  });

  // Fetch block data for breadcrumb
  const { data: block } = useQuery({
    queryKey: ['block', blockId],
    queryFn: () => fetchBlock(blockId),
  });

  // Initialize the form
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      name: '',
    },
  });

  // Fetch room data if editing
  const { data: room, isLoading } = useQuery({
    queryKey: ['room', roomId],
    queryFn: async () => {
      if (!roomId) return null;
      
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  // Set form values when room data is loaded
  useEffect(() => {
    if (room) {
      form.reset({
        name: room.name,
      });
    }
  }, [room, form]);

  // Save room mutation
  const saveRoom = useMutation({
    mutationFn: async (values: RoomFormValues) => {
      const roomData = {
        name: values.name,
        block_id: blockId,
        floor_id: parseInt(floorId || '0'),
      };

      if (isEditing && roomId) {
        const { error } = await supabase
          .from('rooms')
          .update(roomData)
          .eq('id', roomId);
        
        if (error) throw error;
        return { ...roomData, id: roomId };
      } else {
        const { data, error } = await supabase
          .from('rooms')
          .insert([roomData])
          .select();
        
        if (error) throw error;
        return data[0];
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms', blockId, floorId] });
      
      toast({
        title: isEditing ? "Room Updated" : "Room Created",
        description: `Room has been ${isEditing ? 'updated' : 'created'} successfully.`,
      });
      
      navigate(`/buildings/${buildingId}/blocks/${blockId}/floors/${floorId}/rooms`);
    },
    onError: (error) => {
      console.error('Error saving room:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} room. Please try again.`,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (values: RoomFormValues) => {
    setIsSubmitting(true);
    saveRoom.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500">Loading room data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6 flex-wrap gap-2">
        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => navigate(`/buildings/${buildingId}/blocks/${blockId}/floors/${floorId}/rooms`)}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Rooms
        </Button>
        {building && (
          <div className="px-3 py-1 bg-primary-light rounded-full text-primary text-sm font-medium">
            {building.name}
          </div>
        )}
        {block && (
          <div className="px-3 py-1 bg-blue-100 rounded-full text-blue-600 text-sm font-medium">
            {block.name}
          </div>
        )}
        <div className="px-3 py-1 bg-green-100 rounded-full text-green-600 text-sm font-medium">
          {getFloorName(floorId)}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-6">{isEditing ? 'Edit Room' : 'Add New Room'}</h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Name/Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 101, A1, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/buildings/${buildingId}/blocks/${blockId}/floors/${floorId}/rooms`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Room' : 'Create Room')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default RoomForm;
