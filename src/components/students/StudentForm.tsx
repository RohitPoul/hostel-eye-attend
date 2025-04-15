
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import StudentFormContent from './StudentFormContent';
import { StudentFormProps } from '@/types/student';
import { StudentFormValues, fetchStudent, saveStudent, uploadStudentPhoto } from '@/utils/studentUtils';

const StudentForm = ({ isEditing = false, studentId, buildingId, blockId, floorId, roomId }: StudentFormProps) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const params = useParams();
  
  // Use URL params if props are not provided
  const actualBuildingId = buildingId || params.buildingId;
  const actualBlockId = blockId || params.blockId;
  const actualFloorId = floorId || params.floorId;
  const actualRoomId = roomId || params.roomId;
  const actualStudentId = studentId || params.studentId;
  
  // Fetch building, block, and room data
  const { data: building } = useQuery({
    queryKey: ['building', actualBuildingId],
    queryFn: async () => {
      if (!actualBuildingId) return null;
      
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .eq('id', actualBuildingId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!actualBuildingId,
  });
  
  const { data: block } = useQuery({
    queryKey: ['block', actualBlockId],
    queryFn: async () => {
      if (!actualBlockId) return null;
      
      const { data, error } = await supabase
        .from('blocks')
        .select('*')
        .eq('id', actualBlockId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!actualBlockId,
  });
  
  const { data: room } = useQuery({
    queryKey: ['room', actualRoomId],
    queryFn: async () => {
      if (!actualRoomId) return null;
      
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', actualRoomId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!actualRoomId,
  });
  
  // Default form values
  const defaultValues: StudentFormValues = {
    name: '',
    registrationNo: '',
    phoneNumber: '',
    parentPhoneNumber: '',
  };

  // Fetch student data if editing
  useEffect(() => {
    if (actualStudentId) {
      const getStudentData = async () => {
        setIsLoading(true);
        try {
          const data = await fetchStudent(actualStudentId);
          
          if (data) {
            defaultValues.name = data.name;
            defaultValues.registrationNo = data.registration_no;
            defaultValues.phoneNumber = data.phone_number;
            defaultValues.parentPhoneNumber = data.parent_phone_number || '';
            
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
      
      getStudentData();
    }
  }, [actualStudentId, toast]);

  const handlePhotoChange = (file: File | null, preview: string | null) => {
    setPhotoFile(file);
    setPhotoPreview(preview);
  };

  const onSubmit = async (data: StudentFormValues) => {
    setIsSubmitting(true);

    // Simple validation for photo
    if (!photoPreview && !actualStudentId) {
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
        photoUrl = await uploadStudentPhoto(photoFile);
      }
      
      // Prepare floor number as a number, not string
      const floorNum = actualFloorId ? parseInt(actualFloorId) : 1;
      
      // Prepare student data for saving
      const studentData = {
        name: data.name,
        registration_no: data.registrationNo,
        phone_number: data.phoneNumber,
        parent_phone_number: data.parentPhoneNumber,
        building_name: building?.name || '',
        block_name: block?.name || '',
        floor_number: floorNum,
        room_number: room?.name || '',
        room_id: actualRoomId || null,
        photo_url: photoUrl,
      };
      
      // Save student data
      const result = await saveStudent(studentData, actualStudentId);
      
      toast({
        title: result.message,
        description: `${data.name} has been ${isEditing ? 'updated' : 'added'} successfully.`,
      });
      
      // Navigate back to previous page
      navigate(-1);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <h2 className="text-xl font-semibold mb-6">
        {isEditing ? 'Edit Student' : 'Add New Student'}
      </h2>

      <StudentFormContent
        defaultValues={defaultValues}
        photoPreview={photoPreview}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
        onSubmit={onSubmit}
        onPhotoChange={handlePhotoChange}
      />
    </div>
  );
};

export default StudentForm;
