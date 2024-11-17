import { Node } from '../types/node';

export const mockNodes: Node[] = [
  {
    id: 'node1',
    name: 'Primary PMTA Server',
    host: 'pmta1.example.com',
    status: 'connected',
    stats: {
      emailsSent: 125789,
      emailsDelivered: 124532,
      emailsBounced: 1257,
      uniqueOpenRate: 24.5,
      clickRate: 3.2,
      bounceRate: 1.0,
      spamComplaints: 0.02
    }
  },
  {
    id: 'node2',
    name: 'Secondary PMTA Server',
    host: 'pmta2.example.com',
    status: 'connected',
    stats: {
      emailsSent: 98234,
      emailsDelivered: 97123,
      emailsBounced: 1111,
      uniqueOpenRate: 22.8,
      clickRate: 2.9,
      bounceRate: 1.1,
      spamComplaints: 0.03
    }
  },
  {
    id: 'node3',
    name: 'Backup PMTA Server',
    host: 'pmta3.example.com',
    status: 'disconnected',
    stats: {
      emailsSent: 45678,
      emailsDelivered: 45123,
      emailsBounced: 555,
      uniqueOpenRate: 21.5,
      clickRate: 2.7,
      bounceRate: 1.2,
      spamComplaints: 0.01
    }
  }
];