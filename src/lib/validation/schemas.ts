import { z } from "zod";

export const loginSchema = z.object({
 username: z.string().min(1, "Username is required"),
 password: z.string().min(1, "Password is required"),
});

export const createStudentSchema = z.object({
 username: z.string().min(3, "Username must be at least 3 characters"),
 password: z.string().min(6, "Password must be at least 6 characters"),
 firstName: z.string().min(1, "First name is required"),
 lastName: z.string().min(1, "Last name is required"),
 phone: z.string().regex(/^[\d+\-\s()]*/, "Invalid phone number"),
 groupId: z.string().optional(),
 monthlyFee: z.number().min(0, "Monthly fee must be non-negative").optional(),
});

export const editStudentSchema = createStudentSchema.omit({ password: true }).partial();

export const createGroupSchema = z.object({
 name: z.string().min(1, "Group name is required").max(255),
});

export const createTopicSchema = z.object({
 subject: z.enum(["MATH", "ENGLISH"]),
 name: z.string().min(1, "Topic name is required").max(255),
});

export const updateTopicSchema = z.object({
 name: z.string().min(1, "Topic name is required").max(255).optional(),
 isActive: z.boolean().optional(),
});

export const createParentGuardianSchema = z.object({
 fullName: z.string().min(1, "Full name is required"),
 phone: z.string().regex(/^[\d+\-\s()]*/, "Invalid phone number"),
 smsNotifyEnabled: z.boolean().optional(),
});

export const mockTestUploadSchema = z.object({
 subject: z.enum(["MATH", "ENGLISH"]),
 testName: z.string().min(1, "Test name is required"),
 testDate: z.string().datetime(),
 notes: z.string().optional(),
});

export const mockTestConfirmSchema = z.object({
 score: z.number().min(0).max(100),
 topicPerformances: z.array(
 z.object({
 topicId: z.string().uuid(),
 percentage: z.number().min(0).max(100),
 })
 ),
 notes: z.string().optional(),
});

export const paymentSchema = z.object({
 amount: z.number().min(0.01, "Amount must be greater than 0"),
 type: z.enum(["CASH", "CARD", "BANK_TRANSFER"]),
 paidAt: z.string().datetime().optional(),
 notes: z.string().optional(),
});

export const attendanceSchema = z.object({
 date: z.string().datetime(),
 status: z.enum(["PRESENT", "ABSENT", "EXCUSED"]),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type CreateStudentData = z.infer<typeof createStudentSchema>;
export type EditStudentData = z.infer<typeof editStudentSchema>;
export type CreateGroupData = z.infer<typeof createGroupSchema>;
export type CreateTopicData = z.infer<typeof createTopicSchema>;
export type CreateParentGuardianData = z.infer<typeof createParentGuardianSchema>;
export type MockTestUploadData = z.infer<typeof mockTestUploadSchema>;
export type MockTestConfirmData = z.infer<typeof mockTestConfirmSchema>;
export type PaymentData = z.infer<typeof paymentSchema>;
export type AttendanceData = z.infer<typeof attendanceSchema>;
