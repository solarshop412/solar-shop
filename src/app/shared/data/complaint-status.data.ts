import { ComplaintStatus } from "../models/complaint-status.model";

export const COMPLAINT_STATUS: ComplaintStatus[] = [
    {
        id: 1,
        name: 'complaints.status.new'
    },
    {
        id: 2,
        name: 'complaints.status.seen'
    },
    {
        id: 3,
        name: 'complaints.status.inprogress'
    },
    {
        id: 4,
        name: 'complaints.status.done'
    }
];

export function getComplaintStatusNameById(id: number): string | undefined {
    return COMPLAINT_STATUS.find(status => status.id === id)?.name;
}