
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

// Define the form schema with Zod
export const studentSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  registrationNo: z.string().min(3, { message: "Registration number must be at least 3 characters" }),
  phoneNumber: z.string().min(10, { message: "Phone number must be at least 10 digits" }),
  parentPhoneNumber: z.string().min(10, { message: "Parent's phone number must be at least 10 digits" }),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

// Function to fetch student data
export const fetchStudent = async (studentId: string) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Function to save student data
export const saveStudent = async (
  studentData: any,
  studentId?: string
) => {
  if (studentId) {
    // Update existing student
    const { error } = await supabase
      .from('students')
      .update(studentData)
      .eq('id', studentId);
      
    if (error) throw error;
    
    return { message: "Student Updated" };
  } else {
    // Insert new student
    const { error } = await supabase
      .from('students')
      .insert([studentData]);
      
    if (error) throw error;
    
    return { message: "Student Added" };
  }
};

// Function to upload photo
export const uploadStudentPhoto = async (photoFile: File) => {
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
    
  return urlData.publicUrl;
};
