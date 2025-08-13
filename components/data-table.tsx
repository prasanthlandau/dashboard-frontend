'use client'
import * as React from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';

type ClassroomData = {
  id: number;
  classroom: string;
  student: string;
  homework: string;
  completion: number;
};

const rows: ClassroomData[] = [
  { id: 1, classroom: 'A Science class', student: '1', homework: '0', completion: 0 },
  { id: 2, classroom: 'An english class', student: '0', homework: '0', completion: 0 },
  { id: 3, classroom: 'Maths YEar one', student: '8', homework: '18', completion: 20 },
];

const columns: ColumnDef<ClassroomData>[] = [
  { accessorKey: 'classroom', header: 'Classroom' },
  { accessorKey: 'student', header: 'Student' },
  { accessorKey: 'homework', header: 'Homework' },
  {
    accessorKey: 'completion',
    header: 'Completion',
    cell: ({ row }) => {
      const completion = row.getValue('completion') as number;
      return (
        <div className="w-full flex items-center">
          <div className="w-full mr-1 h-2 rounded-sm bg-gray-200 overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-sm"
              style={{ width: `${completion}%` }}
            />
          </div>
          <span className="text-sm text-gray-500">{`${completion}%`}</span>
        </div>
      );
    },
  },
];

const DataTableComponent = () => {
  return (
    <div className='h-80 w-full bg-white flex grow max-md:!w-[700px]'>
      <DataTable data={rows} columns={columns} />
    </div>
  )
}

export default DataTableComponent;