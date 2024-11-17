export interface Node {
  id: string;
  name: string;
  host: string;
  status: 'connected' | 'disconnected';
  stats: {
    emailsSent: number;
    emailsDelivered: number;
    emailsBounced: number;
    uniqueOpenRate: number;
    clickRate: number;
    bounceRate: number;
    spamComplaints: number;
  };
}