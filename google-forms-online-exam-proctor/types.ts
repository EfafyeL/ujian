
export enum AppView {
  SETUP = 'SETUP',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export interface ExamConfig {
  formUrl: string;
  durationMinutes: number;
}
