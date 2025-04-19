import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { formatFloorNumber } from '@/utils/roomUtils';

// Define the form schema with Zod
const formSchema = z.object({
  buildingName: z.string().min(1, "Building name is required"),
  blocks: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Block name is required"),
      floors: z.array(
        z.object({
          floorNumber: z.number().min(1, "Floor number is required"),
        })
      ).optional(),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface BuildingFormProps {
  isEditing: boolean;
  buildingId?: string;
}

const BuildingForm = ({ isEditing, buildingId }: BuildingFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      buildingName: '',
      blocks: [{ name: '', floors: [{ floorNumber: 1 }] }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "blocks"
  });

  // Load building data for editing
  useEffect(() => {
    if (isEditing && buildingId) {
      const loadBuildingData = async () => {
        const { data: building, error: buildingError } = await supabase
          .from('buildings')
          .select('*')
          .eq('id', buildingId)
          .single();

        if (buildingError) throw buildingError;

        const { data: blocks, error: blockError } = await supabase
          .from('blocks')
          .select('*')
          .eq('building_id', buildingId);

        if (blockError) throw blockError;

        // Fetch floors for each block
        const blocksWithFloors = await Promise.all(
          blocks.map(async (block) => {
            const { data: floors, error: floorError } = await supabase
              .from('floors')
              .select('floor_number')
              .eq('block_id', block.id);

            if (floorError) throw floorError;

            return {
              ...block,
              floors: floors.map(floor => ({ floorNumber: floor.floor_number })),
            };
          })
        );

        form.reset({
          buildingName: building.name,
          blocks: blocksWithFloors,
        });
      };

      loadBuildingData();
    }
  }, [isEditing, buildingId, form]);

  // Modify the onSubmit function to include the name property for floors
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      let buildingIdToUse = buildingId;

      // Insert or update building
      if (isEditing && buildingId) {
        const { error } = await supabase
          .from('buildings')
          .update({ name: values.buildingName })
          .eq('id', buildingId);

        if (error) throw error;
      } else {
        // Insert new building
        const { data, error } = await supabase
          .from('buildings')
          .insert([{ name: values.buildingName }])
          .select();

        if (error) throw error;
        buildingIdToUse = data[0].id;
      }

      // Insert blocks
      for (const block of values.blocks) {
        // Check if block already exists when editing
        if (isEditing && block.id) {
          const { error } = await supabase
            .from('blocks')
            .update({ name: block.name })
            .eq('id', block.id);

          if (error) throw error;
        } else {
          // Insert new block
          const { data: blockData, error: blockError } = await supabase
            .from('blocks')
            .insert([{
              name: block.name,
              building_id: buildingIdToUse
            }])
            .select();

          if (blockError) throw blockError;

          const blockId = blockData[0].id;

          // Insert floors for each block
          if (block.floors && block.floors.length > 0) {
            // Make sure to include the name property for each floor
            const floorsWithNames = block.floors.map((floor, index) => ({
              block_id: blockId,
              floor_number: floor.floorNumber,
              name: `${formatFloorNumber(floor.floorNumber)}`
            }));

            const { error: floorError } = await supabase
              .from('floors')
              .insert(floorsWithNames);

            if (floorError) throw floorError;
          }
        }
      }

      toast({
        title: isEditing ? "Building Updated" : "Building Created",
        description: `${values.buildingName} has been ${isEditing ? 'updated' : 'created'} successfully.`,
      });

      navigate('/buildings');
    } catch (error) {
      console.error('Error saving building:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} building. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate('/buildings')}>
          ← Back to Buildings
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-semibold mb-6">{isEditing ? 'Edit Building' : 'Add Building'}</h1>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="buildingName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Building Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter building name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <h2 className="text-xl font-semibold mb-4">Blocks</h2>
              <ul className="space-y-4">
                {fields.map((item, index) => (
                  <li key={item.id} className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`blocks.${index}.name` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Block Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter block name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => remove(index)}
                      className="w-10 h-10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => append({ name: '', floors: [{ floorNumber: 1 }] })}
                className="mt-4"
              >
                Add Block <Plus className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Building' : 'Create Building')}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default BuildingForm;
