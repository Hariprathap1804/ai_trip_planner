export interface AIActionProposal {
  action: string;
  parameters: Record<string, any>;
  explanation: string;
  requires_user_confirmation: boolean;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  action_proposal?: AIActionProposal;
  action_executed?: boolean;
}
