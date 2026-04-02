export interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
}

export const defaultSettings: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsBeforeLongBreak: 4,
};

export interface AdvancedSettings {
  autoStartNextSession: boolean;
  enableSound: boolean;
  soundRepeatCount: number;
}

export const defaultAdvancedSettings: AdvancedSettings = {
  autoStartNextSession: true,
  enableSound: true,
  soundRepeatCount: 1,
};
