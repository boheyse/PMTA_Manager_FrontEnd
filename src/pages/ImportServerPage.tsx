import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Circle } from 'lucide-react';
import { ServerDetailsForm } from '../components/server-manager/ServerDetailsForm';
import { axiosPost } from '../utils/apiUtils';
import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

export function ImportServerPage() {
  const navigate = useNavigate();
  const [serverName, setServerName] = useState('');
  const [hostname, setHostname] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState('');

  const setupInstructions = [
    {
      title: 'Create User Group',
      description: 'Ensure the server has a "heyse" group created for it and that user is part of the wheel group',
      code: 'sudo usermod -aG wheel heyse'
    },
    {
      title: 'ssh Key Access',
      description: 'Ensure the ssh public key has been added for the heyse user',
      code: 'ssh-add ~/.ssh/heyse_key'
    },
    {
      title: 'Update Sudo Permissions',
      description: 'Use sudo visudo to update the wheel group to use this command without requiring a password',
      code: '%wheel  ALL=(ALL)       NOPASSWD:/usr/bin/mv, /usr/bin/cp, /usr/bin/cat'
    },
    {
      title: 'Add API Key',
      description: 'Add an api key to the pmta config found at /etc/pmta/config',
      code: 'http-api-key abcd_0123_abcd_0123_abcd_0123_ab'
    },
    {
      title: 'Configure Webhook',
      description: 'Add the webhook configuration to /etc/pmta/config',
      code: `<acct-file /var/log/pmta/webhook.csv>
  http-webhook-max-interval 1m
  max-size 5M   # 5 MB max 
  http-webhook-url https://moondiver.xyz/webhook/pmta
  http-webhook-ca-file /etc/pmta/webhook-server-ca-certs.pem
  http-webhook-extra-headers /etc/pmta/http-webhook-headers.txt
  records b, d 
</acct-file>`
    }
  ];

  const handleImport = async () => {
    try {
      setIsImporting(true);
      setError('');
      
      const toastId = toast.loading('Server import in progress...', {
        autoClose: false
      });

      await axiosPost('/api/v1/server/import', {
        hostname,
        name: serverName,
      });

      toast.dismiss(toastId);
      toast.success('Server imported successfully!', {
        autoClose: 2000
      });
      navigate('/manage-server');
    } catch (error) {
      console.error('Import failed:', error);
      toast.dismiss();
      const axiosError = error as AxiosError<{ error: string }>;
      const errorMessage = axiosError.response?.data?.error || 'Failed to import server';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/manage-server')}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-semibold">Import Existing Server</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Server Details Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Server Details</h2>
          <ServerDetailsForm
            serverName={serverName}
            hostname={hostname}
            onServerNameChange={setServerName}
            onHostnameChange={setHostname}
            onSubmit={handleImport}
            isConnecting={isImporting}
            connectionError={error}
            ipAddresses={[]}
            submitButtonText={isImporting ? 'Importing Server...' : 'Import Server'}
          />
        </div>

        {/* Setup Instructions */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-base font-semibold mb-3">Server Setup Requirements</h2>
          <div className="space-y-4">
            {setupInstructions.map((instruction, index) => (
              <div key={index} className="border-b pb-3 last:border-b-0">
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    <Circle className="w-4 h-4 text-gray-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{instruction.title}</h3>
                    <p className="text-xs text-gray-600 mt-0.5">{instruction.description}</p>
                    <pre className="mt-1.5 p-2 bg-gray-50 rounded-lg text-xs font-mono whitespace-pre-wrap">
                      {instruction.code}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}