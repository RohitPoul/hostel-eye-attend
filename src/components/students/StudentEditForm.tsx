
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define the form schema with Zod
const studentSchema = z.object({
  first_name: z.string().min(2, { message: "First name must be at least 2 characters" }),
  last_name: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  student_id: z.string().min(3, { message: "Student ID must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  guardian_name: z.string().min(2, { message: "Guardian name must be at least 2 characters" }),
  guardian_phone: z.string().min(10, { message: "Guardian phone must be at least 10 digits" }),
});

type StudentFormValues = z.infer<typeof studentSchema>;

const StudentEditForm = () => {
  const { buildingId, blockId, floorId, roomId, studentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!studentId;
  
  // Initialize form
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      student_id: '',
      email: '',
      phone: '',
      guardian_name: '',
      guardian_phone: '',
    },
  });

  // Fetch student data if editing
  const { data: studentData, isLoading } = useQuery({
    queryKey: ['student', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();
      
      if (error) {
        console.error('Error fetching student:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!studentId,
  });

  // Set form values when student data is loaded
  useEffect(() => {
    if (studentData) {
      form.reset({
        first_name: studentData.first_name || '',
        last_name: studentData.last_name || '',
        student_id: studentData.student_id || '',
        email: studentData.email || '',
        phone: studentData.phone || '',
        guardian_name: studentData.guardian_name || '',
        guardian_phone: studentData.guardian_phone || '',
      });
    }
  }, [studentData, form]);

  // Update student mutation
  const updateStudent = useMutation({
    mutationFn: async (data: StudentFormValues) => {
      const { error } = await supabase
        .from('students')
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          student_id: data.student_id,
          email: data.email,
          phone: data.phone,
          guardian_name: data.guardian_name,
          guardian_phone: data.guardian_phone,
        })
        .eq('id', studentId!);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students', roomId] });
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
      toast({
        title: "Student Updated",
        description: "Student information has been updated successfully.",
      });
      navigate(`/buildings/${buildingId}/blocks/${blockId}/floors/${floorId}/rooms`);
    },
    onError: (error) => {
      console.error('Error updating student:', error);
      toast({
        title: "Error",
        description: "Failed to update student. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: StudentFormValues) => {
    updateStudent.mutate(data);
  };

  const handleCancel = () => {
    navigate(`/buildings/${buildingId}/blocks/${blockId}/floors/${floorId}/rooms`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500">Loading student data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={handleCancel}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Rooms
        </Button>
      </div>

      <h2 className="text-xl font-semibold mb-6">Edit Student Information</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="First Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Last Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="student_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student ID</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Student ID" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="Email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Phone Number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guardian_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guardian Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Guardian Name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guardian_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guardian Phone</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Guardian Phone Number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary-dark"
              disabled={updateStudent.isPending}
            >
              {updateStudent.isPending ? 'Updating...' : 'Update Student'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default StudentEditForm;
