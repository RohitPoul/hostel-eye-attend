
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface StudentFormProps {
  isEditing?: boolean;
  studentId?: string;
}

const StudentForm = ({ isEditing = false, studentId }: StudentFormProps) => {
  const { buildingId, blockId, floorId, roomId } = useParams();
  const [formData, setFormData] = useState({
    name: isEditing ? 'John Doe' : '',
    registrationNo: isEditing ? 'REG2023001' : '',
    phoneNumber: isEditing ? '9876543210' : '',
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    isEditing ? 'https://i.pravatar.cc/150?img=1' : null
  );
  const [photoFile, setPhotoFile] = useState<File | null>(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simple validation
    if (!formData.name || !formData.registrationNo || !formData.phoneNumber || !photoPreview) {
      toast({
        title: "Validation Error",
        description: "All fields and photo are required",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // In a real app, this would be an API call to save the student
    setTimeout(() => {
      toast({
        title: isEditing ? "Student Updated" : "Student Added",
        description: `${formData.name} has been ${isEditing ? 'updated' : 'added'} successfully.`,
      });
      
      if (buildingId && blockId && floorId && roomId) {
        navigate(`/buildings/${buildingId}/blocks/${blockId}/floors/${floorId}/rooms/${roomId}`);
      } else {
        navigate('/students');
      }
      
      setIsSubmitting(false);
    }, 1000);
  };

  const getPageTitle = () => {
    if (isEditing) {
      return 'Edit Student';
    }
    return 'Add New Student';
  };

  const getBackLink = () => {
    if (buildingId && blockId && floorId && roomId) {
      return `/buildings/${buildingId}/blocks/${blockId}/floors/${floorId}/rooms/${roomId}`;
    }
    return '/students';
  };

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

      <h2 className="text-xl font-semibold mb-6">{getPageTitle()}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationNo">Registration Number</Label>
            <Input
              id="registrationNo"
              name="registrationNo"
              placeholder="e.g. REG2023001"
              value={formData.registrationNo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              placeholder="e.g. 9876543210"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

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
    </div>
  );
};

export default StudentForm;
