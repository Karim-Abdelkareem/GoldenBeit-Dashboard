export interface FaQuestion {
  id: string;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  flag?: number; // 0 = selling, 1 = buying
}
export interface FaQuestionFormData {
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  flag?: number; // 0 = selling, 1 = buying
}
