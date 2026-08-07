export interface Persona {
  name: string;
  domain: string;
}

export interface AgentPost {
  id: string;
  createdAt: string;
  text: string;
  rationale: string;
  sources: string[];
}

export interface AgentInstance {
  agentId: string;
  persona: Persona;
  memory: {
    initializedAt: string;
    topicHistory: string[];
    sourceIndex: string[];
  };
  posts: AgentPost[];
  schedulerActive: boolean;
}
