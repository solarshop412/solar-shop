import { Moment } from "moment";
import { ComplaintStatus } from "./complaint-status.model";

export interface Complaints {
    id?: string;
    createdAt?: Moment;
    fullNameOrCompany: string;
    address?: string;
    email: string;
    phone?: string;
    invoiceNumber: string;
    invoiceDate?: Moment;
    itemOrService?: string;
    description: string;
    status?: ComplaintStatus;
}