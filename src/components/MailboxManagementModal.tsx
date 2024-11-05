import React, { useState } from 'react';
import { X, Download } from 'lucide-react';

interface MailboxManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  onSave: (mailboxes: Mailbox[]) => void;
}

interface Mailbox {
  username: string;
  password: string;
  imapServer: string;
  smtpServer: string;
  port: number;
}

export function MailboxManagementModal({ isOpen, onClose, domain, onSave }: MailboxManagementModalProps) {
  const [mailboxCount, setMailboxCount] = useState(1);
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);

  const generateMailboxes = () => {
    const newMailboxes: Mailbox[] = [];
    for (let i = 0; i < mailboxCount; i++) {
      newMailboxes.push({
        username: `mail${i + 1}@${domain}`,
        password: Math.random().toString(36).slice(-8),
        imapServer: `imap.${domain}`,
        smtpServer: `smtp.${domain}`,
        port: 587
      });
    }
    setMailboxes(newMailboxes);
  };

  const exportToCSV = () => {
    const headers = ['Email Address', 'Password', 'IMAP Server', 'SMTP Server', 'Port'];
    const csvContent = [
      headers.join(','),
      ...mailboxes.map(mailbox => 
        [mailbox.username, mailbox.password, mailbox.imapServer, mailbox.smtpServer, mailbox.port].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${domain}-mailboxes.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg w-full max-w-4xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Mailbox Management - {domain}</h2>
          <button onClick={onClose}><X className="w-6 h-6" /></button>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Number of Mailboxes</label>
          <div className="flex space-x-4">
            <input
              type="number"
              value={mailboxCount}
              onChange={(e) => setMailboxCount(parseInt(e.target.value))}
              className="border rounded-md p-2 w-32"
              min="1"
            />
            <button
              onClick={generateMailboxes}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Generate
            </button>
          </div>
        </div>

        {mailboxes.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-3">Username</th>
                    <th className="text-left p-3">Password</th>
                    <th className="text-left p-3">IMAP Server</th>
                    <th className="text-left p-3">SMTP Server</th>
                    <th className="text-left p-3">Port</th>
                  </tr>
                </thead>
                <tbody>
                  {mailboxes.map((mailbox, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3">{mailbox.username}</td>
                      <td className="p-3">{mailbox.password}</td>
                      <td className="p-3">{mailbox.imapServer}</td>
                      <td className="p-3">{mailbox.smtpServer}</td>
                      <td className="p-3">{mailbox.port}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={exportToCSV}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Export to CSV
              </button>
              <button
                onClick={() => onSave(mailboxes)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 