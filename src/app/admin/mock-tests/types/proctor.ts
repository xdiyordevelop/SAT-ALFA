export type ParticipantStatus = 'WAITING' | 'TAKING' | 'COMPLETED';

export type SessionStatus = 'ACTIVE' | 'COMPLETED' | 'REVOKED';

export interface ProctoredParticipantData {
 id: string;
 studentId: string;
 userName: string;
 email: string;
 status: ParticipantStatus;
 startedAt: Date | null;
 completedAt: Date | null;
 currentModule: number | null;
 fullscreenExitCount: number;
 score: number | null;
}

export interface ProctoredSessionData {
 id: string;
 code: string;
 status: SessionStatus;
 createdAt: Date;
 participants: ProctoredParticipantData[];
 totalParticipants: number;
 scoredCount: number;
}

export interface SessionControllerProps {
 session: ProctoredSessionData;
 onUpdateStatus: (status: SessionStatus) => Promise<void>;
}

export interface ParticipantMatrixProps {
 participants: ProctoredParticipantData[];
 sessionCode: string;
 onDisconnect: (participantId: string) => Promise<void>;
 onPause: (participantId: string) => Promise<void>;
}

export interface SecurityAlertTrackerProps {
 participants: ProctoredParticipantData[];
 onFlagViolation: (participantId: string, count: number) => Promise<void>;
}