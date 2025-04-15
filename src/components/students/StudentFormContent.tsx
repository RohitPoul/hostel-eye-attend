
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import PhotoUploader from './PhotoUploader';
import { StudentFormValues, studentSchema } from '@/utils/studentUtils';
import { useNavigate } from 'react-router-dom';

interface StudentFormContentProps {
  defaultValues: StudentFormValues;
  photoPreview: string | null;
  isSubmitting: boolean;
  isEditing: boolean;
  onSubmit: (data: StudentFormValues) => void;
  onPhotoChange: (file: File | null, preview: string | null) => void;
}

const StudentFormContent = ({
  defaultValues,
  photoPreview,
  isSubmitting,
  isEditing,
  onSubmit,
  onPhotoChange,
}: StudentFormContentProps) => {
  const navigate = useNavigate();
  
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues,
  });

  return (
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
                <FormLabel>Student Phone Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. 9876543210" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parentPhoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent Phone Number</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="e.g. 9876543211" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <PhotoUploader 
              initialPreview={photoPreview} 
              onPhotoChange={onPhotoChange} 
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary-dark"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (isEditing ? 'Updating...' : 'Adding...') 
              : (isEditing ? 'Update Student' : 'Add Student')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default StudentFormContent;
