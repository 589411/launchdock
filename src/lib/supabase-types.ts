export type NotificationPreferences = {
  event_confirmation: boolean;
  event_reminder: boolean;
  event_update: boolean;
  new_article: boolean;
};

export type MemberRole = 'member' | 'admin';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type RegistrationStatus = 'registered' | 'waitlist' | 'cancelled' | 'attended';
export type EmailType = 'registration_confirmation' | 'event_reminder' | 'event_update' | 'new_article';

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
      article_page_views: {
        Row: {
          id: number;
          slug: string;
          fingerprint: string | null;
          referrer: string | null;
          created_at: string;
        };
        Insert: {
          slug: string;
          fingerprint?: string | null;
          referrer?: string | null;
        };
      };
      meetup_signups: {
        Row: {
          id: number;
          name: string;
          email: string;
          interest: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          email: string;
          interest?: string | null;
        };
      };
      member_profiles: {
        Row: {
          id: string;
          user_id: string;
          display_name: string;
          avatar_url: string | null;
          email: string;
          role: MemberRole;
          member_since: string;
          notification_preferences: NotificationPreferences;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          display_name: string;
          avatar_url?: string | null;
          email: string;
          role?: MemberRole;
          notification_preferences?: NotificationPreferences;
        };
        Update: {
          display_name?: string;
          avatar_url?: string | null;
          notification_preferences?: NotificationPreferences;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          event_date: string;
          location: string | null;
          max_capacity: number | null;
          status: EventStatus;
          priority_hours: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          description?: string | null;
          event_date: string;
          location?: string | null;
          max_capacity?: number | null;
          status?: EventStatus;
          priority_hours?: number;
          created_by?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          event_date?: string;
          location?: string | null;
          max_capacity?: number | null;
          status?: EventStatus;
          priority_hours?: number;
        };
      };
      event_registrations: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          status: RegistrationStatus;
          registered_at: string;
          cancelled_at: string | null;
        };
        Insert: {
          event_id: string;
          user_id: string;
          status?: RegistrationStatus;
        };
        Update: {
          status?: RegistrationStatus;
          cancelled_at?: string | null;
        };
      };
      email_logs: {
        Row: {
          id: string;
          recipient_email: string;
          recipient_user_id: string | null;
          email_type: EmailType;
          subject: string;
          event_id: string | null;
          article_slug: string | null;
          status: 'sent' | 'failed' | 'bounced';
          resend_id: string | null;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          recipient_email: string;
          recipient_user_id?: string | null;
          email_type: EmailType;
          subject: string;
          event_id?: string | null;
          article_slug?: string | null;
          status?: 'sent' | 'failed' | 'bounced';
          resend_id?: string | null;
          error_message?: string | null;
        };
      };
    };
    Functions: {
      increment_helpful: {
        Args: { answer_id_input: string; fingerprint_input: string };
        Returns: number;
      };
      get_popular_articles: {
        Args: { limit_count?: number };
        Returns: {
          slug: string;
          rocket_count: number;
          like_count: number;
          stuck_count: number;
          cry_count: number;
          total_reactions: number;
          popularity_score: number;
        }[];
      };
      get_distress_alerts: {
        Args: { min_distress_count?: number; min_distress_pct?: number };
        Returns: {
          slug: string;
          total_reactions: number;
          stuck_count: number;
          cry_count: number;
          distress_count: number;
          distress_pct: number;
        }[];
      };
      get_section_distress: {
        Args: { target_slug?: string };
        Returns: {
          slug: string;
          section_id: string;
          total_reactions: number;
          stuck_count: number;
          cry_count: number;
          distress_count: number;
          distress_pct: number;
        }[];
      };
      get_event_registration_count: {
        Args: { event_id_input: string };
        Returns: number;
      };
      is_priority_period: {
        Args: { event_id_input: string };
        Returns: boolean;
      };
    };
  };
}
