
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';

// Define the form schema with Zod
const studentSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  registrationNo: z.string().min(3, { message: "Registration number must be at least 3 characters" }),
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
});

type StudentFormValues = z.infer<typeof studentSchema>;

interface StudentFormProps {
  isEditing?: boolean;
  studentId?: string;
  buildingId?: string;
  blockId?: string;
  floorId?: string;
  roomId?: string;
}

const StudentForm = ({ 
  isEditing = false, 
  studentId, 
  buildingId, 
  blockId, 
  floorId, 
  roomId 
}: StudentFormProps) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Initialize form
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: '',
      registrationNo: '',
      phoneNumber: '',
    },
  });

  // Fetch student data if editing
  useEffect(() => {
    if (isEditing && studentId) {
      const fetchStudent = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', studentId)
            .single();
          
          if (error) {
            throw error;
          }
          
          if (data) {
            form.reset({
              name: data.name,
              registrationNo: data.registration_no,
              phoneNumber: data.phone_number,
            });
            
            if (data.photo_url) {
              setPhotoPreview(data.photo_url);
            }
          }
        } catch (error) {
          console.error('Error fetching student:', error);
          toast({
            title: "Error",
            description: "Failed to fetch student data. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchStudent();
    }
  }, [isEditing, studentId, form, toast]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const onSubmit = async (data: StudentFormValues) => {
    setIsSubmitting(true);

    // Simple validation for photo
    if (!photoPreview && !isEditing) {
      toast({
        title: "Validation Error",
        description: "Student photo is required",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      let photoUrl = photoPreview;
      
      // Upload photo if there's a new one
      if (photoFile) {
        const fileName = `${Date.now()}-${photoFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('students')
          .upload(fileName, photoFile);
        
        if (uploadError) {
          throw uploadError;
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('students')
          .getPublicUrl(fileName);
          
        photoUrl = urlData.publicUrl;
      }
      
      const studentData = {
        name: data.name,
        registration_no: data.registrationNo,
        phone_number: data.phoneNumber,
        photo_url: photoUrl,
        room_id: roomId,
      };
      
      if (isEditing && studentId) {
        // Update existing student
        const { error } = await supabase
          .from('students')
          .update(studentData)
          .eq('id', studentId);
          
        if (error) throw error;
        
        toast({
          title: "Student Updated",
          description: `${data.name} has been updated successfully.`,
        });
      } else {
        // Insert new student
        const { error } = await supabase
          .from('students')
          .insert([studentData]);
          
        if (error) throw error;
        
        toast({
          title: "Student Added",
          description: `${data.name} has been added successfully.`,
        });
      }
      
      // Navigate back
      if (buildingId && blockId && floorId && roomId) {
        navigate(`/buildings/${buildingId}/blocks/${blockId}/floors/${floorId}/rooms`);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error saving student:', error);
      toast({
        title: "Error",
        description: "Failed to save student data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBackLink = () => {
    if (buildingId && blockId && floorId && roomId) {
      return `/buildings/${buildingId}/blocks/${blockId}/floors/${floorId}/rooms`;
    }
    return '/dashboard';
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => navigate(getBackLink())}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <h2 className="text-xl font-semibold mb-6">{isEditing ? 'Edit Student' : 'Add New Student'}</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. John Doe" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="registrationNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. REG2023001" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. 9876543210" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Student Photo</Label>
              {photoPreview ? (
                <div className="relative h-32 w-32 rounded-md overflow-hidden border">
                  <img
                    src={photoPreview}
                    alt="Student"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                    onClick={removePhoto}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="h-32 w-32 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => document.getElementById('photo')?.click()}
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm text-gray-500 mt-2">Upload Photo</span>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(getBackLink())}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary-dark"
              disabled={isSubmitting}
            >
              {isSubmitting ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Student' : 'Add Student')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default StudentForm;
