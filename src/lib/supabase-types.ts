export interface Database {
  public: {
    Tables: {
      article_reactions: {
        Row: {
          id: number;
          slug: string;
          reaction_type: 'rocket' | 'like' | 'stuck' | 'cry';
          fingerprint: string;
          created_at: string;
        };
        Insert: {
          slug: string;
          reaction_type: 'rocket' | 'like' | 'stuck' | 'cry';
          fingerprint: string;
        };
      };
      section_reactions: {
        Row: {
          id: number;
          slug: string;
          section_id: string;
          reaction_type: 'like' | 'stuck' | 'cry';
          fingerprint: string;
          created_at: string;
        };
        Insert: {
          slug: string;
          section_id: string;
          reaction_type: 'like' | 'stuck' | 'cry';
          fingerprint: string;
        };
      };
      qa_questions: {
        Row: {
          id: string;
          slug: string;
          section_id: string | null;
          section_title: string | null;
          question: string;
          fingerprint: string;
          status: 'visible' | 'hidden' | 'flagged';
          created_at: string;
        };
        Insert: {
          slug: string;
          section_id: string | null;
          section_title: string | null;
          question: string;
          fingerprint: string;
          status?: 'visible' | 'hidden' | 'flagged';
        };
      };
      qa_answers: {
        Row: {
          id: string;
          question_id: string;
          answer: string;
          fingerprint: string;
          helpful_count: number;
          status: 'visible' | 'hidden' | 'flagged';
          created_at: string;
        };
        Insert: {
          question_id: string;
          answer: string;
          fingerprint: string;
          status?: 'visible' | 'hidden' | 'flagged';
        };
      };
      qa_helpful_votes: {
        Row: {
          id: number;
          answer_id: string;
          fingerprint: string;
          created_at: string;
        };
        Insert: {
          answer_id: string;
          fingerprint: string;
        };
      };
    };
    Functions: {
      increment_helpful: {
        Args: { answer_id_input: string; fingerprint_input: string };
        Returns: number;
      };
    };
  };
}
