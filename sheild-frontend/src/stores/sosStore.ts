import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MotionPermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

interface SosState {
    sosActive: boolean;
    bodyguardActive: boolean;
    recordingActive: boolean;
    sessionId: string | null;
    autoCallPolice: boolean;
    policeNumber: string;
    // Shake-to-SOS (persisted)
    shakeToSosEnabled: boolean;
    // Shake-to-SOS (runtime only — NOT persisted)
    shakeOverlayVisible: boolean;
    permissionState: MotionPermissionState;
    shakeListening: boolean;
    // Actions
    setSosActive: (v: boolean) => void;
    setBodyguardActive: (v: boolean) => void;
    setSessionId: (id: string | null) => void;
    setRecordingActive: (v: boolean) => void;
    setAutoCallPolice: (v: boolean) => void;
    setPoliceNumber: (v: string) => void;
    toggleShakeSos: () => void;
    setShakeOverlayVisible: (v: boolean) => void;
    setPermissionState: (v: MotionPermissionState) => void;
    setShakeListening: (v: boolean) => void;
}

export const useSosStore = create<SosState>()(
    persist(
        (set) => ({
    sosActive: false,
    bodyguardActive: false,
    recordingActive: false,
    sessionId: null,
    autoCallPolice: true,
    policeNumber: "100",
    // Shake-to-SOS
    shakeToSosEnabled: true,
    shakeOverlayVisible: false,
    permissionState: 'prompt' as MotionPermissionState,
    shakeListening: false,
    // Actions
    setSosActive: (sosActive) => set({ sosActive }),
    setBodyguardActive: (bodyguardActive) => set({ bodyguardActive }),
    setSessionId: (sessionId) => set({ sessionId }),
    setRecordingActive: (recordingActive) => set({ recordingActive }),
    setAutoCallPolice: (autoCallPolice) => set({ autoCallPolice }),
    setPoliceNumber: (policeNumber) => set({ policeNumber: policeNumber || "100" }),
    toggleShakeSos: () => set((s) => ({ shakeToSosEnabled: !s.shakeToSosEnabled })),
    setShakeOverlayVisible: (shakeOverlayVisible) => set({ shakeOverlayVisible }),
    setPermissionState: (permissionState) => set({ permissionState }),
    setShakeListening: (shakeListening) => set({ shakeListening }),
        }),
        {
            name: "sheild-sos-storage",
            partialize: (state) => ({
                bodyguardActive: state.bodyguardActive,
                sosActive: state.sosActive,
                sessionId: state.sessionId,
                autoCallPolice: state.autoCallPolice,
                policeNumber: state.policeNumber,
                shakeToSosEnabled: state.shakeToSosEnabled,
                // Explicitly EXCLUDE runtime-only fields:
                // shakeOverlayVisible, permissionState, shakeListening
            }),
        }
    )
);
