
const statusLabels = {
  'P': 'Present',
  'A': 'Absent',
  'L': 'Leave',
  'H': 'Holiday',
};

const statusColors = {
  'P': 'bg-green-100 text-green-800',
  'A': 'bg-red-100 text-red-800',
  'L': 'bg-yellow-100 text-yellow-800',
  'H': 'bg-blue-100 text-blue-800',
  '-': 'bg-gray-100 text-gray-500'
};

export function AttendanceLegend() {
  return (
    <div className="flex flex-wrap gap-3">
      {Object.entries(statusLabels).map(([status, label]) => (
        <div key={status} className="flex items-center">
          <div className={`w-4 h-4 rounded-full ${statusColors[status as keyof typeof statusColors]} mr-2`}></div>
          <span className="text-sm">{label}</span>
        </div>
      ))}
    </div>
  );
}

export { statusColors, statusLabels };
