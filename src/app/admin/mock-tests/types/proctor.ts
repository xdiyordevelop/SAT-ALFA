export type ParticipantStatus = 'WAITING' | 'TAKING' | 'PAUSED' | 'COMPLETED' | 'DISQUALIFIED';

export type SessionStatus = 'ACTIVE' | 'COMPLETED' | 'REVOKED';

export interface ProctoredParticipantData {
 id: string;
 studentId: string;
 userName: string;
 email: string;
 status: ParticipantStatus;
 startedAt: Date | string | null;
 completedAt: Date | string | null;
 currentModule: number | null;
 currentQuestionIndex?: number | null;
 timeRemaining?: number | null;
 lastHeartbeat?: Date | string | null;
 timeAdded?: number;
 fullscreenExitCount: number;
 score: number | null;
}

export interface ProctoredSessionData {
 id: string;
 code: string;
 status: SessionStatus;
 createdAt: Date | string;
 participants: ProctoredParticipantData[];
 totalParticipants: number;
 scoredCount: number;
}

export interface SessionControllerProps {
 session: ProctoredSessionData;
 onUpdateStatus: (status: SessionStatus) => Promise<void>;
 onOpenProjector?: () => void;
}

export interface ParticipantMatrixProps {
 participants: ProctoredParticipantData[];
 sessionCode: string;
 onDisconnect: (participantId: string) => Promise<void>;
 onPause: (participantId: string) => Promise<void>;
 onResume?: (participantId: string) => Promise<void>;
 onDisqualify?: (participantId: string) => Promise<void>;
 onAddTime?: (participantId: string, seconds: number) => Promise<void>;
 onForceSubmit?: (participantId: string) => Promise<void>;
}

export interface SecurityAlertTrackerProps {
 participants: ProctoredParticipantData[];
 onFlagViolation?: (participantId: string, count: number) => Promise<void>;
 onPauseParticipant?: (participantId: string) => Promise<void>;
 onResumeParticipant?: (participantId: string) => Promise<void>;
 onDisqualifyParticipant?: (participantId: string) => Promise<void>;
 onClearWarnings?: (participantId: string) => Promise<void>;
}